/**
 * Turning a browsed JSON node into the CEL that reaches it.
 *
 * The tree behind the editor's scope panel descends into a column that holds
 * JSON as text (see `createLazyJSONPathTree`), so a path can cross a boundary
 * that CEL cannot cross implicitly: reaching inside an encoded column means
 * decoding it first, and the decoder depends on what is in there — `.JSON()`
 * reads an object, `.JSONArray()` reads an array, and calling the wrong one
 * fails with a Go type name rather than an explanation.
 *
 * That is the whole reason this module exists. The tree already knows which
 * side of the boundary a node is on and what shape was decoded, so the accessor
 * it hands back can carry the right decoder instead of leaving the author to
 * guess it.
 */

import {
  literalSegments,
  type JSONPathNode,
  type JSONPathOrigin,
} from "../../components/jsonPathTree";

/** `^[A-Za-z_][A-Za-z0-9_]*$` — the keys CEL can read with a dot. */
const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * One path segment appended to an accessor.
 *
 * A key that is not an identifier is indexed rather than dotted, and quoted by
 * JSON.stringify — hand-rolled quoting is what turns a key containing a newline
 * or a quote into an expression that does not compile.
 */
function appendSegment(accessor: string, segment: string | number): string {
  if (typeof segment === "number") return `${accessor}[${segment}]`;
  return IDENTIFIER.test(segment)
    ? `${accessor}.${segment}`
    : `${accessor}[${JSON.stringify(segment)}]`;
}

/** Builds an accessor from `base` by walking a literal JSONPath. */
function walk(base: string, path: string): string {
  return (literalSegments(path) ?? []).reduce(appendSegment, base);
}

/**
 * How a row key is read, and how its presence is tested.
 *
 * Kept here beside the path builder so the editor speaks one dialect: an
 * example and a clicked path that quote the same key differently read as two
 * languages.
 */
export function celFieldAccess(name: string): { reference: string; presence: string } {
  if (IDENTIFIER.test(name)) {
    return { reference: `row.${name}`, presence: `has(row.${name})` };
  }
  const key = JSON.stringify(name);
  return { reference: `row[${key}]`, presence: `${key} in row` };
}

/** The call that crosses a boundary: a list needs JSONArray, a map needs JSON. */
export function celDecoder(kind: "array" | "object"): string {
  return kind === "array" ? ".JSONArray()" : ".JSON()";
}

/** What a JSON-encoded string decodes to, or undefined when it is not one. */
export function decodedKind(value: unknown): "array" | "object" | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  if (!text.startsWith("{") && !text.startsWith("[")) return undefined;
  try {
    const parsed: unknown = JSON.parse(text);
    if (Array.isArray(parsed)) return "array";
    return parsed !== null && typeof parsed === "object" ? "object" : undefined;
  } catch {
    return undefined;
  }
}

/** The chain that reaches a boundary, plus the decoder that crosses it. */
function originPrefix(origin: JSONPathOrigin | undefined, base: string): string {
  if (!origin) return base;
  return walk(originPrefix(origin.outer, base), origin.path) + celDecoder(origin.kind);
}

/**
 * The CEL expression that reads `node` out of the row it was browsed from.
 *
 * Inside a decoded subtree the node's own path restarts at `$`, and its
 * `origin` records every boundary crossed to get there — where each one was and
 * what came out of it. So the accessor is rebuilt boundary by boundary, each
 * contributing the way to the encoded value and the decoder its contents need,
 * which also holds for JSON encoded inside JSON.
 *
 * Selecting a boundary node itself yields the decoded form rather than the raw
 * string: picking a column that holds a document is a request for the document,
 * and naming the decoder here is the whole point of the panel.
 */
export function celPathFor(node: JSONPathNode, base = "row"): string {
  const reached = walk(originPrefix(node.origin, base), node.path);
  const kind = decodedKind(node.value);
  return kind === undefined ? reached : reached + celDecoder(kind);
}
