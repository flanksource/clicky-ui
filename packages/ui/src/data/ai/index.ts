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
  type ChatContextPickerRenderProps,
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
  type ToolAnnotations,
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
export type { SpecSectionId } from "./SpecRuntimeEditor/types";
export {
  buildAISpecRuntimePayload,
  compactAISpecRuntime,
  SPEC_CHECKOUT_MODES,
  SPEC_PERMISSION_MODES,
  SPEC_SCHEMA_STRICTNESS,
  SPEC_STASH_MODES,
  SPEC_VERIFY_SCOPES,
  SPEC_WORKTREE_MODES,
  type AISpecRuntimeBudget,
  type AISpecRuntimeEnvVar,
  type AISpecRuntimeEnvVarSource,
  type AISpecRuntimeModelFallback,
  type AISpecRuntimePostRun,
  type AISpecRuntimeVerify,
  type AISpecRuntimeWorkflow,
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
  type SpecSchemaStrictness,
  type SpecStashMode,
  type SpecToolPolicy,
  type SpecVerifyScope,
  type SpecWorktreeMode,
  normalizeMCPPermissions,
  normalizeResourcePolicies,
  normalizeToolPolicies,
} from "./SpecRuntimeEditor.model";
export {
  PromptPickerField,
  PromptSourceRepair,
  SpecEditorDialog,
  isValidPromptSpecDetail,
  promptPreviewText,
  promptRuntimeValueToPayload,
  specToPromptRuntimeValue,
  type InvalidPromptSpecDetail,
  type PromptPickerFieldProps,
  type PromptPickerValue,
  type PromptSourceRepairProps,
  type PromptSpecDetail,
  type PromptSpecSavePayload,
  type SpecEditorDialogProps,
  type ValidPromptSpecDetail,
} from "./PromptPicker";
export { PromptRunEditor, type PromptRunEditorProps } from "./PromptRunEditor";
export {
  effortOptionsForModel,
  reconcileModelCapabilities,
  type ModelRuntimeSelection,
} from "./model-capabilities";
export {
  RuntimeModePicker,
  type RuntimeModePickerProps,
} from "./RuntimeModePicker";
export {
  SPEC_RUNTIME_FAMILIES,
  backendForFamilyMode,
  familyById,
  familyForBackend,
  labelForBackend,
  modelBelongsToFamily,
  modelsForFamily,
  selectionForBackend,
  type SpecRuntimeFamily,
  type SpecRuntimeModeOption,
} from "./runtime-mode";
export {
  ContextMeter,
  type ContextMeterProps,
  type ContextMeterMode,
  type ContextMeterTokens,
  type ContextMeterCost,
  type ContextMeterBudget,
} from "../chat/ContextMeter";
export { SessionContextMeter } from "./SessionViewer.header";

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
  type SessionPendingTool,
  type SessionToolDecision,
  type SessionEntry,
  type SessionEvent,
  type SessionInput,
  type SessionThemeOverride,
} from "./SessionViewer";
export {
  SessionInspector,
  type SessionInspectorProps,
  type SessionInspectorTab,
} from "./SessionInspector";
export {
  SessionChatComposer,
  type SessionChatCapabilities,
  type SessionChatComposerProps,
  type SessionChatQueuedMessage,
} from "./SessionChatComposer";
export type {
  SessionCollectionInput,
  SessionCollectionItem,
  SessionCollectionSummary,
  SessionInspectorInput,
} from "./SessionInspector.collection";
export {
  compactTokens,
  costTotal,
  formatCost,
  tokenTotal,
} from "./session-cost";
export {
  AGENT_RUNTIME_ICONS,
  APPROVAL_ICONS,
  EFFORT_ICONS,
  PERMISSION_MODE_ICONS,
  WORKFLOW_PHASES,
  effortIcon,
  type AgentActionMeta,
  type AgentRuntime,
  type ApprovalState,
  type EffortLevel,
  type WorkflowPhase,
} from "./agent-action-icons";
export {
  getSessionMetadata,
  getSessionAction,
  normalizeSession,
  normalizeMessages,
  splitMcpTool,
  summarizeSession,
  type SessionActionMeta,
  type SessionEventKind,
  type SessionMetadataSummary,
  type SessionToolUse,
  type SessionMessage,
  type SessionContent,
  type SessionTone,
} from "./SessionViewer.model";
export {
  type SessionUIMessage,
  type SessionUIPart,
  type SessionProvenance,
  type SessionAgent,
  type SessionApproval,
  type SessionApprovalStats,
  type SessionBudget,
  type SessionCapabilities,
  type SessionChangedFiles,
  type SessionCost,
  type SessionContext,
  type SessionDenial,
  type SessionGitState,
  type SessionHealth,
  type SessionLiveProcess,
  type SessionMetadataEvent,
  type SessionPlan,
  type SessionPlanEvent,
  type SessionTurn,
  type SessionUsage,
  type UnifiedSessionInput,
} from "./SessionViewer.unified";
export {
  CLAUDE_COMPLETE_SESSION,
  CLAUDE_SESSION_EXAMPLE,
  CODEX_COMPLETE_SESSION,
  CODEX_SESSION_EXAMPLE,
  COMPLETE_EXAMPLE_SESSIONS,
  EXAMPLE_SESSIONS,
} from "./examples/sessions";
export {
  questionsFromToolInput,
  summarizeToolInput,
  toolDiff,
  toolInputParams,
  type DiffSegment,
  type SessionQuestion,
  type SessionQuestionOption,
  type ToolDiff,
  type ToolParam,
} from "./SessionViewer.input";
export {
  CATEGORY_ICONS,
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
