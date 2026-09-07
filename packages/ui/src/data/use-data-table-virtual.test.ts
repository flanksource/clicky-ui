import { describe, expect, it } from "vitest";
import {
  resolveVirtualizeOptions,
  spacerHeights,
} from "./use-data-table-virtual";

describe("resolveVirtualizeOptions", () => {
  it("is off unless asked for", () => {
    expect(resolveVirtualizeOptions(undefined)).toBeNull();
    expect(resolveVirtualizeOptions(false)).toBeNull();
  });

  it("takes defaults from `virtualize`", () => {
    expect(resolveVirtualizeOptions(true)).toEqual({
      overscan: 8,
      estimateRowHeight: 40,
    });
  });

  it("lets a caller override either field on its own", () => {
    expect(resolveVirtualizeOptions({ overscan: 20 })).toEqual({
      overscan: 20,
      estimateRowHeight: 40,
    });
    expect(resolveVirtualizeOptions({ estimateRowHeight: 96 })).toEqual({
      overscan: 8,
      estimateRowHeight: 96,
    });
  });
});

describe("spacerHeights", () => {
  it("is flat when nothing is windowed", () => {
    expect(spacerHeights([], 0, 0)).toEqual({ top: 0, bottom: 0 });
  });

  // 10 rows of 40px; the window holds rows 2-4, so 80px sits above it and
  // 400 - 200 = 200px below.
  it("accounts for the rows on each side of the window", () => {
    const items = [
      { start: 80, end: 120 },
      { start: 120, end: 160 },
      { start: 160, end: 200 },
    ];
    expect(spacerHeights(items, 400, 0)).toEqual({ top: 80, bottom: 200 });
  });

  // The sticky <thead> occupies layout space inside the scroll container, so
  // item offsets are shifted by its height. Without subtracting scrollMargin the
  // top spacer double-counts the header and every row sits too low.
  it("subtracts the header's own height from both spacers", () => {
    const items = [
      { start: 120, end: 160 },
      { start: 160, end: 200 },
    ];
    expect(spacerHeights(items, 400, 40)).toEqual({ top: 80, bottom: 240 });
  });

  it("never returns a negative spacer", () => {
    const items = [{ start: 0, end: 40 }];
    expect(spacerHeights(items, 40, 100)).toEqual({ top: 0, bottom: 100 });
  });
});
