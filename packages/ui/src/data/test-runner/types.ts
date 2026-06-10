// Test-runner data model — ported from the Gavel test runner so consumers
// (gavel and downstream hosts) can rebase onto clicky-ui without a data shim. Field names
// keep gavel's snake_case wire shape on purpose. Lint/bench/diagnostics nodes
// are intentionally out of scope here.

export interface Test {
  name: string;
  package?: string;
  package_path?: string;
  work_dir?: string;
  command?: string;
  suite?: string[];
  message?: string;
  file?: string;
  line?: number;
  framework?: string;
  /** Duration in nanoseconds. */
  duration?: number;
  skipped?: boolean;
  failed?: boolean;
  passed?: boolean;
  /**
   * Non-blocking warning state — amber, surfaced to the operator but never a
   * failure (a warned child never fails its parent). Distinct from `failed`.
   */
  warned?: boolean;
  pending?: boolean;
  /**
   * Execution started but not yet finished — distinct from `pending`
   * (queued/not-yet-started). Renderers show running with an active spinner
   * and pending with a static hollow icon.
   */
  running?: boolean;
  timed_out?: boolean;
  task_id?: string;
  can_stop?: boolean;
  stdout?: string;
  stderr?: string;
  children?: Test[];
  summary?: TestSummary;
  attempts?: TestAttempt[];
  context?: GoTestContext | GinkgoContext | FixtureContext | TaskContext;
  /** Provider-owned structured JSON, rendered by the matching node adapter. */
  detail?: unknown;
  failure_detail?: FailureDetail;
  /** Live in-flight progress for a still-running node. Cleared on completion. */
  progress?: { phase?: string; done: number; total: number };
  /** Host-assigned stable path used for selection/navigation. */
  route_path?: string;
}

export interface TestAttempt {
  sequence: number;
  run_kind?: string;
  started?: string;
  ended?: string;
  duration?: number;
  pid?: number;
  command?: string;
  framework?: string;
  exit_code?: number;
  passed?: boolean;
  failed?: boolean;
  skipped?: boolean;
  pending?: boolean;
  timed_out?: boolean;
  message?: string;
  stdout?: string;
  stderr?: string;
  stack_trace?: string;
  cpu_percent?: number;
  rss?: number;
  goroutine_count?: number;
}

export interface TestSummary {
  Total: number;
  Passed: number;
  Failed: number;
  Warned?: number;
  Skipped: number;
  Pending: number;
  Running?: number;
  Duration: number;
}

export interface Snapshot {
  metadata?: RunMeta;
  git?: SnapshotGit;
  status: SnapshotStatus;
  tests: Test[];
}

export interface RunMeta {
  version?: string;
  sequence: number;
  kind?: "initial" | "rerun" | string;
  started?: string;
  ended?: string;
  args?: Record<string, unknown>;
  pid?: number;
  command?: string;
  frameworks?: string[];
  exit_code?: number;
  timed_out?: boolean;
}

export interface SnapshotGit {
  repo?: string;
  root?: string;
  sha?: string;
}

export interface SnapshotStatus {
  running: boolean;
  stop_supported?: boolean;
  test_edit_supported?: boolean;
  stopped?: boolean;
  stop_message?: string;
}

export interface GoTestContext {
  parent_test?: string;
  import_path?: string;
}

export interface GinkgoContext {
  suite_description?: string;
  suite_path?: string;
  failure_location?: string;
}

/** Virtual clicky-task pseudo-test context emitted by the Go server. */
export interface TaskContext {
  status?: string;
  type?: string;
  duration?: number;
}

export interface FixtureContext {
  command?: string;
  exit_code?: number;
  cwd?: string;
  cel_expression?: string;
  cel_vars?: Record<string, unknown>;
  expected?: unknown;
  actual?: unknown;
}

export type FailureKind = "gomega" | "panic" | "go_test" | "raw";

export interface FailureDetail {
  kind?: FailureKind;
  summary?: string;
  matcher?: string;
  expected?: string;
  actual?: string;
  location?: string;
  stack?: string;
}
