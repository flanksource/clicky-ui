import type {
  OpenAPIOperation,
  OpenAPIParameter,
  OpenAPISchema,
  ResolvedOperation,
} from "../../rpc/types";
import type {
  ChatToolInputSchema,
  JSONSchemaProperty,
  ToolMeta,
  ToolMode,
} from "./types";

const DISABLED_TOOL_GROUP = "Disabled";

const TOOL_GROUP_DEFAULTS: Record<string, ToolMode> = {
  "Accounting Read": "enabled",
  "Accounting Transaction Write": "ask",
  "Accounting Metadata Write": "ask",
  "Comments Read": "enabled",
  "Comments Write": "ask",
  "Xero Read": "disabled",
  "Xero Write": "disabled",
  "Takealot Read": "enabled",
  "Takealot Write": "disabled",
  "Admin Read": "enabled",
  "Admin Write": "ask",
};

/** Converts a clicky RPC operation catalog into AI-tool metadata for display
 *  and request scoping. Execution stays in the Go backend; this maps an
 *  operation's `operationId` → tool name, a short `x-clicky` verb/action →
 *  label, the `x-clicky` surface → group, `summary`/`description` → description,
 *  and `parameters` + `requestBody` → a JSON-Schema input. Operations without an
 *  `operationId` are skipped (a tool needs a stable name). */
export function clickyOperationsToTools(
  operations: ResolvedOperation[],
): ToolMeta[] {
  const tools: ToolMeta[] = [];
  for (const resolved of operations) {
    const tool = operationToTool(resolved.operation, resolved);
    if (tool) {
      tools.push(tool);
    }
  }
  return tools;
}

export function operationToTool(
  operation: OpenAPIOperation,
  resolved?: Pick<ResolvedOperation, "path" | "method">,
): ToolMeta | null {
  if (!operation.operationId) {
    return null;
  }
  if (isCobraHelpOrCompletionOperation(operation, resolved)) {
    return null;
  }
  const meta = operation["x-clicky"];
  const group = operationToolGroup(operation, resolved);
  if (group === DISABLED_TOOL_GROUP) {
    return null;
  }
  const description = operation.description ?? operation.summary;
  return {
    name: operation.operationId,
    label: toolLabel(operation),
    ...(group
      ? { group, preferenceKey: group, defaultMode: toolDefaultMode(group) }
      : meta?.surface
        ? { group: meta.surface }
        : {}),
    ...(description ? { description } : {}),
    inputSchema: buildInputSchema(operation),
  };
}

function operationToolGroup(
  operation: OpenAPIOperation,
  resolved?: Pick<ResolvedOperation, "path" | "method">,
): string | undefined {
  const meta = operation["x-clicky"];
  if (meta?.group) return meta.group;
  return inferToolGroup(operation, resolved);
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
    parts[0] === "api" && /^v\d+$/.test(parts[1] ?? "") ? parts.slice(2) : parts;
  const first = commandParts[0];
  return first === "completion" || first === "help";
}

function inferToolGroup(
  operation: OpenAPIOperation,
  resolved?: Pick<ResolvedOperation, "path" | "method">,
): string | undefined {
  const id = operation.operationId ?? "";
  const tags = operation.tags ?? [];
  const path = resolved?.path ?? "";
  const method = resolved?.method?.toUpperCase() ?? "";
  const write = isWriteMethod(method);

  if (path.startsWith("/api/v1/provider/") || id.startsWith("provider")) {
    return write ? "Xero Write" : "Xero Read";
  }
  if (
    path.startsWith("/api/v1/comments") ||
    path.startsWith("/api/v1/comment-messages") ||
    /^(comments|commentMessages|comment)/.test(id)
  ) {
    return write ? "Comments Write" : "Comments Read";
  }
  if (path === "/api/v1/accounts/mapping" || id.startsWith("accountMapping")) {
    return write ? "Accounting Metadata Write" : "Accounting Read";
  }
  if (path === "/api/v1/entity/metadata" || id.startsWith("entityMetadata")) {
    return write ? "Accounting Metadata Write" : "Accounting Read";
  }
  if (
    path.startsWith("/api/v1/companies/") ||
    id.startsWith("companyBranding")
  ) {
    return write ? "Accounting Metadata Write" : "Accounting Read";
  }
  if (
    path.startsWith("/api/v1/transactions") ||
    path.startsWith("/api/v1/journals") ||
    /^(transactions|journals)/.test(id)
  ) {
    return write ? "Accounting Transaction Write" : "Accounting Read";
  }
  if (
    path.startsWith("/api/v1/rules/") ||
    path.startsWith("/api/v1/rates/") ||
    path.startsWith("/api/v1/template/") ||
    path.startsWith("/api/v1/formula/") ||
    tags.some((tag) =>
      ["rules", "rates", "template", "formula"].includes(tag),
    ) ||
    /^(rules|rates|template|formula)/.test(id)
  ) {
    return write && !isReadLikeOperation(id) ? "Admin Write" : "Admin Read";
  }
  return undefined;
}

function isWriteMethod(method: string): boolean {
  return (
    method === "POST" ||
    method === "PUT" ||
    method === "PATCH" ||
    method === "DELETE"
  );
}

function isReadLikeOperation(operationId: string): boolean {
  return /(list|load|render|pdf|eval|context|validate|preview|coverage|entries|get|history|export)/i.test(
    operationId,
  );
}

function toolDefaultMode(group: string): ToolMode {
  return TOOL_GROUP_DEFAULTS[group] ?? "ask";
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

  return { type: "object", properties, required };
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
