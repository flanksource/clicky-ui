export interface CoreBar {
  /** Fraction of this core that is in use, in [0, 1]. */
  fill: number;
}

export interface CoreBarsModel {
  /** Whether a usage reading was available. */
  hasUsage: boolean;
  /** Usage expressed in bar-units (raw / perBar). */
  usageCores: number;
  /** Capacity in bar-units; undefined when no limit was resolved. */
  limitCores?: number;
  /** Number of bars rendered (one per bar-unit of capacity). */
  coreCount: number;
  /** Utilisation percentage of capacity; 0 when unbounded. */
  pct: number;
  /** Per-core fill fractions, left to right. */
  bars: CoreBar[];
}

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

// deriveCoreBars turns the latest usage/limit readings into a per-bar model: one
// bar per unit of capacity (ceil of the limit), filled left to right by usage so
// the bar straddling the usage boundary is partially filled and the remainder
// stays empty. When the limit is missing or 0 the bar count falls back to the
// ceiling of the usage so an unbounded reading still renders sensibly. `perBar`
// is the raw value that fills one bar (default 1000 = millicores per core); pass
// e.g. 1 GiB to render one bar per gigabyte of memory.
export function deriveCoreBars(
  usage: number | undefined,
  limit: number | undefined,
  perBar = 1000,
): CoreBarsModel {
  const hasUsage = usage !== undefined;
  const usageCores = (usage ?? 0) / perBar;
  const hasLimit = limit !== undefined && limit > 0;
  const limitCores = hasLimit ? (limit as number) / perBar : undefined;

  const coreCount = Math.max(
    1,
    Math.ceil(hasLimit ? (limitCores as number) : usageCores),
  );
  const pct = hasLimit
    ? Math.min(100, Math.round((usageCores / (limitCores as number)) * 100))
    : 0;

  const bars: CoreBar[] = Array.from({ length: coreCount }, (_, i) => ({
    fill: clamp01(usageCores - i),
  }));

  return {
    hasUsage,
    usageCores,
    coreCount,
    pct,
    bars,
    ...(limitCores !== undefined && { limitCores }),
  };
}
