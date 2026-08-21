import { Select } from "../components/select";
import { UiCollapseAll, UiExpandAll } from "../icons";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "./Icon";

type GroupingControlMode = {
  value: string;
  label: string;
};

export type DataTableGroupingControlsProps = {
  modes: GroupingControlMode[];
  value: string;
  hasGroups: boolean;
  allExpanded: boolean;
  allCollapsed: boolean;
  onModeChange: (value: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
};

export function DataTableGroupingControls({
  modes,
  value,
  hasGroups,
  allExpanded,
  allCollapsed,
  onModeChange,
  onExpandAll,
  onCollapseAll,
}: DataTableGroupingControlsProps) {
  return (
    <div
      className="flex shrink-0 items-center gap-1"
      role="group"
      aria-label="Grouping controls"
    >
      <div className="w-44 shrink-0">
        <Select
          aria-label="Group rows by"
          value={value}
          options={modes}
          onChange={(event) => onModeChange(event.target.value)}
        />
      </div>
      <GroupingButton
        label="Expand all groups"
        pressed={allExpanded}
        disabled={!hasGroups}
        onClick={onExpandAll}
        icon={UiExpandAll}
      />
      <GroupingButton
        label="Collapse all groups"
        pressed={allCollapsed}
        disabled={!hasGroups}
        onClick={onCollapseAll}
        icon={UiCollapseAll}
      />
    </div>
  );
}

function GroupingButton({
  label,
  pressed,
  disabled,
  onClick,
  icon,
}: {
  label: string;
  pressed: boolean;
  disabled: boolean;
  onClick: () => void;
  icon: StaticIconComponent;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-control-h w-control-h items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50",
        pressed && "bg-accent text-accent-foreground",
      )}
    >
      <Icon icon={icon} className="text-sm" />
    </button>
  );
}
