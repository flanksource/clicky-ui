import { Badge } from "../../data/Badge";
import type { PatchSummary } from "../model/patches";

export type RegisterSummaryProps = {
  summary: PatchSummary;
};

/** "N classes patched" with a badge for each row state that needs attention. */
export function RegisterSummary({ summary }: RegisterSummaryProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-medium">
        {summary.patched} {summary.patched === 1 ? "class" : "classes"} patched
      </span>
      {summary.unleased > 0 ? (
        <Badge tone="warning" size="sm">
          {summary.unleased} without a lease
        </Badge>
      ) : null}
      {summary.stale > 0 ? (
        <Badge tone="neutral" size="sm">
          {summary.stale} stale
        </Badge>
      ) : null}
    </div>
  );
}
