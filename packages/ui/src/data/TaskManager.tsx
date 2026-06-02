import { useMemo, useState } from "react";
import { cn } from "../lib/utils";
import { useTaskRun, useTaskRuns } from "../hooks/use-task-run";
import { ProgressBar } from "./ProgressBar";
import { Timestamp } from "./cells/Timestamp";
import { TaskProgress } from "./TaskProgress";
import type { TaskRunMeta } from "./TaskSnapshot";
import { taskSegments, taskStatusBg, taskStatusColor, taskStatusIcon } from "./task-status";

// TaskManager is the generic clicky-ui task-manager view: it lists every run
// (TaskRunMeta) from GET {basePath}/tasks with kind/status filters, and expands
// each row into a live <TaskProgress> for that run id. Fully generic — no
// application concepts.

export interface TaskManagerProps {
  /** Base path of the clicky task API, e.g. "/api/v1". */
  basePath?: string;
  /** Restrict the listing to a single kind (also hides the kind filter). */
  kind?: string;
  pollMs?: number;
  className?: string;
}

export function TaskManager({ basePath, kind, pollMs, className }: TaskManagerProps) {
  const [kindFilter, setKindFilter] = useState<string>(kind ?? "");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { runs, status } = useTaskRuns({
    basePath,
    kind: kind ?? (kindFilter || undefined),
    status: statusFilter || undefined,
    pollMs,
  });

  const kinds = useMemo(() => {
    const set = new Set<string>();
    for (const r of runs) if (r.kind) set.add(r.kind);
    return [...set].sort();
  }, [runs]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {!kind && (
          <select
            className="rounded-md border bg-background px-2 py-1 text-xs"
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
          >
            <option value="">All kinds</option>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        )}
        <select
          className="rounded-md border bg-background px-2 py-1 text-xs"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Any status</option>
          <option value="running">Running</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="warning">Warning</option>
        </select>
        <span className="text-xs text-muted-foreground">{status}</span>
      </div>

      {runs.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No background tasks.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          {runs.map((run) => (
            <RunRow key={run.id} run={run} basePath={basePath} pollMs={pollMs} />
          ))}
        </div>
      )}
    </div>
  );
}

function RunRow({
  run,
  basePath,
  pollMs,
}: {
  run: TaskRunMeta;
  basePath: string | undefined;
  pollMs: number | undefined;
}) {
  const [open, setOpen] = useState(false);
  const isTerminal = run.status !== "running" && run.status !== "pending";

  return (
    <div className="border-b last:border-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-muted/50"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <iconify-icon icon={taskStatusIcon(run.status)} class={taskStatusColor(run.status)} />
            <span className="truncate font-medium">{run.name}</span>
            {run.kind && (
              <span className="rounded-full bg-muted px-1.5 py-0 text-[10px] text-muted-foreground">
                {run.kind}
              </span>
            )}
            {isTerminal && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  taskStatusColor(run.status),
                  taskStatusBg(run.status),
                )}
              >
                {run.status}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            {run.startedAt && <Timestamp value={run.startedAt} format="relative" />}
            <span>
              {run.completed + run.failed}/{run.total} done
              {run.failed > 0 ? `, ${run.failed} failed` : ""}
            </span>
            {Object.entries(run.labels ?? {}).map(([k, v]) => (
              <span key={k} className="font-mono">
                {k}={v}
              </span>
            ))}
          </div>
        </div>
        <div className="w-40 shrink-0">
          <ProgressBar
            segments={taskSegments({
              ok: run.completed,
              warn: 0,
              fail: run.failed,
              run: run.running,
              pending: Math.max(0, run.total - run.completed - run.failed - run.running),
            })}
            total={run.total || 1}
            height="h-1.5"
          />
        </div>
      </button>
      {open && <ExpandedRun runId={run.id} basePath={basePath} pollMs={pollMs} />}
    </div>
  );
}

function ExpandedRun({
  runId,
  basePath,
  pollMs,
}: {
  runId: string;
  basePath: string | undefined;
  pollMs: number | undefined;
}) {
  const { snapshots } = useTaskRun({ id: runId, basePath, pollMs });
  return (
    <div className="border-t bg-muted/30 px-4 py-3">
      <TaskProgress snapshots={snapshots} compact />
    </div>
  );
}
