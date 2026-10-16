// Public surface of the lint results view. Re-exported from ../../data.ts so
// consumers import from "@flanksource/clicky-ui".

export { LintResults, type LintResultsProps } from "./LintResults";
export { LintFilterBar, type LintFilterBarProps } from "./LintFilterBar";
export { LintDetailPanel, type LintDetailPanelProps } from "./LintDetail";
export { LintTreeNode } from "./LintTreeNode";
export { LINT_GROUPING_OPTIONS } from "./grouping-options";

export { buildLintTree, findLintNode } from "./grouping";
export {
  collectLintLinters,
  countLintByLinter,
  countLintBySeverity,
  isLinterErrored,
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
  violationIgnoreAction,
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
  type Violation,
} from "./types";
