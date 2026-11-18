import type { GaugeTone } from "../../data/Gauge";
import { ProgressBar, type ProgressSegment } from "../../data/ProgressBar";
import { formatBytes } from "../../lib/format";
import { poolLimit, poolTone, sumPools } from "../model/memory";
import type { JvmMemoryPool, JvmMetrics } from "../protocol/types";

export type MemoryPoolsProps = {
  memory: JvmMetrics["memory"];
  className?: string;
};

const TONE_FILL: Record<GaugeTone, string> = {
  neutral: "bg-muted-foreground/40",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
};

function PoolBar({ pool }: { pool: JvmMemoryPool }) {
  const { limit, bounded } = poolLimit(pool);
  const segments: ProgressSegment[] = [
    { count: pool.used, color: TONE_FILL[poolTone(pool)], label: "used" },
    // Committed but unused memory, drawn only when it is smaller than the ceiling.
    { count: Math.max(0, pool.committed - pool.used), color: "bg-muted-foreground/25", label: "committed, unused" },
  ];
  return (
    <div className="space-y-1" data-pool={pool.name}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 text-xs">
        <span className="truncate font-medium">{pool.name}</span>
        <span className="tabular-nums text-muted-foreground">
          {formatBytes(pool.used)} / {formatBytes(limit)}
          {bounded ? "" : " committed · no max"}
        </span>
      </div>
      <ProgressBar segments={segments} total={limit} label={`${pool.name} memory`} formatValue={formatBytes} height="h-1.5" />
    </div>
  );
}

function PoolGroup({ title, pools }: { title: string; pools: JvmMemoryPool[] }) {
  const total = sumPools(pools);
  return (
    <section className="rounded-md border border-border p-density-3">
      <h3 className="mb-2 flex items-baseline justify-between text-sm font-medium">
        {title}
        <span className="text-xs font-normal tabular-nums text-muted-foreground">
          {formatBytes(total.used)} / {formatBytes(total.limit)}
        </span>
      </h3>
      {pools.length === 0 ? (
        <p className="text-xs text-muted-foreground">No pools reported.</p>
      ) : (
        <div className="space-y-2">
          {pools.map((pool) => (
            <PoolBar key={pool.name} pool={pool} />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Heap, non-heap and buffer pools as bars. A pool without a maximum (`max` of
 * -1) is drawn against its committed size and labelled "no max".
 */
export function MemoryPools({ memory, className }: MemoryPoolsProps) {
  return (
    <div className={className ?? "grid gap-3 md:grid-cols-2 xl:grid-cols-3"}>
      <PoolGroup title="Heap" pools={memory.heap} />
      <PoolGroup title="Non-heap" pools={memory.nonHeap} />
      <PoolGroup title="Buffers" pools={memory.buffer} />
    </div>
  );
}
