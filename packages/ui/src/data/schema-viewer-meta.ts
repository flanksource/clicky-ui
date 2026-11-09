import type { JsonSchemaProperty } from "../components/json-schema-form-types";
import type { SchemaViewerFieldMeta, SchemaViewerEnumValue, SchemaViewerSourceLocation, SchemaViewerAnnotation } from "./schema-viewer-model";

interface ParsedDescription {
  text?: string | undefined;
  query?: string | undefined;
  ascode?: string | undefined;
  annotations?: SchemaViewerAnnotation[] | undefined;
}

const PLATFORM_EXTENSION_PREFIX = ["x-oi", "pa-"].join("");
const PLATFORM_DIRECTIVE_PREFIX = ["@oi", "pa-"].join("");
const PLATFORM_TYPE_EXTENSION = `${PLATFORM_EXTENSION_PREFIX}type`;
export const PLATFORM_ASCODE_EXTENSION = `${PLATFORM_EXTENSION_PREFIX}ascode`;
const PLATFORM_FORMAT_EXTENSION = `${PLATFORM_EXTENSION_PREFIX}format`;
const PLATFORM_CLIENT_REF_EXTENSION = `${PLATFORM_EXTENSION_PREFIX}client-ref`;
const PLATFORM_DIRECTIVE_PATTERN = new RegExp(`${PLATFORM_DIRECTIVE_PREFIX}([a-z][\\w-]*)\\s*`, "gi");

function strExt(schema: JsonSchemaProperty, key: string): string | undefined {
  const value = schema[key];
  return typeof value === "string" ? value : undefined;
}

function enumSchema(schema: JsonSchemaProperty): JsonSchemaProperty | undefined {
  if (Array.isArray(schema.enum) && schema.enum.length > 0) return schema;
  for (const branch of [...(schema.anyOf ?? []), ...(schema.oneOf ?? [])]) {
    if (Array.isArray(branch.enum) && branch.enum.length > 0) return branch;
  }
  return undefined;
}

function typeLabel(schema: JsonSchemaProperty): string {
  const enumBranch = enumSchema(schema);
  if (enumBranch?.enum) return `enum(${enumBranch.enum.length})`;
  if (schema.const !== undefined) return "const";
  const type = schema.type;
  if (Array.isArray(type)) return type.join(" | ");
  if (type) return type;
  if (schema.properties || schema.additionalProperties || schema.patternProperties) return "object";
  if (schema.items) return "array";
  return "any";
}

function enumValues(schema: JsonSchemaProperty): SchemaViewerEnumValue[] | undefined {
  const carrier = enumSchema(schema);
  if (!carrier?.enum || carrier.enum.length === 0) return undefined;
  const rawLabels = carrier["x-enum-labels"] ?? schema["x-enum-labels"];
  const labels =
    rawLabels && typeof rawLabels === "object" ? (rawLabels as Record<string, string>) : undefined;
  return carrier.enum.map((entry) => {
    const value = String(entry);
    const label = labels?.[value];
    return label && label !== value ? { value, label } : { value };
  });
}

function location(schema: JsonSchemaProperty): SchemaViewerSourceLocation | undefined {
  const loc = schema["x-location"];
  if (!loc || typeof loc !== "object" || Array.isArray(loc)) return undefined;
  const record = loc as Record<string, unknown>;
  if (typeof record.path !== "string") return undefined;
  return {
    path: record.path,
    startLine: typeof record.startLine === "number" ? record.startLine : undefined,
    endLine: typeof record.endLine === "number" ? record.endLine : undefined,
  };
}

function parseDescription(raw: string | undefined): ParsedDescription {
  if (!raw) return {};
  const matches = [...raw.matchAll(PLATFORM_DIRECTIVE_PATTERN)];
  if (matches.length === 0) {
    const text = raw.trim();
    return text ? { text } : {};
  }

  const result: ParsedDescription = {};
  const first = matches[0];
  if (!first) return {};
  const firstIndex = first.index ?? 0;
  const text = raw.slice(0, firstIndex).trim();
  if (text) result.text = text;

  const annotations: SchemaViewerAnnotation[] = [];
  matches.forEach((match, index) => {
    const key = match[1]?.toLowerCase();
    if (!key) return;
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? (matches[index + 1]?.index ?? raw.length) : raw.length;
    const value = raw.slice(start, end).trim();
    if (!value) return;
    if (key === "query") result.query = value.replace(/^sql\s+/i, "").trim();
    else if (key === "ascode") result.ascode = value;
    else annotations.push({ key, value });
  });

  if (annotations.length > 0) result.annotations = annotations;
  return result;
}

export function fieldMeta(schema: JsonSchemaProperty): SchemaViewerFieldMeta {
  const desc = parseDescription(typeof schema.description === "string" ? schema.description : undefined);
  return {
    type: typeLabel(schema),
    platformType: strExt(schema, PLATFORM_TYPE_EXTENSION),
    ascode: strExt(schema, PLATFORM_ASCODE_EXTENSION) ?? desc.ascode,
    format: strExt(schema, PLATFORM_FORMAT_EXTENSION) ?? (typeof schema.format === "string" ? schema.format : undefined),
    clientRef: schema[PLATFORM_CLIENT_REF_EXTENSION] === true ? true : undefined,
    layout: strExt(schema, "x-layout"),
    enumValues: enumValues(schema),
    location: location(schema),
    source: strExt(schema, "x-source"),
    query: desc.query,
    annotations: desc.annotations,
    description: desc.text,
    defaultValue: schema.default === undefined ? undefined : JSON.stringify(schema.default),
    constValue: schema.const === undefined ? undefined : JSON.stringify(schema.const),
  };
}

export function hasHoverMeta(meta: SchemaViewerFieldMeta): boolean {
  return Boolean(meta.platformType || meta.ascode || meta.description || hasAdditionalMeta(meta));
}

export function hasAdditionalMeta(meta: SchemaViewerFieldMeta): boolean {
  return Boolean(
    meta.format ||
      meta.clientRef ||
      meta.layout ||
      meta.enumValues?.length ||
      meta.location ||
      meta.source ||
      meta.query ||
      meta.annotations?.length,
  );
}


