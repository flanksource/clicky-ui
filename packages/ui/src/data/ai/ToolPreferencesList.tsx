import { useMemo, useState } from "react";
import { UiChevronDown, UiChevronRight } from "../../icons";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import type { ToolMeta, ToolMode } from "../chat/types";
import {
  BADGE_DESCRIPTION,
  BADGE_LABEL,
  NO_PARENT,
  commonMode,
  entryMode,
  groupedToolEntriesWithPreferences,
  groupToolMode,
  nextMode,
  type BadgeMode,
  type ToolGroup,
  type ToolPreferenceEntry,
  type ToolSubGroup,
} from "./ToolPreferences.model";

export type CompactToolPreferencesListProps = {
  tools: ToolMeta[];
  value: Record<string, ToolMode>;
  onChange: (prefs: Record<string, ToolMode>) => void;
  title?: string | undefined;
  emptyLabel?: string | undefined;
  className?: string | undefined;
};

function ModeBadge({ mode }: { mode: BadgeMode }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
        mode === "on" &&
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        mode === "auto" && "bg-sky-500/10 text-sky-600 dark:text-sky-400",
        mode === "ask" && "bg-amber-500/10 text-amber-600 dark:text-amber-500",
        mode === "off" && "text-muted-foreground",
        mode === "mixed" &&
          "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
      )}
      title={BADGE_DESCRIPTION[mode]}
    >
      {BADGE_LABEL[mode]}
    </span>
  );
}

function ToolGroupHeader({
  group,
  count,
  collapsed,
  mode,
  onCollapseToggle,
  onModeToggle,
}: {
  group: string;
  count: number;
  collapsed: boolean;
  mode: BadgeMode;
  onCollapseToggle: () => void;
  onModeToggle: () => void;
}) {
  return (
    <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-1 px-1 py-0.5">
      <button
        type="button"
        aria-label={`${collapsed ? "Expand" : "Collapse"} ${group}`}
        title={`${collapsed ? "Expand" : "Collapse"} ${group}`}
        className="inline-flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-background hover:text-foreground"
        onClick={onCollapseToggle}
      >
        <Icon
          icon={collapsed ? UiChevronRight : UiChevronDown}
          className="size-3.5"
        />
      </button>
      <button
        type="button"
        aria-label={`Toggle ${group} group`}
        title={`Cycle all ${count} ${count === 1 ? "tool" : "tools"} in ${group}`}
        className="flex min-w-0 items-center gap-1.5 rounded px-1 py-0.5 text-left hover:bg-background/70"
        onClick={onModeToggle}
      >
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {group}
          </span>
          <span className="shrink-0 rounded bg-background px-1 text-[10px] text-muted-foreground">
            {count}
          </span>
        </span>
        <ModeBadge mode={mode} />
      </button>
    </div>
  );
}

function ToolRow({
  entry,
  mode,
  onToggle,
  indented = false,
}: {
  entry: ToolPreferenceEntry;
  mode: ToolMode;
  onToggle: (entry: ToolPreferenceEntry, current: ToolMode) => void;
  indented?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded px-1.5 py-0.5 text-left hover:bg-accent",
        indented && "pl-7",
      )}
      title={entry.tool.name}
      onClick={() => onToggle(entry, mode)}
    >
      <span
        className={cn(
          "min-w-0 truncate text-xs",
          mode === "off" && "text-muted-foreground line-through",
        )}
      >
        {entry.label}
      </span>
      <ModeBadge mode={mode} />
    </button>
  );
}

function ToolParentHeader({
  parent,
  count,
  collapsed,
  mode,
  onCollapseToggle,
  onModeToggle,
}: {
  parent: string;
  count: number;
  collapsed: boolean;
  mode: BadgeMode;
  onCollapseToggle: () => void;
  onModeToggle: () => void;
}) {
  return (
    <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-1 py-0.5 pl-4 pr-1">
      <button
        type="button"
        aria-label={`${collapsed ? "Expand" : "Collapse"} ${parent}`}
        title={`${collapsed ? "Expand" : "Collapse"} ${parent}`}
        className="inline-flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-background hover:text-foreground"
        onClick={onCollapseToggle}
      >
        <Icon
          icon={collapsed ? UiChevronRight : UiChevronDown}
          className="size-3.5"
        />
      </button>
      <button
        type="button"
        aria-label={`Toggle ${parent} tools`}
        title={`Cycle all ${count} ${count === 1 ? "tool" : "tools"} in ${parent}`}
        className="flex min-w-0 items-center gap-1.5 rounded px-1 py-0.5 text-left hover:bg-background/70"
        onClick={onModeToggle}
      >
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="min-w-0 truncate text-[11px] font-medium text-foreground/70">
            {parent}
          </span>
          <span className="shrink-0 rounded bg-background px-1 text-[10px] text-muted-foreground">
            {count}
          </span>
        </span>
        <ModeBadge mode={mode} />
      </button>
    </div>
  );
}

function ToolSubGroupBlock({
  subGroup,
  value,
  open,
  onToggle,
  onToggleEntry,
  onCycleEntries,
}: {
  subGroup: ToolSubGroup;
  value: Record<string, ToolMode>;
  open: boolean;
  onToggle: () => void;
  onToggleEntry: (entry: ToolPreferenceEntry, current: ToolMode) => void;
  onCycleEntries: (entries: ToolPreferenceEntry[], current: ToolMode) => void;
}) {
  const hasParent = subGroup.parent !== NO_PARENT;
  const rows = subGroup.entries.map((entry) => (
    <ToolRow
      key={entry.key}
      entry={entry}
      mode={entryMode(entry, value)}
      onToggle={onToggleEntry}
      indented={hasParent}
    />
  ));
  if (!hasParent) return <>{rows}</>;
  return (
    <div>
      <ToolParentHeader
        parent={subGroup.parent}
        count={subGroup.entries.length}
        collapsed={!open}
        mode={commonMode(subGroup.entries, value)}
        onCollapseToggle={onToggle}
        onModeToggle={() =>
          onCycleEntries(
            subGroup.entries,
            groupToolMode(subGroup.entries, value),
          )
        }
      />
      {open && rows}
    </div>
  );
}

export function CompactToolList({
  groups,
  value,
  onChange,
  emptyLabel = "No tools available",
}: {
  groups: ToolGroup[];
  value: Record<string, ToolMode>;
  onChange: (prefs: Record<string, ToolMode>) => void;
  emptyLabel?: string | undefined;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  if (groups.length === 0) {
    return (
      <div className="px-2 py-2 text-xs text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }
  const isOpen = (key: string) => expanded.has(key);
  const toggle = (key: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const handleToggle = (entry: ToolPreferenceEntry, current: ToolMode) =>
    onChange({ ...value, [entry.key]: nextMode(current) });
  const cycleEntries = (entries: ToolPreferenceEntry[], current: ToolMode) => {
    const next = nextMode(current);
    const updated = { ...value };
    for (const entry of entries) updated[entry.key] = next;
    onChange(updated);
  };
  return (
    <div className="space-y-1">
      {groups.map((group) => {
        const groupOpen = isOpen(group.group);
        return (
          <div key={group.group}>
            <ToolGroupHeader
              group={group.group}
              count={group.entries.length}
              collapsed={!groupOpen}
              mode={commonMode(group.entries, value)}
              onCollapseToggle={() => toggle(group.group)}
              onModeToggle={() =>
                cycleEntries(group.entries, groupToolMode(group.entries, value))
              }
            />
            {groupOpen && (
              <div className="space-y-0.5 p-0.5">
                {group.subGroups.map((subGroup) => {
                  const parentKey = `${group.group}///${subGroup.parent}`;
                  return (
                    <ToolSubGroupBlock
                      key={subGroup.parent}
                      subGroup={subGroup}
                      value={value}
                      open={isOpen(parentKey)}
                      onToggle={() => toggle(parentKey)}
                      onToggleEntry={handleToggle}
                      onCycleEntries={cycleEntries}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function CompactToolPreferencesList({
  tools,
  value,
  onChange,
  title = "Tools preferences",
  emptyLabel = "No tools available",
  className,
}: CompactToolPreferencesListProps) {
  const groups = useMemo(
    () => groupedToolEntriesWithPreferences(tools, value),
    [tools, value],
  );
  return (
    <div className={cn("space-y-2", className)}>
      {title && (
        <div className="text-xs font-medium text-muted-foreground">{title}</div>
      )}
      <CompactToolList
        groups={groups}
        value={value}
        onChange={onChange}
        emptyLabel={emptyLabel}
      />
    </div>
  );
}
