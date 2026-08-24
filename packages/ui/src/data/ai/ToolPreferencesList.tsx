import { useMemo, useState } from "react";
import { UiChevronDown, UiChevronRight } from "../../icons";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import type { ToolMeta, ToolPolicy } from "../chat/types";
import type { PermissionRule } from "../chat/tool-policy";
import {
  BADGE_DESCRIPTION,
  BADGE_LABEL,
  NO_PARENT,
  commonMode,
  entryMode,
  groupedToolEntriesWithPreferences,
  groupToolPolicy,
  nextMode,
  type BadgePolicy,
  type ToolGroup,
  type ToolPreferenceEntry,
  type ToolSubGroup,
} from "./ToolPreferences.model";

export type CompactToolPreferencesListProps = {
  tools: ToolMeta[];
  /** The effective mode of every tool, keyed by name — what the rows render. */
  value: Record<string, ToolPolicy>;
  /** Emits the rule a toggle means: a group header emits a group rule, a parent
   *  header a group+parent rule, and a row a name rule. The caller appends it to
   *  the user's list, where a name rule outranks the group rule above it.
   *
   *  This is deliberately not "here is the new map". A group toggle that wrote
   *  every current member's name would stop applying the moment the catalog
   *  gained a member, and the user would have no way to tell. */
  onRule: (rule: PermissionRule) => void;
  title?: string | undefined;
  emptyLabel?: string | undefined;
  className?: string | undefined;
};

function ModeBadge({ mode }: { mode: BadgePolicy }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
        mode === "allow" &&
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        mode === "auto" && "bg-sky-500/10 text-sky-600 dark:text-sky-400",
        mode === "ask" && "bg-amber-500/10 text-amber-600 dark:text-amber-500",
        mode === "deny" && "text-muted-foreground",
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
  mode: BadgePolicy;
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
  mode: ToolPolicy;
  onToggle: (entry: ToolPreferenceEntry, current: ToolPolicy) => void;
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
          mode === "deny" && "text-muted-foreground line-through",
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
  mode: BadgePolicy;
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
  onCycleSubGroup,
}: {
  subGroup: ToolSubGroup;
  value: Record<string, ToolPolicy>;
  open: boolean;
  onToggle: () => void;
  onToggleEntry: (entry: ToolPreferenceEntry, current: ToolPolicy) => void;
  onCycleSubGroup: (subGroup: ToolSubGroup, current: ToolPolicy) => void;
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
          onCycleSubGroup(subGroup, groupToolPolicy(subGroup.entries, value))
        }
      />
      {open && rows}
    </div>
  );
}

export function CompactToolList({
  groups,
  value,
  onRule,
  emptyLabel = "No tools available",
}: {
  groups: ToolGroup[];
  value: Record<string, ToolPolicy>;
  onRule: (rule: PermissionRule) => void;
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
  const handleToggle = (entry: ToolPreferenceEntry, current: ToolPolicy) =>
    onRule({ name: entry.key, policy: nextMode(current) });
  const cycleGroup = (group: ToolGroup, current: ToolPolicy) =>
    onRule({ group: group.group, policy: nextMode(current) });
  // A parent is a subdivision of one group, not a group of its own, so the rule
  // has to name both — a bare `parent` would reach the same display title under
  // a different group.
  const cycleSubGroup = (
    group: ToolGroup,
    subGroup: ToolSubGroup,
    current: ToolPolicy,
  ) =>
    onRule({
      group: group.group,
      parent: subGroup.parent,
      policy: nextMode(current),
    });
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
                cycleGroup(group, groupToolPolicy(group.entries, value))
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
                      onCycleSubGroup={(sub, current) =>
                        cycleSubGroup(group, sub, current)
                      }
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
  onRule,
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
        onRule={onRule}
        emptyLabel={emptyLabel}
      />
    </div>
  );
}
