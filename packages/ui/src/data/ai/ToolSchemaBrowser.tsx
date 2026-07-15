import { useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { UiCode2, UiSearch, UiWrench } from "../../icons";
import { SchemaViewer } from "../SchemaViewer";
import type { ToolMeta } from "../chat/types";

export type ToolSchemaBrowserProps = {
  tools: ToolMeta[];
  className?: string;
};

export function ToolSchemaBrowser({ tools, className }: ToolSchemaBrowserProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(tools[0]?.name ?? null);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter((tool) =>
      [
        tool.name,
        tool.label,
        tool.title,
        tool.description,
        tool.group,
        tool.source,
        tool.server,
        ...(tool.hints ?? []),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [query, tools]);
  const active =
    tools.find((tool) => tool.name === selected) ?? filtered[0] ?? tools[0];
  const groups = useMemo(() => groupedTools(filtered), [filtered]);

  return (
    <div className={cn("grid min-h-0 grid-cols-[18rem_minmax(0,1fr)] border border-border", className)}>
      <div className="min-h-0 border-r border-border">
        <label className="flex h-9 items-center gap-2 border-b border-border px-2 text-xs">
          <Icon icon={UiSearch} className="size-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tools"
            className="min-w-0 flex-1 bg-transparent outline-none"
          />
        </label>
        <div className="max-h-[52vh] overflow-y-auto">
          {groups.map(([group, groupTools]) => (
            <div key={group}>
              <div className="sticky top-0 z-[1] border-b border-border bg-muted/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </div>
              {groupTools.map((tool) => (
                <button
                  key={tool.name}
                  type="button"
                  title={tool.name}
                  className={cn(
                    "grid h-9 w-full grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-2 text-left hover:bg-accent",
                    active?.name === tool.name && "bg-accent",
                  )}
                  onClick={() => setSelected(tool.name)}
                >
                  <Icon icon={UiWrench} className="size-3.5 text-muted-foreground" />
                  <span className="min-w-0 truncate text-xs">{tool.label || tool.name}</span>
                  {tool.server && (
                    <span className="max-w-20 truncate rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {tool.server}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-8 text-center text-xs text-muted-foreground">
              No matching tools
            </div>
          )}
        </div>
      </div>
      <div className="min-h-0 overflow-y-auto p-3">
        {active ? (
          <div className="space-y-3">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <Icon icon={UiCode2} className="size-4 text-muted-foreground" />
                <div className="min-w-0 truncate text-sm font-medium">{active.label || active.name}</div>
              </div>
              {active.description && (
                <p className="mt-1 text-xs text-muted-foreground">{active.description}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
                {active.name && <span className="rounded bg-muted px-1.5 py-0.5 font-mono">{active.name}</span>}
                {active.source && <span className="rounded bg-muted px-1.5 py-0.5">{active.source}</span>}
                {active.group && <span className="rounded bg-muted px-1.5 py-0.5">{active.group}</span>}
                {active.server && <span className="rounded bg-muted px-1.5 py-0.5">{active.server}</span>}
                {active.method && <span className="rounded bg-muted px-1.5 py-0.5">{active.method}</span>}
                {active.path && <span className="rounded bg-muted px-1.5 py-0.5">{active.path}</span>}
              </div>
              {active.hints && active.hints.length > 0 && (
                <div className="mt-3 rounded border border-border bg-muted/20 p-2">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Hints
                  </div>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {active.hints.map((hint) => (
                      <li key={hint}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <SchemaViewer
              schema={active.inputSchema ?? { type: "object", properties: {} }}
              defaultOpenDepth={2}
              showControls={false}
            />
            {active.outputSchema && (
              <div className="border-t border-border pt-3">
                <div className="mb-2 text-xs font-semibold">Output</div>
                <SchemaViewer schema={active.outputSchema} defaultOpenDepth={1} showControls={false} />
              </div>
            )}
          </div>
        ) : (
          <div className="px-3 py-8 text-center text-xs text-muted-foreground">No tools</div>
        )}
      </div>
    </div>
  );
}

function groupedTools(tools: ToolMeta[]): Array<[string, ToolMeta[]]> {
  const groups: Record<string, ToolMeta[]> = {};
  for (const tool of tools) {
    const group = tool.group || "Tools";
    (groups[group] ??= []).push(tool);
  }
  return Object.entries(groups)
    .map(([group, groupTools]) => [
      group,
      [...groupTools].sort((a, b) =>
        (a.label || a.name).localeCompare(b.label || b.name),
      ),
    ] as [string, ToolMeta[]])
    .sort(([a], [b]) => a.localeCompare(b));
}
