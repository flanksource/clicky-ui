import type { FileFinding, LintSeverity } from "./types";

/** Severities worst first, the order counts are shown in. */
export const FINDING_SEVERITIES: readonly LintSeverity[] = ["error", "warning", "info"];

export function countFindingsBySeverity(findings: readonly FileFinding[]): Record<LintSeverity, number> {
  const counts: Record<LintSeverity, number> = { error: 0, warning: 0, info: 0 };
  for (const finding of findings) counts[finding.severity] += 1;
  return counts;
}
