import { describe, expect, it } from "vitest";
import { deriveProgressBars } from "./ProgressBars.model";

const ONE_CORE = 1000; // millicores per core

describe("deriveProgressBars", () => {
  it("renders one bar per whole unit of the limit", () => {
    const model = deriveProgressBars(2.3 * ONE_CORE, 4 * ONE_CORE);
    expect(model.barCount).toBe(4);
    expect(model.bars).toHaveLength(4);
  });

  it("fills bars left to right, blocking out the straddling bar", () => {
    const model = deriveProgressBars(2.3 * ONE_CORE, 4 * ONE_CORE);
    // 2 full bars, one ~30% bar, one empty bar.
    expect(model.bars.map((b) => Number(b.fill.toFixed(2)))).toEqual([1, 1, 0.3, 0]);
  });

  it("rounds a fractional limit up to the next whole bar", () => {
    const model = deriveProgressBars(1.5 * ONE_CORE, 2.5 * ONE_CORE);
    expect(model.barCount).toBe(3);
    expect(model.bars.map((b) => Number(b.fill.toFixed(2)))).toEqual([1, 0.5, 0]);
  });

  it("computes utilisation percentage of the limit", () => {
    expect(deriveProgressBars(2 * ONE_CORE, 4 * ONE_CORE).pct).toBe(50);
    expect(deriveProgressBars(3.6 * ONE_CORE, 4 * ONE_CORE).pct).toBe(90);
  });

  it("caps utilisation and fill at the capacity when usage exceeds the limit", () => {
    const model = deriveProgressBars(5 * ONE_CORE, 4 * ONE_CORE);
    expect(model.pct).toBe(100);
    expect(model.bars.every((b) => b.fill === 1)).toBe(true);
  });

  it("falls back to ceil(usage) bars when the limit is missing", () => {
    const model = deriveProgressBars(2.3 * ONE_CORE, undefined);
    expect(model.barCount).toBe(3);
    expect(model.limitUnits).toBeUndefined();
    expect(model.pct).toBe(0);
    expect(model.bars.map((b) => Number(b.fill.toFixed(2)))).toEqual([1, 1, 0.3]);
  });

  it("treats a zero limit the same as a missing one", () => {
    expect(deriveProgressBars(1.2 * ONE_CORE, 0).barCount).toBe(2);
  });

  it("scales bars by a custom perBar unit (1 GiB per bar)", () => {
    const GiB = 1024 ** 3;
    const model = deriveProgressBars(2.5 * GiB, 4 * GiB, GiB);
    expect(model.barCount).toBe(4);
    expect(model.usageUnits).toBeCloseTo(2.5);
    expect(model.limitUnits).toBeCloseTo(4);
    expect(model.bars.map((b) => Number(b.fill.toFixed(2)))).toEqual([1, 1, 0.5, 0]);
  });

  it("renders at least one (empty) bar with no usage reading", () => {
    const model = deriveProgressBars(undefined, 2 * ONE_CORE);
    expect(model.hasUsage).toBe(false);
    expect(model.barCount).toBe(2);
    expect(model.usageUnits).toBe(0);
    expect(model.bars.every((b) => b.fill === 0)).toBe(true);
  });
});
