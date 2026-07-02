import { useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { DropdownMenu } from "../../overlay/DropdownMenu";
import { HoverCard } from "../../overlay/HoverCard";
import { Modal } from "../../overlay/Modal";
import { Button } from "../../components/button";
import { Icon } from "../Icon";
import {
  UiChevronDown,
  UiChevronRight,
  UiCode2,
  UiInfo,
  UiShield,
  UiSliders,
} from "../../icons";
import { EffortSelector, ModelSelector } from "../chat/ModelSelector";
import { ToolSchemaBrowser } from "./ToolSchemaBrowser";
import type {
  ChatBudgetConfig,
  ChatModel,
  ChatUsageSummary,
  ClaudePermissionMode,
  ToolMeta,
  ToolMode,
} from "../chat/types";
import { CLAUDE_PERMISSION_MODE_OPTIONS } from "../chat/types";

export type { ClaudePermissionMode, ToolMeta, ToolMode };

const MODE_CYCLE: ToolMode[] = ["enabled", "ask", "disabled"];
const MODE_LABEL: Record<ToolMode, string> = {
  enabled: "Auto",
  ask: "Ask",
  disabled: "Off",
};

const MODE_DESCRIPTION: Record<ToolMode, string> = {
  enabled: "Allow this tool to run automatically.",
  ask: "Ask before running this tool.",
  disabled: "Hide this tool from the model.",
};

type ToolPreferenceEntry = {
  key: string;
  label: string;
  group: string;
  tool: ToolMeta;
  defaultMode: ToolMode;
};

export type ToolPreferencesProps = {
  /** The tools to list. Replaces ai-financials' global registry — callers pass
   *  whatever their backend exposes. */
  tools: ToolMeta[];
  /** Current per-tool mode. Missing entries use each tool's default. */
  value: Record<string, ToolMode>;
  onChange: (prefs: Record<string, ToolMode>) => void;
  models?: ChatModel[] | undefined;
  model?: string | undefined;
  onModelChange?: ((model: string) => void) | undefined;
  reasoningEfforts?: string[] | undefined;
  reasoningEffort?: string | undefined;
  onReasoningEffortChange?: ((effort: string) => void) | undefined;
  permissionMode?: ClaudePermissionMode | undefined;
  onPermissionModeChange?: ((mode: ClaudePermissionMode) => void) | undefined;
  temperature?: number | undefined;
  onTemperatureChange?: ((temperature: number | undefined) => void) | undefined;
  budget?: ChatBudgetConfig | undefined;
  onBudgetChange?: ((budget: ChatBudgetConfig) => void) | undefined;
  usage?: ChatUsageSummary | null | undefined;
  toolsLoading?: boolean | undefined;
  toolsError?: string | null | undefined;
  className?: string;
};

export type CompactToolPreferencesListProps = {
  tools: ToolMeta[];
  value: Record<string, ToolMode>;
  onChange: (prefs: Record<string, ToolMode>) => void;
  title?: string | undefined;
  emptyLabel?: string | undefined;
  className?: string | undefined;
};

type AdvancedTab = "config" | "permissions" | "browser";

function ToolGroupHeader({
  group,
  count,
  collapsed,
  mode,
  onCollapseToggle,
  onModeToggle,
  compact = false,
}: {
  group: string;
  count: number;
  collapsed: boolean;
  mode: ToolMode;
  onCollapseToggle: () => void;
  onModeToggle: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid items-center gap-1 border-b border-border bg-muted/50",
        compact
          ? "grid-cols-[1.5rem_minmax(0,1fr)_auto] px-1 py-0.5"
          : "grid-cols-[1.75rem_minmax(0,1fr)_4rem] px-2 py-1",
      )}
    >
      <button
        type="button"
        aria-label={`${collapsed ? "Expand" : "Collapse"} ${group}`}
        title={`${collapsed ? "Expand" : "Collapse"} ${group}`}
        className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-background hover:text-foreground"
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
        title={`Toggle all ${count} ${count === 1 ? "tool" : "tools"} in ${group}`}
        className="flex min-w-0 items-center gap-2 rounded px-1 py-1 text-left hover:bg-background/70"
        onClick={onModeToggle}
      >
        <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {group}
        </span>
        <span className="shrink-0 rounded bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {count}
        </span>
      </button>
      <span className="justify-self-end">
        <ModeBadge mode={mode} />
      </span>
    </div>
  );
}

function ToolRow({
  entry,
  mode,
  onToggle,
}: {
  entry: ToolPreferenceEntry;
  mode: ToolMode;
  onToggle: (entry: ToolPreferenceEntry, current: ToolMode) => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded px-2 py-1 text-left hover:bg-accent"
      title={entry.tool.name}
      onClick={() => onToggle(entry, mode)}
    >
      <span
        className={cn(
          "min-w-0 truncate text-xs",
          mode === "disabled" && "text-muted-foreground line-through",
        )}
      >
        {entry.label}
      </span>
      <ModeBadge mode={mode} />
    </button>
  );
}

function AdvancedToolRow({
  entry,
  mode,
  onToggle,
}: {
  entry: ToolPreferenceEntry;
  mode: ToolMode;
  onToggle: (entry: ToolPreferenceEntry, current: ToolMode) => void;
}) {
  const description = entry.tool.description?.trim() || "No description";
  return (
    <button
      type="button"
      className="grid h-9 w-full grid-cols-[minmax(0,1fr)_4rem] items-center gap-3 border-b border-border px-2 text-left hover:bg-accent"
      title={entry.tool.name}
      onClick={() => onToggle(entry, mode)}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <span
          className={cn(
            "min-w-0 truncate text-xs",
            mode === "disabled" && "text-muted-foreground line-through",
          )}
        >
          {entry.label}
        </span>
        <HoverCard
          placement="top"
          delay={120}
          trigger={
            <span
              aria-label={`Description for ${entry.label}`}
              className="inline-flex shrink-0 text-muted-foreground"
              title={description}
            >
              <Icon icon={UiInfo} className="size-3.5" />
            </span>
          }
          cardClassName="max-w-xs whitespace-normal"
        >
          {description}
        </HoverCard>
      </span>
      <span className="justify-self-end">
        <ModeBadge mode={mode} />
      </span>
    </button>
  );
}

function ModeBadge({ mode }: { mode: ToolMode }) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[10px] font-medium",
        mode === "enabled" &&
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
        mode === "ask" &&
          "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
        mode === "disabled" && "bg-muted text-muted-foreground",
      )}
      title={MODE_DESCRIPTION[mode]}
    >
      {MODE_LABEL[mode]}
    </span>
  );
}

/** A popover that cycles tools through Auto -> Ask -> Off. The resulting
 *  `Record<name, ToolMode>` is meant to be forwarded to the backend (e.g. via
 *  `<Chat body={{ toolPreferences }}>`). */
export function ToolPreferences({
  tools,
  value,
  onChange,
  models = [],
  model,
  onModelChange,
  reasoningEfforts = ["low", "medium", "high"],
  reasoningEffort = "",
  onReasoningEffortChange,
  permissionMode = "default",
  onPermissionModeChange,
  temperature,
  onTemperatureChange,
  budget,
  onBudgetChange,
  usage,
  toolsLoading = false,
  toolsError = null,
  className = "",
}: ToolPreferencesProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedTab, setAdvancedTab] = useState<AdvancedTab>("config");
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
  const groups = useMemo(() => groupedToolEntries(tools), [tools]);

  const toggleCollapsed = (group: string) => {
    setCollapsedGroups((current) => ({ ...current, [group]: !current[group] }));
  };

  const handleToggle = (entry: ToolPreferenceEntry, current: ToolMode) => {
    onChange({ ...value, [entry.key]: nextMode(current) });
  };

  const handleGroupToggle = (
    entries: ToolPreferenceEntry[],
    current: ToolMode,
  ) => {
    const next = nextMode(current);
    const updated = { ...value };
    for (const entry of entries) {
      updated[entry.key] = next;
    }
    onChange(updated);
  };

  return (
    <>
      <DropdownMenu
        align="right"
        className={className}
        menuClassName="w-72 max-h-[400px] overflow-y-auto p-2"
        trigger={
          <Button
            variant="ghost"
            size="icon"
            title="Tool preferences"
            data-testid="tool-preferences-btn"
          >
            <Icon icon={UiSliders} className="size-4" />
          </Button>
        }
      >
        {(closeMenu) => (
          <div>
            <div className="mb-2 px-1 text-xs font-semibold">
              Tool Preferences
            </div>
            {groups.map(([group, entries]) => {
              const collapsed = collapsedGroups[group] ?? false;
              const groupMode = groupToolMode(entries, value);
              return (
                <div
                  key={group}
                  className="mb-2 overflow-hidden rounded border border-border"
                >
                  <ToolGroupHeader
                    group={group}
                    count={entries.length}
                    collapsed={collapsed}
                    mode={groupMode}
                    compact
                    onCollapseToggle={() => toggleCollapsed(group)}
                    onModeToggle={() => handleGroupToggle(entries, groupMode)}
                  />
                  {!collapsed && (
                    <div className="p-1">
                      {entries.map((entry) => (
                        <ToolRow
                          key={entry.key}
                          entry={entry}
                          mode={entryMode(entry, value)}
                          onToggle={handleToggle}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="mt-2 border-t border-border pt-2">
              <button
                type="button"
                className="w-full rounded px-2 py-1.5 text-left text-xs hover:bg-accent"
                onClick={() => {
                  closeMenu();
                  setAdvancedOpen(true);
                }}
              >
                Advanced
              </button>
            </div>
          </div>
        )}
      </DropdownMenu>
      <Modal
        open={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        title="Advanced Chat Settings"
        size="xl"
      >
        <div className="flex h-[70vh] min-h-0 flex-col gap-3">
          <div className="flex items-center gap-1 rounded border border-border bg-muted/30 p-1">
            {(["config", "permissions", "browser"] as AdvancedTab[]).map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded px-3 text-xs font-medium capitalize",
                    advancedTab === tab
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/60",
                  )}
                  onClick={() => setAdvancedTab(tab)}
                >
                  <Icon
                    icon={
                      tab === "config"
                        ? UiSliders
                        : tab === "permissions"
                          ? UiShield
                          : UiCode2
                    }
                    className="size-3.5"
                  />
                  {tab}
                </button>
              ),
            )}
            <div className="flex-1" />
            {toolsLoading && (
              <span className="pr-2 text-[11px] text-muted-foreground">
                Loading tools
              </span>
            )}
            {toolsError && (
              <span className="pr-2 text-[11px] text-destructive">
                {toolsError}
              </span>
            )}
          </div>
          {advancedTab === "config" ? (
            <ToolConfigPanel
              models={models}
              model={model}
              onModelChange={onModelChange}
              reasoningEfforts={reasoningEfforts}
              reasoningEffort={reasoningEffort}
              onReasoningEffortChange={onReasoningEffortChange}
              permissionMode={permissionMode}
              onPermissionModeChange={onPermissionModeChange}
              temperature={temperature}
              onTemperatureChange={onTemperatureChange}
              budget={budget}
              onBudgetChange={onBudgetChange}
              usage={usage}
            />
          ) : advancedTab === "permissions" ? (
            <AdvancedPermissionsPanel
              groups={groups}
              value={value}
              collapsedGroups={collapsedGroups}
              onCollapseToggle={toggleCollapsed}
              onToolToggle={handleToggle}
              onGroupToggle={handleGroupToggle}
            />
          ) : (
            <ToolSchemaBrowser tools={tools} className="min-h-0 flex-1" />
          )}
        </div>
      </Modal>
    </>
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
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
  const groups = useMemo(
    () => groupedToolEntriesWithPreferences(tools, value),
    [tools, value],
  );

  const toggleCollapsed = (group: string) => {
    setCollapsedGroups((current) => ({
      ...current,
      [group]: !current[group],
    }));
  };
  const handleToggle = (entry: ToolPreferenceEntry, current: ToolMode) => {
    onChange({ ...value, [entry.key]: nextMode(current) });
  };
  const handleGroupToggle = (
    entries: ToolPreferenceEntry[],
    current: ToolMode,
  ) => {
    const next = nextMode(current);
    const updated = { ...value };
    for (const entry of entries) {
      updated[entry.key] = next;
    }
    onChange(updated);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {title && (
        <div className="text-xs font-medium text-muted-foreground">{title}</div>
      )}
      <div className="overflow-hidden rounded-md border border-border">
        {groups.map(([group, entries]) => {
          const collapsed = collapsedGroups[group] ?? false;
          const groupMode = groupToolMode(entries, value);
          return (
            <div key={group} className="border-b border-border last:border-b-0">
              <ToolGroupHeader
                group={group}
                count={entries.length}
                collapsed={collapsed}
                mode={groupMode}
                compact
                onCollapseToggle={() => toggleCollapsed(group)}
                onModeToggle={() => handleGroupToggle(entries, groupMode)}
              />
              {!collapsed && (
                <div className="p-1">
                  {entries.map((entry) => (
                    <ToolRow
                      key={entry.key}
                      entry={entry}
                      mode={entryMode(entry, value)}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {groups.length === 0 && (
          <div className="px-2 py-3 text-xs text-muted-foreground">
            {emptyLabel}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolConfigPanel({
  models,
  model,
  onModelChange,
  reasoningEfforts,
  reasoningEffort,
  onReasoningEffortChange,
  permissionMode,
  onPermissionModeChange,
  temperature,
  onTemperatureChange,
  budget,
  onBudgetChange,
  usage,
}: {
  models: ChatModel[];
  model?: string | undefined;
  onModelChange?: ((model: string) => void) | undefined;
  reasoningEfforts: string[];
  reasoningEffort: string;
  onReasoningEffortChange?: ((effort: string) => void) | undefined;
  permissionMode: ClaudePermissionMode;
  onPermissionModeChange?: ((mode: ClaudePermissionMode) => void) | undefined;
  temperature?: number | undefined;
  onTemperatureChange?: ((temperature: number | undefined) => void) | undefined;
  budget?: ChatBudgetConfig | undefined;
  onBudgetChange?: ((budget: ChatBudgetConfig) => void) | undefined;
  usage?: ChatUsageSummary | null | undefined;
}) {
  const updateBudget = (key: keyof ChatBudgetConfig, raw: string) => {
    const next: ChatBudgetConfig = { ...budget };
    const parsed = parseOptionalNumber(raw, key === "maxTokens");
    if (parsed === undefined) {
      delete next[key];
    } else {
      next[key] = parsed;
    }
    onBudgetChange?.(next);
  };

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] gap-4 overflow-y-auto">
      <div className="space-y-4">
        <section className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Model
          </div>
          <div className="flex flex-wrap gap-2">
            <ModelSelector
              models={models}
              value={model}
              onChange={(next) => onModelChange?.(next)}
              className="w-64"
            />
            <EffortSelector
              efforts={reasoningEfforts}
              value={reasoningEffort}
              onChange={(next) => onReasoningEffortChange?.(next)}
              className="w-44"
            />
          </div>
          <label className="grid max-w-md grid-cols-[9rem_minmax(0,1fr)] items-center gap-3 text-xs">
            <span className="text-muted-foreground">Permission mode</span>
            <select
              aria-label="Permission mode"
              value={permissionMode}
              onChange={(event) =>
                onPermissionModeChange?.(
                  event.target.value as ClaudePermissionMode,
                )
              }
              className="h-8 rounded border border-border bg-background px-2 text-xs"
            >
              {CLAUDE_PERMISSION_MODE_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  title={option.description}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </section>
        <section className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Generation
          </div>
          <label className="grid grid-cols-[8rem_minmax(0,1fr)_4rem] items-center gap-3 text-xs">
            <span className="text-muted-foreground">Temperature</span>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={temperature ?? 0}
              onChange={(event) =>
                onTemperatureChange?.(Number(event.target.value))
              }
            />
            <input
              type="number"
              min={0}
              max={2}
              step={0.1}
              value={temperature ?? ""}
              onChange={(event) =>
                onTemperatureChange?.(parseOptionalNumber(event.target.value))
              }
              className="h-8 rounded border border-border bg-background px-2 text-xs"
            />
          </label>
        </section>
        <section className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Budget
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 text-xs">
              <span className="text-muted-foreground">Max cost</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={budget?.cost ?? ""}
                onChange={(event) => updateBudget("cost", event.target.value)}
                className="h-8 w-full rounded border border-border bg-background px-2 text-xs"
              />
            </label>
            <label className="space-y-1 text-xs">
              <span className="text-muted-foreground">Max tokens</span>
              <input
                type="number"
                min={0}
                step={1}
                value={budget?.maxTokens ?? ""}
                onChange={(event) =>
                  updateBudget("maxTokens", event.target.value)
                }
                className="h-8 w-full rounded border border-border bg-background px-2 text-xs"
              />
            </label>
          </div>
        </section>
      </div>
      <UsageCostPanel usage={usage} />
    </div>
  );
}

function UsageCostPanel({
  usage,
}: {
  usage?: ChatUsageSummary | null | undefined;
}) {
  const tokens = usage?.usage;
  const costs = usage?.costBreakdown;
  return (
    <aside className="space-y-3 border-l border-border pl-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Usage
      </div>
      <div className="overflow-hidden rounded border border-border">
        <MetricRow
          label="Context"
          value={`${formatNumber(usage?.usedTokens)} / ${formatNumber(usage?.maxTokens)}`}
        />
        <MetricRow
          label="Input tokens"
          value={formatNumber(tokens?.inputTokens)}
        />
        <MetricRow
          label="Output tokens"
          value={formatNumber(tokens?.outputTokens)}
        />
        <MetricRow
          label="Reasoning tokens"
          value={formatNumber(tokens?.reasoningTokens)}
        />
        <MetricRow
          label="Cache read tokens"
          value={formatNumber(tokens?.cacheReadTokens)}
        />
        <MetricRow
          label="Cache write tokens"
          value={formatNumber(tokens?.cacheWriteTokens)}
        />
        <MetricRow
          label="Total tokens"
          value={formatNumber(tokens?.totalTokens)}
        />
      </div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Cost
      </div>
      <div className="overflow-hidden rounded border border-border">
        <MetricRow label="Input" value={formatUSD(costs?.inputUsd)} />
        <MetricRow label="Output" value={formatUSD(costs?.outputUsd)} />
        <MetricRow label="Reasoning" value={formatUSD(costs?.reasoningUsd)} />
        <MetricRow label="Cache read" value={formatUSD(costs?.cacheReadUsd)} />
        <MetricRow
          label="Cache write"
          value={formatUSD(costs?.cacheWriteUsd)}
        />
        <MetricRow
          label="Thread total"
          value={formatUSD(usage?.cost ?? costs?.totalUsd)}
          strong
        />
      </div>
    </aside>
  );
}

function MetricRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-border px-2 py-1.5 text-xs last:border-b-0">
      <span className="truncate text-muted-foreground">{label}</span>
      <span
        className={cn("font-mono", strong && "font-semibold text-foreground")}
      >
        {value}
      </span>
    </div>
  );
}

function AdvancedPermissionsPanel({
  groups,
  value,
  collapsedGroups,
  onCollapseToggle,
  onToolToggle,
  onGroupToggle,
}: {
  groups: Array<[string, ToolPreferenceEntry[]]>;
  value: Record<string, ToolMode>;
  collapsedGroups: Record<string, boolean>;
  onCollapseToggle: (group: string) => void;
  onToolToggle: (entry: ToolPreferenceEntry, mode: ToolMode) => void;
  onGroupToggle: (entries: ToolPreferenceEntry[], mode: ToolMode) => void;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-hidden rounded border border-border">
      <div className="grid grid-cols-[minmax(0,1fr)_4rem] gap-3 border-b border-border bg-muted/40 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Tool</span>
        <span className="text-right">Mode</span>
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        {groups.length > 0 ? (
          groups.map(([group, entries]) => {
            const collapsed = collapsedGroups[group] ?? false;
            const groupMode = groupToolMode(entries, value);
            return (
              <div key={group}>
                <ToolGroupHeader
                  group={group}
                  count={entries.length}
                  collapsed={collapsed}
                  mode={groupMode}
                  onCollapseToggle={() => onCollapseToggle(group)}
                  onModeToggle={() => onGroupToggle(entries, groupMode)}
                />
                {!collapsed &&
                  entries.map((entry) => (
                    <AdvancedToolRow
                      key={entry.key}
                      entry={entry}
                      mode={entryMode(entry, value)}
                      onToggle={onToolToggle}
                    />
                  ))}
              </div>
            );
          })
        ) : (
          <div className="px-2 py-6 text-center text-xs text-muted-foreground">
            No tools
          </div>
        )}
      </div>
    </div>
  );
}

function groupedToolEntries(
  tools: ToolMeta[],
): Array<[string, ToolPreferenceEntry[]]> {
  const groups: Record<string, ToolPreferenceEntry[]> = {};
  for (const tool of tools) {
    const group = toolGroup(tool);
    const entry: ToolPreferenceEntry = {
      key: tool.name,
      label: tool.label || tool.name,
      group,
      tool,
      defaultMode: toolDefaultMode(tool),
    };
    (groups[group] ??= []).push(entry);
  }
  return Object.entries(groups)
    .map(
      ([group, entries]) =>
        [
          group,
          [...entries].sort((a, b) => a.label.localeCompare(b.label)),
        ] as [string, ToolPreferenceEntry[]],
    )
    .sort(([a], [b]) => a.localeCompare(b));
}

function groupedToolEntriesWithPreferences(
  tools: ToolMeta[],
  value: Record<string, ToolMode>,
): Array<[string, ToolPreferenceEntry[]]> {
  const groups = groupedToolEntries(tools);
  const known = new Set(tools.map((tool) => tool.name));
  const customEntries = Object.entries(value)
    .filter(([name, mode]) => !known.has(name) && isToolMode(mode))
    .map(([name, mode]) => ({
      key: name,
      label: name,
      group: "Custom",
      tool: {
        name,
        label: name,
        group: "Custom",
        defaultMode: mode,
      },
      defaultMode: mode,
    }));
  if (customEntries.length === 0) return groups;
  return [...groups, ["Custom", customEntries]];
}

function isToolMode(value: string): value is ToolMode {
  return value === "enabled" || value === "ask" || value === "disabled";
}

function toolGroup(meta: ToolMeta): string {
  return meta.group ?? "Tools";
}

function toolDefaultMode(meta: ToolMeta): ToolMode {
  return meta.defaultMode ?? "enabled";
}

function entryMode(
  entry: ToolPreferenceEntry,
  value: Record<string, ToolMode>,
): ToolMode {
  return value[entry.key] ?? entry.defaultMode;
}

function groupToolMode(
  entries: ToolPreferenceEntry[],
  value: Record<string, ToolMode>,
): ToolMode {
  return entries.reduce<ToolMode>(
    (mode, entry) => mostRestrictiveMode(mode, entryMode(entry, value)),
    "enabled",
  );
}

function nextMode(mode: ToolMode): ToolMode {
  return MODE_CYCLE[(MODE_CYCLE.indexOf(mode) + 1) % MODE_CYCLE.length]!;
}

function mostRestrictiveMode(a: ToolMode, b: ToolMode): ToolMode {
  return modeRank(a) >= modeRank(b) ? a : b;
}

function modeRank(mode: ToolMode): number {
  switch (mode) {
    case "enabled":
      return 0;
    case "ask":
      return 1;
    case "disabled":
      return 2;
  }
}

function parseOptionalNumber(raw: string, integer = false): number | undefined {
  if (raw.trim() === "") return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value)) return undefined;
  return integer ? Math.max(0, Math.trunc(value)) : value;
}

function formatNumber(value: number | undefined): string {
  if (value == null || !Number.isFinite(value)) return "-";
  return new Intl.NumberFormat().format(value);
}

function formatUSD(value: number | undefined): string {
  if (value == null || !Number.isFinite(value)) return "-";
  return `$${value.toFixed(value >= 1 ? 4 : 6)}`;
}
