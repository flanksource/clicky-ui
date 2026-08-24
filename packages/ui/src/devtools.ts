/**
 * `@flanksource/clicky-ui/devtools` — a persistent debug console for an app
 * whose server records what it ran.
 *
 * It is a separate entry point rather than part of `data` because it pulls in
 * the tables, the HAR panel and an SSE client, and an app that never opens a
 * console should not carry any of it.
 */

export { DebugConsole } from "./devtools/DebugConsole";
export type { DebugConsoleProps } from "./devtools/DebugConsole";

export {
  DebugConsoleDock,
  DEFAULT_DOCK_HEIGHT,
  MIN_DOCK_HEIGHT,
} from "./devtools/DebugConsoleDock";
export type { DebugConsoleDockProps } from "./devtools/DebugConsoleDock";

export { DebugConsoleButton } from "./devtools/DebugConsoleButton";
export type { DebugConsoleButtonProps } from "./devtools/DebugConsoleButton";

export {
  DebugClient,
  DetailEvictedError,
  armUrl,
  withDebugFetch,
} from "./devtools/debugClient";
export type {
  DebugClientOptions,
  DebugFetchOptions,
  ManualInspectionRequest,
} from "./devtools/debugClient";

export { DebugStore, debugStore, MAX_LOG_LINES, MAX_RECORDS } from "./devtools/debugStore";
export type { DebugStoreState } from "./devtools/debugStore";

export { useDebugStream } from "./devtools/useDebugStream";
export type { UseDebugStreamOptions } from "./devtools/useDebugStream";

export {
  DEFAULT_DOCK_STATE,
  DOCK_PARAM,
  LEVEL_PARAM,
  TAB_PARAM,
  readDockState,
  writeDockState,
} from "./devtools/dockState";
export type { DockState } from "./devtools/dockState";

export { ExecutionDetail } from "./devtools/ExecutionDetail";
export type { ExecutionDetailProps } from "./devtools/ExecutionDetail";

export { ConsoleTab } from "./devtools/tabs/ConsoleTab";
export { InspectionTab } from "./devtools/tabs/InspectionTab";
export { InspectionCaches } from "./devtools/tabs/InspectionCaches";
export { NetworkTab } from "./devtools/tabs/NetworkTab";
export { QueriesTab } from "./devtools/tabs/QueriesTab";
export type { ConsoleTabProps } from "./devtools/tabs/ConsoleTab";
export type { InspectionTabProps } from "./devtools/tabs/InspectionTab";
export type { InspectionCachesProps } from "./devtools/tabs/InspectionCaches";
export type { NetworkTabProps } from "./devtools/tabs/NetworkTab";
export type { QueriesTabProps } from "./devtools/tabs/QueriesTab";

export {
  DEBUG_ID_HEADER,
  DEBUG_LEVEL_HEADER,
  DEBUG_LEVEL_PARAM,
  DEBUG_REFRESH_HEADER,
  DEBUG_TABS,
  DEFAULT_DEBUG_LEVEL,
  LEVEL_HELP,
  SELECTABLE_LEVELS,
} from "./devtools/types";
export type {
  CardinalityProbe,
  DebugTab,
  DebugCapabilities,
  DebugLevel,
  DebugLogLine,
  DebugRecordsPage,
  DebugStats,
  DetailEvicted,
  ExecutionDetail as ExecutionDetailPayload,
  FlushResult,
  InspectionCacheStats,
  InspectionCaches as InspectionCachesPayload,
  ExecutionSource,
  ExecutionSummary,
  InspectionRecord,
  OperationSummary,
  RecordCounts,
} from "./devtools/types";
