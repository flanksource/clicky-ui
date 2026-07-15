import type { JsonSchemaObject } from "../components/json-schema-form-types";

const UNSUPPORTED = new Set([
  "unevaluatedProperties",
  "unevaluatedItems",
  "dependentSchemas",
  "dependentRequired",
  "prefixItems",
  "minContains",
  "maxContains",
  "$dynamicRef",
  "$dynamicAnchor",
]);

export type MonacoSchemaNormalization = {
  schema?: Record<string, unknown>;
  unsupportedKeywords: string[];
};

export function normalizeSchemaForMonaco(
  input: JsonSchemaObject,
): MonacoSchemaNormalization {
  const unsupported = new Set<string>();

  function visit(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(visit);
    if (!value || typeof value !== "object") return value;

    const output: Record<string, unknown> = {};
    for (const [rawKey, rawValue] of Object.entries(value)) {
      if (UNSUPPORTED.has(rawKey)) unsupported.add(rawKey);
      const key = rawKey === "$defs" ? "definitions" : rawKey;
      if (key === "$schema") {
        output[key] = "http://json-schema.org/draft-07/schema#";
      } else if (key === "$ref" && typeof rawValue === "string") {
        output[key] = rawValue.replace(/^#\/\$defs\//, "#/definitions/");
      } else {
        output[key] = visit(rawValue);
      }
    }
    return output;
  }

  const schema = visit(input) as Record<string, unknown>;
  const unsupportedKeywords = [...unsupported].sort();
  return unsupportedKeywords.length > 0 ? { unsupportedKeywords } : { schema, unsupportedKeywords };
}
