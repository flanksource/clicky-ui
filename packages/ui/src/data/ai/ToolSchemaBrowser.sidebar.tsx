import { useEffect, useRef } from "react";
import { IconButton } from "../../components/IconButton";
import { SegmentedControl } from "../../components/SegmentedControl";
import {
  ListMenu,
  ListMenuHeader,
  ListMenuItem,
  ListMenuSection,
} from "../../components/ListMenu";
import type { ListMenuSelection } from "../../components/use-list-menu-selection";
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
  UiWrench,
} from "../../icons";
import { Icon, type StaticIconComponent } from "../Icon";
import type { PermissionRule } from "../chat/tool-policy";
import type { ToolMeta, ToolPolicy } from "../chat/types";
import { ToolDirectoryHeader } from "./ToolSchemaBrowser.directory-header";
import { ToolSelectionStrategyToolbar } from "./ToolSchemaBrowser.selection-toolbar";
import {
  TOOL_HINTS,
  directoryPermissionRule,
  selectedToolState,
  updateSelectedTools,
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
  selection,
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
  selection?: ListMenuSelection | undefined;
  value: Record<string, ToolPolicy> | undefined;
  onRule: ((rule: PermissionRule) => void) | undefined;
  onQueryChange: (query: string) => void;
  onViewChange: (view: ToolSchemaViewMode) => void;
  onFilterChange: (key: ToolHintKey, value: ToolHintFilter) => void;
  onClearFilters: () => void;
  onToggle: (key: string) => void;
  onSelect: (name: string) => void;
}) {
  const selected = selection?.selected ?? new Set<string>();
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
      {selection && onRule && selection.count > 0 && (
        <ToolSelectionStrategyToolbar
          selection={selection}
          onRule={onRule}
        />
      )}
      <ListMenu
        className="min-h-0 flex-1 overflow-y-auto divide-y-0"
        {...(selection ? { selection } : {})}
      >
        {sections.map((section) => {
          const sectionKey = `p:${section.label}`;
          const sectionOpen = isOpen(sectionKey);
          const sectionTools = section.children.flatMap((child) => child.tools);
          const sectionNames = sectionTools.map((tool) => tool.name);
          const sectionState = selectedToolState(selected, sectionNames);
          return (
            <ListMenuSection key={sectionKey}>
              <ListMenuHeader className="px-0 py-0">
                {selection && (
                  <SelectionCheckbox
                    label={`Select all visible tools in ${section.label}`}
                    checked={sectionState.checked}
                    mixed={sectionState.mixed}
                    onChange={() =>
                      selection.set(
                        updateSelectedTools(
                          selection.selectedKeys,
                          sectionNames,
                        ),
                      )
                    }
                  />
                )}
                <ToolDirectoryHeader
                  label={section.label}
                  count={section.count}
                  open={sectionOpen}
                  variant="section"
                  onToggle={() => onToggle(sectionKey)}
                  {...(onRule
                    ? {
                        onAdd: () =>
                          onRule(
                            directoryPermissionRule({
                              tools: sectionTools,
                              view,
                              depth: "section",
                            }),
                          ),
                      }
                    : {})}
                />
              </ListMenuHeader>
              {sectionOpen &&
                section.children.map((child) => {
                  const childKey = `s:${section.label}///${child.label}`;
                  const childOpen = isOpen(childKey);
                  const childNames = child.tools.map((tool) => tool.name);
                  const childState = selectedToolState(selected, childNames);
                  return (
                    <div key={childKey}>
                      <div className="flex items-center border-b border-border bg-background pl-2">
                        {selection && (
                          <SelectionCheckbox
                            label={`Select all visible tools in ${child.label}`}
                            checked={childState.checked}
                            mixed={childState.mixed}
                            onChange={() =>
                              selection.set(
                                updateSelectedTools(
                                  selection.selectedKeys,
                                  childNames,
                                ),
                              )
                            }
                          />
                        )}
                        <ToolDirectoryHeader
                          label={child.label}
                          count={child.tools.length}
                          open={childOpen}
                          variant="child"
                          onToggle={() => onToggle(childKey)}
                          {...(onRule
                            ? {
                                onAdd: () =>
                                  onRule(
                                    directoryPermissionRule({
                                      tools: child.tools,
                                      view,
                                      depth: "child",
                                    }),
                                  ),
                              }
                            : {})}
                        />
                      </div>
                      {childOpen &&
                        child.tools.map((tool) => (
                          <ToolSidebarRow
                            key={tool.name}
                            tool={tool}
                            active={active?.name === tool.name}
                            policy={value?.[tool.name]}
                            selectable={selection !== undefined}
                            onSelect={() => onSelect(tool.name)}
                          />
                        ))}
                    </div>
                  );
                })}
            </ListMenuSection>
          );
        })}
        {filteredCount === 0 && (
          <div className="px-3 py-8 text-center text-xs text-muted-foreground">
            No matching tools
          </div>
        )}
      </ListMenu>
    </>
  );
}

function ToolSidebarRow({
  tool,
  active,
  policy,
  selectable,
  onSelect,
}: {
  tool: ToolMeta;
  active: boolean;
  policy: ToolPolicy | undefined;
  selectable: boolean;
  onSelect: () => void;
}) {
  return (
    <ListMenuItem
      active={active}
      role="button"
      tabIndex={0}
      aria-selected={active}
      aria-label={tool.label || tool.name}
      className={cn("px-2 py-2", selectable ? "pl-4" : "pl-6")}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      {...(selectable
        ? {
            itemKey: tool.name,
            checkboxLabel: `Select ${tool.label || tool.name}`,
          }
        : {})}
    >
      <div className="grid grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-2">
        {tool.icon ? (
          <Icon name={tool.icon} className="size-3.5 text-muted-foreground" />
        ) : (
          <Icon icon={UiWrench} className="size-3.5 text-muted-foreground" />
        )}
        <span className="min-w-0 truncate text-xs font-medium">
          {tool.label || tool.name}
        </span>
        <div className="flex items-center gap-1">
          <ToolHintIcons tool={tool} />
          {policy && (
            <span className="rounded bg-muted px-1 py-0.5 text-[9px] font-medium capitalize text-muted-foreground">
              {policy === "allow" ? "On" : policy === "deny" ? "Off" : policy}
            </span>
          )}
        </div>
      </div>
    </ListMenuItem>
  );
}

function ToolHintIcons({ tool }: { tool: ToolMeta }) {
  const hints = [
    [
      tool.annotations?.readOnlyHint,
      "Read only tool",
      UiEye,
      "text-emerald-600",
    ],
    [
      tool.annotations?.destructiveHint,
      "Destructive tool",
      UiWarningTriangle,
      "text-red-600",
    ],
    [
      tool.annotations?.idempotentHint,
      "Idempotent tool",
      UiRepeat,
      "text-sky-600",
    ],
    [
      tool.annotations?.openWorldHint,
      "Open world tool",
      UiGlobe,
      "text-violet-600",
    ],
  ] as const;
  return hints.flatMap(([enabled, label, icon, className]) =>
    enabled
      ? [
          <span key={label} role="img" aria-label={label} title={label}>
            <Icon icon={icon} className={cn("size-3", className)} />
          </span>,
        ]
      : [],
  );
}

function SelectionCheckbox({
  label,
  checked,
  mixed,
  onChange,
}: {
  label: string;
  checked: boolean;
  mixed: boolean;
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = mixed;
  }, [mixed]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      aria-label={label}
      onChange={onChange}
      className="ml-2 size-3.5 shrink-0 rounded border-input"
    />
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
