import { Button } from "../components/button";
import { UiActivity, UiListChecks, UiMemoryStick } from "../icons";
import { useTaskRun, useTaskRuns } from "../hooks/use-task-run";
import { DropdownMenu, type DropdownMenuItem } from "../overlay/DropdownMenu";
import { formatBytes } from "../lib/format";
import { TaskManager } from "./TaskManager";
import { isTaskProcessDetails } from "./task-process-details";
import type { TaskSnapshot } from "./TaskSnapshot";
import { taskStatusIcon } from "./task-status";

export interface TaskManagerButtonProps {
  basePath?: string;
  tasksHref?: string;
  latest?: number;
  onNavigate?: (href: string) => void;
  panel?: boolean;
  kind?: string;
  labels?: Record<string, string>;
  selectedId?: string;
  onSelectRun?: (id: string | null) => void;
}

export function TaskManagerButton({
  basePath,
  tasksHref = "/tasks",
  latest = 5,
  onNavigate,
  panel,
  kind,
  labels,
  selectedId,
  onSelectRun,
}: TaskManagerButtonProps) {
  const { runs } = useTaskRuns({ basePath, kind, labels });
  const activeRuns = runs.filter((run) => run.status === "running" || run.status === "pending");
  const { snapshots } = useTaskRun({
    ...(basePath ? { basePath } : {}),
    ids: activeRuns.map((run) => run.id),
    enabled: activeRuns.length > 0,
  });
  const resources = resourceSummary(snapshots);
  const trigger = <TaskTrigger active={activeRuns.length} {...(resources ? { resources } : {})} />;

  return panel ? (
    <TaskPanelDropdown
      {...(basePath ? { basePath } : {})}
      {...(kind ? { kind } : {})}
      {...(labels ? { labels } : {})}
      {...(onSelectRun ? { onSelectRun } : {})}
      {...(selectedId ? { selectedId } : {})}
      trigger={trigger}
    />
  ) : (
    <RecentTasksDropdown
      latest={latest}
      {...(onNavigate ? { onNavigate } : {})}
      runs={runs}
      tasksHref={tasksHref}
      trigger={trigger}
    />
  );
}

function TaskPanelDropdown({ basePath, kind, labels, onSelectRun, selectedId, trigger }: TaskManagerButtonProps & { trigger: React.ReactNode }) {
  return (
    <DropdownMenu
      align="right"
      header={<span className="text-xs font-semibold">Activity</span>}
      menuClassName="w-[min(42rem,calc(100vw-1rem))] max-w-none p-0"
      menuLabel="Task activity"
      trigger={trigger}
    >
      {() => (
        <div className="max-h-[min(42rem,calc(100vh-5rem))] overflow-auto p-3">
          <TaskManager
            {...(basePath ? { basePath } : {})}
            {...(kind ? { kind } : {})}
            {...(labels ? { labels } : {})}
            {...(onSelectRun ? { onSelectRun } : {})}
            {...(selectedId ? { selectedId } : {})}
          />
        </div>
      )}
    </DropdownMenu>
  );
}

type TaskRuns = ReturnType<typeof useTaskRuns>["runs"];

function RecentTasksDropdown({
  latest,
  onNavigate,
  runs,
  tasksHref,
  trigger,
}: {
  latest: number;
  onNavigate?: (href: string) => void;
  runs: TaskRuns;
  tasksHref: string;
  trigger: React.ReactNode;
}) {
  const navigate = (href: string) => {
    if (onNavigate) onNavigate(href);
    else window.location.assign(href);
  };
  const items: DropdownMenuItem[] = runs.slice(0, latest).map((run) => ({
    label: (
      <span className="flex min-w-0 items-center justify-between gap-3">
        <span className="truncate">{run.name}</span>
        <span className="shrink-0 text-[10px] text-muted-foreground">{run.status}</span>
      </span>
    ),
    icon: taskStatusIcon(run.status),
    onSelect: () => navigate(run.href ?? `${tasksHref}/${encodeURIComponent(run.id)}`),
  }));
  if (items.length === 0) {
    items.push({ label: "No tasks yet", disabled: true, onSelect: () => {} });
  }

  return (
    <DropdownMenu
      items={items}
      align="right"
      menuLabel="Recent tasks"
      trigger={trigger}
      footer={(
        <Button type="button" variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate(tasksHref)}>
          View all tasks
        </Button>
      )}
    />
  );
}

type ResourceSummary = { cpu: number; rss: number; peakRss: number };

function TaskTrigger({ active, resources }: { active: number; resources?: ResourceSummary }) {
  const label = `Tasks (${active} active)`;
  return (
    <Button type="button" variant="ghost" size={resources ? "sm" : "icon"} aria-label={label} title={label} className="relative gap-1.5">
      <UiListChecks className={active > 0 ? "animate-pulse" : undefined} />
      {resources ? (
        <>
          <ResourceGauge icon={<UiActivity />} label="CPU" percent={resources.cpu} value={`${resources.cpu.toFixed(1)}%`} />
          <ResourceGauge icon={<UiMemoryStick />} label="Memory" percent={resources.peakRss ? resources.rss / resources.peakRss * 100 : 0} value={formatBytes(resources.rss)} />
        </>
      ) : active > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-primary px-1 text-[9px] leading-4 text-primary-foreground">{active}</span>
      ) : null}
    </Button>
  );
}

function ResourceGauge({ icon, label, percent, value }: { icon: React.ReactNode; label: string; percent: number; value: string }) {
  return (
    <span aria-label={`${label} ${value}`} className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium" title={`${label} ${value}`}>
      {icon}
      <span aria-hidden className="h-1 w-5 overflow-hidden rounded bg-border">
        <span className="block h-full rounded bg-primary" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
      </span>
      <span>{value}</span>
    </span>
  );
}

function resourceSummary(snapshots: TaskSnapshot[]): ResourceSummary | undefined {
  const activeSnapshots = snapshots.filter(
    (snapshot) => snapshot.status === "running" || snapshot.status === "pending",
  );
  const tasks = activeSnapshots.filter(
    (snapshot) => snapshot.type === "task" && isTaskProcessDetails(snapshot.details),
  );
  const processes = tasks.length
    ? tasks
    : activeSnapshots.filter((snapshot) => isTaskProcessDetails(snapshot.details));
  if (!processes.length) return undefined;
  return processes.reduce<ResourceSummary>((total, snapshot) => {
    if (!isTaskProcessDetails(snapshot.details)) return total;
    return {
      cpu: total.cpu + snapshot.details.latest.cpuPercent,
      rss: total.rss + snapshot.details.latest.rssBytes,
      peakRss: total.peakRss + snapshot.details.peak.rssBytes,
    };
  }, { cpu: 0, rss: 0, peakRss: 0 });
}
