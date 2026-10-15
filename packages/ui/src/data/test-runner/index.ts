// Public surface of the test-runner component family. Re-exported from
// ../../data.ts so consumers import from "@flanksource/clicky-ui" or "/data".

export { TestRunner, type TestRunnerProps } from "./TestRunner";
export { TestTree } from "./TestTree";
export { TestTreeNode } from "./TestTreeNode";
export { TestDetailPanel } from "./TestDetailPanel";
export {
  TestFailureDetail,
  TestOutput,
  TestAttempts,
} from "./TestFailureDetail";
export { Expectation, type ExpectationProps } from "./Expectation";
export { TestRunSummary, type TestRunSummaryProps } from "./TestRunSummary";
export { TestFilterBar, type TestFilterBarProps } from "./TestFilterBar";

export {
  TestRunnerProvider,
  useTestRunner,
  type TestRunnerContext,
} from "./context";

export {
  TestNodeAdapterRegistry,
  createTestRunnerRegistry,
  type TestNodeAdapter,
  type AdapterContext,
  type DetailTab,
  type DetailAttempt,
} from "./adapter";

export {
  genericCopySections,
  mergeCopySections,
  buildBrief,
  buildNodeBrief,
  buildNodeJson,
  type BriefFact,
  type BriefSection,
  type CopyItem,
  type CopySections,
} from "./copy";

export {
  type StatusCounts,
  type TestStatus,
  sum,
  sumNonTaskTests,
  aggregateStatusCounts,
  STATUS_LABELS,
  hasFailed,
  hasPending,
  testStatus,
  totalDuration,
  outcomeFor,
  type TestOutcome,
  statusToneFor,
  formatTestDuration,
  formatCount,
  humanizeName,
  collectFrameworks,
  collapseSingleChildChains,
  filterTests,
} from "./status";

export {
  TEST_OUTCOMES,
  LINT_SEVERITIES,
  TEST_TOOLS,
  toolMark,
  toolKeyFor,
  type ResultMark,
  type LintSeverity,
  type ToolKind,
  type ToolMark,
} from "./marks";
export { OutcomeIcon, LintSeverityIcon, ToolIcon } from "./MarkIcons";

export { slugify, annotateRoutePaths, findNodeByRoutePath } from "./routePath";

export {
  type FilterMode,
  type FilterState,
  type TestFilters,
  emptyTestFilters,
  decodeFilterState,
  encodeFilterState,
  cycleFilterState,
  matchesFilterState,
  filterStateToRecord,
  recordToFilterState,
} from "./filterState";

export type {
  Test,
  TestSummary,
  TestAttempt,
  FailureDetail,
  FailureKind,
  GoTestContext,
  GinkgoContext,
  FixtureContext,
  TaskContext,
  RunMeta,
  Snapshot,
  SnapshotGit,
  SnapshotStatus,
} from "./types";
