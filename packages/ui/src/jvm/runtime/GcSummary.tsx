import { MetricTile } from "../../data/diagnostics/MetricTile";
import { formatDuration } from "../../lib/format";
import type { JvmGarbageCollector } from "../protocol/types";

export type GcSummaryProps = {
  collectors: JvmGarbageCollector[];
  className?: string;
};

/** One tile per collector: collection count and accumulated pause time since JVM start. */
export function GcSummary({ collectors, className }: GcSummaryProps) {
  if (collectors.length === 0) return <p className="text-xs text-muted-foreground">No garbage collectors reported.</p>;
  return (
    <div className={className ?? "grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-2"}>
      {collectors.map((collector) => (
        <MetricTile key={collector.name} label={collector.name} value={`${collector.collectionCount} · ${formatDuration(collector.collectionTime)}`} />
      ))}
    </div>
  );
}
