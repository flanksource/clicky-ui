import { useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { DropdownMenu } from "../../overlay/DropdownMenu";
import { Modal } from "../../overlay/Modal";
import { Button } from "../../components/button";
import { Icon } from "../Icon";
import {
  UiChevronDown,
  UiChevronRight,
  UiCode2,
  UiShield,
  UiSliders,
} from "../../icons";
import { EffortSelector, ModelSelector } from "../chat/ModelSelector";
import { DEFAULT_REASONING_EFFORTS } from "../chat/effort-icons";
import { ToolSchemaBrowser } from "./ToolSchemaBrowser";
import type {
  ChatBudgetConfig,
  ChatModel,
  ChatUsageSummary,
  ClaudePermissionMode,
  ToolAnnotations,
  ToolMeta,
  ToolMode,
} from "../chat/types";
import { CLAUDE_PERMISSION_MODE_OPTIONS } from "../chat/types";

export type { ClaudePermissionMode, ToolAnnotations, ToolMeta, ToolMode };

// Tools cycle Auto -> Ask -> Off -> On on click (the compact toggle approach).
const MODE_CYCLE: ToolMode[] = ["auto", "ask", "off", "on"];

const MODE_LABEL: Record<ToolMode, string> = {
  on: "On",
  auto: "Auto",
  ask: "Ask",
  off: "Off",
};

const MODE_DESCRIPTION: Record<ToolMode, string> = {
  on: "Always allow this tool to run automatically.",
  auto: "Use the backend's default permission policy.",
  ask: "Ask before running this tool.",
  off: "Hide this tool from the model.",
};

// A header can display "Mixed" when its members don't share one mode; individual
// tool rows never do.
type BadgeMode = ToolMode | "mixed";

const BADGE_LABEL: Record<BadgeMode, string> = { ...MODE_LABEL, mixed: "Mixed" };

const BADGE_DESCRIPTION: Record<BadgeMode, string> = {
  ...MODE_DESCRIPTION,
  mixed: "Members have different permissions.",
};

type ToolPreferenceEntry = {
  key: string;
  label: string;
  group: string;
  tool: ToolMeta;
  defaultPermission: ToolMode;
};

// Sentinel parent for tools without a resolved surface — rendered directly under
// their group with no entity sub-header.
const NO_PARENT = "\u0000no-parent";

// A parent surface (entity) sub-bucket within a group, e.g. "Accounts" inside
// "Accounting Read". Supplies the disambiguating context for sibling verbs so
// bare labels like "Get"/"List" stay distinguishable.
type ToolSubGroup = {
  parent: string;
  entries: ToolPreferenceEntry[];
};

// A permission-tier group (the load-bearing preferenceKey scope) plus its
// parent-surface sub-buckets. `entries` is the flat member list used for the
// group-level count and bulk cycle.
type ToolGroup = {
  group: string;
  entries: ToolPreferenceEntry[];
  subGroups: ToolSubGroup[];
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

// A single mode badge — shows exactly the current mode's label, tone-colored.
// Headers may pass "mixed" when their members disagree.
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

// A collapsible group header: a chevron to expand/collapse, the group name +
// count as a button that cycles every tool in the group, and the group's mode
// badge ("Mixed" when members disagree).
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
        <span className="shrink-0">
          <ModeBadge mode={mode} />
        </span>
      </button>
    </div>
  );
}

// One tool row — the whole row is a button that cycles the tool's mode. Rows
// under an entity sub-header are indented so the sub-header reads as their
// heading.
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

// A collapsible entity sub-header inside a group: a chevron to expand/collapse
// its rows, and a button that cycles every tool under the parent surface —
// mirroring the group header one level down.
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
        <span className="shrink-0">
          <ModeBadge mode={mode} />
        </span>
      </button>
    </div>
  );
}

// A parent sub-bucket: its entity sub-header (when the parent is real) followed
// by the tool rows. Parentless tools render as bare rows directly under the
// group.
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
  // Parentless tools have no sub-header, so they always show when the group is open.
  if (!hasParent) {
    return <>{rows}</>;
  }
  return (
    <div>
      <ToolParentHeader
        parent={subGroup.parent}
        count={subGroup.entries.length}
        collapsed={!open}
        mode={commonMode(subGroup.entries, value)}
        onCollapseToggle={onToggle}
        onModeToggle={() =>
          onCycleEntries(subGroup.entries, groupToolMode(subGroup.entries, value))
        }
      />
      {open && rows}
    </div>
  );
}

// The compact per-tool list shared by the dropdown and the standalone list:
// grouped, collapsible, single cycling badge per tool.
function CompactToolList({
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
  // Track which nodes are EXPANDED, so everything starts collapsed (empty set)
  // like the tool browser's group view. Parent keys are namespaced under their
  // group since entity names repeat across groups.
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

/** A popover that cycles tools through Auto -> Ask -> Off -> On. The resulting
 *  `Record<name, ToolMode>` is meant to be forwarded to the backend (e.g. via
 *  `<Chat body={{ toolPreferences }}>`). */
export function ToolPreferences({
  tools,
  value,
  onChange,
  models = [],
  model,
  onModelChange,
  reasoningEfforts = DEFAULT_REASONING_EFFORTS,
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
  const groups = useMemo(() => groupedToolEntries(tools), [tools]);

  return (
    <>
      <DropdownMenu
        align="right"
        className={className}
        menuClassName="w-72 max-h-[70vh] overflow-y-auto p-1"
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
            <div className="mb-1 px-1 text-xs font-semibold">
              Tool Preferences
            </div>
            <CompactToolList
              groups={groups}
              value={value}
              onChange={onChange}
              emptyLabel="No tools available"
            />
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
              onChange={onChange}
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
  onChange,
}: {
  groups: ToolGroup[];
  value: Record<string, ToolMode>;
  onChange: (prefs: Record<string, ToolMode>) => void;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto rounded border border-border p-1">
      <CompactToolList
        groups={groups}
        value={value}
        onChange={onChange}
        emptyLabel="No tools"
      />
    </div>
  );
}

function groupedToolEntries(tools: ToolMeta[]): ToolGroup[] {
  const groups: Record<string, ToolPreferenceEntry[]> = {};
  for (const tool of tools) {
    const group = toolGroup(tool);
    const entry: ToolPreferenceEntry = {
      key: tool.name,
      label: tool.label || tool.name,
      group,
      tool,
      defaultPermission: toolDefaultPermission(tool),
    };
    (groups[group] ??= []).push(entry);
  }
  return Object.entries(groups)
    .map(([group, entries]) => buildToolGroup(group, entries))
    .sort((a, b) => a.group.localeCompare(b.group));
}

// Splits a group's entries into parent-surface sub-buckets. Parentless entries
// collapse into the NO_PARENT bucket, which sorts first and renders headerless.
function buildToolGroup(
  group: string,
  entries: ToolPreferenceEntry[],
): ToolGroup {
  const byParent: Record<string, ToolPreferenceEntry[]> = {};
  for (const entry of entries) {
    const parent = entry.tool.parent?.trim() || NO_PARENT;
    (byParent[parent] ??= []).push(entry);
  }
  const subGroups = Object.entries(byParent)
    .map(([parent, subEntries]) => ({
      parent,
      entries: [...subEntries].sort((a, b) => a.label.localeCompare(b.label)),
    }))
    .sort(compareSubGroups);
  return {
    group,
    entries: [...entries].sort((a, b) => a.label.localeCompare(b.label)),
    subGroups,
  };
}

function compareSubGroups(a: ToolSubGroup, b: ToolSubGroup): number {
  if (a.parent === NO_PARENT) return b.parent === NO_PARENT ? 0 : -1;
  if (b.parent === NO_PARENT) return 1;
  return a.parent.localeCompare(b.parent);
}

function groupedToolEntriesWithPreferences(
  tools: ToolMeta[],
  value: Record<string, ToolMode>,
): ToolGroup[] {
  const groups = groupedToolEntries(tools);
  const known = new Set(tools.map((tool) => tool.name));
  const customEntries = Object.entries(value).flatMap(([name, mode]) => {
    const normalizedMode = normalizeToolMode(mode);
    if (known.has(name) || !normalizedMode) return [];
    return [
      {
        key: name,
        label: name,
        group: "Custom",
        tool: {
          name,
          label: name,
          group: "Custom",
          defaultPermission: normalizedMode,
        },
        defaultPermission: normalizedMode,
      },
    ];
  });
  if (customEntries.length === 0) return groups;
  return [...groups, buildToolGroup("Custom", customEntries)];
}

function normalizeToolMode(value: string): ToolMode | undefined {
  switch (value.trim().toLowerCase()) {
    case "on":
    case "enabled":
      return "on";
    case "auto":
      return "auto";
    case "ask":
      return "ask";
    case "off":
    case "disabled":
      return "off";
    default:
      return undefined;
  }
}

function toolGroup(meta: ToolMeta): string {
  return meta.group ?? "Tools";
}

function toolDefaultPermission(meta: ToolMeta): ToolMode {
  return meta.defaultPermission ?? "auto";
}

function entryMode(
  entry: ToolPreferenceEntry,
  value: Record<string, ToolMode>,
): ToolMode {
  return normalizeToolMode(value[entry.key] ?? "") ?? entry.defaultPermission;
}

// A group's toggle mode is its most-restrictive member, so cycling starts from
// the safest current state.
function groupToolMode(
  entries: ToolPreferenceEntry[],
  value: Record<string, ToolMode>,
): ToolMode {
  return entries.reduce<ToolMode>(
    (mode, entry) => mostRestrictiveMode(mode, entryMode(entry, value)),
    "on",
  );
}

// A header's DISPLAY mode: the shared member mode, or "mixed" when members
// disagree. Cycling still uses groupToolMode; this is badge-only.
function commonMode(
  entries: ToolPreferenceEntry[],
  value: Record<string, ToolMode>,
): BadgeMode {
  const first = entries[0];
  if (!first) return "mixed";
  const firstMode = entryMode(first, value);
  return entries.every((entry) => entryMode(entry, value) === firstMode)
    ? firstMode
    : "mixed";
}

function nextMode(mode: ToolMode): ToolMode {
  const current = MODE_CYCLE.indexOf(mode);
  return MODE_CYCLE[((current >= 0 ? current : 0) + 1) % MODE_CYCLE.length]!;
}

function mostRestrictiveMode(a: ToolMode, b: ToolMode): ToolMode {
  return modeRank(a) >= modeRank(b) ? a : b;
}

function modeRank(mode: ToolMode): number {
  switch (mode) {
    case "on":
      return 0;
    case "auto":
      return 1;
    case "ask":
      return 2;
    case "off":
      return 3;
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
