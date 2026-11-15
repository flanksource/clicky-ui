import type { GaugeTone } from "../../data/Gauge";
import type { JvmMemoryPool } from "../protocol/types";

/**
 * The size a pool's bar is drawn against: `max`, or `committed` when the pool
 * has no maximum (`max` is -1), in which case `bounded` is false so the UI can
 * say so.
 */
export function poolLimit(pool: JvmMemoryPool): { limit: number; bounded: boolean } {
  return pool.max > 0 ? { limit: pool.max, bounded: true } : { limit: pool.committed, bounded: false };
}

/** Green below 75% of the max, amber from 75%, red from 90%. A pool without a max has no ceiling to judge against. */
export function poolTone(pool: JvmMemoryPool): GaugeTone {
  const { limit, bounded } = poolLimit(pool);
  if (limit === 0) return "neutral";
  if (!bounded) return "info";
  const ratio = pool.used / limit;
  if (ratio >= 0.9) return "danger";
  if (ratio >= 0.75) return "warning";
  return "success";
}

export function sumPools(pools: readonly JvmMemoryPool[]): { used: number; limit: number } {
  return pools.reduce((total, pool) => ({ used: total.used + pool.used, limit: total.limit + poolLimit(pool).limit }), { used: 0, limit: 0 });
}

export function capturedAtMs(capturedAt: string): number {
  const ms = Date.parse(capturedAt);
  if (Number.isNaN(ms)) throw new Error(`JvmMetrics.capturedAt is not a timestamp: ${JSON.stringify(capturedAt)}`);
  return ms;
}
