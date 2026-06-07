import type {
  FieldControl,
  FieldOption,
  JsonSchemaObject,
  JsonSchemaProperty,
} from "./json-schema-form-types";

// isOpenStringMap reports whether a property is an object whose entries are
// described by a sub-schema in `additionalProperties` (a typed key/value map).
export function isOpenStringMap(prop: JsonSchemaProperty): boolean {
  return (
    schemaHasType(prop, "object") &&
    typeof prop.additionalProperties === "object" &&
    prop.additionalProperties !== null
  );
}

function schemaHasType(prop: JsonSchemaProperty, type: string): boolean {
  if (Array.isArray(prop.type)) return prop.type.includes(type as never);
  return prop.type === type;
}

function enumOptions(prop: JsonSchemaProperty): FieldOption[] {
  return (prop.enum ?? []).map((v) => ({ value: String(v), label: String(v) }));
}

export interface ResolveControlArgs {
  key: string;
  prop: JsonSchemaProperty;
  required: boolean;
  value: unknown;
  onChange: (next: unknown) => void;
}

// resolveControl infers a base, render-ready FieldControl from a property
// schema. It is deliberately domain-agnostic: no date/ascode/token heuristics —
// those are layered on by consumer pre-extensions. First match wins.
export function resolveControl(args: ResolveControlArgs): FieldControl {
  const { key, prop, required, value, onChange } = args;
  const base: FieldControl = {
    key,
    kind: "string",
    label: typeof prop.title === "string" && prop.title ? prop.title : key,
    required,
    schema: prop,
    value,
    onChange,
    ...(typeof prop.description === "string" ? { description: prop.description } : {}),
  };

  if (Array.isArray(prop.enum) && prop.enum.length > 0) {
    return { ...base, kind: "enum", options: enumOptions(prop) };
  }
  if (schemaHasType(prop, "boolean")) {
    return { ...base, kind: "boolean" };
  }
  if (schemaHasType(prop, "integer") || schemaHasType(prop, "number")) {
    return {
      ...base,
      kind: "number",
      coerceNumber: true,
      ...(typeof prop.minimum === "number" ? { minimum: prop.minimum } : {}),
    };
  }
  if (schemaHasType(prop, "array")) {
    return { ...base, kind: "array", ...(prop.items ? { itemSchema: prop.items } : {}) };
  }
  // An open map: object whose entries are described by an additionalProperties
  // sub-schema. Renders as editable key/value rows (+ any known properties).
  if (isOpenStringMap(prop)) {
    return {
      ...base,
      kind: "string-map",
      valueSchema: prop.additionalProperties as JsonSchemaProperty,
      ...(prop.properties ? { knownProperties: prop.properties } : {}),
      allowExtraKeys: true,
    };
  }
  // A structured object: fixed `properties`, not an open map. Renders as a
  // nested sub-form (labels, required, if/then) — recursed into by the renderer.
  if (schemaHasType(prop, "object") && prop.properties) {
    return {
      ...base,
      kind: "object",
      objectProperties: prop.properties,
      ...(prop.required ? { objectRequired: prop.required } : {}),
    };
  }
  // A bare object with neither properties nor an additionalProperties schema:
  // treat as an open string map unless explicitly closed.
  if (schemaHasType(prop, "object")) {
    return { ...base, kind: "string-map", allowExtraKeys: prop.additionalProperties !== false };
  }
  return base;
}

// isScalarStringItems reports whether an array's item schema is a plain string
// with no richer shape — the case the array control renders as compact tags.
// Anything with an enum/const/properties/items/additionalProperties/allOf needs
// a real per-item control instead.
export function isScalarStringItems(items: JsonSchemaProperty | undefined): boolean {
  if (!items) return true; // untyped items default to string tags
  if (items.type !== undefined && !schemaHasType(items, "string")) return false;
  return (
    items.enum === undefined &&
    items.const === undefined &&
    items.properties === undefined &&
    items.items === undefined &&
    items.additionalProperties === undefined &&
    items.allOf === undefined
  );
}

// matchesIf reports whether the `if` sub-schema holds for the current value:
// every `if.required` key is present AND every `if.properties[k].const` equals
// value[k].
export function matchesIf(
  ifSchema: JsonSchemaProperty | undefined,
  value: Record<string, unknown>,
): boolean {
  if (!ifSchema) return false;
  for (const k of ifSchema.required ?? []) {
    if (!(k in value)) return false;
  }
  for (const [k, sub] of Object.entries(ifSchema.properties ?? {})) {
    if ("const" in sub && value[k] !== sub.const) return false;
  }
  return true;
}

export interface EffectiveProperties {
  properties: Record<string, JsonSchemaProperty>;
  required: string[];
}

// effectiveProperties merges the schema's base `properties` with every
// `allOf[i].then.properties` whose `allOf[i].if` matches the current value.
// `then` wins on key collision; required is the union. Pure and idempotent.
export function effectiveProperties(
  schema: JsonSchemaObject,
  value: Record<string, unknown>,
): EffectiveProperties {
  const properties: Record<string, JsonSchemaProperty> = { ...(schema.properties ?? {}) };
  const required = new Set(schema.required ?? []);
  for (const clause of schema.allOf ?? []) {
    if (!matchesIf(clause.if, value)) continue;
    const then = clause.then ?? {};
    for (const [k, sub] of Object.entries(then.properties ?? {})) {
      properties[k] = sub;
    }
    for (const k of then.required ?? []) required.add(k);
  }
  return { properties, required: [...required] };
}
