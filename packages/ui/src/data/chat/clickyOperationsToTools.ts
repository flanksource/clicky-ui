import type {
  OpenAPIOperation,
  OpenAPIParameter,
  OpenAPISchema,
  ResolvedOperation,
} from "../../rpc/types";
import type { ChatToolInputSchema, JSONSchemaProperty, ToolMeta } from "./types";

/** Converts a clicky RPC operation catalog into AI-tool metadata for display
 *  and request scoping. Execution stays in the Go backend; this maps an
 *  operation's `operationId` → tool name, a short `x-clicky` verb/action →
 *  label, the `x-clicky` surface → group, `summary`/`description` → description,
 *  and `parameters` + `requestBody` → a JSON-Schema input. Operations without an
 *  `operationId` are skipped (a tool needs a stable name). */
export function clickyOperationsToTools(operations: ResolvedOperation[]): ToolMeta[] {
  const tools: ToolMeta[] = [];
  for (const resolved of operations) {
    const tool = operationToTool(resolved.operation);
    if (tool) {
      tools.push(tool);
    }
  }
  return tools;
}

export function operationToTool(operation: OpenAPIOperation): ToolMeta | null {
  if (!operation.operationId) {
    return null;
  }
  const meta = operation["x-clicky"];
  const description = operation.description ?? operation.summary;
  return {
    name: operation.operationId,
    label: toolLabel(operation),
    ...(meta?.surface ? { group: meta.surface } : {}),
    ...(description ? { description } : {}),
    inputSchema: buildInputSchema(operation),
  };
}

/** A concise popover label: the clicky action/verb (capitalized) when present,
 *  else the operation summary, else a humanized operationId. Mirrors the intent
 *  of rpc/clickyMetadata.ts `surfaceActionLabel`. */
function toolLabel(operation: OpenAPIOperation): string {
  const meta = operation["x-clicky"];
  const short = meta?.actionName?.trim() || meta?.verb?.trim();
  if (short && short !== "action") {
    return short.charAt(0).toUpperCase() + short.slice(1);
  }
  if (operation.summary) {
    return operation.summary;
  }
  return humanize(operation.operationId ?? "");
}

function humanize(operationId: string): string {
  const spaced = operationId.replace(/[_-]+/g, " ").replace(/([a-z\d])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function buildInputSchema(operation: OpenAPIOperation): ChatToolInputSchema {
  const properties: Record<string, JSONSchemaProperty> = {};
  const required: string[] = [];

  for (const param of operation.parameters ?? []) {
    properties[param.name] = parameterToProperty(param);
    if (param.required) {
      required.push(param.name);
    }
  }

  const body = requestBodySchema(operation);
  if (body?.properties) {
    for (const [name, schema] of Object.entries(body.properties)) {
      properties[name] = schemaToProperty(schema);
    }
  }

  return { type: "object", properties, required };
}

function parameterToProperty(param: OpenAPIParameter): JSONSchemaProperty {
  const prop = schemaToProperty(param.schema);
  if (param.description && !prop.description) {
    prop.description = param.description;
  }
  return prop;
}

function schemaToProperty(schema: OpenAPISchema | undefined): JSONSchemaProperty {
  if (!schema) {
    return { type: "string" };
  }
  const prop: JSONSchemaProperty = { type: schema.type ?? "string" };
  if (schema.description !== undefined) {
    prop.description = schema.description;
  }
  if (schema.enum !== undefined) {
    prop.enum = schema.enum;
  }
  if (schema.default !== undefined) {
    prop.default = schema.default;
  }
  return prop;
}

function requestBodySchema(operation: OpenAPIOperation): OpenAPISchema | undefined {
  const content = operation.requestBody?.content;
  if (!content) {
    return undefined;
  }
  return content["application/json"]?.schema ?? Object.values(content)[0]?.schema;
}
