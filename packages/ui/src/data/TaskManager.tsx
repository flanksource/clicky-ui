import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import { cn } from "../lib/utils";
import { useTaskRun, useTaskRuns } from "../hooks/use-task-run";
import { Icon } from "./Icon";
import { ProgressBar } from "./ProgressBar";
import { Timestamp } from "./cells/Timestamp";
import { TaskProgress } from "./TaskProgress";
import type { TaskControlAction, TaskRunMeta, TaskSnapshot } from "./TaskSnapshot";
import { taskQueryKeys } from "./task-query-keys";
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
  /** Restrict the listing to runs whose labels contain every key/value pair. */
  labels?: Record<string, string>;
  pollMs?: number;
  className?: string;
  /**
   * Currently-selected (expanded) run id, e.g. driven from the URL. When set,
   * the matching run renders expanded and selection is controlled — otherwise
   * each row manages its own expand/collapse state.
   */
  selectedId?: string;
  /**
   * Called when a run row is toggled: the new selection id, or null when the
   * open row is collapsed. Pair with selectedId for URL-driven deep links.
   */
  onSelectRun?: (id: string | null) => void;
}

export function TaskManager({
  basePath,
  kind,
  labels,
  pollMs,
  className,
  selectedId,
  onSelectRun,
}: TaskManagerProps) {
  const [kindFilter, setKindFilter] = useState<string>(kind ?? "");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const queryClient = useQueryClient();
  const apiBase = basePath ?? "/api/v1";
  const activeKind = kind ?? (kindFilter || undefined);
  const { runs, status } = useTaskRuns({
    basePath,
    kind: activeKind,
    labels,
    status: statusFilter || undefined,
    pollMs,
  });
  const runsQueryKey = useMemo(
    () => taskQueryKeys.runs({
      basePath: apiBase,
      kind: activeKind,
      status: statusFilter || undefined,
      labels,
    }),
    [activeKind, apiBase, labels, statusFilter],
  );

  useEffect(() => {
    queryClient.setQueryData(runsQueryKey, runs);
  }, [queryClient, runs, runsQueryKey]);

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
            <RunRow
              key={run.id}
              run={run}
              basePath={basePath}
              pollMs={pollMs}
              selectedId={selectedId}
              onSelectRun={onSelectRun}
              runsQueryKey={runsQueryKey}
            />
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
  selectedId,
  onSelectRun,
  runsQueryKey,
}: {
  run: TaskRunMeta;
  basePath: string | undefined;
  pollMs: number | undefined;
  selectedId: string | undefined;
  onSelectRun: ((id: string | null) => void) | undefined;
  runsQueryKey: QueryKey;
}) {
  const [localOpen, setLocalOpen] = useState(false);
  // Controlled by selectedId when a selection handler is wired; otherwise the
  // row owns its expand state (backward compatible for router-less consumers).
  const controlled = onSelectRun !== undefined;
  const open = controlled ? selectedId === run.id : localOpen;
  const toggle = () => {
    if (controlled) onSelectRun(open ? null : run.id);
    else setLocalOpen((v) => !v);
  };
  const isTerminal = run.status !== "running" && run.status !== "pending";

  return (
    <div className="border-b last:border-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-muted/50"
        onClick={toggle}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Icon
              icon={taskStatusIcon(run.status)}
              className={cn(taskStatusColor(run.status), run.status === "running" && "animate-spin")}
            />
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
      {open && (
        <ExpandedRun
          runId={run.id}
          basePath={basePath}
          pollMs={pollMs}
          runsQueryKey={runsQueryKey}
        />
      )}
    </div>
  );
}

function ExpandedRun({
  runId,
  basePath,
  pollMs,
  runsQueryKey,
}: {
  runId: string;
  basePath: string | undefined;
  pollMs: number | undefined;
  runsQueryKey: QueryKey;
}) {
  const { snapshots } = useTaskRun({ id: runId, basePath, pollMs });
  const apiBase = basePath ?? "/api/v1";
  const queryClient = useQueryClient();
  const pendingControls = useRef(new Map<string, Promise<void>>());
  const cachedSnapshots = useRef<TaskSnapshot[] | undefined>(undefined);
  const runQueryKey = useMemo(
    () => taskQueryKeys.run({ basePath: apiBase, runId }),
    [apiBase, runId],
  );
  const controlMutation = useMutation({
    mutationKey: taskQueryKeys.control({ basePath: apiBase, runId }),
    mutationFn: postTaskControl,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: runsQueryKey, exact: true, refetchType: "none" }),
        queryClient.invalidateQueries({ queryKey: runQueryKey, exact: true, refetchType: "none" }),
      ]);
    },
  });

  useEffect(() => {
    const previous = cachedSnapshots.current;
    if (previous?.length === snapshots.length && previous.every((snapshot, index) => snapshot === snapshots[index])) {
      return;
    }
    cachedSnapshots.current = snapshots;
    queryClient.setQueryData(runQueryKey, snapshots);
  }, [queryClient, runQueryKey, snapshots]);

  const mutateControl = useCallback((request: TaskControlRequest) => {
    const key = `${request.url}:${request.action}`;
    const pending = pendingControls.current.get(key);
    if (pending) return pending;
    controlMutation.reset();
    const mutation = controlMutation.mutateAsync(request).finally(() => {
      if (pendingControls.current.get(key) === mutation) pendingControls.current.delete(key);
    });
    pendingControls.current.set(key, mutation);
    return mutation;
  }, [controlMutation.mutateAsync, controlMutation.reset]);
  const control = (action: TaskControlAction, group: TaskSnapshot) =>
    mutateControl({
      url: `${apiBase}/tasks/${encodeURIComponent(runId)}/control`,
      action,
      target: group,
    });
  const controlTask = (action: TaskControlAction, task: TaskSnapshot) =>
    mutateControl({
      url: `${apiBase}/tasks/${encodeURIComponent(runId)}/tasks/${encodeURIComponent(task.id)}/control`,
      action,
      target: task,
    });
  return (
    <div className="border-t bg-muted/30 px-4 py-3">
      <TaskProgress
        snapshots={snapshots}
        compact
        onControl={control}
        onTaskControl={controlTask}
        metricsBaseUrl={`${apiBase}/tasks/metrics/`}
      />
    </div>
  );
}

interface TaskControlRequest {
  url: string;
  action: TaskControlAction;
  target: TaskSnapshot;
}

async function postTaskControl({ url, action, target }: TaskControlRequest) {
  const context = `Failed to ${action} ${target.type} "${target.name}"`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
  } catch (cause) {
    throw new Error(`${context}: ${cause instanceof Error ? cause.message : "request failed"}`, { cause });
  }
  if (!response.ok) {
    const detail = (await response.text()).trim() || `HTTP ${response.status}`;
    throw new Error(`${context}: ${detail}`);
  }
}
