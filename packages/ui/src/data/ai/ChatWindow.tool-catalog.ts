import type { ToolMeta, ToolMode } from "./ToolPreferences";

export function normalizeToolCatalog(data: unknown): ToolMeta[] {
  const tools = Array.isArray(data)
    ? data
    : data &&
      typeof data === "object" &&
      Array.isArray((data as { tools?: unknown }).tools)
    ? (data as { tools: unknown[] }).tools
    : [];
  return tools.flatMap((tool) => normalizeToolMeta(tool));
}

function normalizeToolMeta(tool: unknown): ToolMeta[] {
  if (!tool || typeof tool !== "object") return [];
  const item = tool as Record<string, unknown>;
  const name = stringValue(item.name);
  if (!name) return [];
  const label =
    stringValue(item.label) ??
    stringValue(item.title) ??
    stringValue(item.operationName) ??
    name;
  const defaultPermission = normalizeToolModeValue(
    item.defaultPermission ?? item.defaultMode
  );
  const group = stringValue(item.group);
  const parent = stringValue(item.parent);
  const entity = stringValue(item.entity);
  const preferenceKey = stringValue(item.preferenceKey);
  const icon = stringValue(item.icon);
  const description = stringValue(item.description);
  const hints = stringArrayValue(item.hints);
  const source = stringValue(item.source);
  const server = stringValue(item.server);
  const method = stringValue(item.method);
  const path = stringValue(item.path);
  const operationName = stringValue(item.operationName);
  const title = stringValue(item.title);
  const strict = booleanValue(item.strict);
  const annotations = annotationsValue(item.annotations);
  const inputSchema = schemaValue(item.inputSchema);
  const outputSchema = schemaValue(item.outputSchema);
  return [
    {
      name,
      label,
      ...(group ? { group } : {}),
      ...(parent ? { parent } : {}),
      ...(entity ? { entity } : {}),
      ...(preferenceKey ? { preferenceKey } : {}),
      ...(defaultPermission ? { defaultPermission } : {}),
      ...(icon ? { icon } : {}),
      ...(description ? { description } : {}),
      ...(hints ? { hints } : {}),
      ...(source ? { source } : {}),
      ...(server ? { server } : {}),
      ...(method ? { method } : {}),
      ...(path ? { path } : {}),
      ...(operationName ? { operationName } : {}),
      ...(title ? { title } : {}),
      ...(strict !== undefined ? { strict } : {}),
      ...(annotations ? { annotations } : {}),
      ...(inputSchema ? { inputSchema } : {}),
      ...(outputSchema ? { outputSchema } : {}),
    },
  ];
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function stringArrayValue(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const values = value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0
  );
  return values.length > 0 ? values : undefined;
}

function schemaValue(value: unknown): ToolMeta["inputSchema"] | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return undefined;
  return value as ToolMeta["inputSchema"];
}

function booleanValue(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function annotationsValue(value: unknown): ToolMeta["annotations"] | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return undefined;
  return value as ToolMeta["annotations"];
}

function normalizeToolModeValue(value: unknown): ToolMode | undefined {
  if (typeof value !== "string") return undefined;
  switch (value.trim().toLowerCase()) {
    case "on":
    case "enabled":
      return "on";
    case "ask":
      return "ask";
    case "off":
    case "disabled":
      return "off";
    case "auto":
      return "auto";
    default:
      return undefined;
  }
}
