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
} from "./adapter";

export {
  type StatusCounts,
  type TestStatus,
  sum,
  sumNonTaskTests,
  hasFailed,
  hasPending,
  testStatus,
  totalDuration,
  statusIconFor,
  statusToneFor,
  formatTestDuration,
  formatCount,
  humanizeName,
  collectFrameworks,
  collapseSingleChildChains,
  filterTests,
} from "./status";

export { frameworkIcon } from "./frameworkIcon";

export {
  type FilterMode,
  type FilterState,
  type TestFilters,
  emptyTestFilters,
  decodeFilterState,
  encodeFilterState,
  cycleFilterState,
  matchesFilterState,
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
