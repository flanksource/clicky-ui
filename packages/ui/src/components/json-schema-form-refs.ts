import type {
  JsonSchemaObject,
  JsonSchemaProperty,
} from "./json-schema-form-types";

// rehydrateRefs resolves local RFC 6901 fragment pointers into a self-contained
// tree the existing renderer walks directly. This includes nested bundled
// documents such as #/$defs/<version>/$defs/<definition>.
//
// Each unique pointer is resolved once and shared by reference; a cyclic
// ref is broken with a non-recursive stub, so the result is always a finite DAG
// the recursive renderer can traverse without a depth cap. Missing or malformed
// local pointers remain as $ref objects so invalid schemas stay visible.
export function rehydrateRefs(schema: JsonSchemaObject): JsonSchemaObject {
  const document = schema as Record<string, unknown>;
  const cache = new Map<string, JsonSchemaProperty>();
  const resolving = new Set<string>();
  let unresolved = false;

  const resolveRef = (ref: string): JsonSchemaProperty | undefined => {
    if (cache.has(ref)) return cache.get(ref);
    // A ref already on the resolution stack is a cycle: break it with a
    // permissive stub rather than building a self-referential object graph.
    if (resolving.has(ref))
      return { type: "object", description: "↻ recursive schema" };
    const target = resolveLocalPointer(document, ref);
    if (!isSchemaObject(target)) {
      unresolved = true;
      return undefined;
    }
    resolving.add(ref);
    const resolved = walk(target) as JsonSchemaProperty;
    resolving.delete(ref);
    cache.set(ref, resolved);
    return resolved;
  };

  // walk rewrites local JSON Pointer refs and otherwise REUSES the input node by
  // reference when nothing beneath it changed (structural sharing). This is what
  // keeps rehydration cheap: a ref-free component — e.g. address-form.json, which
  // is 5.6MB with no internal refs — is returned as-is, never deep-rebuilt, so
  // only the (small) ref-bearing spine of the document is reallocated.
  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) {
      let changed = false;
      const out = node.map((v) => {
        const w = walk(v);
        if (w !== v) changed = true;
        return w;
      });
      return changed ? out : node;
    }
    if (node && typeof node === "object") {
      const obj = node as Record<string, unknown>;
      const ref = obj["$ref"];
      if (typeof ref === "string" && isLocalPointerRef(ref)) {
        const resolved = resolveRef(ref);
        if (!resolved) return walkUnresolvedRef(obj);
        // A `$ref` alongside siblings: the siblings are local keywords that win
        // over the referenced body (JSON Schema 2020-12 semantics), e.g.
        // `allOf:[{$ref, title}]`.
        const siblings: Record<string, unknown> = {};
        let hasSiblings = false;
        for (const [k, v] of Object.entries(obj)) {
          if (k === "$ref") continue;
          siblings[k] = walk(v);
          hasSiblings = true;
        }
        return hasSiblings ? { ...resolved, ...siblings } : resolved;
      }
      let changed = false;
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj)) {
        const w = walk(v);
        out[k] = w;
        if (w !== v) changed = true;
      }
      return changed ? out : node;
    }
    return node;
  };

  const walkUnresolvedRef = (
    obj: Record<string, unknown>
  ): Record<string, unknown> => {
    let changed = false;
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === "$ref") {
        out[key] = value;
        continue;
      }
      const walked = walk(value);
      out[key] = walked;
      if (walked !== value) changed = true;
    }
    return changed ? out : obj;
  };

  if (!Object.hasOwn(document, "$defs"))
    return walk(schema) as JsonSchemaObject;

  // Drop `$defs` only when every local pointer was resolved. Retaining it beside
  // an unresolved $ref keeps the invalid target inspectable by callers.
  const { $defs, ...rest } = document;
  const resolved = walk(rest) as JsonSchemaObject;
  return unresolved
    ? ({ ...resolved, $defs: walk($defs) } as JsonSchemaObject)
    : resolved;
}

function isLocalPointerRef(ref: string): boolean {
  if (!ref.startsWith("#")) return false;
  if (ref === "#") return true;
  try {
    return decodeURIComponent(ref.slice(1)).startsWith("/");
  } catch {
    return ref.startsWith("#/");
  }
}

function resolveLocalPointer(
  document: Record<string, unknown>,
  ref: string
): unknown {
  let fragment: string;
  try {
    fragment = decodeURIComponent(ref.slice(1));
  } catch {
    return undefined;
  }
  if (fragment === "") return document;
  if (!fragment.startsWith("/")) return undefined;

  let current: unknown = document;
  for (const rawToken of fragment.slice(1).split("/")) {
    const token = decodePointerToken(rawToken);
    if (token === undefined) return undefined;
    if (Array.isArray(current)) {
      if (!/^(0|[1-9]\d*)$/.test(token)) return undefined;
      const index = Number(token);
      if (!Number.isSafeInteger(index) || index >= current.length)
        return undefined;
      current = current[index];
      continue;
    }
    if (!isRecord(current) || !Object.hasOwn(current, token)) return undefined;
    current = current[token];
  }
  return current;
}

function decodePointerToken(token: string): string | undefined {
  if (/~(?:[^01]|$)/.test(token)) return undefined;
  return token.replaceAll("~1", "/").replaceAll("~0", "~");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSchemaObject(value: unknown): value is JsonSchemaProperty {
  return isRecord(value);
}
