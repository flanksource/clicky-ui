import { isPlainObject } from "../lib/collections";
import type { JsonSchemaObject } from "./json-schema-form-types";
import { effectiveProperties } from "./json-schema-form-conditionals";
import { isOpenStringMap, schemaRendersAsObject } from "./json-schema-form-resolve";

// applySchemaDefaults fills missing values from JSON Schema `default` keywords.
// It walks fixed object properties recursively and re-evaluates `if`/`then`
// branches after each pass, so a defaulted discriminator can activate defaults
// in its selected branch. Existing values, including null and empty strings, are
// never replaced. The original value is returned when no defaults apply.
export function applySchemaDefaults(
  schema: JsonSchemaObject,
  value: Record<string, unknown>,
): Record<string, unknown> {
  return applyObjectDefaults(schema, value, new Set());
}

function applyObjectDefaults(
  schema: JsonSchemaObject,
  value: Record<string, unknown>,
  ancestors: Set<JsonSchemaObject>,
): Record<string, unknown> {
  // Recursive schemas may point back to an ancestor after refs are hydrated.
  if (ancestors.has(schema)) return value;
  const nextAncestors = new Set(ancestors).add(schema);
  let next = value;

  // A default can select another conditional branch, so allow enough passes for
  // a chain of discriminator defaults while keeping malformed schemas bounded.
  const maxPasses = Math.min(
    100,
    Object.keys(schema.properties ?? {}).length +
      (schema.allOf?.length ?? 0) +
      2,
  );
  for (let pass = 0; pass < maxPasses; pass += 1) {
    const { properties } = effectiveProperties(schema, next);
    let passChanged = false;
    let passValue = next;

    for (const [key, propertySchema] of Object.entries(properties)) {
      const existing = passValue[key];
      let fieldValue = existing;
      let fieldChanged = false;

      if (existing === undefined && propertySchema.default !== undefined) {
        fieldValue = cloneSchemaDefault(propertySchema.default);
        fieldChanged = true;
      }

      const structuredObject = schemaRendersAsObject(propertySchema);
      if (structuredObject && !isOpenStringMap(propertySchema)) {
        const objectValue = isPlainObject(fieldValue)
          ? (fieldValue as Record<string, unknown>)
          : {};
        const defaultedObject = applyObjectDefaults(
          propertySchema as JsonSchemaObject,
          objectValue,
          nextAncestors,
        );
        if (defaultedObject !== objectValue) {
          fieldValue = defaultedObject;
          fieldChanged = true;
        }
      }

      if (fieldChanged) {
        if (!passChanged) passValue = { ...next };
        passValue[key] = fieldValue;
        passChanged = true;
      }
    }

    if (!passChanged) break;
    next = passValue;
  }
  return next;
}

export function cloneSchemaDefault(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneSchemaDefault);
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        cloneSchemaDefault(entry),
      ]),
    );
  }
  return value;
}
