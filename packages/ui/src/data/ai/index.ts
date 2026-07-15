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

export {
  ChatWindow,
  ChatWindowLayer,
  type ChatWindowProps,
} from "./ChatWindow";
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
  CompactToolPreferencesList,
  type CompactToolPreferencesListProps,
  type ToolPreferencesProps,
  type ClaudePermissionMode,
  type ToolMeta,
  type ToolMode,
} from "./ToolPreferences";
export {
  CLAUDE_PERMISSION_MODES,
  CLAUDE_PERMISSION_MODE_OPTIONS,
  type ClaudePermissionModeOption,
} from "../chat/types";
export {
  ToolSchemaBrowser,
  ToolSchemaBrowser as SchemaBrowser,
  type ToolSchemaBrowserProps,
} from "./ToolSchemaBrowser";
export {
  SpecRuntimeEditor,
  type SpecRuntimeEditorProps,
  type SpecRuntimeSecretSelectorConfig,
  type AISpecRuntimeValue,
} from "./SpecRuntimeEditor";
export {
  buildAISpecRuntimePayload,
  compactAISpecRuntime,
  SPEC_CHECKOUT_MODES,
  SPEC_PERMISSION_MODES,
  SPEC_STASH_MODES,
  SPEC_VERIFY_SCOPES,
  SPEC_WORKTREE_MODES,
  type AISpecRuntimeBudget,
  type AISpecRuntimeEnvVar,
  type AISpecRuntimeEnvVarSource,
  type AISpecRuntimeLocalWorkflow,
  type AISpecRuntimeMemory,
  type AISpecRuntimeMCPPermissions,
  type AISpecRuntimePermissionCatalog,
  type AISpecRuntimePermissionCatalogItem,
  type AISpecRuntimePayload,
  type AISpecRuntimePermissions,
  type AISpecRuntimePrompt,
  type AISpecRuntimeResourcePolicies,
  type AISpecRuntimeSetup,
  type AISpecRuntimeSpec,
  type AISpecRuntimeToolPolicies,
  type SpecCheckoutMode,
  type SpecPermissionMode,
  type SpecResourceMode,
  type SpecStashMode,
  type SpecToolPolicy,
  type SpecVerifyScope,
  type SpecWorktreeMode,
  normalizeMCPPermissions,
  normalizeResourcePolicies,
  normalizeToolPolicies,
} from "./SpecRuntimeEditor.model";
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
