import type { JsonSchemaProperty } from "./json-schema-form-types";
import { isPlainObject } from "../lib/collections";

export function unionBranches(schema: JsonSchemaProperty): JsonSchemaProperty[] {
  const branches = schema.oneOf ?? schema.anyOf;
  if (branches && branches.length > 1) {
    const types = branches.map(branchType);
    const template = branches.length === 2 && branches.some((part) => part.type === "string" && part.pattern);
    if (!template && (new Set(types).size > 1 || types.includes("object") || types.includes("array"))) return branches;
  }
  if (Array.isArray(schema.type) && schema.type.length > 1) return schema.type.map((type) => ({ type }));
  return [];
}

export function branchType(schema: JsonSchemaProperty): string {
  if (schema.const === null) return "null";
  if (schema.const !== undefined) return typeof schema.const;
  if (schema.properties || schema.additionalProperties) return "object";
  return schema.type?.toString() ?? "value";
}

export function seedUnionBranch(schema: JsonSchemaProperty): unknown {
  if (schema.default !== undefined) return schema.default;
  if (schema.const !== undefined) return schema.const;
  if (schema.enum?.length) return schema.enum[0];
  if (branchType(schema) === "null") return null;
  if (branchType(schema) === "object") return Object.fromEntries(Object.entries(schema.properties ?? {})
    .filter(([, property]) => property.const !== undefined || property.default !== undefined)
    .map(([key, property]) => [key, seedUnionBranch(property)]));
  if (schema.type === "array") return [];
  if (schema.type === "boolean") return false;
  if (schema.type === "integer" || schema.type === "number") return 0;
  return "";
}

export function matchesUnionBranch(schema: JsonSchemaProperty, value: unknown): boolean {
  if (schema.const !== undefined) return schema.const === value;
  if (schema.enum) return schema.enum.includes(value);
  if (schema.type === "null") return value === null;
  if (schema.type === "array") return Array.isArray(value);
  if (schema.type === "object" || schema.properties || schema.additionalProperties) {
    if (!isPlainObject(value)) return false;
    return Object.entries(schema.properties ?? {}).every(([key, prop]) => prop.const === undefined || value[key] === prop.const);
  }
  if (schema.type === "integer") return typeof value === "number" && Number.isInteger(value);
  return schema.type === typeof value;
}
