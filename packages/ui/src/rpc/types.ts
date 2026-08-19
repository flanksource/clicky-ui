import type { ClickyNode } from "../data/Clicky";
import type { TimeRangePresetGroup } from "../components/TimeRange";

export interface ExecutionRequest {
  args?: string[];
  flags?: Record<string, string>;
}

export interface ExecutionPagination {
  total?: number;
  limit?: number;
  offset?: number;

  // totalRelation says whether total is a count or a lower bound. A backend
  // that stops counting past a threshold reports "gte", and rendering that as
  // a count would state a number nobody promised.
  totalRelation?: "eq" | "gte";

  // hasMore is the server's answer, not an inference from the page length: a
  // short page and the end of the data are different facts.
  hasMore?: boolean;

  // nextCursor resumes after this page. Opaque — it is passed back unchanged
  // and never parsed, because a client that can read one can forge one.
  nextCursor?: string;

  // truncated reports that the server stopped short of the whole result, so a
  // partial answer is never rendered as a complete one.
  truncated?: boolean;
}

export interface ExecutionResponse {
  success: boolean;
  message?: string;
  output?: string;
  stdout?: string;
  stderr?: string;
  exit_code: number;
  error?: string;
  cli?: string;
  input?: ExecutionRequest;
  contentType?: string;
  requestUrl?: string;
  responseHeaders?: Record<string, string>;
  pagination?: ExecutionPagination;
  blob?: Blob;
  parsed?: unknown;
}

export interface OpenAPISchema {
  type?: string;
  format?: string;
  default?: unknown;
  enum?: unknown[];
  description?: string;
  properties?: Record<string, OpenAPISchema>;
  items?: OpenAPISchema;
  oneOf?: OpenAPISchema[];
  additionalProperties?: OpenAPISchema | boolean;
  nullable?: boolean;
}

// ClickyParameterRole tells the UI which widget owns a parameter:
//   "search"    — render as the FilterBar's dedicated search input
//   "filter"    — render as a FilterBar chip on the DataTable
//   "limit"     — feed into DataTable pagination's pageSize
//   "offset"    — feed into DataTable pagination's page (or skip)
//   "cursor"    — carry the opaque position the previous page returned
//   "time-from" — left edge of a time-range picker
//   "time-to"   — right edge of a time-range picker
// Set server-side by clicky's converter (see paramRole in clicky/rpc/openapi.go).
export type ClickyParameterRole =
  | "search"
  | "filter"
  | "limit"
  | "offset"
  | "cursor"
  | "time-from"
  | "time-to";

export interface ClickyParameterMeta {
  role?: ClickyParameterRole;
}

/**
 * A parameter's pointer to its filter control, set server-side.
 *
 * `$ref` names the control's SHAPE — which control this is — and is present on
 * every generated filter, because a control's identity never varies with the
 * values currently selected. `url`/`filter`/`searchParam` are the separate
 * question of where its OPTIONS come from, and are present only when the
 * backend can enumerate them: a range has no list to offer.
 */
export interface ClickyParameterLookup {
  /** JSON pointer into `components["x-clicky-filters"]`. */
  $ref?: string;
  url?: string;
  filter?: string;
  searchParam?: string;
  multi?: boolean;
}

/**
 * One entry of `components["x-clicky-filters"]`: a filter control's shape,
 * published once per spec and invariant for the life of it.
 *
 * Distinct from OperationLookupFilter, which is the per-request answer to "what
 * values can this filter take right now" and may legitimately narrow as other
 * filters are selected. Reading shape from here rather than from a lookup
 * response is what keeps a control from decaying into a text box while its
 * options are in flight.
 */
export interface ClickyFilterShape {
  label?: string;
  type?: OperationLookupFilterType;
  multi?: boolean;
}

export interface OpenAPIParameter {
  name: string;
  in: "query" | "path" | "header";
  description?: string;
  required?: boolean;
  schema?: OpenAPISchema;
  /** Hint text shown inside the empty input. Distinct from `description`,
   *  which is help text and must NOT be used as a placeholder. */
  placeholder?: string;
  "x-clicky"?: ClickyParameterMeta;
  "x-clicky-lookup"?: ClickyParameterLookup;
  /** Vendor-extension placeholder, set server-side by clicky's converter.
   *  Takes precedence over `placeholder` when both are present. */
  "x-clicky-placeholder"?: string;
}

/** Resolves the input placeholder for a parameter, drawing ONLY from explicit
 *  placeholder fields — never from `description` (help text). Returns undefined
 *  when no placeholder is declared so callers can apply their own fallback. */
export function parameterPlaceholder(
  param: OpenAPIParameter,
): string | undefined {
  return param["x-clicky-placeholder"] ?? param.placeholder;
}

export interface OpenAPIOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: OpenAPIParameter[];
  requestBody?: {
    content?: Record<string, { schema?: OpenAPISchema }>;
  };
  // Optional because nothing here reads it, and a server may serve this catalog
  // with the response schemas reduced to a stub — they are over half the bytes
  // of a spec whose only job here is to describe what can be called.
  responses?: Record<string, unknown>;
  "x-clicky"?: ClickyOperationMeta;
}

export interface OpenAPISpec {
  openapi: string;
  info: { title: string; description?: string; version: string };
  paths: Record<string, Record<string, OpenAPIOperation>>;
  tags?: Array<{ name: string; description?: string }>;
  components?: {
    "x-clicky-filters"?: Record<string, ClickyFilterShape>;
  };
  "x-clicky"?: ClickySpecMeta;
}

export interface ResolvedOperation {
  path: string;
  method: string;
  operation: OpenAPIOperation;
}

export interface DomainDefinition {
  key: string;
  title: string;
  description: string;
  icon?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export interface ClickySpecMeta {
  surfaces?: ClickySurface[];
}

export interface ClickySurface {
  key: string;
  entity: string;
  title: string;
  parent?: string;
  admin?: boolean;
  description?: string;
  /** Opaque icon name emitted by the backend (x-clicky-icon), resolved to a glyph in the UI. */
  icon?: string;
  /**
   * Hierarchy position within `parent`, "/"-separated (x-clicky-path) — e.g.
   * "jms/incoming/disbursements". The backend has already applied whatever
   * delimiter its own naming convention uses, so the UI never guesses one.
   * Absent — the default — means the parent group renders as a flat list.
   */
  path?: string;
}

export interface ClickyOperationMeta {
  command?: string;
  surface?: string;
  verb: "list" | "get" | "create" | "update" | "delete" | "action";
  scope: "collection" | "entity";
  actionName?: string;
  idParam?: string;
  supportsLookup?: boolean;
  supportsFilterMode?: boolean;
  group?: string;
  toolHints?: ClickyToolHints;
  export?: ClickyExportMeta;
}

export interface ClickyExportMeta {
  formats?: string[];
  scopes?: Array<"page" | "all">;
  allRowsMode?: "streaming" | "buffered";
  formatMaxRows?: Record<string, number>;
}

export interface ClickyToolHints {
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
  icon?: string;
  group?: string;
  parent?: string;
  defaultPermission?: "on" | "ask" | "off" | "auto";
  strict?: boolean;
}

export type OperationLookupFilterType =
  | "bool"
  | "number"
  | "date"
  /** Both edges of a range under one parameter, as ">=from,<=to". */
  | "date-range"
  /** A "date-range" with the clock taken off it: whole days, same grammar. */
  | "day-range"
  /**
   * A numeric range over elapsed time. Same grammar as "number"; the operands
   * are the column's own unit, which `unit` names.
   */
  | "duration"
  | "from"
  | "to"
  | "multi-filter"
  /** A Kubernetes workload selected inside a profile's target scope. */
  | "workload"
  /** Kubernetes label values, grouped by key when options are key=value pairs. */
  | "labels"
  /**
   * An exact-value selection with nothing to enumerate — a UUID column, say.
   * Same wire grammar as "multi-filter"; typed rather than picked, because a
   * dropdown over identifiers is a page of the rows.
   */
  | "value";

export interface OperationLookupFilter {
  label?: string;
  options?: Record<string, ClickyNode>;
  selected?: Record<string, ClickyNode>;
  multi?: boolean;
  type?: OperationLookupFilterType;
  /** True when `options` is only the head of a larger set (server-side capped). */
  truncated?: boolean;
  /** True distinct count behind a truncated option set; drives "… and N more". */
  total?: number;
  presets?: Array<
    { label: string; from: string; to: string } | TimeRangePresetGroup
  >;
  timeEnabled?: boolean;
  timeZone?: string;
  timeZones?: string[];
  /** The unit a "duration" filter's operands are written in ("ms" or "s"), so
   *  the control labels itself in the numbers the column is stored in. Absent
   *  means milliseconds. */
  unit?: string;
}

export interface OperationLookupResponse {
  filters: Record<string, OperationLookupFilter>;
}

export function isPositionalParam(p: OpenAPIParameter): boolean {
  return (
    p.name === "args" ||
    p.description?.toLowerCase().includes("positional argument") === true
  );
}
