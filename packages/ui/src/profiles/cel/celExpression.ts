import { fetchJSON } from "../connections/connectionBrowserModel";
import { celEvaluator, profileApiPath } from "../profileApi";

/**
 * The three binding environments a profile's CEL can compile against.
 *
 * The schema tags each CEL field with the one it belongs to
 * (`x-clicky-cel-scope`), because the document itself does not record it: a
 * column's expression and a processor's `set` are two strings in the same YAML
 * that see different variables.
 */
export type CelScope = "row" | "batch" | "boundary";

/**
 * The `x-clicky-component` hint the profile schema tags every CEL field with, so
 * the form offers an editor that knows the bindings and can evaluate rather than
 * a bare input. Mirrors query/schema.celEditorComponent.
 */
export const CEL_EDITOR_WIDGET = "cel-editor";

export type CelResult = {
  index: number;
  value?: unknown;
  type?: string;
  error?: string;
};

export type CelResponse = {
  results: CelResult[];
  error?: string;
};

export type CelRequest = {
  cel: string;
  scope: CelScope;
  rows: unknown[];
  keep?: string;
};

/** What runs an expression for the editor. See {@link evaluateCel}. */
export type CelEvaluator = (request: CelRequest) => Promise<CelResponse>;

/**
 * Evaluates an expression against the sampled rows, once per row.
 *
 * It has to be run by the engine that will run it for real, or the preview would
 * confidently disagree with the column it previews — CEL here is null-safe in
 * ways a browser reimplementation would not reproduce. The rows travel up with
 * the request because the caller already sampled them.
 *
 * Which engine that is belongs to the host: the default posts to commons-db's
 * profile service at the configured mount, and a host whose expressions are
 * evaluated somewhere else — a different route, an RPC, a WASM build running in
 * the tab — supplies its own through `configureProfiles({ celEvaluator })`
 * rather than forking the editor.
 */
export function evaluateCel(request: CelRequest): Promise<CelResponse> {
  const configured = celEvaluator();
  if (configured) return configured(request);
  return fetchJSON<CelResponse>(profileApiPath("profile/sample/expression"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

export type CelCoverage = {
  /** Rows that produced a usable value. */
  ok: number;
  /** Rows the expression read nothing from. */
  empty: number;
  /** Rows where evaluation itself failed. */
  failed: number;
  /** Indices of rows that produced nothing usable, in row order. */
  barren: number[];
  /** The distinct result types seen, so a column that is sometimes a string shows. */
  types: string[];
};

/**
 * What an expression did across the whole sample.
 *
 * `empty` is deliberately not folded into `ok`. An out-of-range index or a
 * missing field does not throw in this engine — it reads as null — so the
 * expression that is wrong about most of the data still returns cleanly, and
 * counting those rows as successes is exactly the mistake this view exists to
 * prevent.
 */
export function coverage(results: CelResult[]): CelCoverage {
  const types = new Set<string>();
  const barren: number[] = [];
  let ok = 0;
  let empty = 0;
  let failed = 0;

  for (const result of results) {
    if (result.error) {
      failed += 1;
      barren.push(result.index);
      continue;
    }
    if (result.value === null || result.value === undefined) {
      empty += 1;
      barren.push(result.index);
      continue;
    }
    ok += 1;
    if (result.type) types.add(result.type);
  }

  return { ok, empty, failed, barren, types: [...types].sort() };
}

/**
 * The next row worth looking at after `from`, wrapping.
 *
 * An author works from the rows on screen and the rows an expression reads
 * nothing from are, by definition, ones they have not looked at — so the editor
 * has to be able to go and find them.
 */
export function nextBarren(coverageResult: CelCoverage, from: number): number | undefined {
  return coverageResult.barren.find((index) => index > from) ?? coverageResult.barren[0];
}

/** True when the expression is safe to apply: every sampled row evaluated. */
export function isClean(coverageResult: CelCoverage): boolean {
  return coverageResult.failed === 0 && coverageResult.empty === 0;
}

/** `^[A-Za-z_][A-Za-z0-9_]*$` — the rule the engine flattens a row key by. */
export function isIdentifier(key: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(key);
}

export type Binding = { name: string; detail: string; value?: unknown };

/**
 * What an expression may name in `scope`.
 *
 * Only `row` and `span` are fixed in the row scope — every other name comes from
 * the data, because the engine binds each row key that is a valid identifier as
 * a bare variable. A key that is not one, like `@timestamp`, is reachable only
 * through `row`, and the palette says so by omission rather than offering a name
 * that will not compile.
 */
export function bindingsFor(scope: CelScope, row: Record<string, unknown> | undefined): Binding[] {
  if (scope === "batch") {
    return [
      { name: "batch", detail: "list · the grouped rows, oldest first" },
      { name: "first", detail: "map · batch[0]" },
      { name: "last", detail: "map · the final row of the batch" },
      { name: "count", detail: "int · how many rows collapsed" },
      { name: "row", detail: "map · the kept row" },
    ];
  }
  if (scope === "boundary") {
    return [
      { name: "row", detail: "map · the row being judged" },
      { name: "prev", detail: "map · the row above it" },
      { name: "index", detail: "int · position in the result" },
    ];
  }

  const fixed: Binding[] = [
    { name: "row", detail: "map · the whole row" },
    { name: "span", detail: "map · the same row, for trace profiles" },
  ];
  if (!row) return fixed;

  const flattened = Object.keys(row)
    .filter(isIdentifier)
    .filter((key) => key !== "row" && key !== "span")
    .sort()
    .map((key) => ({ name: key, detail: `bound bare and as row.${key}`, value: row[key] }));

  return [...fixed, ...flattened];
}

/** Row keys that exist but cannot be named directly. */
export function unreachableKeys(row: Record<string, unknown> | undefined): string[] {
  return Object.keys(row ?? {}).filter((key) => !isIdentifier(key));
}

/**
 * Where an expression runs: what it may name, what evaluates it, and how its
 * rows are addressed.
 *
 * A profile's scopes are the built-in environments (see
 * {@link profileCelEnvironment}). A host whose CEL is not a profile's — an
 * authorization rule, say — passes its own, so the editor previews that
 * expression against the host's rows on the host's engine instead of posing as
 * a profile expression with bindings the host does not have.
 */
export type CelEnvironment = {
  /** Stable id; part of the evaluation cache key. */
  id: string;
  /** Names the environment in the editor's header. */
  label: string;
  /** The variable a whole row is bound to, or "" when a row's keys are the variables. */
  rowName: string;
  /** What an expression may name, given the focused row. */
  bindings: (row: Record<string, unknown> | undefined) => Binding[];
  /** Evaluates the expression once per row, on the engine that will run it for real. */
  evaluate: (cel: string, rows: unknown[]) => Promise<CelResponse>;
  /** Row keys that exist but cannot be named bare, listed under the bindings. */
  unreachable?: (row: Record<string, unknown> | undefined) => string[];
  /** Names a row; defaults to its position. */
  rowLabel?: (row: Record<string, unknown>, index: number) => string;
  /** What one row is, for the count in the header; defaults to a sampled row. */
  rowNoun?: string;
  /**
   * The expression selects rows rather than computing a value — a filter, an
   * authorization matcher — so true and false are tallied and drawn apart
   * instead of both reading as "evaluated".
   */
  predicate?: boolean;
};

const SCOPE_LABEL: Record<CelScope, string> = {
  row: "Row",
  batch: "Batch",
  boundary: "Boundary",
};

/** The built-in environment of a profile scope, evaluated by the profile service. */
export function profileCelEnvironment(scope: CelScope): CelEnvironment {
  return {
    id: scope,
    label: `${SCOPE_LABEL[scope]} scope`,
    rowName: "row",
    bindings: (row) => bindingsFor(scope, row),
    evaluate: (cel, rows) => evaluateCel({ cel, scope, rows }),
    ...(scope === "row" ? {} : { unreachable: unreachableKeys }),
  };
}

/**
 * A failure the author can act on, read out of the engine's own words.
 *
 * The engine reports in the vocabulary of the Go library underneath it, so
 * decoding an array with `.JSON()` — a mistake the type system cannot catch,
 * because both decoders take a string — comes back as a YAML type name and the
 * entire offending value inline. Neither says what to do.
 */
export type CelFailure = {
  /** What went wrong, in the author's terms. */
  message: string;
  /** The draft rewritten to fix it, when the fix is unambiguous. */
  fix?: string;
  /** The engine's own words, kept for a failure this cannot explain. */
  raw: string;
};

/** How much of an error is worth showing before it buries the dialog. */
const RAW_ERROR_LIMIT = 240;

/**
 * Shortens an error from the middle.
 *
 * Both ends carry the meaning — the prefix names the operation that failed and
 * the suffix names the failure — and it is the value interpolated between them
 * that runs to kilobytes. Trimming the tail would throw away the diagnosis and
 * keep the payload, which is the wrong half.
 */
function elide(text: string, limit = RAW_ERROR_LIMIT): string {
  if (text.length <= limit) return text;
  const head = Math.ceil((limit - 1) / 2);
  return `${text.slice(0, head)}…${text.slice(text.length - (limit - 1 - head))}`;
}

/**
 * `.JSON()` decodes an object; the value was an array. The signature is the Go
 * map type the decode targeted — matched on that rather than on the message
 * around it, which carries the whole value and so is never stable.
 */
const ARRAY_INTO_OBJECT = /cannot unmarshal\s+!!seq\s+into\s+map\[string\]interface\s*\{\s*\}/;

/** Conversely: `.JSONArray()` on an object. */
const OBJECT_INTO_ARRAY = /cannot unmarshal\s+!!map\s+into\s+\[\]interface\s*\{\s*\}/;

export function explainCelError(error: string, draft: string): CelFailure {
  const raw = elide(error);

  if (ARRAY_INTO_OBJECT.test(error)) {
    const failure: CelFailure = {
      message:
        "That value is a JSON array. JSON() decodes an object — use JSONArray(), then index or filter it.",
      raw,
    };
    if (draft.includes(".JSON()")) failure.fix = draft.replaceAll(".JSON()", ".JSONArray()");
    return failure;
  }

  if (OBJECT_INTO_ARRAY.test(error)) {
    const failure: CelFailure = {
      message: "That value is a JSON object. JSONArray() decodes a list — use JSON().",
      raw,
    };
    if (draft.includes(".JSONArray()")) failure.fix = draft.replaceAll(".JSONArray()", ".JSON()");
    return failure;
  }

  return { message: raw, raw };
}
