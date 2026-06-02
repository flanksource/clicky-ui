// TaskSnapshot mirrors the Go `task.TaskSnapshot` wire format emitted by clicky's
// JSONHandler / SSEHandler (github.com/flanksource/clicky/task/snapshot.go). Field
// names match the JSON tags exactly. This module is generic — it carries no
// application-specific concepts.

export interface LogEntry {
  level: string;
  message: string;
}

export interface TaskSnapshot {
  id: string;
  name: string;
  /** "task" or "group". */
  type: "task" | "group";
  /** Parent group NAME (groups: empty). */
  group?: string;
  status: string;
  duration?: string;
  error?: string;
  /** Latest log line. */
  message?: string;
  logs?: LogEntry[];
  /** Group aggregates. */
  total?: number;
  completed?: number;
  failed?: number;
  running?: number;
  /** Stable parent-run id (tasks) or the run's own id (groups). */
  groupId?: string;
  kind?: string;
  labels?: Record<string, string>;
  owner?: string;
  /** RFC3339. */
  startedAt?: string;
  /** RFC3339. */
  finishedAt?: string;
}

// TaskRunMeta mirrors the Go `task.RunMeta` listing summary returned by
// GET {prefix}/tasks. Named TaskRunMeta to avoid colliding with the unrelated
// diagnostics `RunMeta` already exported by this package.
export interface TaskRunMeta {
  id: string;
  name: string;
  kind?: string;
  labels?: Record<string, string>;
  owner?: string;
  status: string;
  startedAt?: string;
  finishedAt?: string;
  total: number;
  completed: number;
  failed: number;
  running: number;
}

// Terminal run/group statuses (not running/pending). Used to decide when an SSE
// stream is done or when polling should stop.
const TERMINAL_STATUSES = new Set([
  "success",
  "failed",
  "warning",
  "canceled",
  "PASS",
  "FAIL",
  "ERR",
  "SKIP",
]);

export function isTerminalStatus(status: string | undefined): boolean {
  return !!status && TERMINAL_STATUSES.has(status);
}

// allGroupsTerminal reports whether every group snapshot has reached a terminal
// status — i.e. the run(s) are complete and an SSE stream / poll can stop.
export function allGroupsTerminal(snapshots: TaskSnapshot[]): boolean {
  const groups = snapshots.filter((s) => s.type === "group");
  if (groups.length === 0) return false;
  return groups.every((g) => isTerminalStatus(g.status));
}
