import { isPlainObject } from "../lib/collections";
import { appendInstancePath } from "./json-schema-form-errors";
import { applyChangeEffects, applyListenerState, type ListenerOptions } from "./json-schema-form-listeners";
import { schemaRendersAsObject } from "./json-schema-form-resolve";
import type { FieldArgs } from "./json-schema-form-runtime-types";
import type { JsonSchemaObject, JsonSchemaProperty } from "./json-schema-form-types";

export type HoistedFields = {
  /** Field rows lifted out of nested objects, keyed `<object>.<field>`. */
  rows: Map<string, FieldArgs>;
  /** Nested objects whose every field was lifted, so they render no section. */
  emptied: Set<string>;
};

export function isHoisted(prop: JsonSchemaProperty): boolean {
  return prop["x-clicky-hoist"] === true;
}

/**
 * hoistNestedFields lifts the `x-clicky-hoist` fields of an object's nested
 * objects into its own field list, so they render in its grid at their own
 * `x-clicky-order` while their values stay inside the nested object. A
 * connection's host/port/database live in its `properties` map but belong
 * beside its URL, which they are an alternative to.
 */
export function hoistNestedFields(args: {
  properties: Record<string, JsonSchemaProperty>;
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  schema: JsonSchemaObject;
  listenerOptions: ListenerOptions;
  instancePath: string;
}): HoistedFields {
  const { properties, value, onChange, schema, listenerOptions, instancePath } = args;
  const rows = new Map<string, FieldArgs>();
  const emptied = new Set<string>();
  for (const [key, prop] of Object.entries(properties)) {
    if (!schemaRendersAsObject(prop)) continue;
    const raw = value[key];
    if (raw !== undefined && !isPlainObject(raw)) {
      throw new Error(`cannot hoist fields out of ${key}: its value is not an object`);
    }
    const nestedValue = raw ?? {};
    const nestedSchema = prop as JsonSchemaObject;
    const nested = applyListenerState(nestedSchema, nestedValue, listenerOptions);
    const children = Object.entries(nested.properties);
    const lifted = children.filter(([, child]) => isHoisted(child));
    if (lifted.length === 0) continue;
    if (lifted.length === children.length) emptied.add(key);
    for (const [child, childProp] of lifted) {
      rows.set(`${key}.${child}`, {
        key: child,
        prop: childProp,
        required: nested.required.includes(child),
        value: nestedValue[child],
        instancePath: appendInstancePath(appendInstancePath(instancePath, key), child),
        onChange: (next) => {
          const object = applyChangeEffects(nestedSchema, { ...listenerOptions, value: nestedValue, key: child, next });
          onChange(applyChangeEffects(schema, { ...listenerOptions, value, key, next: object }));
        },
      });
    }
  }
  return { rows, emptied };
}
