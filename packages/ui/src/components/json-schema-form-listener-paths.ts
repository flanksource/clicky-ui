import { isPlainObject } from "../lib/collections";
import { effectiveProperties } from "./json-schema-form-conditionals";
import type { JsonSchemaObject, JsonSchemaProperty } from "./json-schema-form-types";

// Listener path targets: `mf/Group/Cell` names a property inside a sibling's
// subtree. The first segment is a sibling key; each later segment names a
// property of the object reached so far, and an array is crossed into its
// `items` without spending a segment.

const SEPARATOR = "/";

export function isPathTarget(target: string): boolean {
  return target.includes(SEPARATOR);
}

// targetSegments splits a target into its segments, throwing on an empty one
// (`a//b`, a leading or a trailing `/`), which can only be a typo.
export function targetSegments(label: string, target: string): string[] {
  const segments = target.split(SEPARATOR);
  if (segments.some((segment) => segment === "")) {
    throw new Error(`${label}: target "${target}" has an empty path segment`);
  }
  return segments;
}

// patchTarget rewrites the property a target names, in place on `properties`
// (the effective properties of the object being rendered, whose `value` is
// given). A plain key is replaced by `apply(prop)`. A path clones the sibling
// along the way: at each object node the patched child goes into a trailing
// unconditional `allOf` member, which wins the effectiveProperties merge
// without touching the node's own properties or conditional branches, so two
// paths under one sibling both survive. A segment the current shape does not
// declare leaves the sibling untouched.
export function patchTarget({
  properties,
  value,
  target,
  apply,
}: {
  properties: Record<string, JsonSchemaProperty>;
  value: Record<string, unknown>;
  target: string;
  apply: (leaf: JsonSchemaProperty) => JsonSchemaProperty;
}): void {
  const [first = "", ...rest] = target.split(SEPARATOR);
  const prop = properties[first];
  if (!prop) return;
  const patched = patchNode(prop, value[first], rest, apply);
  if (patched) properties[first] = patched;
}

function patchNode(
  node: JsonSchemaProperty,
  nodeValue: unknown,
  segments: string[],
  apply: (leaf: JsonSchemaProperty) => JsonSchemaProperty,
): JsonSchemaProperty | undefined {
  const [segment, ...rest] = segments;
  if (segment === undefined) return apply(node);
  if (isArraySchema(node)) {
    if (!node.items) return undefined;
    const items = patchNode(node.items, {}, segments, apply);
    return items && { ...node, items };
  }
  const objectValue = isPlainObject(nodeValue) ? nodeValue : {};
  const child = effectiveProperties(node as JsonSchemaObject, objectValue).properties[segment];
  if (!child) return undefined;
  const patchedChild = patchNode(child, objectValue[segment], rest, apply);
  return (
    patchedChild && {
      ...node,
      allOf: [...(node.allOf ?? []), { properties: { [segment]: patchedChild } }],
    }
  );
}

function isArraySchema(node: JsonSchemaProperty): boolean {
  if (node.items !== undefined) return true;
  return Array.isArray(node.type) ? node.type.includes("array") : node.type === "array";
}
