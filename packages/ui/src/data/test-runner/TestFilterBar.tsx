import { cn } from "../../lib/utils";
import type { MultiSelectOption } from "../../components/MultiSelect";
import { FilterFacet as Facet } from "./FilterFacet";
import { OutcomeIcon, ToolIcon } from "./MarkIcons";
import { toolMark } from "./marks";
import { STATUS_LABELS, type StatusCounts, type TestOutcome } from "./status";
import type { TestFilters } from "./filterState";

export type TestFilterBarProps = {
  filters: TestFilters;
  onChange: (next: TestFilters) => void;
  counts: StatusCounts;
  frameworks: string[];
  className?: string;
};


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
