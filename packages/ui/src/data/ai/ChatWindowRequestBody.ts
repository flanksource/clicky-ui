import { serializeContext, type ChatContextItem } from "./context";
import type { ToolMeta, ToolMode } from "./ToolPreferences";

export function chatWindowRequestBody({
  base,
  contextItems,
  tools,
  toolPrefs,
}: {
  base?: Record<string, unknown> | undefined;
  contextItems: ChatContextItem[];
  tools?: ToolMeta[] | undefined;
  toolPrefs?: Record<string, ToolMode> | undefined;
}): Record<string, unknown> {
  return {
    ...base,
    ...(contextItems.length ? {
      context: serializeContext(contextItems),
      contextItems,
    } : {}),
    ...(tools ? { toolPreferences: toolPrefs ?? {} } : {}),
  };
}
