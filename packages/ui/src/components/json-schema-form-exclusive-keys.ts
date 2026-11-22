import type { JsonSchemaObject } from "./json-schema-form-types";

// Exclusive keys: an object whose `oneOf` branches each require exactly one
// declared property and say nothing else (`oneOf: [{required: [A]}, {required:
// [B]}]`) holds exactly one of those properties. The form draws them as one
// row: a dropdown choosing the key (ExclusiveKeySelect), then the chosen key's
// own control, instead of a row per key of which all but one must stay empty.
export function exclusiveKeys(schema: JsonSchemaObject): string[] | undefined {
  const branches = schema.oneOf;
  if (!branches || branches.length < 2) return undefined;
  const keys = branches.map((branch) => {
    const required = branch.required;
    return Object.keys(branch).length === 1 && Array.isArray(required) && required.length === 1 ? required[0] : undefined;
  });
  if (keys.some((key) => key === undefined || !schema.properties?.[key])) return undefined;
  return keys as string[];
}

// switchExclusiveKey moves the value held under any of `keys` to `next`,
// leaving every other property as it was.
export function switchExclusiveKey({ value, keys, next }: { value: Record<string, unknown>; keys: string[]; next: string }): Record<string, unknown> {
  const current = keys.find((key) => value[key] !== undefined);
  const rest = Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));
  return current === undefined ? rest : { ...rest, [next]: value[current] };
}
