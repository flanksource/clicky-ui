import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { UiChevronDown } from "../../icons";
import { DropdownMenu } from "../../overlay/DropdownMenu";
import { FilterBarContext } from "../../components/filter-bar-context";
import { MultiFilterPanel } from "../../components/filter-bar-multi";
import { summarizeMultiFilter } from "../../components/filter-bar-field-utils";
import type { MultiSelectOption } from "../../components/MultiSelect";
import { OutcomeIcon, ToolIcon } from "./MarkIcons";
import { toolMark } from "./marks";
import { STATUS_LABELS, type StatusCounts, type TestOutcome } from "./status";
import type { FilterMode, FilterState, TestFilters } from "./filterState";

export type TestFilterBarProps = {
  filters: TestFilters;
  onChange: (next: TestFilters) => void;
  counts: StatusCounts;
  frameworks: string[];
  className?: string;
};

// Picks commit straight away: the runner, not a form, owns the filter state.
const COMMIT_IMMEDIATELY = { autoSubmit: false, compact: false };

function Facet({
  label,
  options,
  state,
  onChange,
}: {
  label: string;
  options: MultiSelectOption[];
  state: FilterState<string>;
  onChange: (next: FilterState<string>) => void;
}) {
  const value: Record<string, FilterMode> = Object.fromEntries(state);
  const active = state.size > 0;
  return (
    <DropdownMenu
      align="right"
      menuLabel={label}
      menuClassName="p-2"
      trigger={
        <span
          role="button"
          tabIndex={0}
          className={cn(
            "inline-flex h-6 items-center gap-0.5 rounded px-1.5 text-xs transition-colors",
            active
              ? "bg-muted font-medium text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          )}
        >
          {summarizeMultiFilter(label, value)}
          <Icon icon={UiChevronDown} className="text-[10px] opacity-60" />
        </span>
      }
    >
      {() => (
        <FilterBarContext.Provider value={COMMIT_IMMEDIATELY}>
          <MultiFilterPanel
            chrome="embedded"
            filter={{
              key: label,
              kind: "multi",
              label,
              options,
              value,
              onChange: (v) => onChange(new Map(Object.entries(v))),
            }}
          />
        </FilterBarContext.Provider>
      )}
    </DropdownMenu>
  );
}

/**
 * Status and tool facets as compact, muted menu triggers sized for the tree
 * toolbar; each opens a tri-state (include / exclude) option list. Named
 * TestFilterBar to avoid the generic `FilterBar` export in clicky-ui/components.
 */
export function TestFilterBar({
  filters,
  onChange,
  counts,
  frameworks,
  className,
}: TestFilterBarProps) {
  const statusOptions: MultiSelectOption[] = STATUS_LABELS.filter((d) => counts[d.key] > 0).map(
    (d) => ({
      value: d.key,
      label: d.label,
      icon: <OutcomeIcon outcome={d.key as TestOutcome} />,
      count: counts[d.key],
    }),
  );
  const toolOptions: MultiSelectOption[] = frameworks.map((fw) => ({
    value: fw,
    label: toolMark(fw)?.label ?? fw,
    title: fw,
    icon: <ToolIcon tool={fw} />,
  }));

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <Facet
        label="Status"
        options={statusOptions}
        state={filters.status}
        onChange={(status) => onChange({ ...filters, status })}
      />
      {frameworks.length > 1 && (
        <Facet
          label="Tool"
          options={toolOptions}
          state={filters.framework}
          onChange={(framework) => onChange({ ...filters, framework })}
        />
      )}
    </div>
  );
}
