import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { hashKey, useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import { cn } from "../lib/utils";
import { formatDuration } from "../lib/format";
import { useResourceClock } from "../hooks/use-resource-clock";
import { useTaskRun, useTaskRuns } from "../hooks/use-task-run";
import type { FilterBarFilter } from "../components/FilterBar";
import { Icon } from "./Icon";
import { DataTable, type DataTableColumn } from "./DataTable";
import { splitTagToken } from "./cells/tag-utils";
import { ProgressBar } from "./ProgressBar";
import { TaskProgress } from "./TaskProgress";
import { taskWorkProgress } from "./task-work-progress";
import type { TaskControlAction, TaskRunMeta, TaskSnapshot } from "./TaskSnapshot";
import type { TaskHeaderExtra } from "./TaskHeaderExtras";
import type { TaskExtraTabs } from "./TaskStreamTabs";
import { taskQueryKeys } from "./task-query-keys";
import { taskSegments, taskStatusColor, taskStatusIcon } from "./task-status";

// TaskManager is the generic clicky-ui task-manager view: it lists every run
// (TaskRunMeta) from GET {basePath}/tasks with kind/status filters, and expands
// each row into a live <TaskProgress> for that run id.
//
// Requires a react-query QueryClientProvider in the host app (like
// TimeseriesPanel and CacheBrowser): control actions run through useMutation,
// and the listing is mirrored into the query cache so sibling views can read it.

export interface TaskManagerProps {
  /** Base path of the clicky task API, e.g. "/api/v1". */
  basePath?: string;
  /** Restrict the listing to a single kind (also hides the kind filter). */
  kind?: string;
  /** Restrict the listing to runs whose labels contain every key/value pair. */
  labels?: Record<string, string>;
  pollMs?: number;
  className?: string;
  /** Keep the run columns usable in a narrow panel. */
  compact?: boolean;
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
  /**
   * Contributes host-owned output panes to each task, alongside its own
   * stdout/stderr — an agent's session transcript, say.
   */
  extraTabs?: TaskExtraTabs;
  /**
   * Replaces the content beside a task's name in its header row. Returning null
   * for a task falls back to the default metadata chips.
   */
  headerExtra?: TaskHeaderExtra;
  renderRunDetails?: (run: TaskRunMeta, snapshots: TaskSnapshot[]) => ReactNode;
  controlUrl?: (run: TaskRunMeta, action: TaskControlAction) => string | undefined;
  showTaskControls?: (run: TaskRunMeta) => boolean;
}

type RunTableRow = Record<string, unknown> & {
  id: string;
  name: string;
  kind: string;
  status: string;
  startedAt?: string;
  finishedAt?: string;
  labels?: Record<string, string>;
  run: TaskRunMeta;
};

const progressColumn: DataTableColumn<RunTableRow> = {
  key: "progress", label: "Progress", minWidth: 180,
  accessor: (row) => taskWorkProgress(row.run).done,
  render: (_, row) => {
    const progress = taskWorkProgress(row.run);
    return (
      <div className="min-w-36 space-y-1">
        <span className="text-xs tabular-nums text-muted-foreground">{progress.label}</span>
        {progress.total > 0 && <ProgressBar segments={taskSegments(progress.counts)} total={progress.total} height="h-1.5" />}
      </div>
    );
  },
};
const startedColumn: DataTableColumn<RunTableRow> = { key: "startedAt", label: "Started", kind: "timestamp", sortable: true };
const durationColumn: DataTableColumn<RunTableRow> = {
  key: "duration", label: "Duration", sortable: true,
  accessor: (row) => row.startedAt ? Date.parse(row.finishedAt ?? new Date().toISOString()) - Date.parse(row.startedAt) : null,
  render: (_, row) => <RunDuration startedAt={row.startedAt} finishedAt={row.finishedAt} />,
};
const runColumns: DataTableColumn<RunTableRow>[] = [
  { key: "name", label: "Run", sortable: true, grow: true, minWidth: 220 },
  {
    key: "status", label: "Status", sortable: true,
    render: (_, row) => (
      <span className={cn("inline-flex items-center gap-1.5 capitalize", taskStatusColor(row.status))}>
        <Icon icon={taskStatusIcon(row.status)} {...(row.status === "running" ? { className: "animate-spin" } : {})} />
        {row.status}
      </span>
    ),
  },
  durationColumn,
  progressColumn,
  { key: "labels", label: "Labels", kind: "tags", tags: { maxVisible: 2 }, minWidth: 160 },
  startedColumn,
  { key: "finishedAt", label: "Finished", kind: "timestamp", sortable: true },
];
const compactRunColumns: DataTableColumn<RunTableRow>[] = [
  {
    key: "name", label: "Run", sortable: true, grow: true, minWidth: 220,
    render: (_, row) => (
      <div className="space-y-0.5">
        <div className="font-medium">{row.name}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{applicationLabel(row.kind)}</span>
          <span className={cn("inline-flex items-center gap-1 capitalize", taskStatusColor(row.status))}>
            <Icon icon={taskStatusIcon(row.status)} />{row.status}
          </span>
        </div>
      </div>
    ),
  },
  progressColumn,
  startedColumn,
];

export function TaskManager({
  basePath,
  kind,
  labels,
  pollMs,
  className,
  compact,
  selectedId,
  onSelectRun,
  extraTabs,
  headerExtra,
  renderRunDetails,
  controlUrl,
  showTaskControls,
}: TaskManagerProps) {
  const [kindFilter, setKindFilter] = useState<string>(kind ?? "");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [labelFilter, setLabelFilter] = useState("");
  const [filterOptions, setFilterOptions] = useState({ kinds: [] as string[], labels: [] as string[] });
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const apiBase = basePath ?? "/api/v1";
  const activeKind = kind ?? (kindFilter || undefined);
  const activeLabels = useMemo(() => {
    if (!labelFilter) return labels;
    const selected = splitTagToken(labelFilter);
    return { ...labels, [selected.key]: selected.value };
  }, [labels, labelFilter]);
  const { runs, runsKey, status } = useTaskRuns({
    basePath: apiBase,
    kind: activeKind,
    labels: activeLabels,
    status: statusFilter || undefined,
    pollMs,
  });
  const runsQueryKey = useMemo(
    () => taskQueryKeys.runs({
      basePath: apiBase,
      kind: activeKind,
      status: statusFilter || undefined,
      labels: activeLabels,
    }),
    [activeKind, apiBase, activeLabels, statusFilter],
  );

  // Changing a filter re-subscribes the transport but leaves the previous
  // listing on screen until the next SSE/poll frame. Publishing that listing
  // under the new key would hand cache consumers rows that do not match their
  // filters, so mirror only once the delivered listing's own key agrees.
  useEffect(() => {
    if (!runsKey || hashKey(runsKey) !== hashKey(runsQueryKey)) return;
    queryClient.setQueryData(runsQueryKey, runs);
  }, [queryClient, runs, runsKey, runsQueryKey]);

  useEffect(() => {
    setFilterOptions((previous) => {
      const kinds = [...new Set([...previous.kinds, ...runs.flatMap((run) => run.kind ? [run.kind] : [])])].sort();
      const labels = [...new Set([...previous.labels, ...runs.flatMap((run) => Object.entries(run.labels ?? {}).map(([key, value]) => `${key}=${value}`))])].sort();
      if (kinds.length === previous.kinds.length && labels.length === previous.labels.length) return previous;
      return { kinds, labels };
    });
  }, [runs]);
  const filters: FilterBarFilter[] = [
    ...(!kind ? [{ key: "kind", kind: "enum" as const, label: "Kind", placeholder: "All kinds", value: kindFilter, options: filterOptions.kinds.map((value) => ({ value, label: applicationLabel(value) })), onChange: setKindFilter }] : []),
    { key: "status", kind: "enum", label: "Status", placeholder: "Any status", value: statusFilter, options: [
      { value: "running", label: "Running" },
      { value: "pending", label: "Pending" },
      { value: "success", label: "Success" },
      { value: "failed", label: "Failed" },
      { value: "warning", label: "Warning" },
      { value: "canceled", label: "Canceled" },
    ], onChange: setStatusFilter },
    { key: "labels", kind: "enum", label: "Labels", placeholder: "Any label", value: labelFilter,
      options: filterOptions.labels.filter((token) => !(splitTagToken(token).key in (labels ?? {}))).map((value) => ({ value })),
      onChange: setLabelFilter },
  ];
  const rows = useMemo<RunTableRow[]>(() => runs.map((run) => ({
    id: run.id,
    name: run.name,
    kind: run.kind || "other",
    status: run.status,
    ...(run.startedAt ? { startedAt: run.startedAt } : {}),
    ...(run.finishedAt ? { finishedAt: run.finishedAt } : {}),
    ...(run.labels ? { labels: run.labels } : {}),
    run,
  })), [runs]);
  const openId = onSelectRun ? selectedId : localSelectedId;

  return (
    <DataTable
      {...(className ? { className } : {})}
      data={rows}
      columns={compact ? compactRunColumns : runColumns}
      emptyMessage="No background tasks."
      externalFilters={filters}
      filterBarProps={{ trailing: <span className="text-xs text-muted-foreground">{status}</span> }}
      getRowId={(row) => row.id}
      defaultSort={{ key: "startedAt", dir: "desc" }}
      expandedRowIds={openId ? [openId] : []}
      onExpandedRowIdsChange={(ids) => {
        const next = ids.find((id) => id !== openId) ?? null;
        if (onSelectRun) onSelectRun(next);
        else setLocalSelectedId(next);
      }}
      renderExpandedRow={(row) => (
        <ExpandedRun
          run={row.run}
          basePath={basePath}
          pollMs={pollMs}
          runsQueryKey={runsQueryKey}
          extraTabs={extraTabs}
          headerExtra={headerExtra}
          renderRunDetails={renderRunDetails}
          controlUrl={controlUrl}
          showTaskControls={showTaskControls}
        />
      )}
    />
  );
}

function RunDuration({ startedAt, finishedAt }: { startedAt: string | undefined; finishedAt: string | undefined }) {
  const now = useResourceClock(!!startedAt && !finishedAt);
  if (!startedAt) return <span className="text-muted-foreground">—</span>;
  return <span className="tabular-nums">{formatDuration(Math.max(0, (finishedAt ? Date.parse(finishedAt) : now) - Date.parse(startedAt)))}</span>;
}

function applicationLabel(kind: string): string {
  const names: Record<string, string> = {
    makerprint: "MakerPrint",
    openscad: "OpenSCAD",
    orca: "Orca",
    snapmaker: "Snapmaker",
    other: "Other",
  };
  return names[kind] ?? kind;
}

function ExpandedRun({
  run,
  basePath,
  pollMs,
  runsQueryKey,
  extraTabs,
  headerExtra,
  renderRunDetails,
  controlUrl,
  showTaskControls,
}: {
  run: TaskRunMeta;
  basePath: string | undefined;
  pollMs: number | undefined;
  runsQueryKey: QueryKey;
  extraTabs: TaskExtraTabs | undefined;
  headerExtra: TaskHeaderExtra | undefined;
  renderRunDetails: TaskManagerProps["renderRunDetails"];
  controlUrl: TaskManagerProps["controlUrl"];
  showTaskControls: TaskManagerProps["showTaskControls"];
}) {
  const runId = run.id;
  const { snapshots, status } = useTaskRun({ id: runId, basePath, pollMs });
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
      url: controlUrl?.(run, action) ?? `${apiBase}/tasks/${encodeURIComponent(runId)}/control`,
      action,
      target: group,
    });
  const controlTask = (action: TaskControlAction, task: TaskSnapshot) =>
    mutateControl({
      url: controlUrl?.(run, action) ?? `${apiBase}/tasks/${encodeURIComponent(runId)}/tasks/${encodeURIComponent(task.id)}/control`,
      action,
      target: task,
    });
  const progress = taskWorkProgress(run);
  return (
    <div className="space-y-3 bg-muted/20 px-4 py-4">
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span>{progress.completed} completed</span>
        <span>{progress.running} running</span>
        <span>{progress.failed} failed</span>
        <span>{progress.counts.pending + progress.unstarted} waiting</span>
        {Object.entries(run.labels ?? {}).map(([key, value]) => (
          <span key={key} className="font-mono">{key}={value}</span>
        ))}
      </div>
      {renderRunDetails?.(run, snapshots)}
      <TaskProgress
        snapshots={snapshots}
        compact
        connectionStatus={status}
        initialShowAllTasks
        onControl={control}
        {...(showTaskControls?.(run) !== false ? { onTaskControl: controlTask } : {})}
        metricsBaseUrl={`${apiBase}/tasks/metrics/`}
        {...(extraTabs ? { extraTabs } : {})}
        {...(headerExtra ? { headerExtra } : {})}
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
