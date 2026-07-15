import type {
  ClickySurface,
  OpenAPIOperation,
  OpenAPIParameter,
  OpenAPISchema,
  ResolvedOperation,
} from "../../rpc/types";
import type {
  ChatToolInputSchema,
  JSONSchemaProperty,
  ToolAnnotations,
  ToolMeta,
} from "./types";

/** Converts a clicky RPC operation catalog into AI-tool metadata for display
 *  and request scoping. Execution stays in the Go backend; this maps an
 *  operation's `operationId` → tool name, a short `x-clicky` verb/action →
 *  label, the `x-clicky` surface → group, `summary`/`description` → description,
 *  and `parameters` + `requestBody` → a JSON-Schema input. Operations without an
 *  `operationId` are skipped (a tool needs a stable name). */
export function clickyOperationsToTools(
  operations: ResolvedOperation[],
  surfaces?: ClickySurface[],
): ToolMeta[] {
  const surfacesByKey = new Map<string, ClickySurface>();
  for (const surface of surfaces ?? []) {
    surfacesByKey.set(surface.key, surface);
  }
  const tools: ToolMeta[] = [];
  for (const resolved of operations) {
    const tool = operationToTool(resolved.operation, resolved, surfacesByKey);
    if (tool) {
      tools.push(tool);
    }
  }
  return tools;
}

export function operationToTool(
  operation: OpenAPIOperation,
  resolved?: Pick<ResolvedOperation, "path" | "method">,
  surfacesByKey?: Map<string, ClickySurface>,
): ToolMeta | null {
  if (!operation.operationId) {
    return null;
  }
  if (isCobraHelpOrCompletionOperation(operation, resolved)) {
    return null;
  }
  const meta = operation["x-clicky"];
  const hints = meta?.toolHints;
  const group = operationToolGroup(operation);
  const surface = meta?.surface ? surfacesByKey?.get(meta.surface) : undefined;
  const parent = surface?.title || hints?.parent || surface?.entity;
  const icon = hints?.icon || surface?.icon;
  const defaultPermission = hints?.defaultPermission;
  const description = operation.description ?? operation.summary;
  return {
    name: operation.operationId,
    label: toolLabel(operation),
    ...(group
      ? { group, preferenceKey: group }
      : meta?.surface
        ? { group: meta.surface }
        : {}),
    ...(defaultPermission ? { defaultPermission } : {}),
    ...(parent ? { parent } : {}),
    ...(surface?.entity ? { entity: surface.entity } : {}),
    ...(icon ? { icon } : {}),
    ...(description ? { description } : {}),
    ...(resolved?.method ? { method: resolved.method.toUpperCase() } : {}),
    ...(resolved?.path ? { path: resolved.path } : {}),
    strict: hints?.strict ?? true,
    annotations: toolAnnotations(operation, resolved, description),
    inputSchema: buildInputSchema(operation),
  };
}

function toolAnnotations(
  operation: OpenAPIOperation,
  resolved: Pick<ResolvedOperation, "path" | "method"> | undefined,
  description: string | undefined,
): ToolAnnotations {
  const hints = operation["x-clicky"]?.toolHints;
  const method = resolved?.method?.toUpperCase() ?? "";
  const annotations: ToolAnnotations = {};
  const title =
    hints?.title ??
    operation.summary ??
    operation["x-clicky"]?.actionName ??
    description;
  if (title) annotations.title = title;
  if (hints?.readOnlyHint !== undefined) {
    annotations.readOnlyHint = hints.readOnlyHint;
  } else if (resolved?.method?.toUpperCase() === "GET") {
    annotations.readOnlyHint = true;
  }
  if (hints?.idempotentHint !== undefined) {
    annotations.idempotentHint = hints.idempotentHint;
  } else if (isIdempotentMethod(method)) {
    annotations.idempotentHint = true;
  }
  if (hints?.destructiveHint !== undefined) {
    annotations.destructiveHint = hints.destructiveHint;
  } else if (isDestructiveTool(operation, resolved)) {
    annotations.destructiveHint = true;
  }
  if (hints?.openWorldHint !== undefined) {
    annotations.openWorldHint = hints.openWorldHint;
  }
  return annotations;
}

function isIdempotentMethod(method: string): boolean {
  return (
    method === "GET" ||
    method === "HEAD" ||
    method === "OPTIONS" ||
    method === "PUT" ||
    method === "DELETE"
  );
}

function isDestructiveTool(
  operation: OpenAPIOperation,
  resolved: Pick<ResolvedOperation, "path" | "method"> | undefined,
): boolean {
  const method = resolved?.method?.toUpperCase() ?? "";
  if (method === "DELETE") return true;
  if (method === "GET" || method === "HEAD" || method === "OPTIONS")
    return false;
  const text = `${resolved?.path ?? ""} ${operation.operationId ?? ""}`.toLowerCase();
  return /\b(write|delete|remove|destroy|void|sync|create|update|patch|post)\b/.test(
    text,
  );
}

function operationToolGroup(
  operation: OpenAPIOperation,
): string | undefined {
  const meta = operation["x-clicky"];
  if (meta?.toolHints?.group) return meta.toolHints.group;
  if (meta?.group) return meta.group;
  return undefined;
}

function isCobraHelpOrCompletionOperation(
  operation: OpenAPIOperation,
  resolved?: Pick<ResolvedOperation, "path" | "method">,
): boolean {
  return (
    commandStartsWithCobraBuiltin(operation.operationId) ||
    commandStartsWithCobraBuiltin(operation["x-clicky"]?.command) ||
    pathContainsCobraBuiltin(resolved?.path)
  );
}

function commandStartsWithCobraBuiltin(raw: string | undefined): boolean {
  if (!raw) return false;
  const normalized = raw
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/[/_.-]+/g, " ")
    .trim()
    .toLowerCase();
  const first = normalized.split(/\s+/)[0];
  return first === "completion" || first === "help";
}

function pathContainsCobraBuiltin(path: string | undefined): boolean {
  if (!path) return false;
  const parts = path
    .split("/")
    .filter(Boolean)
    .map((part) => part.toLowerCase());
  const commandParts =
    parts[0] === "api" && /^v\d+$/.test(parts[1] ?? "")
      ? parts.slice(2)
      : parts;
  const first = commandParts[0];
  return first === "completion" || first === "help";
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
  const spaced = operationId
    .replace(/[_-]+/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2");
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

  return { type: "object", properties, required, additionalProperties: false };
}

function parameterToProperty(param: OpenAPIParameter): JSONSchemaProperty {
  const prop = schemaToProperty(param.schema);
  if (param.description && !prop.description) {
    prop.description = param.description;
  }
  return prop;
}

function schemaToProperty(
  schema: OpenAPISchema | undefined,
): JSONSchemaProperty {
  if (!schema) {
    return { type: "string" };
  }
  const prop: JSONSchemaProperty = { type: jsonSchemaType(schema.type) };
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

function jsonSchemaType(
  type: string | undefined,
): NonNullable<JSONSchemaProperty["type"]> {
  switch (type) {
    case "object":
    case "array":
    case "string":
    case "integer":
    case "number":
    case "boolean":
    case "null":
      return type;
    default:
      return "string";
  }
}

function requestBodySchema(
  operation: OpenAPIOperation,
): OpenAPISchema | undefined {
  const content = operation.requestBody?.content;
  if (!content) {
    return undefined;
  }
  return (
    content["application/json"]?.schema ?? Object.values(content)[0]?.schema
  );
}
