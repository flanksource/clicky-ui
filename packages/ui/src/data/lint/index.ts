// Public surface of the lint results view. Re-exported from ../../data.ts so
// consumers import from "@flanksource/clicky-ui".

export { LintResults, type LintResultsProps, type LintView } from "./LintResults";
export { LintTable, type LintTableProps } from "./LintTable";
export { LintFilterBar, LintFilterFacets, LintGroupingPicker, type LintFilterBarProps } from "./LintFilterBar";
export { LintDetailPanel, type LintDetailPanelProps } from "./LintDetail";
export { LintTreeNode } from "./LintTreeNode";
export { ViolationSnippet, VIOLATION_CONTEXT_LINES, type LintSourceLoader } from "./ViolationSnippet";
export { ViolationLocations, type ViolationLocationsProps } from "./ViolationLocations";
export { locationLabel, urlSelector, violationTargetGroup, type LintTargetGroup } from "./locations";
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

export { LintWizardDialog, type LintWizardDialogProps, type LintWizardOption } from "./LintWizardDialog";
export {
  buildLintWizardRequest,
  emptyLintWizardDraft,
  lintWizardCommand,
  type LintWizardDraft,
  type LintWizardMethod,
  type LintWizardRequest,
} from "./LintWizardDialog.model";

export {
  DEFAULT_LINT_GROUPING,
  LINT_GROUPINGS,
  emptyLintFilters,
  type EntityHref,
  type LintAction,
  type LintFilters,
  type LintGrouping,
  type LintIgnoreRequest,
  type LintNode,
  type LintNodeKind,
  type LinterResult,
  type LinterStatus,
  type LintResultProvenance,
  type LintTargetKind,
  type Violation,
  type ViolationEntity,
  type ViolationImageRegion,
  type ViolationLocation,
  type ViolationUrlTarget,
} from "./types";
