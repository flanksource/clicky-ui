import { IconButton } from "../../components/IconButton";
import { SegmentedControl } from "../../components/SegmentedControl";
import { DropdownMenu } from "../../overlay/DropdownMenu";
import { cn } from "../../lib/utils";
import {
  UiEye,
  UiFilter,
  UiGlobe,
  UiLayers,
  UiListDashes,
  UiRepeat,
  UiSearch,
  UiWarningTriangle,
} from "../../icons";
import { Icon, type StaticIconComponent } from "../Icon";
import type { PermissionRule } from "../chat/tool-policy";
import type { ToolMeta, ToolPolicy } from "../chat/types";
import { ToolPolicyTree } from "./ToolSchemaBrowser.tree";
import {
  TOOL_HINTS,
  type ToolHintFilter,
  type ToolHintFilters,
  type ToolHintKey,
  type ToolSchemaViewMode,
  type ToolSection,
} from "./ToolSchemaBrowser.model";

export function ToolSchemaBrowserSidebar({
  query,
  view,
  filters,
  sections,
  active,
  filteredCount,
  isOpen,
  value,
  onRule,
  onQueryChange,
  onViewChange,
  onFilterChange,
  onClearFilters,
  onToggle,
  onSelect,
}: {
  query: string;
  view: ToolSchemaViewMode;
  filters: ToolHintFilters;
  sections: ToolSection[];
  active: ToolMeta | undefined;
  filteredCount: number;
  isOpen: (key: string) => boolean;
  value: Record<string, ToolPolicy> | undefined;
  onRule: ((rule: PermissionRule) => void) | undefined;
  onQueryChange: (query: string) => void;
  onViewChange: (view: ToolSchemaViewMode) => void;
  onFilterChange: (key: ToolHintKey, value: ToolHintFilter) => void;
  onClearFilters: () => void;
  onToggle: (key: string) => void;
  onSelect: (name: string) => void;
}) {
  const activeFilterCount = Object.values(filters).filter(
    (filter) => filter !== "any",
  ).length;
  return (
    <>
      <label className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-2 text-xs">
        <Icon icon={UiSearch} className="size-3.5 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search tools"
          className="min-w-0 flex-1 bg-transparent outline-none"
        />
      </label>
      <div className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-1">
        <ViewToggleButton
          active={view === "group"}
          icon={UiListDashes}
          label="Group"
          onClick={() => onViewChange("group")}
        />
        <ViewToggleButton
          active={view === "tree"}
          icon={UiLayers}
          label="Tree"
          onClick={() => onViewChange("tree")}
        />
        <DropdownMenu
          align="right"
          menuLabel="Tool annotation filters"
          menuClassName="w-72 p-2"
          className="ml-auto"
          trigger={
            <span className="relative inline-flex">
              <IconButton
                icon={UiFilter}
                label={
                  activeFilterCount > 0
                    ? `Filter tool annotations, ${activeFilterCount} active`
                    : "Filter tool annotations"
                }
                className={cn(
                  activeFilterCount > 0 && "bg-primary/10 text-primary",
                )}
              />
              {activeFilterCount > 0 && (
                <span className="pointer-events-none absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </span>
          }
        >
          {() => (
            <div className="space-y-density-2">
              <div className="flex items-center justify-between gap-density-2">
                <span className="text-xs font-semibold">Tool annotations</span>
                <button
                  type="button"
                  disabled={activeFilterCount === 0}
                  onClick={onClearFilters}
                  className="text-[10px] font-medium text-primary disabled:text-muted-foreground"
                >
                  Clear all
                </button>
              </div>
              {TOOL_HINTS.map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                    <Icon
                      icon={hintFilterIcon(key)}
                      className={cn("size-3", hintIconClass(key))}
                    />
                    {label}
                  </span>
                  <SegmentedControl<ToolHintFilter>
                    aria-label={label}
                    value={filters[key]}
                    onChange={(next) => onFilterChange(key, next)}
                    size="sm"
                    className="w-full"
                    options={[
                      { id: "any", label: "Any" },
                      { id: "yes", label: "Yes" },
                      { id: "no", label: "No" },
                    ]}
                  />
                </div>
              ))}
            </div>
          )}
        </DropdownMenu>
      </div>
      <ToolPolicyTree
        sections={filteredCount === 0 ? [] : sections}
        view={view}
        value={value}
        onRule={onRule}
        isOpen={isOpen}
        onToggle={onToggle}
        activeName={active?.name}
        onSelect={onSelect}
        className="min-h-0 flex-1 overflow-y-auto"
      />
    </>
  );
}

function ViewToggleButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: StaticIconComponent;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium",
        active
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent/50",
      )}
    >
      <Icon icon={icon} className="size-3.5" />
      {label}
    </button>
  );
}

function hintFilterIcon(key: ToolHintKey): StaticIconComponent {
  if (key === "readOnlyHint") return UiEye;
  if (key === "destructiveHint") return UiWarningTriangle;
  if (key === "idempotentHint") return UiRepeat;
  return UiGlobe;
}

function hintIconClass(key: ToolHintKey): string {
  if (key === "readOnlyHint") return "text-emerald-600";
  if (key === "destructiveHint") return "text-red-600";
  if (key === "idempotentHint") return "text-sky-600";
  return "text-violet-600";
}
