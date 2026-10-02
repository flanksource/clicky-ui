import { useMemo, useState } from "react";
import { SplitPane } from "../../layout/SplitPane";
import { cn } from "../../lib/utils";
import type { PermissionPolicy, PermissionRule } from "../chat/tool-policy";
import type { ToolMeta, ToolPolicy } from "../chat/types";
import { ToolSchemaBrowserDetail } from "./ToolSchemaBrowser.detail";
import {
  EMPTY_TOOL_HINT_FILTERS,
  buildToolSchemaSections,
  filterToolSchemaBrowserTools,
  type ToolHintFilter,
  type ToolHintFilters,
  type ToolHintKey,
  type ToolSchemaBrowserTab,
  type ToolSchemaViewMode,
} from "./ToolSchemaBrowser.model";
import { ToolSchemaBrowserSidebar } from "./ToolSchemaBrowser.sidebar";
import { ToolPermissionStrategies } from "./ToolSchemaBrowser.strategies";

export type ToolSchemaBrowserProps = {
  tools: ToolMeta[];
  /** Server-resolved effective permission shown beside each tool. */
  value?: Record<string, ToolPolicy> | undefined;
  /** Enables click-to-toggle badges; emits one ordered policy rule per click. */
  onRule?: ((rule: PermissionRule) => void) | undefined;
  /** Saved rules; with `onRulesChange`, shows the collapsed strategy editor. */
  rules?: PermissionPolicy | undefined;
  onRulesChange?: ((rules: PermissionPolicy) => void) | undefined;
  className?: string;
};

export function ToolSchemaBrowser({
  tools,
  value,
  onRule,
  rules,
  onRulesChange,
  className,
}: ToolSchemaBrowserProps) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ToolSchemaViewMode>("group");
  const [tab, setTab] = useState<ToolSchemaBrowserTab>("schema");
  const [filters, setFilters] = useState<ToolHintFilters>(
    EMPTY_TOOL_HINT_FILTERS,
  );
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<string | null>(
    tools[0]?.name ?? null,
  );

  const filtered = useMemo(
    () => filterToolSchemaBrowserTools(tools, query, filters),
    [filters, query, tools],
  );
  const searching =
    query.trim().length > 0 ||
    Object.values(filters).some((value) => value !== "any");
  const active =
    filtered.find((tool) => tool.name === selected) ?? filtered[0] ?? tools[0];
  const sections = useMemo(
    () => buildToolSchemaSections(filtered, view),
    [filtered, view],
  );

  const toggle = (key: string) =>
    setCollapsed((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const isOpen = (key: string) => searching || !collapsed.has(key);
  const updateFilter = (key: ToolHintKey, value: ToolHintFilter) =>
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));

  return (
    <div className={cn("flex min-h-0 flex-col gap-2", className)}>
      {rules && onRulesChange && (
        <ToolPermissionStrategies
          rules={rules}
          tools={tools}
          onRulesChange={onRulesChange}
        />
      )}
      <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-border bg-background">
        <SplitPane
          defaultSplit={34}
          minLeft={24}
          minRight={42}
          className="min-h-0"
          leftClass="flex min-h-0 flex-col overflow-hidden"
          rightClass="min-h-0 overflow-y-auto"
          left={
            <ToolSchemaBrowserSidebar
              query={query}
              view={view}
              filters={filters}
              sections={sections}
              active={active}
              filteredCount={filtered.length}
              isOpen={isOpen}
              value={value}
              onRule={onRule}
              onQueryChange={setQuery}
              onViewChange={setView}
              onFilterChange={updateFilter}
              onClearFilters={() => setFilters({ ...EMPTY_TOOL_HINT_FILTERS })}
              onToggle={toggle}
              onSelect={setSelected}
            />
          }
          right={
            active ? (
              <ToolSchemaBrowserDetail
                tool={active}
                tab={tab}
                onTabChange={setTab}
              />
            ) : (
              <div className="px-3 py-8 text-center text-xs text-muted-foreground">
                No tools
              </div>
            )
          }
        />
      </div>
    </div>
  );
}
