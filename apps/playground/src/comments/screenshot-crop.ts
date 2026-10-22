export type ScreenshotCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function pixelColor(data: Uint8ClampedArray, offset: number): number {
  const alpha = data[offset + 3]! / 255;
  const red = Math.round(data[offset]! * alpha + 255 * (1 - alpha));
  const green = Math.round(data[offset + 1]! * alpha + 255 * (1 - alpha));
  const blue = Math.round(data[offset + 2]! * alpha + 255 * (1 - alpha));
  return (red << 16) | (green << 8) | blue;
}

export function screenshotCrop({
  pixels: { width, height, data },
  padding = 8,
}: {
  pixels: Pick<ImageData, "width" | "height" | "data">;
  padding?: number;
}): ScreenshotCrop {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width <= 0 ||
    height <= 0 ||
    data.length !== width * height * 4 ||
    !Number.isInteger(padding) ||
    padding < 0
  )
    throw new Error("Invalid screenshot pixels or padding");
  const colors = new Map<number, number>();
  const sample = (x: number, y: number) => {
    const color = pixelColor(data, (y * width + x) * 4) & 0xf0f0f0;
    colors.set(color, (colors.get(color) ?? 0) + 1);
  };
  const step = Math.max(1, Math.floor((width + height) / 256));
  for (let x = 0; x < width; x += step) {
    sample(x, 0);
    sample(x, height - 1);
  }
  for (let y = 0; y < height; y += step) {
    sample(0, y);
    sample(width - 1, y);
  }
  let background = 0;
  let mostSamples = 0;
  for (const [color, count] of colors) {
    if (count > mostSamples) {
      background = color | 0x080808;
      mostSamples = count;
    }
  }
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = pixelColor(data, (y * width + x) * 4);
      if (
        Math.max(
          Math.abs((color >> 16) - (background >> 16)),
          Math.abs(((color >> 8) & 255) - ((background >> 8) & 255)),
          Math.abs((color & 255) - (background & 255)),
        ) <= 40
      )
        continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < left) return { x: 0, y: 0, width, height };
  const x = Math.max(0, left - padding);
  const y = Math.max(0, top - padding);
  return {
    x,
    y,
    width: Math.min(width, right + padding + 1) - x,
    height: Math.min(height, bottom + padding + 1) - y,
  };
}
