import { LintSeverityIcon } from "../data/test-runner/MarkIcons";
import { cn } from "../lib/utils";
import { countFindingsBySeverity, FINDING_SEVERITIES } from "./severity-counts";
import type { FileFinding, LintSeverity } from "./types";

export type FindingsSummaryChipsProps = {
  findings: readonly FileFinding[];
  /** Called with a chip's severity when it is clicked; without it the chips are static. */
  onSelect?: ((severity: LintSeverity) => void) | undefined;
  className?: string | undefined;
};

/** One count chip per severity — error, warning, info — for a set of findings. */
export function FindingsSummaryChips({ findings, onSelect, className }: FindingsSummaryChipsProps) {
  const counts = countFindingsBySeverity(findings);
  return (
    <span className={cn("inline-flex items-center gap-1", className)} data-findings-summary="">
      {FINDING_SEVERITIES.map((severity) => (
        <button
          key={severity}
          type="button"
          disabled={!onSelect || counts[severity] === 0}
          onClick={() => onSelect?.(severity)}
          title={`${counts[severity]} ${severity}`}
          aria-label={`${counts[severity]} ${severity}`}
          data-severity={severity}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs tabular-nums",
            counts[severity] === 0 ? "text-muted-foreground opacity-60" : "text-foreground",
            onSelect && counts[severity] > 0 && "hover:bg-muted",
          )}
        >
          <LintSeverityIcon severity={severity} />
          {counts[severity]}
        </button>
      ))}
    </span>
  );
}
