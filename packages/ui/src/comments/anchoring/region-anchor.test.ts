import { describe, expect, it } from "vitest";
import { isRegionAnchor, normalizeRegion, parseRegionAnchor, regionAnchor } from "./region-anchor";

const BOUNDS = { width: 400, height: 200 };

describe("region anchors", () => {
  it("round-trips a region through its anchor string", () => {
    const region = { x: 0.25, y: 0.1, w: 0.5, h: 0.4 };
    const anchor = regionAnchor(region);
    expect({ is: isRegionAnchor(anchor), parsed: parseRegionAnchor(anchor) }).toEqual({ is: true, parsed: region });
  });

  it.each([
    ["a negative origin", { x: -0.1, y: 0, w: 0.5, h: 0.5 }],
    ["a region leaving the image on the right", { x: 0.6, y: 0, w: 0.5, h: 0.5 }],
    ["a region leaving the image at the bottom", { x: 0, y: 0.7, w: 0.5, h: 0.5 }],
    ["an empty width", { x: 0.1, y: 0.1, w: 0, h: 0.5 }],
    ["a non-finite field", { x: Number.NaN, y: 0.1, w: 0.2, h: 0.5 }],
    ["a region a hair past the right edge, which gavel rejects as x + w > 1", { x: 0.5, y: 0, w: 0.5 + 2 ** -50, h: 0.5 }],
    ["a region a hair past the bottom edge", { x: 0, y: 0.5, w: 0.5, h: 0.5 + 2 ** -50 }],
  ])("refuses to anchor on %s", (_name, region) => {
    expect(() => regionAnchor(region)).toThrow(/region/i);
  });

  it("refuses to parse an anchor that is not a region", () => {
    expect(() => parseRegionAnchor("r:{}")).toThrow(/region anchor/);
    expect(() => parseRegionAnchor("region:{not json")).toThrow(/not valid JSON/);
    expect(() => parseRegionAnchor('region:{"x":0,"y":0,"w":2,"h":1}')).toThrow(/region/);
  });
});

describe("normalizeRegion", () => {
  it("turns a drag in pixels into fractions of the image, whichever corner it started from", () => {
    const forward = normalizeRegion({ from: { x: 100, y: 20 }, to: { x: 300, y: 120 }, bounds: BOUNDS });
    const backward = normalizeRegion({ from: { x: 300, y: 120 }, to: { x: 100, y: 20 }, bounds: BOUNDS });
    expect([forward, backward]).toEqual([
      { x: 0.25, y: 0.1, w: 0.5, h: 0.5 },
      { x: 0.25, y: 0.1, w: 0.5, h: 0.5 },
    ]);
  });

  it("clamps a drag that leaves the image to its edges", () => {
    expect(normalizeRegion({ from: { x: -50, y: 100 }, to: { x: 500, y: 400 }, bounds: BOUNDS })).toEqual({ x: 0, y: 0.5, w: 1, h: 0.5 });
  });

  it("clamps a drag that runs to the right or bottom edge so x + w and y + h never exceed 1, which gavel rejects", () => {
    // 6.3468 / 361.1000000000001 + (361.1000000000001 - 6.3468) / 361.1000000000001 is 1.0000000000000002 unclamped.
    const bounds = { width: 361.1000000000001, height: 200 };
    const region = normalizeRegion({ from: { x: 6.3468, y: 10 }, to: { x: bounds.width + 40, y: bounds.height + 40 }, bounds })!;
    expect({ right: region.x + region.w <= 1, bottom: region.y + region.h <= 1, anchored: regionAnchor(region).startsWith("region:") }).toEqual({ right: true, bottom: true, anchored: true });
  });

  it("returns null for a click that drew no area, and throws for an image with no size", () => {
    expect(normalizeRegion({ from: { x: 10, y: 10 }, to: { x: 10, y: 90 }, bounds: BOUNDS })).toBeNull();
    expect(() => normalizeRegion({ from: { x: 0, y: 0 }, to: { x: 5, y: 5 }, bounds: { width: 0, height: 0 } })).toThrow(/size/);
  });
});
