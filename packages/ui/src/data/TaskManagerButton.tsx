import { resourceSummary, taskTransportConnected, type ResourceSummary } from "./task-resource-summary";
import { useResourceClock } from "../hooks/use-resource-clock";
import { Button } from "../components/button";
import { UiActivity, UiListChecks, UiMemoryStick } from "../icons";
import { useTaskRun, useTaskRuns } from "../hooks/use-task-run";
import { DropdownMenu, type DropdownMenuItem } from "../overlay/DropdownMenu";
import { formatBytes } from "../lib/format";
import { TaskManager } from "./TaskManager";
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
  const { runs, status: runsStatus } = useTaskRuns({ basePath, kind, labels });
  const activeRuns = runs.filter((run) => run.status === "running" || run.status === "pending");
  const { snapshots, status: snapshotStatus } = useTaskRun({
    ...(basePath ? { basePath } : {}),
    ids: activeRuns.map((run) => run.id),
    enabled: activeRuns.length > 0,
  });
  const now = useResourceClock(activeRuns.length > 0);
  const resources = resourceSummary(snapshots, { now, connected: taskTransportConnected(runsStatus) && taskTransportConnected(snapshotStatus) });
  const trigger = <TaskTrigger active={activeRuns.length} {...(activeRuns.length ? { resources } : {})} />;

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

function TaskTrigger({ active, resources }: { active: number; resources?: ResourceSummary }) {
  const label = `Tasks (${active} active)`;
  return (
    <Button type="button" variant="ghost" size={resources ? "sm" : "icon"} aria-label={label} title={label} className="relative gap-1.5">
      <UiListChecks className={active > 0 ? "animate-pulse" : undefined} />
      {resources?.state === "unavailable" ? <span className="text-xs text-muted-foreground">Resources unavailable</span> : resources ? (
        <span className="flex items-center gap-1.5 text-xs" title={`Sampled ${new Date(resources.sampledAt).toLocaleTimeString()}; CPU 100% equals one core`}>
          <UiActivity /><span>{resources.cpu.toFixed(1)}%</span>
          <UiMemoryStick /><span>{formatBytes(resources.rss)}</span>
          {resources.state === "stale" && <span className="text-muted-foreground">Stale</span>}
        </span>
      ) : null}
    </Button>
  );
}
