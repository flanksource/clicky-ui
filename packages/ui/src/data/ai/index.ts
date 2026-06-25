// Public surface of the chat application shell. Re-exported from ../../ai.ts so
// consumers import from "@flanksource/clicky-ui/ai".

export {
  ChatWindowManagerProvider,
  type ChatWindowManagerProviderProps,
} from "./ChatWindowManager";
export {
  useChatWindowManager,
  nextPromptId,
  type ChatWindowManagerValue,
  type ChatWindowState,
  type OpenPanelOpts,
} from "./chat-window-context";

export { ChatWindow, ChatWindowLayer, type ChatWindowProps } from "./ChatWindow";
export { ChatFab, type ChatFabProps } from "./ChatFab";
export {
  ThreadPicker,
  type ThreadPickerProps,
  type ThreadSummary,
  type ThreadSource,
} from "./ThreadPicker";
export {
  ContextBadges,
  ContextBadgesReadonly,
  type ContextBadgesProps,
} from "./ContextBadges";
export {
  ToolPreferences,
  type ToolPreferencesProps,
  type ToolMeta,
  type ToolMode,
} from "./ToolPreferences";
export { ContextUsage, type ContextUsageProps } from "../chat/ContextUsage";

export {
  serializeContext,
  parseContextPrefix,
  makeContextId,
  type ChatContextItem,
  type ContextTypeConfig,
  type ContextTypeStyle,
} from "./context";

// AI coding-agent session viewer (captain pkg/ai/history transcripts).
export {
  SessionViewer,
  type SessionViewerProps,
  type SessionEntry,
  type SessionEvent,
  type SessionInput,
  type SessionThemeOverride,
} from "./SessionViewer";
export {
  getSessionAction,
  normalizeSession,
  splitMcpTool,
  summarizeSession,
  summarizeToolInput,
  type SessionActionMeta,
  type SessionEventKind,
  type SessionToolUse,
  type SessionMessage,
  type SessionContent,
  type SessionTone,
} from "./SessionViewer.model";
export {
  CATEGORY_LABELS,
  classifyCommand,
  classifyToolCategory,
  collectSessionFilters,
  eventCategory,
  isEventVisible,
  type SessionCategory,
  type SessionFilters,
  type SessionVisibility,
} from "./session-categories";
