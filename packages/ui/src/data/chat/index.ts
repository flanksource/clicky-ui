// Public surface of the chat component family. Re-exported from ../../chat.ts
// so consumers import from "@flanksource/clicky-ui/chat".

export { Chat, type ChatProps } from "./Chat";
export { Conversation, type ConversationProps } from "./Conversation";
export {
  Message,
  type MessageProps,
  type MessageActionHandlers,
} from "./Message";
export { MessageActions, type MessageActionsProps } from "./MessageActions";
export { Reasoning, type ReasoningProps } from "./Reasoning";
export { PromptInput, type PromptInputProps } from "./PromptInput";
export {
  RuntimeBar,
  type RuntimeBarProps,
  type RuntimeBarValue,
} from "../runtime/RuntimeBar";
export { ToolCall, type ToolCallProps } from "./ToolCall";
export { Suggestions, type SuggestionsProps } from "./Suggestion";
export {
  ModelSelector,
  type ModelSelectorProps,
  EffortSelector,
  type EffortSelectorProps,
  ProviderSelector,
  type ProviderSelectorOption,
  type ProviderSelectorProps,
  BudgetSelector,
  type BudgetSelectorProps,
} from "./ModelSelector";
export {
  providerIcon,
  providerIconColor,
  type ProviderGlyph,
} from "./provider-icons";
export { defaultChatModelId } from "./models";
export {
  ContextMeter,
  type ContextMeterProps,
  type ContextMeterMode,
  type ContextMeterTokens,
  type ContextMeterCost,
  type ContextMeterBudget,
} from "./ContextMeter";
export {
  AttachmentButton,
  type AttachmentButtonProps,
  AttachmentList,
  type AttachmentListProps,
} from "./Attachment";
export {
  createAttachmentUploadAdapter,
  DEFAULT_ATTACHMENT_LIMITS,
  type AttachmentFilePart,
  type AttachmentLimits,
  type AttachmentUploadAdapter,
} from "./attachment-upload";

export {
  clickyOperationsToTools,
  operationToTool,
} from "./clickyOperationsToTools";

// Tool input/output rendering: the adapter registry a host plugs domain
// renderers into, plus the known-tool and heuristic defaults <ToolCall> uses.
export {
  ToolRenderRegistry,
  createToolRenderRegistry,
  toToolRenderRegistry,
  toolNameAdapter,
  ToolRenderRegistryProvider,
  useToolRenderRegistry,
  defaultToolInputView,
  defaultToolOutputView,
  defaultToolRenderAdapters,
  knownToolRenderAdapters,
  defaultToolSummary,
  summarizeToolValue,
  normalizeToolOutput,
  classifyToolValue,
  deriveColumns,
  fieldMetaFromSchema,
  listItemsSchema,
  orderFieldKeys,
  ToolParams,
  ToolFieldValue,
  ToolArgs,
  ToolValue,
  type ToolRenderAdapter,
  type ToolRenderAdapterContext,
  type ToolRenderBaseContext,
  type ToolRenderRegistryOptions,
  type ToolRenderSurface,
  type NormalizedToolOutput,
  type ClassifiedToolValue,
  type ToolValueShape,
  type ToolPageInfo,
  type ToolFieldMeta,
  type ToolParamsProps,
  type ToolArgsProps,
  type ToolValueProps,
} from "./tool-render";

// Backend-free mocks for previews, stories and demos: a transport that streams
// a canned assistant turn and a sample model menu.
export { mockChatTransport, MOCK_MODELS } from "./Chat.fixtures";

export {
  isDynamicToolPart,
  isTypedToolPart,
  isReasoningPart,
  isFilePart,
  toolPartName,
  suggestionLabel,
  suggestionPrompt,
  CLAUDE_PERMISSION_MODES,
  CLAUDE_PERMISSION_MODE_OPTIONS,
  type AnyToolPart,
  type ChatModel,
  type ChatModelRuntime,
  type RuntimeAvailability,
  type RuntimeAvailabilityState,
  type ChatMessageMetadata,
  type ChatUsageSummary,
  type ChatBudgetConfig,
  type ChatUsageBreakdown,
  type ChatCostBreakdown,
  type ChatStatus,
  type ChatToolInputSchema,
  type ClaudePermissionMode,
  type ClaudePermissionModeOption,
  type ToolResultRenderArgs,
  type ToolResultRenderer,
  type ToolAnnotations,
  type ToolMeta,
  type ToolMode,
  type DynamicToolUIPart,
  type FileUIPart,
  type JSONSchemaProperty,
  type ReasoningUIPart,
  type Suggestion,
  type ToolUIPart,
  type UIMessage,
} from "./types";
