import { describe, expect, it } from "vitest";
import { fitTransform, zoomAround } from "./use-pan-zoom";

describe("zoomAround", () => {
  it("keeps the content point under the pointer fixed while scaling", () => {
    const pointer = { x: 110, y: 70 };

    expect(zoomAround({ x: 10, y: 20, scale: 1 }, pointer, 2)).toEqual({ x: -90, y: -30, scale: 2 });
  });

  it("clamps the scale to the maximum and pans by the clamped ratio", () => {
    const pointer = { x: 100, y: 100 };

    expect(zoomAround({ x: 0, y: 0, scale: 2 }, pointer, 100, { minScale: 0.2, maxScale: 4 })).toEqual({
      x: -100,
      y: -100,
      scale: 4,
    });
  });

  it("clamps the scale to the minimum", () => {
    const origin = { x: 0, y: 0 };

    expect(zoomAround({ x: 0, y: 0, scale: 1 }, origin, 0.01, { minScale: 0.2, maxScale: 4 }).scale).toBe(0.2);
  });
});

describe("fitTransform", () => {
  it("scales oversized content down to the viewport and centres the slack axis", () => {
    expect(fitTransform({ width: 800, height: 400 }, { width: 400, height: 300 })).toEqual({
      x: 0,
      y: 50,
      scale: 0.5,
    });
  });

  it("centres content that already fits without enlarging it", () => {
    expect(fitTransform({ width: 200, height: 100 }, { width: 400, height: 300 })).toEqual({
      x: 100,
      y: 100,
      scale: 1,
    });
  });

  describe("with a minimum scale", () => {
    const viewport = { width: 1000, height: 400 };
    const floor = { minScale: 0.75 };

    it("stops shrinking at the minimum and centres each overflowing axis on the focus point", () => {
      // Fitting 2000x1000 would take 0.4; at 0.75 it is 1500x750 and overflows both ways.
      const focus = { x: 1000, y: 500 };

      expect(fitTransform({ width: 2000, height: 1000 }, viewport, undefined, { ...floor, focus })).toEqual({
        x: -250,
        y: -175,
        scale: 0.75,
      });
    });

    it("keeps the content's edge at the viewport's rather than centre a focus point near that edge", () => {
      const nearTopLeft = { x: 100, y: 100 };
      const nearBottomRight = { x: 1900, y: 900 };

      expect(
        [nearTopLeft, nearBottomRight].map((focus) =>
          fitTransform({ width: 2000, height: 1000 }, viewport, undefined, { ...floor, focus }),
        ),
      ).toEqual([
        { x: 0, y: 0, scale: 0.75 },
        { x: -500, y: -350, scale: 0.75 },
      ]);
    });

    it("centres an axis that fits at the minimum scale, and focuses on the content's centre by default", () => {
      expect(fitTransform({ width: 800, height: 1000 }, viewport, undefined, floor)).toEqual({
        x: 200,
        y: -175,
        scale: 0.75,
      });
    });

    it("changes nothing for content that fits at a larger scale", () => {
      expect(fitTransform({ width: 1000, height: 440 }, viewport, undefined, floor)).toEqual(
        fitTransform({ width: 1000, height: 440 }, viewport),
      );
    });
  });

  it("returns the identity transform for a viewport that has not been measured", () => {
    expect(fitTransform({ width: 800, height: 400 }, { width: 0, height: 0 })).toEqual({ x: 0, y: 0, scale: 1 });
  });
});
