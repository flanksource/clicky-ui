import { describe, expect, it } from "vitest";
import { selectionCrop } from "./screenshot";

describe("host selection crop", () => {
  const frame = { left: 720, top: 160, width: 800, height: 600 };
  const viewport = { width: 1920, height: 1080 };
  it("adds the frame offset, clips to its viewport, and scales tab pixels", () => {
    expect(selectionCrop({ frame, rect: { left: -10, top: 40, width: 150, height: 60 }, viewport, capture: { width: 3840, height: 2160 } })).toEqual({ x: 1440, y: 400, width: 280, height: 120 });
  });
  it("refuses off-frame and invalid selections rather than capturing other host content", () => {
    for (const rect of [{ left: 900, top: 0, width: 20, height: 20 }, { left: 0, top: 0, width: NaN, height: 20 }]) {
      expect(() => selectionCrop({ frame, rect, viewport, capture: viewport })).toThrow();
    }
  });
});
