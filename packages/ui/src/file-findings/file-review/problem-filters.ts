import { matchesFilterState, type FilterState } from "../../data/test-runner/filterState";
import type { FileFinding, LintSeverity } from "../types";

/** Controlled include/exclude/neutral filters, persisted by the host. */
export type ProblemFilters = {
  severity: FilterState<LintSeverity>;
  type: FilterState<string>;
};
export function emptyProblemFilters(): ProblemFilters {
  return { severity: new Map(), type: new Map() };
}
export function problemType(finding: FileFinding): string {
  return finding.rule || finding.source;
}
/** Whether a finding passes the Problems severity and issue-type filters. */
export function matchesProblemFilters(finding: FileFinding, filters: ProblemFilters): boolean {
  return matchesFilterState(finding.severity, filters.severity) && matchesFilterState(problemType(finding), filters.type);
}
