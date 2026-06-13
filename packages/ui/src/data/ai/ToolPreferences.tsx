import { useMemo } from "react";
import { cn } from "../../lib/utils";
import { DropdownMenu } from "../../overlay/DropdownMenu";
import { Button } from "../../components/button";
import { Icon } from "../Icon";
import { UiSliders } from "../../icons";
import type { ToolMeta } from "../chat/types";

export type { ToolMeta };

/** How a tool may be invoked: run automatically, pause for approval, or be
 *  hidden from the model entirely. */
export type ToolMode = "enabled" | "ask" | "disabled";

const MODE_CYCLE: ToolMode[] = ["enabled", "ask", "disabled"];
const MODE_LABEL: Record<ToolMode, string> = { enabled: "Auto", ask: "Ask", disabled: "Off" };

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
  meta,
  mode,
  onToggle,
}: {
  meta: ToolMeta;
  mode: ToolMode;
  onToggle: (name: string) => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded px-2 py-1 text-left hover:bg-accent"
      onClick={() => onToggle(meta.name)}
    >
      <span className={cn("text-xs", mode === "disabled" && "text-muted-foreground line-through")}>
        {meta.label}
      </span>
      <span
        className={cn(
          "rounded px-1.5 py-0.5 text-[10px] font-medium",
          mode === "enabled" &&
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
          mode === "ask" && "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
          mode === "disabled" && "bg-muted text-muted-foreground",
        )}
      >
        {MODE_LABEL[mode]}
      </span>
    </button>
  );
}

/** A popover that cycles each tool through Auto → Ask → Off. The resulting
 *  `Record<name, ToolMode>` is meant to be forwarded to the backend (e.g. via
 *  `<Chat body={{ toolPreferences }}>`). */
export function ToolPreferences({ tools, value, onChange, className = "" }: ToolPreferencesProps) {
  const groups = useMemo(() => {
    const g: Record<string, ToolMeta[]> = {};
    for (const meta of tools) (g[meta.group ?? "Tools"] ??= []).push(meta);
    return g;
  }, [tools]);

  const handleToggle = (name: string) => {
    const current = value[name] ?? "enabled";
    const next = MODE_CYCLE[(MODE_CYCLE.indexOf(current) + 1) % MODE_CYCLE.length]!;
    onChange({ ...value, [name]: next });
  };

  return (
    <DropdownMenu
      align="right"
      className={className}
      menuClassName="w-64 max-h-[400px] overflow-y-auto p-3"
      trigger={
        <Button variant="ghost" size="icon" title="Tool preferences" data-testid="tool-preferences-btn">
          <Icon icon={UiSliders} className="size-4" />
        </Button>
      }
    >
      {() => (
        <div>
          <div className="mb-2 text-xs font-semibold">Tool Preferences</div>
          <p className="mb-2 text-[10px] text-muted-foreground">Click to cycle: Auto → Ask → Off</p>
          {Object.entries(groups).map(([group, metas]) => (
            <div key={group} className="mb-2">
              <div className="mb-0.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </div>
              {metas.map((meta) => (
                <ToolRow
                  key={meta.name}
                  meta={meta}
                  mode={value[meta.name] ?? "enabled"}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </DropdownMenu>
  );
}
