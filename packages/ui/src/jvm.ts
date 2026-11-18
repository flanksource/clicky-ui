/**
 * JVM diagnostics: browse and operate a live JVM through its diagnostics agent.
 *
 * Layers, each depending only on those above it:
 * - protocol — wire types of the `jvm.*` agent operations, the
 *   `JvmDiagnosticsClient` port, `jvmOperationClient(call)` for agents that
 *   speak the operation protocol, and `jvmKeys(scope)` for the query cache.
 * - model — pure helpers (ObjectName grouping, argument parsing, value typing).
 * - components — presentational views taking data, callbacks and slots.
 * - surfaces — data-wired screens under a `JvmProvider`; the host owns routing
 *   (`state` / `onStateChange`), permissions (`canMutate`) and app concepts
 *   (extra tabs and panes).
 */
export type * from "./jvm/protocol/types";
export type { JvmDiagnosticsClient, JvmRequestOptions } from "./jvm/protocol/client";
export {
  jvmOperationClient,
  type JvmOperationCall,
  type JvmOperationCallOptions,
} from "./jvm/protocol/operation-client";
export { jvmKeys } from "./jvm/protocol/query-keys";

export {
  buildMBeanBrowserTree,
  parseObjectName,
  unquoteObjectNameValue,
  UNTYPED_MBEAN,
  type MBeanDomain,
  type MBeanLeaf,
  type MBeanTypeGroup,
  type ObjectNameProperty,
} from "./jvm/model/mbean-tree";
export { isBooleanMBeanType, isScalarMBeanType, parseMBeanArgument } from "./jvm/model/mbean-arguments";
export { mbeanAttributeProperty } from "./jvm/model/mbean-properties";
export { mergeMBeanReadings } from "./jvm/model/mbean-readings";

export { MBeanBrowser, type MBeanBrowserProps } from "./jvm/mbeans/MBeanBrowser";
export { findMBeanNode, mbeanBrowserNodes, type MBeanBrowserNode } from "./jvm/mbeans/mbean-browser-nodes";
export { MBeanDetailView, type MBeanDetailTab, type MBeanDetailViewProps } from "./jvm/mbeans/MBeanDetailView";
export { MBeanAttributes, type MBeanAttributesProps } from "./jvm/mbeans/MBeanAttributes";
export { MBeanAttributeLabel, type MBeanAttributeLabelProps } from "./jvm/mbeans/MBeanAttributeLabel";
export { mbeanAttributeIcon } from "./jvm/mbeans/mbean-attribute-icon";
export { MBeanAttributeEditDialog, type MBeanAttributeEditDialogProps } from "./jvm/mbeans/MBeanAttributeEditDialog";
export { MBeanOperations, type MBeanOperationsProps } from "./jvm/mbeans/MBeanOperations";
export { MBeanInvokeDialog, type MBeanInvokeDialogProps } from "./jvm/mbeans/MBeanInvokeDialog";

export { MutationGate, type MutationGateProps } from "./jvm/safety/MutationGate";
export { mutationAllowed, type MutationGateState } from "./jvm/safety/mutation-allowed";

export {
  BUILT_IN_EXPRESSION_PRESETS,
  EXPRESSION_HISTORY_LIMIT,
  evaluationGraph,
  evaluationRawText,
  ognlExpressionForNode,
  pushExpressionHistory,
  type ExpressionLanguage,
  type ExpressionPreset,
} from "./jvm/model/expressions";
export { EvaluationResult, type EvaluationResultProps, type EvaluationResultView } from "./jvm/ognl/EvaluationResult";
export { ExpressionConsole, type ExpressionConsoleProps, type ExpressionLoaderChoice } from "./jvm/ognl/ExpressionConsole";
export { expressionHistoryStorageKey, useExpressionHistory } from "./jvm/ognl/use-expression-history";
export { ExpressionSurface, type ExpressionSurfaceProps, type ExpressionSurfaceState } from "./jvm/surfaces/ExpressionSurface";

export {
  canRestorePatch,
  formatLeaseRemaining,
  isVirtualLoader,
  leaseRemainingMs,
  patchKey,
  patchRowState,
  summarisePatches,
  VIRTUAL_LOADER_REASON,
  type PatchFailure,
  type PatchRowState,
  type PatchSummary,
} from "./jvm/model/patches";
export {
  effectiveLevels,
  filterLoggerRows,
  JUL_LEVELS,
  loggerDisplayName,
  loggerRows,
  ROOT_LOGGER_LABEL,
  type EffectiveLevel,
  type LoggerRow,
} from "./jvm/model/loggers";
export { capturedAtMs, poolLimit, poolTone, sumPools } from "./jvm/model/memory";
export { PatchRegister, type PatchRegisterProps } from "./jvm/patches/PatchRegister";
export { PatchRegisterTable, type PatchRegisterTableProps } from "./jvm/patches/PatchRegisterTable";
export { RegisterSummary, type RegisterSummaryProps } from "./jvm/patches/RegisterSummary";
export { RuntimeDashboard, type RuntimeDashboardProps } from "./jvm/runtime/RuntimeDashboard";
export { RuntimeInfo, type RuntimeInfoProps } from "./jvm/runtime/RuntimeInfo";
export { MemoryPools, type MemoryPoolsProps } from "./jvm/runtime/MemoryPools";
export { GcSummary, type GcSummaryProps } from "./jvm/runtime/GcSummary";
export { ProcessTiles, type ProcessTilesProps } from "./jvm/runtime/ProcessTiles";
export { PoolMetricsTable, type PoolMetricsTableProps } from "./jvm/runtime/PoolMetricsTable";
export { LoggersTable, type LoggersTableProps } from "./jvm/logging/LoggersTable";
export { LoggerLevelDialog, type LoggerLevelDialogProps } from "./jvm/logging/LoggerLevelDialog";
export { PatchesSurface, type PatchesSurfaceProps } from "./jvm/surfaces/PatchesSurface";
export { RuntimeSurface, type RuntimeSurfaceProps } from "./jvm/surfaces/RuntimeSurface";
export { LoggingSurface, type LoggingSurfaceProps, type LoggingSurfaceState } from "./jvm/surfaces/LoggingSurface";

export {
  baseThreadName,
  buildThreadTree,
  countThreadStates,
  dominantState,
  formatContention,
  formatThreadCpu,
  isDiagnosticsAgentThread,
  parseStateSet,
  parseThreadId,
  parseThreadSort,
  serializeStateSet,
  sortThreads,
  threadStackFileName,
  visibleThreads,
  withViewParam,
  THREAD_SORTS,
  type ThreadLike,
  type ThreadSort,
  type ThreadTreeNode,
  type ThreadsViewState,
  type VisibleThreadsOptions,
} from "./jvm/model/threads";
export { countStackFrames, foldRepeatedFrames, type FoldedStack, type StackFold } from "./jvm/model/stack-fold";
export { ThreadTree, type ThreadTreeProps } from "./jvm/threads/ThreadTree";
export { ThreadRow, ThreadGroupRow, type ThreadRowProps } from "./jvm/threads/ThreadRow";
export { ThreadFacts, type ThreadFactsProps } from "./jvm/threads/ThreadFacts";
export { ThreadDetail, type ThreadDetailProps } from "./jvm/threads/ThreadDetail";
export { LockOwnerButton, type LockOwnerButtonProps } from "./jvm/threads/LockOwnerButton";
export { FoldedStackTrace, type FoldedStackTraceProps } from "./jvm/threads/FoldedStackTrace";
export { DeadlockCallout, type DeadlockCalloutProps } from "./jvm/threads/DeadlockCallout";
export { ThreadsToolbar, type ThreadsToolbarProps } from "./jvm/threads/ThreadsToolbar";
export { downloadText } from "./jvm/threads/download-text";
export { ThreadsSurface, type ThreadsSurfaceProps, type ThreadsSurfaceState } from "./jvm/surfaces/ThreadsSurface";

export { buildClassTree, classNodeKey, classSimpleName, findClassNode, type ClassTreeNode } from "./jvm/model/class-tree";
export {
  bareMethodName,
  classFocus,
  methodKey,
  methodSignature,
  selectMethod,
  type ClassFocus,
  type ClassFocusInput,
  type ClassSelection,
  type LineRange,
} from "./jvm/model/class-fold";
export { gutterLabel, hasLineMap, lineForRow, mappedRow, rowForLine, type MappedRow } from "./jvm/model/source-lines";
export {
  includePlatformFromState,
  updateClassesState,
  type ClassesSurfaceState,
  type ClassesStatePatch,
} from "./jvm/classes/classes-state";
export { ClassBrowser, type ClassBrowserProps } from "./jvm/classes/ClassBrowser";
export { MethodPicker, type MethodPickerProps } from "./jvm/classes/MethodPicker";
export { CompileDiagnosticsList, type CompileDiagnosticsListProps } from "./jvm/classes/CompileDiagnosticsList";
export { PatchActions, type PatchActionsProps, type PatchBusy } from "./jvm/classes/PatchActions";
export { DecompiledSourceView, type DecompiledSourceViewProps } from "./jvm/classes/DecompiledSourceView";
export { DecompiledSourceReader, type DecompiledSourceReaderProps } from "./jvm/classes/DecompiledSourceReader";
export { ClassDownloads, type ClassDownloadsProps } from "./jvm/classes/ClassDownloads";
export { PatchedClassList, type PatchedClassListProps } from "./jvm/classes/PatchedClassList";
export { diagnosticMarkers, type SourceMarker } from "./jvm/classes/source-markers";
export { base64ToBlob, classArtifactFilename, saveBlob } from "./jvm/classes/class-download";
export { LEASE_OPTIONS, DEFAULT_LEASE_SECONDS, leaseLabel } from "./jvm/classes/patch-leases";
export { ClassesSurface, type ClassesSurfaceProps } from "./jvm/surfaces/ClassesSurface";

export { JvmDiagnosticsWorkspace, type JvmDiagnosticsSection, type JvmDiagnosticsWorkspaceProps } from "./jvm/surfaces/JvmDiagnosticsWorkspace";
export { JvmStatusBar, type JvmStatusBarProps } from "./jvm/surfaces/JvmStatusBar";
export { JvmProvider, type JvmProviderProps } from "./jvm/surfaces/JvmProvider";
export { useJvm, useJvmStatus, type JvmContextValue } from "./jvm/surfaces/jvm-context";
export { MBeansSurface, type MBeansSurfaceProps, type MBeansSurfaceState } from "./jvm/surfaces/MBeansSurface";
