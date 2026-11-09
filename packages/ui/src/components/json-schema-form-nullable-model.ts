import type { JsonSchemaProperty } from "./json-schema-form-types";

export function nullableSchema(
  schema: JsonSchemaProperty,
): JsonSchemaProperty | undefined {
  if (
    Array.isArray(schema.type) &&
    schema.type.includes("null") &&
    schema.type.length > 1
  ) {
    const types = schema.type.filter((type) => type !== "null");
    return {
      ...schema,
      type: types.length === 1 ? types[0]! : types,
      ...(schema.enum
        ? { enum: schema.enum.filter((value) => value !== null) }
        : {}),
    };
  }
  const key = schema.oneOf ? "oneOf" : "anyOf";
  const branches = schema[key];
  if (
    branches?.some((branch) => branch.type === "null" || branch.const === null)
  ) {
    const remaining = branches.filter(
      (branch) => branch.type !== "null" && branch.const !== null,
    );
    if (!remaining.length) return undefined;
    const { [key]: _branches, ...base } = schema;
    return remaining.length === 1
      ? { ...base, ...remaining[0], ...(base.title !== undefined ? { title: base.title } : {}) }
      : { ...base, [key]: remaining };
  }
  if (
    schema.enum?.includes(null) &&
    schema.enum.length > 1 &&
    schema.type === undefined
  )
    return { ...schema, enum: schema.enum.filter((value) => value !== null) };
  return undefined;
}
