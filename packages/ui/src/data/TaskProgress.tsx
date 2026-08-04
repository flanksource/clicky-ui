import { useState } from "react";
import { Button } from "../components/button";
import { UiPlay, UiRestart, UiStop } from "../icons";
import { cn } from "../lib/utils";
import { AnsiHtml } from "./AnsiHtml";
import { Icon } from "./Icon";
import { ProgressBar } from "./ProgressBar";
import { TaskProcessDetailsView } from "./TaskProcessDetails";
import type { LogEntry, TaskControlAction, TaskSnapshot } from "./TaskSnapshot";
import { isTaskProcessDetails } from "./task-process-details";
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

const MAX_COMPLETED = 5;
const MAX_PENDING = 3;

export interface TaskProgressProps {
  snapshots: TaskSnapshot[];
  title?: string;
  /** Tighter spacing for embedding in a panel. */
  compact?: boolean;
  className?: string;
  onControl?: (action: TaskControlAction, group: TaskSnapshot) => void | Promise<void>;
  onTaskControl?: (
    action: TaskControlAction,
    task: TaskSnapshot,
    group: TaskSnapshot,
  ) => void | Promise<void>;
  metricsBaseUrl?: string;
}

export function TaskProgress({
  snapshots,
  title,
  compact,
  className,
  onControl,
  onTaskControl,
  metricsBaseUrl,
}: TaskProgressProps) {
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
          {...(onControl ? { onControl } : {})}
          {...(onTaskControl ? { onTaskControl } : {})}
          {...(metricsBaseUrl ? { metricsBaseUrl } : {})}
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
  onControl,
  onTaskControl,
  metricsBaseUrl,
}: {
  group: TaskSnapshot;
  tasks: TaskSnapshot[];
  compact: boolean | undefined;
  onControl?: (action: TaskControlAction, group: TaskSnapshot) => void | Promise<void>;
  onTaskControl?: (
    action: TaskControlAction,
    task: TaskSnapshot,
    group: TaskSnapshot,
  ) => void | Promise<void>;
  metricsBaseUrl?: string;
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
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <Icon
            icon={taskStatusIcon(g.status)}
            className={cn(taskStatusColor(g.status), g.status === "running" && "animate-spin")}
          />
          <span>{g.name}</span>
          {progress && <span className="text-xs text-muted-foreground">{progress}</span>}
          {g.kind && (
            <span className="rounded-full bg-muted px-1.5 py-0 text-[10px] text-muted-foreground">
              {g.kind}
            </span>
          )}
        </h3>
        <div className="flex shrink-0 items-center gap-1">
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
          {onControl && <TaskControls target={g} onControl={onControl} />}
        </div>
      </div>

      {total > 0 && (
        <div className="mb-3">
          <ProgressBar segments={taskSegments(counts)} total={total} height="h-1.5" />
        </div>
      )}

      {isTaskProcessDetails(g.details) && (
        <TaskProcessDetailsView
          details={g.details}
          {...(metricsBaseUrl ? { metricsBaseUrl } : {})}
        />
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
        <TaskRow
          key={t.id}
          task={t}
          group={g}
          {...(onTaskControl ? { onTaskControl } : {})}
        />
      ))}
    </div>
  );
}

function TaskRow({
  task: t,
  group,
  onTaskControl,
}: {
  task: TaskSnapshot;
  group: TaskSnapshot;
  onTaskControl?: (
    action: TaskControlAction,
    task: TaskSnapshot,
    group: TaskSnapshot,
  ) => void | Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const logs: LogEntry[] = t.logs ?? [];
  const hasLogs = logs.length > 0;
  const hasOutput = !!t.stdout || !!t.stderr;
  // Promote the latest warning message inline so a `warning` row shows its
  // reason without expanding. Suppressed when an error is already shown.
  const latestWarn = t.error ? undefined : logs.filter((l) => l.level === "warn").at(-1);
  // Bounded per-task progress (e.g. records emitted in a phase): render an x/y
  // count, a percentage, and a thin bar while the task runs.
  const done = t.progress ?? 0;
  // Only surface bounded progress once work has actually started — an untouched
  // task should not render a "0/100 · 0%" placeholder.
  const hasProgress = typeof t.maxValue === "number" && t.maxValue > 0 && done > 0;
  const pct = hasProgress ? Math.round((done / (t.maxValue as number)) * 100) : 0;

  return (
    <div
      className={cn(
        "flex items-start gap-3 border-b py-2 last:border-0",
        (hasLogs || hasOutput) && "-mx-1 cursor-pointer rounded px-1 hover:bg-muted/50",
      )}
      onClick={hasLogs || hasOutput ? () => setExpanded((v) => !v) : undefined}
    >
      <Icon
        icon={taskStatusIcon(t.status)}
        className={cn(taskStatusColor(t.status), "mt-0.5 text-lg", t.status === "running" && "animate-spin")}
      />
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
            {(hasLogs || hasOutput) && (
              <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                {logs.length + (t.stdout ? 1 : 0) + (t.stderr ? 1 : 0)}
              </span>
            )}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            {t.duration && <span className="text-xs text-muted-foreground">{t.duration}</span>}
            {onTaskControl && (
              <TaskControls
                target={t}
                labelSuffix={t.name}
                stopPropagation
                onControl={(action) => onTaskControl(action, t, group)}
              />
            )}
          </div>
        </div>
        {(t.description || hasProgress) && (
          <div className="mt-0.5 flex items-center gap-2">
            {t.description && (
              <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{t.description}</span>
            )}
            {hasProgress && (
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {done}/{t.maxValue} · {pct}%
              </span>
            )}
          </div>
        )}
        {hasProgress && t.status === "running" && (
          <div className="mt-1">
            <ProgressBar
              segments={[{ count: done, color: "bg-blue-500", label: "done" }]}
              total={t.maxValue as number}
              height="h-1"
            />
          </div>
        )}
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
        {expanded && hasOutput && (
          <div className="mt-2 space-y-2">
            {t.stdout && <TaskStream label="stdout" text={t.stdout} {...(t.stdoutTruncated ? { truncated: true } : {})} />}
            {t.stderr && <TaskStream label="stderr" text={t.stderr} {...(t.stderrTruncated ? { truncated: true } : {})} error />}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskStream({
  label,
  text,
  truncated,
  error,
}: {
  label: string;
  text: string;
  truncated?: boolean;
  error?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded border bg-black">
      <div className="flex items-center justify-between border-b border-white/10 px-2 py-1 text-[10px] text-gray-400">
        <span>{label}</span>
        {truncated && <span>showing latest 1 MiB</span>}
      </div>
      <AnsiHtml
        text={text}
        className={cn("max-h-64 overflow-auto whitespace-pre-wrap p-2 text-xs text-gray-100", error && "text-red-300")}
      />
    </div>
  );
}

function TaskControls({
  target,
  onControl,
  labelSuffix,
  stopPropagation,
}: {
  target: TaskSnapshot;
  onControl: (action: TaskControlAction, target: TaskSnapshot) => void | Promise<void>;
  labelSuffix?: string;
  stopPropagation?: boolean;
}) {
  const [busy, setBusy] = useState<TaskControlAction | null>(null);
  const [error, setError] = useState("");
  const icons = { start: UiPlay, stop: UiStop, restart: UiRestart };
  const invoke = async (action: TaskControlAction) => {
    setBusy(action);
    setError("");
    try {
      await onControl(action, target);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Failed to ${action} task`);
    } finally {
      setBusy(null);
    }
  };
  return (
    <>
      {(target.controls ?? []).map((action) => {
        const ControlIcon = icons[action];
        const actionLabel = action[0]?.toUpperCase() + action.slice(1);
        const label = labelSuffix ? `${actionLabel} ${labelSuffix}` : actionLabel;
        return (
          <Button
            key={action}
            type="button"
            variant="ghost"
            size="icon"
            aria-label={label}
            title={label}
            disabled={busy !== null}
            onClick={(event) => {
              if (stopPropagation) event.stopPropagation();
              void invoke(action);
            }}
          >
            <ControlIcon />
          </Button>
        );
      })}
      {error && <span role="alert" className="text-xs text-red-600">{error}</span>}
    </>
  );
}
