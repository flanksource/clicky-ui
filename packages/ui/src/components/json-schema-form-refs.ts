import type { JsonSchemaObject, JsonSchemaProperty } from "./json-schema-form-types";

const DEFS_PREFIX = "#/$defs/";

// rehydrateRefs resolves a BUNDLED schema — one whose components live under
// `$defs` and are referenced by local `#/$defs/<key>` pointers (the shape the
// server's refs=inline bundling emits) — into a self-contained tree the existing
// renderer walks directly. It is the read-side counterpart of bundling: where
// bundling collapses a component referenced N times to one `$defs` entry + N
// local pointers, this expands those pointers back to the (shared, by-reference)
// component, so the component's bytes still cost O(1) in memory, not O(N).
//
// Each unique `$defs` entry is resolved once and shared by reference; a cyclic
// ref is broken with a non-recursive stub, so the result is always a finite DAG
// the recursive renderer can traverse without a depth cap. A schema with no
// `$defs` is returned unchanged (the common, already-self-contained case), so
// this is a no-op for non-bundled schemas.
export function rehydrateRefs(schema: JsonSchemaObject): JsonSchemaObject {
  const defs = (schema as Record<string, unknown>)["$defs"] as
    | Record<string, JsonSchemaProperty>
    | undefined;
  if (!defs || Object.keys(defs).length === 0) return schema;

  const cache = new Map<string, JsonSchemaProperty>();
  const resolving = new Set<string>();

  const resolveDef = (key: string): JsonSchemaProperty => {
    const cached = cache.get(key);
    if (cached) return cached;
    // A ref to a def already on the resolution stack is a cycle: break it with a
    // permissive stub rather than building a self-referential object graph.
    if (resolving.has(key)) return { type: "object", description: "↻ recursive schema" };
    const body = defs[key];
    if (body === undefined) return {}; // dangling local ref → permissive object
    resolving.add(key);
    const resolved = walk(body) as JsonSchemaProperty;
    resolving.delete(key);
    cache.set(key, resolved);
    return resolved;
  };

  // walk rewrites local `#/$defs` refs and otherwise REUSES the input node by
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
      if (typeof ref === "string" && ref.startsWith(DEFS_PREFIX)) {
        const resolved = resolveDef(ref.slice(DEFS_PREFIX.length));
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

  // Drop `$defs` from the rendered root — every reference to it is now resolved
  // inline (by shared reference), so it is dead weight the renderer would ignore.
  const { $defs: _defs, ...rest } = schema as Record<string, unknown>;
  void _defs;
  return walk(rest) as JsonSchemaObject;
}
