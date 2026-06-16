import type { MergedRow, ResolvedSeries } from "./TimeseriesPanel.model";

export type AxisOrientation = "left" | "right";

/** A rendered Y-axis: its recharts id (== orientation) and the unit it formats with. */
export interface AxisSpec {
  id: AxisOrientation;
  orientation: AxisOrientation;
  /** Unit the axis ticks format with; undefined for a unitless axis. */
  unit?: string;
}

export interface AxisAssignment {
  /** 1 or 2 axes in render order (left first). */
  axes: AxisSpec[];
  /** Maps each series.key to the axis it draws against. */
  axisOfKey: Map<string, AxisOrientation>;
}

/** Sentinel grouping unitless series; never surfaced as an AxisSpec.unit. */
const NO_UNIT = "\u0000__noUnit";

/**
 * Assigns series to one or two Y-axes by distinct unit, in first-seen order:
 * the first distinct unit takes the left axis, the second takes the right.
 * A third-or-later distinct unit shares the right axis (its series still plot,
 * but the right ticks read in the second unit's scale — a known approximation;
 * true N-axis support is out of scope). A single distinct unit yields one left
 * axis only. Undefined units form their own bucket so unitless series still get
 * an axis (recharts drops any series whose yAxisId is missing). Pure.
 */
export function assignAxes(series: ResolvedSeries[]): AxisAssignment {
  const order: string[] = [];
  const seen = new Set<string>();
  for (const s of series) {
    const u = s.unit ?? NO_UNIT;
    if (!seen.has(u)) {
      seen.add(u);
      order.push(u);
    }
  }

  const unitToAxis = new Map<string, AxisOrientation>();
  const axes: AxisSpec[] = [];
  order.forEach((u, i) => {
    const orientation: AxisOrientation = i === 0 ? "left" : "right";
    unitToAxis.set(u, orientation);
    if (i <= 1) {
      axes.push({ id: orientation, orientation, ...(u !== NO_UNIT ? { unit: u } : {}) });
    }
  });

  const axisOfKey = new Map<string, AxisOrientation>();
  for (const s of series) {
    axisOfKey.set(s.key, unitToAxis.get(s.unit ?? NO_UNIT) ?? "left");
  }

  return { axes, axisOfKey };
}

/** Last numeric value for a series key, scanning from newest row; undefined if none. Pure. */
export function latestOf(rows: MergedRow[], key: string): number | undefined {
  for (let i = rows.length - 1; i >= 0; i--) {
    const v = rows[i]?.[key];
    if (typeof v === "number") return v;
  }
  return undefined;
}
