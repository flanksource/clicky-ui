// Tool input/output renderer registry. Re-exported from ../index.ts, so
// consumers reach it via "@flanksource/clicky-ui/chat".

export {
  ToolRenderRegistry,
  toolNameAdapter,
  type ToolRenderAdapter,
  type ToolRenderAdapterContext,
  type ToolRenderRegistryOptions,
  type ToolRenderSurface,
} from "./adapter";
export { createToolRenderRegistry, toToolRenderRegistry } from "./registry";
export { ToolRenderRegistryProvider, useToolRenderRegistry } from "./context";
export {
  defaultToolInputView,
  defaultToolOutputView,
  defaultToolRenderAdapters,
  type ToolRenderBaseContext,
} from "./defaults";
export { defaultToolSummary, summarizeToolValue } from "./summary";
export { ToolArgs, type ToolArgsProps } from "./ToolArgs";
export { knownToolRenderAdapters } from "./known-tools";
export { normalizeToolOutput, type NormalizedToolOutput } from "./normalize";
export {
  classifyToolValue,
  deriveColumns,
  type ClassifiedToolValue,
  type ToolPageInfo,
  type ToolValueShape,
} from "./shape";
export {
  fieldMetaFromSchema,
  listItemsSchema,
  orderFieldKeys,
  type ToolFieldMeta,
} from "./schema";
export { ToolParams, ToolFieldValue, type ToolParamsProps } from "./ToolParams";
export { ToolValue, type ToolValueProps } from "./ToolValue";
