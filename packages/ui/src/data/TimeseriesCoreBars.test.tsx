import { describe, expect, it } from "vitest";
import { deriveCoreBars } from "./TimeseriesCoreBars.model";

const ONE_CORE = 1000; // millicores per core

describe("deriveCoreBars", () => {
  it("renders one bar per whole core of the limit", () => {
    const model = deriveCoreBars(2.3 * ONE_CORE, 4 * ONE_CORE);
    expect(model.coreCount).toBe(4);
    expect(model.bars).toHaveLength(4);
  });

  it("fills bars left to right, blocking out the straddling core", () => {
    const model = deriveCoreBars(2.3 * ONE_CORE, 4 * ONE_CORE);
    // 2 full cores, one ~30% core, one empty core.
    expect(model.bars.map((b) => Number(b.fill.toFixed(2)))).toEqual([1, 1, 0.3, 0]);
  });

  it("rounds a fractional limit up to the next whole bar", () => {
    const model = deriveCoreBars(1.5 * ONE_CORE, 2.5 * ONE_CORE);
    expect(model.coreCount).toBe(3);
    expect(model.bars.map((b) => Number(b.fill.toFixed(2)))).toEqual([1, 0.5, 0]);
  });

  it("computes utilisation percentage of the limit", () => {
    expect(deriveCoreBars(2 * ONE_CORE, 4 * ONE_CORE).pct).toBe(50);
    expect(deriveCoreBars(3.6 * ONE_CORE, 4 * ONE_CORE).pct).toBe(90);
  });

  it("caps utilisation and fill at the capacity when usage exceeds the limit", () => {
    const model = deriveCoreBars(5 * ONE_CORE, 4 * ONE_CORE);
    expect(model.pct).toBe(100);
    expect(model.bars.every((b) => b.fill === 1)).toBe(true);
  });

  it("falls back to ceil(usage) bars when the limit is missing", () => {
    const model = deriveCoreBars(2.3 * ONE_CORE, undefined);
    expect(model.coreCount).toBe(3);
    expect(model.limitCores).toBeUndefined();
    expect(model.pct).toBe(0);
    expect(model.bars.map((b) => Number(b.fill.toFixed(2)))).toEqual([1, 1, 0.3]);
  });

  it("treats a zero limit the same as a missing one", () => {
    expect(deriveCoreBars(1.2 * ONE_CORE, 0).coreCount).toBe(2);
  });

  it("renders at least one (empty) bar with no usage reading", () => {
    const model = deriveCoreBars(undefined, 2 * ONE_CORE);
    expect(model.hasUsage).toBe(false);
    expect(model.coreCount).toBe(2);
    expect(model.usageCores).toBe(0);
    expect(model.bars.every((b) => b.fill === 0)).toBe(true);
  });
});
