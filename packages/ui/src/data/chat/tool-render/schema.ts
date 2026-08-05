// L1 of the tool-render pipeline: per-field metadata mined from a tool's
// JSON-Schema, when the catalog published one. Every read is optional — tools
// without a schema (custom, MCP, map-returning ops) fall through to the value
// heuristics in shape.ts, which is the normal case.

import type { JsonSchemaObject, JsonSchemaProperty } from "../../../components/json-schema-form-types";
import type { ChatToolInputSchema } from "../types";

export type ToolFieldMeta = {
  key: string;
  /** `schema.title` when present, else the raw key. Raw keys are deliberate:
   *  these are API field names, and a user approving a write op needs the exact
   *  name. Humanising them would also break the collapsed/expanded text
   *  assertions pinned by ToolCall.test.tsx. */
  label: string;
  description?: string;
  type?: string;
  format?: string;
  enumLabels?: Record<string, string>;
  required: boolean;
  order: number;
};

type AnySchema = ChatToolInputSchema | JsonSchemaObject | JsonSchemaProperty;

function propertyType(property: JsonSchemaProperty): string | undefined {
  const { type } = property;
  if (typeof type === "string") return type;
  if (Array.isArray(type)) return type.find((entry) => entry !== "null");
  return undefined;
}

function enumLabelsOf(property: JsonSchemaProperty): Record<string, string> | undefined {
  const labels = property["x-enum-labels"];
  return labels && Object.keys(labels).length > 0 ? labels : undefined;
}

/** Field metadata keyed by property name. Returns an empty map when no schema
 *  (or a schema with no properties) is supplied. */
export function fieldMetaFromSchema(schema: AnySchema | undefined): Record<string, ToolFieldMeta> {
  const properties = schema?.properties;
  if (!properties) return {};

  const required = new Set(schema?.required ?? []);
  const explicitOrder = schema?.["x-order"] ?? [];
  const fields: Record<string, ToolFieldMeta> = {};

  Object.entries(properties).forEach(([key, property], index) => {
    const orderIndex = explicitOrder.indexOf(key);
    const type = propertyType(property);
    const labels = enumLabelsOf(property);
    fields[key] = {
      key,
      label: property.title ?? key,
      required: required.has(key),
      order: orderIndex >= 0 ? orderIndex : explicitOrder.length + index,
      ...(property.description ? { description: property.description } : {}),
      ...(type ? { type } : {}),
      ...(property.format ? { format: property.format } : {}),
      ...(labels ? { enumLabels: labels } : {}),
    };
  });

  return fields;
}

/** Orders keys by the schema's declared order (`x-order`, then property order),
 *  leaving keys the schema does not know about in their original order after. */
export function orderFieldKeys(keys: string[], fields: Record<string, ToolFieldMeta>): string[] {
  return [...keys].sort((a, b) => {
    const left = fields[a]?.order;
    const right = fields[b]?.order;
    if (left === undefined && right === undefined) return 0;
    if (left === undefined) return 1;
    if (right === undefined) return -1;
    return left - right;
  });
}

/** The item schema behind a list result: the clicky `PagedResult` envelope's
 *  `properties.data.items`, or a bare array schema's `items`. */
export function listItemsSchema(schema: AnySchema | undefined): JsonSchemaProperty | undefined {
  if (!schema) return undefined;
  const data = schema.properties?.["data"];
  if (data?.items) return data.items;
  return schema.items;
}
