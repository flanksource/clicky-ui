export interface ProgressBarFill {
  /** Fraction of this bar that is in use, in [0, 1]. */
  fill: number;
}

export interface ProgressBarsModel {
  /** Whether a usage reading was available. */
  hasUsage: boolean;
  /** Usage expressed in bar-units (raw / perBar). */
  usageUnits: number;
  /** Capacity in bar-units; undefined when no limit was resolved. */
  limitUnits?: number;
  /** Number of bars rendered (one per bar-unit of capacity). */
  barCount: number;
  /** Utilisation percentage of capacity; 0 when unbounded. */
  pct: number;
  /** Per-bar fill fractions, left to right. */
  bars: ProgressBarFill[];
}

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

// deriveProgressBars turns the latest usage/limit readings into a per-bar model: one
// bar per unit of capacity (ceil of the limit), filled left to right by usage so
// the bar straddling the usage boundary is partially filled and the remainder
// stays empty. When the limit is missing or 0 the bar count falls back to the
// ceiling of the usage so an unbounded reading still renders sensibly. `perBar`
// is the raw value that fills one bar (default 1000 = millicores per core); pass
// e.g. 1 GiB to render one bar per gigabyte of memory.
export function deriveProgressBars(
  usage: number | undefined,
  limit: number | undefined,
  perBar = 1000,
): ProgressBarsModel {
  const hasUsage = usage !== undefined;
  const usageUnits = (usage ?? 0) / perBar;
  const hasLimit = limit !== undefined && limit > 0;
  const limitUnits = hasLimit ? (limit as number) / perBar : undefined;

  const barCount = Math.max(
    1,
    Math.ceil(hasLimit ? (limitUnits as number) : usageUnits),
  );
  const pct = hasLimit
    ? Math.min(100, Math.round((usageUnits / (limitUnits as number)) * 100))
    : 0;

  const bars: ProgressBarFill[] = Array.from({ length: barCount }, (_, i) => ({
    fill: clamp01(usageUnits - i),
  }));

  return {
    hasUsage,
    usageUnits,
    barCount,
    pct,
    bars,
    ...(limitUnits !== undefined && { limitUnits }),
  };
}
