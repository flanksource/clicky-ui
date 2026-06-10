import type {
  OpenAPIOperation,
  OpenAPIParameter,
  OpenAPISchema,
  ResolvedOperation,
} from "../../rpc/types";
import type { ChatToolInputSchema, ChatToolMeta, JSONSchemaProperty } from "./types";

/** Converts a clicky RPC operation catalog into AI-tool metadata for display
 *  and request scoping. Execution stays in the Go backend; this maps an
 *  operation's `operationId` → tool name, `summary`/`description` → description,
 *  and `parameters` + `requestBody` → a JSON-Schema input. Operations without an
 *  `operationId` are skipped (a tool needs a stable name). */
export function clickyOperationsToTools(operations: ResolvedOperation[]): ChatToolMeta[] {
  const tools: ChatToolMeta[] = [];
  for (const resolved of operations) {
    const tool = operationToTool(resolved.operation);
    if (tool) {
      tools.push(tool);
    }
  }
  return tools;
}

export function operationToTool(operation: OpenAPIOperation): ChatToolMeta | null {
  if (!operation.operationId) {
    return null;
  }
  return {
    name: operation.operationId,
    description: operation.description ?? operation.summary,
    inputSchema: buildInputSchema(operation),
  };
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
