import { describe, expect, it } from "vitest";
import { BREAKPOINTS, VIEWPORT_PRESETS, belowBreakpoint } from "./breakpoints";

describe("belowBreakpoint", () => {
  it("ends one pixel before the Tailwind prefix starts", () => {
    expect(belowBreakpoint("sm")).toBe("(max-width: 639px)");
    expect(belowBreakpoint("md")).toBe("(max-width: 767px)");
  });
});

describe("VIEWPORT_PRESETS", () => {
  it("is ordered smallest first with unique ids", () => {
    const widths = VIEWPORT_PRESETS.map((p) => p.width);
    expect(widths).toEqual([...widths].sort((a, b) => a - b));
    expect(new Set(VIEWPORT_PRESETS.map((p) => p.id)).size).toBe(VIEWPORT_PRESETS.length);
  });

  it("puts at least one preset on each side of sm, md and lg", () => {
    for (const bp of ["sm", "md", "lg"] as const) {
      const edge = BREAKPOINTS[bp];
      expect(VIEWPORT_PRESETS.some((p) => p.width < edge), `below ${bp}`).toBe(true);
      expect(VIEWPORT_PRESETS.some((p) => p.width >= edge), `at/above ${bp}`).toBe(true);
    }
  });
});
