import { cn } from "../../lib/utils";
import type { MultiSelectOption } from "../../components/MultiSelect";
import { ProblemFacet } from "../diagnostics/ProblemFacet";
import { ProblemViewOptions } from "../diagnostics/ProblemViewOptions";
import { LINT_GROUPING_OPTIONS } from "./grouping-options";
import { LINT_SEVERITIES, toolMark } from "../test-runner/marks";
import { LintSeverityIcon, ToolIcon } from "../test-runner/MarkIcons";
import { collectLintLinters, countLintByLinter, countLintBySeverity } from "./stats";
import type { LintFilters, LintGrouping, LintSeverity, LinterResult } from "./types";

type GroupingProps = {
  grouping: LintGrouping;
  onGroupingChange: (next: LintGrouping) => void;
};

type FacetProps = {
  results: readonly LinterResult[];
  filters: LintFilters;
  onFiltersChange: (next: LintFilters) => void;
};

export type LintFilterBarProps = GroupingProps & FacetProps & { className?: string };

const SEVERITY_ORDER: readonly LintSeverity[] = ["error", "warning", "info"];

/** One pill per lint grouping; the active one is highlighted. */
export function LintGroupingPicker({ grouping, onGroupingChange, className }: GroupingProps & { className?: string }) {
  return (
    <div role="group" aria-label="Group by" className={cn("space-y-1", className)}>
      {LINT_GROUPING_OPTIONS.map((opt) => (
        <button type="button"
          key={opt.key}
          aria-pressed={opt.key === grouping}
          className={cn("block w-full rounded px-2 py-1 text-left text-xs hover:bg-muted", opt.key === grouping && "bg-muted font-medium")}
          title={`Group by ${opt.label}`}
          onClick={() => onGroupingChange(opt.key)}
        >{opt.label}</button>
      ))}
    </div>
  );
}

/**
 * Severity and linter facets: compact triggers that each open a multi-select
 * with icons where every option is included, excluded or left neutral. Counts
 * follow the other facet, so each option shows what picking it would leave. A
 * severity nobody reported is offered only while a severity filter is active.
 */
export function LintFilterFacets({ results, filters, onFiltersChange, className }: FacetProps & { className?: string }) {
  const severityCounts = countLintBySeverity(results, filters.linter);
  const linterCounts = countLintByLinter(results, filters.severity);
  const linters = [...new Set([...collectLintLinters(results), ...filters.linter.keys()])];
  const hasActive = filters.severity.size > 0 || filters.linter.size > 0;

  const severityOptions: MultiSelectOption[] = SEVERITY_ORDER.filter(
    (s) => severityCounts[s] > 0 || filters.severity.size > 0,
  ).map((s) => ({
    value: s,
    label: LINT_SEVERITIES[s].label,
    icon: <LintSeverityIcon severity={s} />,
    count: severityCounts[s],
  }));
  const linterOptions: MultiSelectOption[] = linters.map((linter) => ({
    value: linter,
    label: toolMark(linter)?.label ?? linter,
    title: linter,
    icon: <ToolIcon tool={linter} />,
    count: linterCounts[linter] ?? 0,
  }));

  return (
    <div className={cn("space-y-3", className)} data-lint-filter-facets="">
      <ProblemFacet
        label="Severity"
        options={severityOptions}
        state={filters.severity}
        onChange={(severity) => onFiltersChange({ ...filters, severity: severity as LintFilters["severity"] })}
      />
      {(linters.length > 1 || filters.linter.size > 0) && (
        <ProblemFacet
          label="Linter"
          options={linterOptions}
          state={filters.linter}
          onChange={(linter) => onFiltersChange({ ...filters, linter })}
        />
      )}
      {hasActive && (
        <button
          type="button"
          className="ml-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => onFiltersChange({ severity: new Map(), linter: new Map() })}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

/**
 * Grouping picker plus severity and linter facets for the lint tree.
 * Controlled: the host owns grouping and filters (typically in the URL).
 */
export function LintFilterBar({ className, ...props }: LintFilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)} data-lint-filter-bar="">
      <ProblemViewOptions active={props.filters.severity.size + props.filters.linter.size}>
        <LintGroupingPicker grouping={props.grouping} onGroupingChange={props.onGroupingChange} />
        <LintFilterFacets results={props.results} filters={props.filters} onFiltersChange={props.onFiltersChange} />
      </ProblemViewOptions>
    </div>
  );
}
