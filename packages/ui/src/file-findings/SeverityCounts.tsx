import { LintSeverityIcon } from "../data/test-runner/MarkIcons";
import { countFindingsBySeverity, FINDING_SEVERITIES } from "./severity-counts";
import type { FileFinding } from "./types";

/** One icon and count per severity present in `findings`, worst first. */
export function SeverityCounts({ findings }: { findings: readonly FileFinding[] }) {
  const counts = countFindingsBySeverity(findings);
  return (
    <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
      {FINDING_SEVERITIES.filter((s) => counts[s] > 0).map((s) => (
        <span key={s} className="inline-flex items-center gap-0.5" title={`${counts[s]} ${s}`}>
          <LintSeverityIcon severity={s} />
          <span className="tabular-nums">{counts[s]}</span>
        </span>
      ))}
    </span>
  );
}
