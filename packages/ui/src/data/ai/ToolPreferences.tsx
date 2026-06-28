import { useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { DropdownMenu } from "../../overlay/DropdownMenu";
import { HoverCard } from "../../overlay/HoverCard";
import { Modal } from "../../overlay/Modal";
import { Button } from "../../components/button";
import { Icon } from "../Icon";
import { UiInfo, UiSliders } from "../../icons";
import type { ToolMeta, ToolMode } from "../chat/types";

export type { ToolMeta, ToolMode };

/** How a tool may be invoked: run automatically, pause for approval, or be
 *  hidden from the model entirely. */
const MODE_CYCLE: ToolMode[] = ["enabled", "ask", "disabled"];
const MODE_LABEL: Record<ToolMode, string> = {
  enabled: "Auto",
  ask: "Ask",
  disabled: "Off",
};

type ToolPreferenceEntry = {
  key: string;
  label: string;
  group: string;
  tools: ToolMeta[];
  defaultMode: ToolMode;
};

export type ToolPreferencesProps = {
  /** The tools to list. Replaces ai-financials' global registry — callers pass
   *  whatever their backend exposes. */
  tools: ToolMeta[];
  /** Current per-tool mode. Missing entries default to "enabled". */
  value: Record<string, ToolMode>;
  onChange: (prefs: Record<string, ToolMode>) => void;
  className?: string;
};

function ToolRow({
  entry,
  mode,
  onToggle,
}: {
  entry: ToolPreferenceEntry;
  mode: ToolMode;
  onToggle: (name: string, current: ToolMode) => void;
}) {
  const title =
    entry.tools.length > 1
      ? `${entry.tools.length} tools`
      : entry.tools[0]?.description;
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded px-2 py-1 text-left hover:bg-accent"
      title={title}
      onClick={() => onToggle(entry.key, mode)}
    >
      <span
        className={cn(
          "text-xs",
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
  tool,
  mode,
  onToggle,
}: {
  tool: ToolMeta;
  mode: ToolMode;
  onToggle: (name: string, current: ToolMode) => void;
}) {
  const description = tool.description?.trim() || "No description";
  return (
    <button
      type="button"
      className="grid h-9 w-full grid-cols-[minmax(0,1fr)_4rem] items-center gap-3 border-b border-border px-2 text-left hover:bg-accent"
      title={description}
      onClick={() => onToggle(tool.name, mode)}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <span
          className={cn(
            "min-w-0 truncate font-mono text-xs",
            mode === "disabled" && "text-muted-foreground line-through",
          )}
        >
          {tool.name}
        </span>
        <HoverCard
          placement="top"
          delay={120}
          trigger={
            <span
              aria-label={`Description for ${tool.name}`}
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
    >
      {MODE_LABEL[mode]}
    </span>
  );
}

/** A popover that cycles each tool/group through Auto → Ask → Off. The resulting
 *  `Record<name, ToolMode>` is meant to be forwarded to the backend (e.g. via
 *  `<Chat body={{ toolPreferences }}>`). */
export function ToolPreferences({
  tools,
  value,
  onChange,
  className = "",
}: ToolPreferencesProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const groups = useMemo(() => {
    const maps: Record<string, Map<string, ToolPreferenceEntry>> = {};
    for (const meta of tools) {
      const group = toolGroup(meta);
      const key = toolPreferenceKey(meta);
      const map = (maps[group] ??= new Map());
      let entry = map.get(key);
      if (!entry) {
        entry = {
          key,
          label: key === meta.name ? meta.label : key,
          group,
          tools: [],
          defaultMode: toolDefaultMode(meta),
        };
        map.set(key, entry);
      }
      entry.tools.push(meta);
      entry.defaultMode = mostRestrictiveMode(
        entry.defaultMode,
        toolDefaultMode(meta),
      );
    }
    const g: Record<string, ToolPreferenceEntry[]> = {};
    for (const [group, map] of Object.entries(maps)) {
      g[group] = [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
    }
    return g;
  }, [tools]);

  const advancedGroups = useMemo(
    () => groupedToolMetas(tools),
    [tools],
  );

  const handleToggle = (name: string, current: ToolMode) => {
    const next =
      MODE_CYCLE[(MODE_CYCLE.indexOf(current) + 1) % MODE_CYCLE.length]!;
    onChange({ ...value, [name]: next });
  };

  return (
    <>
      <DropdownMenu
        align="right"
        className={className}
        menuClassName="w-64 max-h-[400px] overflow-y-auto p-3"
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
            <div className="mb-2 text-xs font-semibold">Tool Preferences</div>
            {Object.entries(groups)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([group, metas]) => (
                <div key={group} className="mb-2">
                  <div className="mb-0.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group}
                  </div>
                  {metas.map((entry) => {
                    const mode = value[entry.key] ?? entry.defaultMode;
                    return (
                      <ToolRow
                        key={entry.key}
                        entry={entry}
                        mode={mode}
                        onToggle={handleToggle}
                      />
                    );
                  })}
                </div>
              ))}
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
        title="Advanced Tool Preferences"
        size="xl"
      >
        <div className="overflow-hidden rounded border border-border">
          <div className="grid grid-cols-[minmax(0,1fr)_4rem] gap-3 border-b border-border bg-muted/40 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Name</span>
            <span className="text-right">Mode</span>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {advancedGroups.length > 0 ? (
              advancedGroups.map(([group, groupTools]) => (
                <div key={group}>
                  <div className="sticky top-0 z-[1] border-b border-border bg-muted/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group}
                  </div>
                  {groupTools.map((tool) => {
                    const mode = toolMode(tool, value);
                    return (
                      <AdvancedToolRow
                        key={tool.name}
                        tool={tool}
                        mode={mode}
                        onToggle={handleToggle}
                      />
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                No tools
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}

function toolGroup(meta: ToolMeta): string {
  return meta.group ?? "Tools";
}

function groupedToolMetas(tools: ToolMeta[]): Array<[string, ToolMeta[]]> {
  const groups: Record<string, ToolMeta[]> = {};
  for (const tool of tools) {
    (groups[toolGroup(tool)] ??= []).push(tool);
  }
  return Object.entries(groups)
    .map(([group, groupTools]) => [
      group,
      [...groupTools].sort((a, b) => a.name.localeCompare(b.name)),
    ] as [string, ToolMeta[]])
    .sort(([a], [b]) => a.localeCompare(b));
}

function toolPreferenceKey(meta: ToolMeta): string {
  return meta.preferenceKey ?? meta.name;
}

function toolDefaultMode(meta: ToolMeta): ToolMode {
  return meta.defaultMode ?? "enabled";
}

function toolMode(meta: ToolMeta, value: Record<string, ToolMode>): ToolMode {
  const own = value[meta.name];
  if (own) return own;
  const key = toolPreferenceKey(meta);
  if (key !== meta.name) {
    const grouped = value[key];
    if (grouped) return grouped;
  }
  return toolDefaultMode(meta);
}

function mostRestrictiveMode(a: ToolMode, b: ToolMode): ToolMode {
  const rank: Record<ToolMode, number> = { enabled: 0, ask: 1, disabled: 2 };
  return rank[a] >= rank[b] ? a : b;
}
