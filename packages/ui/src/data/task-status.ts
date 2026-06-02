import type { ProgressSegment } from "./ProgressBar";
import type { TaskSnapshot } from "./TaskSnapshot";

// Status → presentation maps, ported from clicky's task UI (task/ui/src/utils.ts)
// so the React and Preact renderers agree on icon/color semantics.

const STATUS_COLORS: Record<string, string> = {
  success: "text-green-600",
  PASS: "text-green-600",
  completed: "text-green-600",
  failed: "text-red-600",
  FAIL: "text-red-600",
  ERR: "text-red-600",
  warning: "text-yellow-600",
  running: "text-blue-600",
  pending: "text-gray-400",
  canceled: "text-gray-400",
  SKIP: "text-gray-400",
};

const STATUS_ICONS: Record<string, string> = {
  pending: "codicon:clock",
  running: "svg-spinners:ring-resize",
  success: "codicon:pass-filled",
  PASS: "codicon:pass-filled",
  completed: "codicon:pass-filled",
  failed: "codicon:error",
  FAIL: "codicon:error",
  ERR: "codicon:error",
  warning: "codicon:warning",
  canceled: "codicon:circle-slash",
  SKIP: "codicon:circle-slash",
};

const STATUS_BG: Record<string, string> = {
  success: "bg-green-100",
  completed: "bg-green-100",
  PASS: "bg-green-100",
  failed: "bg-red-100",
  FAIL: "bg-red-100",
  ERR: "bg-red-100",
  warning: "bg-yellow-100",
  running: "bg-blue-100",
  pending: "bg-gray-100",
};

export function taskStatusColor(s: string): string {
  return STATUS_COLORS[s] ?? "text-gray-500";
}

export function taskStatusIcon(s: string): string {
  return STATUS_ICONS[s] ?? "codicon:circle-outline";
}

export function taskStatusBg(s: string): string {
  return STATUS_BG[s] ?? "bg-gray-100";
}

export function logLevelColor(level: string): string {
  switch (level) {
    case "error":
      return "text-red-500";
    case "warn":
      return "text-yellow-600";
    case "debug":
      return "text-gray-400";
    default:
      return "text-gray-500";
  }
}

// taskSegments builds the colored progress-bar segments for a set of counts, in
// the canonical clicky order (passed, warnings, failed, running, pending).
export function taskSegments(counts: {
  ok: number;
  warn: number;
  fail: number;
  run: number;
  pending: number;
}): ProgressSegment[] {
  return [
    { count: counts.ok, color: "bg-green-500", label: "passed" },
    { count: counts.warn, color: "bg-yellow-400", label: "warnings" },
    { count: counts.fail, color: "bg-red-500", label: "failed" },
    { count: counts.run, color: "bg-blue-500", label: "running" },
    { count: counts.pending, color: "bg-gray-300", label: "pending" },
  ];
}

// bucketTasks tallies the child tasks of a group by status bucket.
export function bucketTasks(tasks: TaskSnapshot[]): {
  ok: number;
  warn: number;
  fail: number;
  run: number;
  pending: number;
} {
  let ok = 0;
  let warn = 0;
  let fail = 0;
  let run = 0;
  let pending = 0;
  for (const t of tasks) {
    switch (t.status) {
      case "success":
      case "PASS":
        ok += 1;
        break;
      case "warning":
        warn += 1;
        break;
      case "failed":
      case "FAIL":
      case "ERR":
        fail += 1;
        break;
      case "running":
        run += 1;
        break;
      case "pending":
        pending += 1;
        break;
      default:
        ok += 1; // SKIP / canceled / completed count as done
    }
  }
  return { ok, warn, fail, run, pending };
}
