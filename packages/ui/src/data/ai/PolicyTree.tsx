import { useMemo, useState, type ReactNode } from "react";
import { Icon, type StaticIconComponent } from "../Icon";
import { UiChevronDown, UiChevronRight, UiInfo, UiShield } from "../../icons";
import { cn } from "../../lib/utils";
import { HoverCard } from "../../overlay/HoverCard";

export type PolicyTone = "success" | "warning" | "danger" | "info" | "neutral";

export type PolicyOption<TMode extends string = string> = {
  id: TMode;
  label: string;
  tone?: PolicyTone | undefined;
  title?: string | undefined;
};

export type PolicyTreeEntry<TMode extends string = string, TData = unknown> = {
  id: string;
  label: string;
  group: string;
  mode: TMode;
  options: readonly PolicyOption<TMode>[];
  data: TData;
  icon?: StaticIconComponent | undefined;
  description?: string | undefined;
  source?: string | undefined;
  sourcePath?: string | undefined;
};

export type PolicyTreeProps<TMode extends string = string, TData = unknown> = {
  entries: PolicyTreeEntry<TMode, TData>[];
  emptyLabel: string;
  onEntryModeChange: (
    entry: PolicyTreeEntry<TMode, TData>,
    mode: TMode,
  ) => void;
  onGroupModeChange: (
    entries: PolicyTreeEntry<TMode, TData>[],
    mode: TMode,
  ) => void;
  groupIcon?: (
    group: string,
    entries: PolicyTreeEntry<TMode, TData>[],
  ) => StaticIconComponent;
  footer?: ReactNode | undefined;
  className?: string | undefined;
  compact?: boolean | undefined;
};

export function PolicyTree<TMode extends string, TData = unknown>({
  entries,
  emptyLabel,
  onEntryModeChange,
  onGroupModeChange,
  groupIcon,
  footer,
  className,
  compact = false,
}: PolicyTreeProps<TMode, TData>) {
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
  const groups = useMemo(() => groupEntries(entries), [entries]);

  return (
    <div className={cn("space-y-density-2", className)}>
      {groups.length > 0 && (
        <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
          {groups.map(([group, groupEntries]) => {
            const collapsed = collapsedGroups[group] ?? false;
            const GroupIcon = groupIcon?.(group, groupEntries) ?? UiShield;
            const groupOptions = commonOptions(groupEntries);
            const groupMode = commonMode(groupEntries);
            const toggle = () =>
              setCollapsedGroups((current) => ({
                ...current,
                [group]: !current[group],
              }));
            return (
              <div key={group}>
                {/* The whole header row is the collapse target; the chevron
                    button keeps keyboard access and the mode buttons stop
                    propagation so changing a group policy doesn't collapse it. */}
                <div
                  className={cn(
                    "flex cursor-pointer items-center gap-1 bg-muted/50 hover:bg-muted",
                    compact ? "px-1 py-0.5" : "px-density-2 py-density-1",
                  )}
                  onClick={toggle}
                >
                  <button
                    type="button"
                    aria-label={`${collapsed ? "Expand" : "Collapse"} ${group}`}
                    aria-expanded={!collapsed}
                    title={`${collapsed ? "Expand" : "Collapse"} ${group}`}
                    className="inline-flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-background hover:text-foreground"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggle();
                    }}
                  >
                    <Icon
                      icon={collapsed ? UiChevronRight : UiChevronDown}
                      className="size-3.5"
                    />
                  </button>
                  <Icon
                    icon={GroupIcon}
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                  <span className="min-w-0 truncate text-[10px] font-semibold uppercase text-muted-foreground">
                    {group}
                  </span>
                  <span className="shrink-0 rounded bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {groupEntries.length}
                  </span>
                  {groupOptions.length > 0 && (
                    <span
                      className="ml-auto"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <ModeButtons
                        ariaLabel={`${group} group policy`}
                        options={groupOptions}
                        value={groupMode}
                        size="group"
                        onChange={(mode) =>
                          onGroupModeChange(groupEntries, mode)
                        }
                        buttonLabel={(option) =>
                          `Set ${group} group to ${option.label}`
                        }
                      />
                    </span>
                  )}
                </div>
                {!collapsed && (
                  <div className="divide-y divide-border/60 border-t border-border">
                    {groupEntries.map((entry) => (
                      <PolicyTreeRow
                        key={entry.id}
                        entry={entry}
                        compact={compact}
                        onChange={(mode) => onEntryModeChange(entry, mode)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {groups.length === 0 && (
        <div className="rounded-md border border-border px-density-2 py-density-3 text-xs text-muted-foreground">
          {emptyLabel}
        </div>
      )}
      {footer}
    </div>
  );
}

function PolicyTreeRow<TMode extends string, TData>({
  entry,
  compact,
  onChange,
}: {
  entry: PolicyTreeEntry<TMode, TData>;
  compact: boolean;
  onChange: (mode: TMode) => void;
}) {
  const EntryIcon = entry.icon;
  const denied = entry.mode === "deny" || entry.mode === "disabled";
  return (
    <div
      title={entry.id}
      className={cn(
        "flex items-center gap-1.5",
        compact ? "px-2 py-1" : "px-density-2 py-density-1",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        {EntryIcon && (
          <Icon
            icon={EntryIcon}
            className={cn(
              "size-4 shrink-0",
              denied ? "text-muted-foreground/45" : "text-muted-foreground",
            )}
          />
        )}
        <span
          className={cn(
            "min-w-0 truncate text-xs",
            denied && "text-muted-foreground line-through",
          )}
        >
          {entry.label}
        </span>
        {(entry.description || entry.source || entry.sourcePath) && (
          <PolicyInfo entry={entry} />
        )}
      </div>
      <ModeButtons
        ariaLabel={`${entry.label} policy`}
        options={entry.options}
        value={entry.mode}
        onChange={onChange}
      />
    </div>
  );
}

function ModeButtons<TMode extends string>({
  ariaLabel,
  options,
  value,
  onChange,
  size = "entry",
  buttonLabel,
}: {
  ariaLabel: string;
  options: readonly PolicyOption<TMode>[];
  value: TMode | "mixed";
  onChange: (mode: TMode) => void;
  size?: "entry" | "group";
  buttonLabel?: ((option: PolicyOption<TMode>) => string) | undefined;
}) {
  return (
    <span
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex flex-wrap items-center gap-0.5"
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={buttonLabel?.(option)}
            title={option.title ?? buttonLabel?.(option)}
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded border font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              size === "group"
                ? "px-1.5 py-0.5 text-[10px]"
                : "min-w-12 px-1.5 py-0.5 text-[10px]",
              active
                ? activeModeClass(option.tone)
                : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </span>
  );
}

function PolicyInfo<TMode extends string, TData>({
  entry,
}: {
  entry: PolicyTreeEntry<TMode, TData>;
}) {
  const lines = [
    entry.description,
    entry.source ? `Source: ${entry.source}` : undefined,
    entry.sourcePath,
  ].filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <HoverCard
      placement="top"
      delay={120}
      trigger={
        <span
          aria-label={`Info for ${entry.label}`}
          className="inline-flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-background hover:text-foreground"
        >
          <Icon icon={UiInfo} className="size-3.5" />
        </span>
      }
      cardClassName="max-w-xs whitespace-normal text-xs"
    >
      <div className="space-y-1">
        {lines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </HoverCard>
  );
}

function groupEntries<TMode extends string, TData>(
  entries: PolicyTreeEntry<TMode, TData>[],
) {
  const groups = new Map<string, PolicyTreeEntry<TMode, TData>[]>();
  for (const entry of entries) {
    groups.set(entry.group, [...(groups.get(entry.group) ?? []), entry]);
  }
  return Array.from(groups.entries());
}

function commonOptions<TMode extends string, TData>(
  entries: PolicyTreeEntry<TMode, TData>[],
) {
  const first = entries[0]?.options ?? [];
  if (entries.length === 0) return [];
  const signature = optionSignature(first);
  return entries.every((entry) => optionSignature(entry.options) === signature)
    ? first
    : [];
}

function commonMode<TMode extends string, TData>(
  entries: PolicyTreeEntry<TMode, TData>[],
): TMode | "mixed" {
  const first = entries[0]?.mode;
  if (!first) return "mixed";
  return entries.every((entry) => entry.mode === first) ? first : "mixed";
}

function optionSignature<TMode extends string>(
  options: readonly PolicyOption<TMode>[],
) {
  return options.map((option) => option.id).join("\0");
}

// Active (selected) state: a solid fill in the mode's tone (allow/enabled →
// green, ask → amber, auto → blue, deny → red, disabled → slate). Inactive
// buttons stay neutral grey — only the selected mode carries colour.
function activeModeClass(tone: PolicyTone = "neutral") {
  switch (tone) {
    case "success":
      return "border-emerald-600 bg-emerald-600 text-white shadow-sm dark:border-emerald-500 dark:bg-emerald-500 dark:text-emerald-950";
    case "warning":
      return "border-amber-500 bg-amber-500 text-white shadow-sm dark:border-amber-400 dark:bg-amber-400 dark:text-amber-950";
    case "danger":
      return "border-red-600 bg-red-600 text-white shadow-sm dark:border-red-500 dark:bg-red-500 dark:text-red-950";
    case "info":
      return "border-sky-600 bg-sky-600 text-white shadow-sm dark:border-sky-500 dark:bg-sky-500 dark:text-sky-950";
    case "neutral":
      return "border-slate-600 bg-slate-700 text-white shadow-sm dark:border-slate-300 dark:bg-slate-300 dark:text-slate-950";
  }
}
