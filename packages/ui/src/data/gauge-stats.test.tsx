import { describe, expect, it } from "vitest";
import { seriesStats } from "./gauge-stats";
import type { TimeseriesPoint } from "./TimeseriesPanel.model";

const pts = (values: number[]): TimeseriesPoint[] =>
  values.map((value, i) => ({ at: `t${i}`, value }));

describe("seriesStats", () => {
  it("returns null for an empty or absent series", () => {
    expect(seriesStats(undefined)).toBeNull();
    expect(seriesStats([])).toBeNull();
  });

  it("computes current/min/max/avg over the window", () => {
    expect(seriesStats(pts([2, 8, 4, 6]))).toEqual({
      current: 6,
      min: 2,
      max: 8,
      avg: 5,
      count: 4,
    });
  });

  it("applies the transform to each value before reducing", () => {
    expect(seriesStats(pts([1, 2, 3]), (v) => v * 1000)).toEqual({
      current: 3000,
      min: 1000,
      max: 3000,
      avg: 2000,
      count: 3,
    });
  });
});
