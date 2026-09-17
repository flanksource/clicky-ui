import { isIdentifier } from "./celExpression";

/** An example expression the author can drop into the draft. */
export type CelExample = { label: string; expression: string };

/** Whether a list looks like OpenTelemetry's `[{key, type, value}]` tag shape. */
function isKeyValueList(value: unknown): value is Array<Record<string, unknown>> {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (entry) =>
        entry !== null && typeof entry === "object" && "key" in entry && "value" in entry,
    )
  );
}

/** The value behind an accessor, decoded when the column holds JSON as text. */
function decoded(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const text = value.trim();
  if (!text.startsWith("{") && !text.startsWith("[")) return value;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return value;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** A key read off `base`: dotted when CEL can name it, indexed when it cannot. */
function member(base: string, key: string): string {
  return isIdentifier(key) ? `${base}.${key}` : `${base}[${JSON.stringify(key)}]`;
}

/** Whether `base` has `key`: `has()` takes only a dotted selection. */
function presence(base: string, key: string): string {
  return isIdentifier(key) ? `has(${base}.${key})` : `${JSON.stringify(key)} in ${base}`;
}

/** A key/value list folded into a map, so a missing key reads as absent. */
function foldedMap(accessor: string): string {
  return `dyn(${accessor}).fold(e, acc, merge(acc, {e.key: e.value}))`;
}

export type CelExampleOptions = {
  /**
   * The expression selects rows rather than computing a value — a filter, an
   * authorization matcher — so every example has to be a test: the engine
   * refuses a predicate that returns anything but a bool.
   */
  predicate?: boolean | undefined;
};

/**
 * Examples that fit the value in front of the author.
 *
 * A fixed list is wrong wherever it matters most: on a JSON column every
 * suggestion built from the field name alone reads the encoded string rather
 * than what is in it. These are derived from the sampled value, so the decoder
 * they carry is the one that value actually needs — which is the same mistake
 * the editor exists to stop the author making.
 *
 * The syntax is gomplate's own, verified against its CEL reference: the
 * comprehension macros (map/filter/exists), and `fold` with the `merge` helper
 * for folding a key/value list into a map. Ranges are wrapped in `dyn(...)`
 * because the engine declares every binding as `any` and a comprehension needs
 * a concrete list to walk.
 */
export function celExamplesFor(
  accessor: string,
  value: unknown,
  { predicate = false }: CelExampleOptions = {},
): CelExample[] {
  const inner = decoded(value);
  return predicate ? predicateExamples(accessor, inner) : valueExamples(accessor, inner);
}

function valueExamples(accessor: string, inner: unknown): CelExample[] {
  const range = `dyn(${accessor})`;

  if (isKeyValueList(inner)) {
    const sample = String(inner[0]?.["key"] ?? "key");
    const asMap = foldedMap(accessor);
    return [
      { label: `Read ${sample}`, expression: `${asMap}[${JSON.stringify(sample)}]` },
      // The map itself has to be encoded to leave the engine: a CEL map is a
      // map[ref.Val]ref.Val, which the response cannot serialize. Indexing one
      // yields a scalar and needs no such call, which is why only this example
      // carries it.
      { label: "Fold every entry into a map", expression: `${asMap}.toJSON()` },
      { label: "List the keys", expression: `${range}.map(e, e.key)` },
      { label: "Keep the whole list", expression: accessor },
    ];
  }

  if (Array.isArray(inner)) {
    // Only an object has fields to pull: the keys of a string are its indices.
    const field = isObject(inner[0]) ? Object.keys(inner[0])[0] : undefined;
    return [
      { label: "Take the first entry", expression: `${accessor}[0]` },
      { label: "Count the entries", expression: `size(${accessor})` },
      ...(field
        ? [{ label: `Pull ${field} from each`, expression: `${range}.map(e, ${member("e", field)})` }]
        : []),
      { label: "Keep the whole list", expression: accessor },
    ];
  }

  if (isObject(inner)) {
    const field = Object.keys(inner)[0];
    return [
      ...(field
        ? [
            { label: `Read ${field}`, expression: member(accessor, field) },
            {
              label: `Default ${field} when missing`,
              expression: `${presence(accessor, field)} ? ${member(accessor, field)} : ""`,
            },
          ]
        : []),
      { label: "List the keys", expression: `${accessor}.keys()` },
      { label: "Keep the whole object", expression: accessor },
    ];
  }

  return [
    { label: "Read it", expression: accessor },
    { label: "Convert to text", expression: `string(${accessor})` },
    ...(typeof inner === "number"
      ? [{ label: "Scale by 1,000", expression: `${accessor} / 1000.0` }]
      : []),
  ];
}

/** A test that the sampled list's first entry passes: membership, or a field match. */
function firstEntryTest(accessor: string, first: unknown): CelExample[] {
  if (first === undefined) return [];
  if (!isObject(first)) {
    return [{ label: `Contains ${String(first)}`, expression: `${JSON.stringify(first)} in ${accessor}` }];
  }
  const field = Object.keys(first)[0];
  if (!field) return [];
  return [
    {
      label: `Any entry with ${field} ${String(first[field])}`,
      expression: `dyn(${accessor}).exists(e, ${member("e", field)} == ${JSON.stringify(first[field])})`,
    },
  ];
}

function predicateExamples(accessor: string, inner: unknown): CelExample[] {
  if (isKeyValueList(inner)) {
    const key = String(inner[0]?.["key"] ?? "key");
    const value = inner[0]?.["value"];
    return [
      {
        label: `${key} is ${String(value)}`,
        expression: `${foldedMap(accessor)}[${JSON.stringify(key)}] == ${JSON.stringify(value)}`,
      },
    ];
  }

  if (Array.isArray(inner)) {
    return [
      ...firstEntryTest(accessor, inner[0]),
      { label: "Is not empty", expression: `size(${accessor}) > 0` },
      { label: "Is empty", expression: `size(${accessor}) == 0` },
    ];
  }

  if (isObject(inner)) {
    const field = Object.keys(inner)[0];
    return [
      ...(field ? [{ label: `Has ${field}`, expression: presence(accessor, field) }] : []),
      { label: "Is not empty", expression: `size(${accessor}) > 0` },
    ];
  }

  if (typeof inner === "boolean") {
    return [
      { label: "Is true", expression: accessor },
      { label: "Is false", expression: `!${accessor}` },
    ];
  }

  const literal = JSON.stringify(inner ?? null);
  return [
    { label: `Is ${String(inner)}`, expression: `${accessor} == ${literal}` },
    { label: `Is not ${String(inner)}`, expression: `${accessor} != ${literal}` },
  ];
}
