export {
  useTheme,
  useOptionalTheme,
  useResolvedTheme,
  type Theme,
  type ResolvedTheme,
} from "./hooks/use-theme";
export { ThemeProvider, type ThemeProviderProps } from "./hooks/theme-provider";
export { useDensity, useDensityValue, type Density } from "./hooks/use-density";
export {
  DensityProvider,
  DensityValueProvider,
  type DensityProviderProps,
} from "./hooks/density-provider";
export {
  useSort,
  type SortDir,
  type SortState,
  type UseSortOptions,
  type UseSortReturn,
} from "./hooks/use-sort";
export { useHistoryRoute, type UseHistoryRouteOptions } from "./hooks/use-history-route";
export {
  useTaskRun,
  useTaskRuns,
  type UseTaskRunOptions,
  type UseTaskRunResult,
  type UseTaskRunsOptions,
  type UseTaskRunsResult,
  type TaskTransportOptions,
} from "./hooks/use-task-run";
export {
  usePrompts,
  answerPrompt,
  type PromptSnapshot,
  type PromptFilter,
  type UsePromptsOptions,
  type UsePromptsResult,
} from "./hooks/use-prompts";
export {
  useHotkey,
  parseHotkey,
  formatHotkey,
  type UseHotkeyOptions,
  type ParsedHotkey,
} from "./hooks/use-hotkey";
export {
  useLogTail,
  stopLogSession,
  appendTailEvent,
  emptyLogTailBuffer,
  encodeTailParams,
  isTerminalSessionState,
  type UseLogTailOptions,
  type UseLogTailResult,
  type LogSessionInfo,
  type LogSessionState,
  type LogTailBuffer,
  type LogTailError,
  type LogTailEvent,
  type LogTailStatus,
} from "./hooks/use-log-tail";
// The pinning predicates live with the SessionViewer's windowing hook because
// that is where the math is exercised hardest, but any surface that pins a
// stream to its newest row needs the same two answers — so they are published
// here rather than copied into each caller.
export { isPinnedToBottom, isNearTop } from "./data/ai/use-session-scroll";
