import { useState } from "react";
import { cn } from "../lib/utils";
import { ProgressBar } from "./ProgressBar";
import type { LogEntry, TaskSnapshot } from "./TaskSnapshot";
import {
  bucketTasks,
  logLevelColor,
  taskSegments,
  taskStatusBg,
  taskStatusColor,
  taskStatusIcon,
} from "./task-status";

// TaskProgress renders one or more clicky task runs (groups) and their child
// tasks: a segmented progress bar per group plus collapsible per-task rows with
// status icon, duration, error, and expandable logs. Presentational only —
// callers feed it snapshots from useTaskRun (SSE) or any other source.

// Iconify web component, loaded by the host app (same as clicky's task UI). The
// intrinsic element keeps TaskProgress free of clicky-ui's icon registry.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "iconify-icon": { icon: string; class?: string };
    }
  }
}

const MAX_COMPLETED = 5;
const MAX_PENDING = 3;

export interface TaskProgressProps {
  snapshots: TaskSnapshot[];
  title?: string;
  /** Tighter spacing for embedding in a panel. */
  compact?: boolean;
  className?: string;
}

export function TaskProgress({ snapshots, title, compact, className }: TaskProgressProps) {
  const groups = snapshots.filter((s) => s.type === "group");
  const tasks = snapshots.filter((s) => s.type === "task");

  if (groups.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        {title ? `${title}: ` : ""}No tasks yet.
      </div>
    );
  }

  return (
    <div className={cn(compact ? "space-y-2" : "space-y-3", className)}>
      {title && <h2 className="text-sm font-semibold">{title}</h2>}
      {groups.map((g) => (
        <TaskGroupCard
          key={g.groupId || g.id}
          group={g}
          tasks={tasks.filter((t) => t.groupId === g.groupId || t.group === g.id)}
          compact={compact}
        />
      ))}
    </div>
  );
}

function isFailedOrWarn(t: TaskSnapshot): boolean {
  return t.status === "failed" || t.status === "FAIL" || t.status === "ERR" || t.status === "warning";
}

function TaskGroupCard({
  group: g,
  tasks,
  compact,
}: {
  group: TaskSnapshot;
  tasks: TaskSnapshot[];
  compact: boolean | undefined;
}) {
  const [showAll, setShowAll] = useState(false);
  const total = g.total ?? tasks.length;
  const counts = bucketTasks(tasks);
  const done = counts.ok + counts.warn + counts.fail;
  const progress = total > 0 ? `${done}/${total}` : "";

  const running = tasks.filter((t) => t.status === "running");
  const pending = tasks.filter((t) => t.status === "pending");
  const completed = tasks.filter((t) => t.status !== "running" && t.status !== "pending");
  const alwaysShow = completed.filter(isFailedOrWarn);
  const collapsible = completed.filter((t) => !isFailedOrWarn(t));

  const hiddenCompleted = collapsible.length - MAX_COMPLETED;
  const collapseCompleted = !showAll && hiddenCompleted > 0;
  const visibleSuccess = collapseCompleted ? collapsible.slice(-MAX_COMPLETED) : collapsible;

  const hiddenPending = pending.length - MAX_PENDING;
  const collapsePending = !showAll && hiddenPending > 0;
  const visiblePending = collapsePending ? pending.slice(0, MAX_PENDING) : pending;

  const isTerminal = g.status !== "running" && g.status !== "pending";

  return (
    <div className={cn("rounded-lg border bg-card", compact ? "p-3" : "p-4")}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <iconify-icon icon={taskStatusIcon(g.status)} class={taskStatusColor(g.status)} />
          <span>{g.name}</span>
          {progress && <span className="text-xs text-muted-foreground">{progress}</span>}
          {g.kind && (
            <span className="rounded-full bg-muted px-1.5 py-0 text-[10px] text-muted-foreground">
              {g.kind}
            </span>
          )}
        </h3>
        {isTerminal && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs",
              taskStatusColor(g.status),
              taskStatusBg(g.status),
            )}
          >
            {g.status}
          </span>
        )}
      </div>

      {total > 0 && (
        <div className="mb-3">
          <ProgressBar segments={taskSegments(counts)} total={total} height="h-1.5" />
        </div>
      )}

      {hiddenCompleted > 0 || hiddenPending > 0 ? (
        <button
          type="button"
          className="border-b py-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll
            ? "▲ collapse"
            : `... ${(collapseCompleted ? hiddenCompleted : 0) + (collapsePending ? hiddenPending : 0)} more tasks`}
        </button>
      ) : null}

      {[...visibleSuccess, ...alwaysShow, ...running, ...visiblePending].map((t) => (
        <TaskRow key={t.id} task={t} />
      ))}
    </div>
  );
}

function TaskRow({ task: t }: { task: TaskSnapshot }) {
  const [expanded, setExpanded] = useState(false);
  const logs: LogEntry[] = t.logs ?? [];
  const hasLogs = logs.length > 0;
  // Promote the latest warning message inline so a `warning` row shows its
  // reason without expanding. Suppressed when an error is already shown.
  const latestWarn = t.error ? undefined : logs.filter((l) => l.level === "warn").at(-1);

  return (
    <div
      className={cn(
        "flex items-start gap-3 border-b py-2 last:border-0",
        hasLogs && "-mx-1 cursor-pointer rounded px-1 hover:bg-muted/50",
      )}
      onClick={hasLogs ? () => setExpanded((v) => !v) : undefined}
    >
      <iconify-icon icon={taskStatusIcon(t.status)} class={cn(taskStatusColor(t.status), "mt-0.5 text-lg")} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
            <span className="truncate">{t.name}</span>
            {t.error && <span className="truncate text-xs font-normal text-red-500">{t.error}</span>}
            {latestWarn && (
              <span className={cn("truncate text-xs font-normal", logLevelColor("warn"))}>
                {latestWarn.message}
              </span>
            )}
            {hasLogs && (
              <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                {logs.length}
              </span>
            )}
          </span>
          {t.duration && <span className="shrink-0 text-xs text-muted-foreground">{t.duration}</span>}
        </div>
        {expanded && hasLogs && (
          <div className="mt-1 ml-1 max-h-48 space-y-0.5 overflow-y-auto border-l-2 pl-2">
            {logs.map((l, i) => (
              <div key={i} className={cn("text-xs", logLevelColor(l.level))}>
                <span className="mr-1 font-mono text-muted-foreground">{l.level.substring(0, 3)}</span>
                {l.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
