import { MetricTile } from "../../data/diagnostics/MetricTile";
import { cpuTone, memoryTone } from "../../data/diagnostics/metric-tone";
import { formatBytes } from "../../lib/format";
import { sumPools } from "../model/memory";
import type { JvmMetrics } from "../protocol/types";

export type ProcessTilesProps = {
  metrics: Pick<JvmMetrics, "processCpuPercent" | "runtime" | "memory">;
  className?: string;
};

const pct = (used: number, limit: number) => (limit > 0 ? Math.min(100, (used / limit) * 100) : 0);

/** Process CPU, load against processors, and heap and non-heap use. */
export function ProcessTiles({ metrics, className }: ProcessTilesProps) {
  const { processCpuPercent, runtime, memory } = metrics;
  const heap = sumPools(memory.heap);
  const nonHeap = sumPools(memory.nonHeap);
  const loadPct = pct(runtime.systemLoadAverage, runtime.processors);
  return (
    <div className={className ?? "grid grid-cols-2 gap-2 md:grid-cols-4"}>
      {processCpuPercent === null ? (
        <MetricTile label="Process CPU" value="Unavailable" />
      ) : (
        <MetricTile label="Process CPU" value={`${processCpuPercent.toFixed(1)}%`} barPct={Math.min(100, processCpuPercent)} tone={cpuTone(processCpuPercent)} />
      )}
      {runtime.systemLoadAverage < 0 ? (
        <MetricTile label="Load average" value="Unavailable" />
      ) : (
        <MetricTile label="Load average" value={`${runtime.systemLoadAverage.toFixed(2)} / ${runtime.processors} cores`} barPct={loadPct} tone={cpuTone(loadPct)} />
      )}
      <MetricTile label="Heap" value={`${formatBytes(heap.used)} / ${formatBytes(heap.limit)}`} barPct={pct(heap.used, heap.limit)} tone={memoryTone(heap.used, heap.limit)} />
      <MetricTile label="Non-heap" value={`${formatBytes(nonHeap.used)} / ${formatBytes(nonHeap.limit)}`} barPct={pct(nonHeap.used, nonHeap.limit)} tone={memoryTone(nonHeap.used, nonHeap.limit)} />
    </div>
  );
}
