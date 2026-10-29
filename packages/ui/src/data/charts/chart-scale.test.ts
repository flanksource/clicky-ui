import { describe, expect, it } from "vitest";
import { clampLabelX, foldTail, formatChartX, labelStep, niceTicks, truncateLabel } from "./chart-scale";

describe("niceTicks", () => {
  it.each([
    [0, 120, [0, 50, 100, 150]],
    [0, 1, [0, 0.2, 0.4, 0.6, 0.8, 1]],
    [0, 8, [0, 2, 4, 6, 8]],
    [-30, 45, [-40, -20, 0, 20, 40, 60]],
  ])("ticks %s..%s as %j", (min, max, expected) => {
    expect(niceTicks(min, max)).toEqual(expected);
  });

  it("widens a flat range so the axis still has a span", () => {
    expect(niceTicks(0, 0)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
  });
});

describe("foldTail", () => {
  const ROWS = [
    { label: "a", value: 50 },
    { label: "b", value: 40 },
    { label: "c", value: 30 },
    { label: "d", value: 20 },
    { label: "e", value: 10 },
  ];

  it("keeps maxBars-1 rows and sums the rest into Other", () => {
    expect(foldTail(ROWS, 3)).toEqual([
      { label: "a", value: 50 },
      { label: "b", value: 40 },
      { label: "Other", value: 60, folded: 3 },
    ]);
  });

  it("leaves data that already fits untouched", () => {
    expect(foldTail(ROWS, 5)).toEqual(ROWS);
    expect(foldTail(ROWS, undefined)).toEqual(ROWS);
  });

  it.each([0, 1, 2.5])("rejects maxBars=%s", (maxBars) => {
    expect(() => foldTail(ROWS, maxBars)).toThrow(/maxBars/);
  });
});

describe("labelStep", () => {
  it("shows every label when each fits its slot", () => {
    expect(labelStep(["a", "b", "c"], 40)).toBe(1);
  });

  it("skips enough slots that the widest label never overlaps its neighbour", () => {
    const labels = Array.from({ length: 30 }, (_, i) => `category-${i}`);
    const step = labelStep(labels, 10);
    expect(step).toBeGreaterThan(1);
    expect(step * 10).toBeGreaterThanOrEqual(11 * 5);
  });
});

describe("clampLabelX", () => {
  // "abcd" at the 11px font is 4 × 6.6 = 26.4px wide, so its centre must stay 13.2px from either edge.
  it.each([
    [50, 50],
    [2, 13.2],
    [99, 86.8],
  ])("keeps a label centred at %s inside a 100px chart (at %s)", (center, expected) => {
    expect(clampLabelX(center, "abcd", 100)).toBeCloseTo(expected, 2);
  });
});

describe("truncateLabel", () => {
  it("keeps a label that fits", () => {
    expect(truncateLabel("s3", 100)).toBe("s3");
  });

  it("ends a clipped label with an ellipsis", () => {
    const clipped = truncateLabel("a-very-long-service-name", 40);
    expect(clipped.endsWith("…")).toBe(true);
    expect(clipped.length).toBeLessThan("a-very-long-service-name".length);
  });
});

describe("formatChartX", () => {
  it.each([
    ["2026-08-16", "Aug 16"],
    ["2026-01-02T10:00:00Z", "Jan 2"],
    ["week 3", "week 3"],
  ])("formats %s as %s", (input, expected) => {
    expect(formatChartX(input)).toBe(expected);
  });
});
