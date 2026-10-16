import { cn } from "../../lib/utils";
import { FilterPill } from "../FilterPill";
import { LINT_GROUPING_OPTIONS } from "./grouping-options";
import { cycleFilterState, type FilterMode } from "../test-runner/filterState";
import { LINT_SEVERITIES, toolMark } from "../test-runner/marks";
import { LintSeverityIcon, ToolIcon } from "../test-runner/MarkIcons";
import { formatCount } from "../test-runner/status";
import { collectLintLinters, countLintByLinter, countLintBySeverity } from "./stats";
import type { LintFilters, LintGrouping, LintSeverity, LinterResult } from "./types";

export type LintFilterBarProps = {
  results: readonly LinterResult[];
  grouping: LintGrouping;
  onGroupingChange: (next: LintGrouping) => void;
  filters: LintFilters;
  onFiltersChange: (next: LintFilters) => void;
  className?: string;
};

const SEVERITY_ORDER: readonly LintSeverity[] = ["error", "warning", "info"];

const SEVERITY_BADGE: Record<LintSeverity, string> = {
  error: "bg-red-600",
  warning: "bg-amber-600",
  info: "bg-sky-600",
};

function triStateTitle(label: string, mode: FilterMode | undefined): string {
  if (mode === "include") return `${label}: included. Click to exclude`;
  if (mode === "exclude") return `${label}: excluded. Click to clear`;
  return `${label}: neutral. Click to include`;
}

/**
 * Grouping picker plus tri-state severity and linter filters for the lint
 * tree. Controlled: the host owns grouping and filters (typically in the URL).
 * Counts follow the other filter, so each pill shows what picking it would leave.
 */
export function LintFilterBar({
  results,
  grouping,
  onGroupingChange,
  filters,
  onFiltersChange,
  className,
}: LintFilterBarProps) {
  const severityCounts = countLintBySeverity(results, filters.linter);
  const linterCounts = countLintByLinter(results, filters.severity);
  const linters = collectLintLinters(results);
  const hasActive = filters.severity.size > 0 || filters.linter.size > 0;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)} data-lint-filter-bar="">
      <div role="group" aria-label="Group by" className="flex flex-wrap items-center gap-1.5">
        {LINT_GROUPING_OPTIONS.map((opt) => (
          <FilterPill
            key={opt.key}
            mode={opt.key === grouping ? "active" : "neutral"}
            label={opt.label}
            icon={opt.icon}
            title={`Group by ${opt.label}`}
            onClick={() => onGroupingChange(opt.key)}
          />
        ))}
      </div>

      <span className="mx-0.5 text-border" aria-hidden>
        |
      </span>

      {SEVERITY_ORDER.map((severity) => {
        const count = severityCounts[severity];
        if (count === 0 && filters.severity.size === 0) return null;
        const mode = filters.severity.get(severity);
        const label = LINT_SEVERITIES[severity].label;
        return (
          <FilterPill
            key={severity}
            mode={mode ?? "neutral"}
            count={count}
            badge={SEVERITY_BADGE[severity]}
            label={
              <span className="inline-flex items-center gap-1">
                <LintSeverityIcon severity={severity} />
                {label}
              </span>
            }
            title={triStateTitle(label, mode)}
            onClick={() =>
              onFiltersChange({ ...filters, severity: cycleFilterState(filters.severity, severity) })
            }
          />
        );
      })}

      {linters.length > 1 && (
        <>
          <span className="mx-0.5 text-border" aria-hidden>
            |
          </span>
          {linters.map((linter) => {
            const mode = filters.linter.get(linter);
            const name = toolMark(linter)?.label ?? linter;
            return (
              <FilterPill
                key={linter}
                mode={mode ?? "neutral"}
                label={
                  <span className="inline-flex items-center gap-1">
                    <ToolIcon tool={linter} />
                    {name}
                    <span className="text-[10px] tabular-nums opacity-70" title={String(linterCounts[linter] ?? 0)}>
                      {formatCount(linterCounts[linter] ?? 0)}
                    </span>
                  </span>
                }
                title={triStateTitle(linter, mode)}
                onClick={() =>
                  onFiltersChange({ ...filters, linter: cycleFilterState(filters.linter, linter) })
                }
              />
            );
          })}
        </>
      )}

      {hasActive && (
        <button
          type="button"
          className="ml-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => onFiltersChange({ severity: new Map(), linter: new Map() })}
        >
          Clear
        </button>
      )}
    </div>
  );
}
