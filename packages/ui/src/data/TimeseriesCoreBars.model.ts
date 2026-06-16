export interface CoreBar {
  /** Fraction of this core that is in use, in [0, 1]. */
  fill: number;
}

export interface CoreBarsModel {
  /** Whether a usage reading was available. */
  hasUsage: boolean;
  /** Usage expressed in cores (millicores / 1000). */
  usageCores: number;
  /** Capacity in cores; undefined when no limit was resolved. */
  limitCores?: number;
  /** Number of bars rendered (one per core). */
  coreCount: number;
  /** Utilisation percentage of capacity; 0 when unbounded. */
  pct: number;
  /** Per-core fill fractions, left to right. */
  bars: CoreBar[];
}

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

// deriveCoreBars turns the latest usage/limit millicore readings into a per-core
// bar model: one bar per core (ceil of the limit), filled left to right by usage
// so the bar straddling the usage boundary is partially filled and the remainder
// stays empty. When the limit is missing or 0 the bar count falls back to the
// ceiling of the usage so an unbounded reading still renders sensibly.
export function deriveCoreBars(
  usageMilli: number | undefined,
  limitMilli: number | undefined,
): CoreBarsModel {
  const hasUsage = usageMilli !== undefined;
  const usageCores = (usageMilli ?? 0) / 1000;
  const hasLimit = limitMilli !== undefined && limitMilli > 0;
  const limitCores = hasLimit ? (limitMilli as number) / 1000 : undefined;

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
