// Counting and severity roll-ups over raw results and over built tree nodes.

import { matchesFilterState, type FilterState } from "../test-runner/filterState";
import type { LintNode, LintSeverity, LinterResult, Violation } from "./types";

const SEVERITY_RANK: Record<LintSeverity, number> = { info: 1, warning: 2, error: 3 };

/** A violation without a severity is an error, as on the wire. */
export function severityOf(violation: Violation): LintSeverity {
  return violation.severity ?? "error";
}

export function worstSeverity(violations: readonly Violation[] | undefined): LintSeverity {
  let worst: LintSeverity = "info";
  for (const v of violations ?? []) {
    const sev = severityOf(v);
    if (SEVERITY_RANK[sev] > SEVERITY_RANK[worst]) worst = sev;
  }
  return worst;
}

/** Whether the linter itself failed to run (as opposed to reporting findings). */
export function isLinterErrored(result: LinterResult): boolean {
  return !result.skipped && (Boolean(result.error) || Boolean(result.timed_out));
}

/** Why a linter failed: its error text, or "timed out" when it only carries the flag. */
export function linterErrorMessage(result: LinterResult): string {
  return result.error || "timed out";
}

/** Linters that reported violations or failed to run, sorted by name. */
export function collectLintLinters(results: readonly LinterResult[]): string[] {
  const names = new Set<string>();
  for (const r of results) {
    if ((r.violations ?? []).length > 0 || isLinterErrored(r)) names.add(r.linter);
  }
  return Array.from(names).sort();
}

export function countLintBySeverity(
  results: readonly LinterResult[],
  linterFilter: FilterState<string>,
): Record<LintSeverity, number> {
  const counts: Record<LintSeverity, number> = { error: 0, warning: 0, info: 0 };
  for (const r of results) {
    if (!matchesFilterState(r.linter, linterFilter)) continue;
    for (const v of r.violations ?? []) counts[severityOf(v)] += 1;
  }
  return counts;
}

export function countLintByLinter(
  results: readonly LinterResult[],
  severityFilter: FilterState<LintSeverity>,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of results) {
    for (const v of r.violations ?? []) {
      if (!matchesFilterState(severityOf(v), severityFilter)) continue;
      counts[r.linter] = (counts[r.linter] ?? 0) + 1;
    }
  }
  return counts;
}

export function totalLintViolations(results: readonly LinterResult[]): number {
  return results.reduce((n, r) => n + (r.violations ?? []).length, 0);
}

/** Violations at or beneath a node; error leaves count as zero (they are not findings). */
export function lintNodeCount(node: LintNode): number {
  if (node.violations) return node.violations.length;
  return (
    (node.noFileViolations?.length ?? 0) +
    (node.children ?? []).reduce((n, child) => n + lintNodeCount(child), 0)
  );
}

/** The worst severity at or beneath a node. A linter-error leaf is an error. */
export function lintNodeSeverity(node: LintNode): LintSeverity {
  if (node.kind === "linter-error") return "error";
  let worst: LintSeverity = "info";
  const consider = (sev: LintSeverity) => {
    if (SEVERITY_RANK[sev] > SEVERITY_RANK[worst]) worst = sev;
  };
  if (node.violations) consider(worstSeverity(node.violations));
  if (node.noFileViolations) consider(worstSeverity(node.noFileViolations));
  for (const child of node.children ?? []) consider(lintNodeSeverity(child));
  return worst;
}
