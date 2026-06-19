// Public surface of the chat component family. Re-exported from ../../chat.ts
// so consumers import from "@flanksource/clicky-ui/chat".

export { Chat, type ChatProps } from "./Chat";
export { Conversation, type ConversationProps } from "./Conversation";
export { Message, type MessageProps, type MessageActionHandlers } from "./Message";
export { MessageActions, type MessageActionsProps } from "./MessageActions";
export { Reasoning, type ReasoningProps } from "./Reasoning";
export { PromptInput, type PromptInputProps } from "./PromptInput";
export { ToolCall, type ToolCallProps } from "./ToolCall";
export { Suggestions, type SuggestionsProps } from "./Suggestion";
export {
  ModelSelector,
  type ModelSelectorProps,
  EffortSelector,
  type EffortSelectorProps,
} from "./ModelSelector";
export { providerIcon, type ProviderGlyph } from "./provider-icons";
export { ContextUsage, type ContextUsageProps } from "./ContextUsage";
export {
  AttachmentButton,
  type AttachmentButtonProps,
  AttachmentList,
  type AttachmentListProps,
} from "./Attachment";

export {
  clickyOperationsToTools,
  operationToTool,
} from "./clickyOperationsToTools";

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
  type AnyToolPart,
  type ChatModel,
  type ChatMessageMetadata,
  type ChatUsageSummary,
  type ChatStatus,
  type ChatToolInputSchema,
  type ToolResultRenderArgs,
  type ToolResultRenderer,
  type ToolMeta,
  type DynamicToolUIPart,
  type FileUIPart,
  type JSONSchemaProperty,
  type ReasoningUIPart,
  type Suggestion,
  type ToolUIPart,
  type UIMessage,
} from "./types";
