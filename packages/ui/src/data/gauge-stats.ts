import type { TimeseriesPoint } from "./TimeseriesPanel.model";

export interface SeriesStats {
  /** The most recent point's value. */
  current: number;
  /** Smallest value over the window. */
  min: number;
  /** Largest value over the window. */
  max: number;
  /** Mean value over the window. */
  avg: number;
  /** Number of points reduced. */
  count: number;
}

// seriesStats reduces a metric's points to current/min/max/avg, applying an
// optional transform (e.g. unit scaling) to each raw value first. Returns null
// for an empty or absent series so callers can skip rendering the stat rows.
export function seriesStats(
  points: TimeseriesPoint[] | undefined,
  transform?: (value: number) => number,
): SeriesStats | null {
  if (!points || points.length === 0) return null;
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let current = 0;
  for (const p of points) {
    const v = transform ? transform(p.value) : p.value;
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
    current = v;
  }
  return { current, min, max, avg: sum / points.length, count: points.length };
}
