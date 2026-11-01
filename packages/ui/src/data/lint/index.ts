// Public surface of the lint results view. Re-exported from ../../data.ts so
// consumers import from "@flanksource/clicky-ui".

export { LintResults, type LintResultsProps, type LintView } from "./LintResults";
export { LintTable, type LintTableProps } from "./LintTable";
export { LintFilterBar, LintFilterFacets, LintGroupingPicker, type LintFilterBarProps } from "./LintFilterBar";
export { LintDetailPanel, type LintDetailPanelProps } from "./LintDetail";
export { LintTreeNode } from "./LintTreeNode";
export { ViolationSnippet, VIOLATION_CONTEXT_LINES, type LintSourceLoader } from "./ViolationSnippet";
export { LINT_GROUPING_OPTIONS } from "./grouping-options";

export { buildLintTree, findLintNode } from "./grouping";
export {
  collectLintLinters,
  countLintByLinter,
  countLintBySeverity,
  isLinterErrored,
  isLinterInFlight,
  lintNodeCount,
  lintNodeSeverity,
  totalLintViolations,
} from "./stats";
export {
  collectFolderLintStats,
  folderPattern,
  lintFileActions,
  lintFolderActions,
  lintNodeActions,
  violationIgnoreActions,
} from "./actions";

export {
  DEFAULT_LINT_GROUPING,
  LINT_GROUPINGS,
  emptyLintFilters,
  type LintAction,
  type LintFilters,
  type LintGrouping,
  type LintIgnoreRequest,
  type LintNode,
  type LintNodeKind,
  type LinterResult,
  type LinterStatus,
  type LintResultProvenance,
  type Violation,
  type ViolationLocation,
} from "./types";
