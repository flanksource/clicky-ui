import type { JsonSchemaConditional, JsonSchemaProperty } from "./json-schema-form-types";
import { isPlainObject } from "../lib/collections";

// A branch that is itself only a union (a named `oneOf` of answers) contributes
// its own branches, so nested unions surface as one flat choice list instead of
// stacked selectors that each re-match the same value.
function flattenBranches(branches: JsonSchemaProperty[]): JsonSchemaProperty[] {
  return branches.flatMap((branch) => {
    const nested = branch.oneOf ?? branch.anyOf;
    const own = branch.type !== undefined || branch.properties !== undefined || branch.const !== undefined || branch.enum !== undefined;
    return nested && !own ? flattenBranches(nested) : [branch];
  });
}

export function unionBranches(schema: JsonSchemaProperty): JsonSchemaProperty[] {
  const declared = schema.oneOf ?? schema.anyOf;
  const branches = declared && flattenBranches(declared);
  if (branches && branches.length > 1) {
    const types = branches.map(branchType);
    const template = branches.length === 2 && branches.some((part) => part.type === "string" && part.pattern);
    const distinct = new Set(branches.map(branch => `${branch.format ?? ""}:${branch.title ?? ""}`)).size > 1;
    if (!template && (distinct || new Set(types).size > 1 || types.includes("object") || types.includes("array"))) return branches;
  }
  if (Array.isArray(schema.type) && schema.type.length > 1) return schema.type.map((type) => ({ type }));
  return [];
}

export function branchType(schema: JsonSchemaProperty): string {
  if (schema.const === null) return "null";
  if (schema.const !== undefined) return typeof schema.const;
  if (schema.properties || schema.additionalProperties || Object.keys(branchProperties(schema).properties).length) return "object";
  return schema.type?.toString() ?? "value";
}

export function branchTitle(schema: JsonSchemaProperty): string | undefined {
  return schema.title ?? schema.allOf?.find((member) => member.title)?.title;
}

// branchProperties merges a branch's own properties with its unconditional
// `allOf` members (an inlined `$ref` composition), so discriminator consts and
// closed key sets declared on the referenced schema still identify the branch.
function branchProperties(schema: JsonSchemaProperty | JsonSchemaConditional): { properties: Record<string, JsonSchemaProperty>; closed: boolean } {
  const allOf = "allOf" in schema ? schema.allOf ?? [] : [];
  const members = allOf.filter((member) => member.if === undefined).map(branchProperties);
  const properties = Object.assign({}, ...members.map((member) => member.properties), schema.properties);
  const closed = schema.additionalProperties === false || schema.unevaluatedProperties === false || members.some((member) => member.closed);
  return { properties, closed };
}

export function seedUnionBranch(schema: JsonSchemaProperty): unknown {
  if (schema.default !== undefined) return schema.default;
  if (schema.const !== undefined) return schema.const;
  if (schema.enum?.length) return schema.enum[0];
  if (branchType(schema) === "null") return null;
  if (branchType(schema) === "object") return Object.fromEntries(Object.entries(branchProperties(schema).properties)
    .filter(([, property]) => property.const !== undefined || property.default !== undefined)
    .map(([key, property]) => [key, seedUnionBranch(property)]));
  if (schema.type === "array") return [];
  if (schema.type === "boolean") return false;
  if (schema.type === "integer" || schema.type === "number") return 0;
  return "";
}

export function matchesUnionBranch(schema: JsonSchemaProperty, value: unknown): boolean {
  if (typeof value === "string") {
    if (typeof schema.pattern === "string" && !new RegExp(schema.pattern).test(value)) return false;
    if (schema.format === "date" && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) return false;
    if (schema.format === "date-time" && (!/^\d{4}-\d{2}-\d{2}T/.test(value) || Number.isNaN(Date.parse(value)))) return false;
  }
  if (schema.const !== undefined) return schema.const === value;
  if (schema.enum) return schema.enum.includes(value);
  if (schema.type === "null") return value === null;
  if (schema.type === "array") return Array.isArray(value);
  const nested = flattenBranches([schema]);
  if (nested[0] !== schema) return nested.some((branch) => matchesUnionBranch(branch, value));
  if (schema.type === "object" || branchType(schema) === "object") {
    if (!isPlainObject(value)) return false;
    const { properties, closed } = branchProperties(schema);
    if (closed && Object.keys(value).some((key) => !(key in properties))) return false;
    return Object.entries(properties).every(([key, prop]) => prop.const === undefined || value[key] === prop.const);
  }
  if (schema.type === "integer") return typeof value === "number" && Number.isInteger(value);
  return schema.type === typeof value;
}
