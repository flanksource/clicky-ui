import { describe, expect, it } from "vitest";
import { screenshotCrop } from "./screenshot-crop";

function raster({
  width = 24,
  height = 14,
  background = [255, 255, 255, 255],
  content = { x: 5, y: 4, width: 6, height: 4 },
  color = [30, 45, 70, 255],
  border = false,
} = {}) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inside =
        x >= content.x &&
        x < content.x + content.width &&
        y >= content.y &&
        y < content.y + content.height;
      const edge =
        border && (x === 0 || x === width - 1 || y === 0 || y === height - 1);
      data.set(
        inside ? color : edge ? [232, 232, 232, 255] : background,
        (y * width + x) * 4,
      );
    }
  }
  return { width, height, data };
}

describe("screenshotCrop", () => {
  it.each([
    {
      name: "white margins and faint panel borders",
      background: [255, 255, 255, 255],
      color: [30, 45, 70, 255],
      border: true,
    },
    {
      name: "transparent margins",
      background: [0, 0, 0, 0],
      color: [30, 45, 70, 255],
      border: false,
    },
    {
      name: "dark margins",
      background: [20, 25, 35, 255],
      color: [245, 245, 245, 255],
      border: false,
    },
  ])(
    "trims $name while retaining the full content",
    ({ background, color, border }) => {
      expect(
        screenshotCrop({
          pixels: raster({ background, color, border }),
          padding: 0,
        }),
      ).toEqual({ x: 5, y: 4, width: 6, height: 4 });
    },
  );

  it("adds bounded padding around content", () => {
    expect(screenshotCrop({ pixels: raster(), padding: 3 })).toEqual({
      x: 2,
      y: 1,
      width: 12,
      height: 10,
    });
  });

  it.each([
    [255, 255, 255, 255],
    [0, 0, 0, 0],
    [20, 25, 35, 255],
  ])("keeps a uniform image intact", (red, green, blue, alpha) => {
    expect(
      screenshotCrop({
        pixels: raster({
          background: [red, green, blue, alpha],
          color: [red, green, blue, alpha],
        }),
        padding: 0,
      }),
    ).toEqual({ x: 0, y: 0, width: 24, height: 14 });
  });

  it("preserves content touching opposite edges", () => {
    const pixels = raster();
    pixels.data.set([0, 0, 0, 255], 0);
    pixels.data.set([0, 0, 0, 255], pixels.data.length - 4);
    expect(screenshotCrop({ pixels, padding: 0 })).toEqual({
      x: 0,
      y: 0,
      width: 24,
      height: 14,
    });
  });

  it("rejects malformed pixel data", () => {
    expect(() =>
      screenshotCrop({
        pixels: { width: 3, height: 2, data: new Uint8ClampedArray(4) },
      }),
    ).toThrow("Invalid screenshot pixels");
  });
});
