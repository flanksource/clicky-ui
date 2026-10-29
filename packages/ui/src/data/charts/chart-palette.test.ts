import { describe, expect, it } from "vitest";
import { CHART_PALETTE, chartColor } from "./chart-palette";

const EXPECTED_HEXES = ["#0284c7", "#d97706", "#e11d48", "#7c3aed", "#059669", "#6366f1", "#0d9488"];

describe("chartColor", () => {
  it("keeps the validated categorical order", () => {
    expect(CHART_PALETTE.map((slot) => slot.hex)).toEqual(EXPECTED_HEXES);
  });

  it.each(EXPECTED_HEXES.map((hex, index) => [index, `var(--chart-${index + 1}, ${hex})`]))(
    "maps slot %i to its token with a hex fallback",
    (index, expected) => {
      expect(chartColor(index)).toBe(expected);
    },
  );

  it("cycles past the seventh slot", () => {
    expect(chartColor(EXPECTED_HEXES.length)).toBe(chartColor(0));
    expect(chartColor(EXPECTED_HEXES.length + 2)).toBe(chartColor(2));
  });

  it.each([-1, 1.5, Number.NaN])("rejects index %s", (index) => {
    expect(() => chartColor(index)).toThrow(/chartColor/);
  });
});
