import { Button } from "../components/button";
import { UiListChecks } from "../icons";
import { useTaskRuns } from "../hooks/use-task-run";
import { DropdownMenu, type DropdownMenuItem } from "../overlay/DropdownMenu";
import { taskStatusIcon } from "./task-status";

export interface TaskManagerButtonProps {
  basePath?: string;
  tasksHref?: string;
  latest?: number;
  onNavigate?: (href: string) => void;
}

export function TaskManagerButton({
  basePath,
  tasksHref = "/tasks",
  latest = 5,
  onNavigate,
}: TaskManagerButtonProps) {
  const { runs } = useTaskRuns({ basePath });
  const active = runs.filter((run) => run.status === "running" || run.status === "pending").length;
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
  const label = `Tasks (${active} active)`;

  return (
    <DropdownMenu
      items={items}
      align="right"
      menuLabel="Recent tasks"
      trigger={(
        <Button type="button" variant="ghost" size="icon" aria-label={label} title={label} className="relative">
          <UiListChecks />
          {active > 0 && (
            <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-primary px-1 text-[9px] leading-4 text-primary-foreground">
              {active}
            </span>
          )}
        </Button>
      )}
      footer={(
        <Button type="button" variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate(tasksHref)}>
          View all tasks
        </Button>
      )}
    />
  );
}
