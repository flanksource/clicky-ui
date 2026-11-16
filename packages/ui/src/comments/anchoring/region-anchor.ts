/**
 * Anchors on a rectangle of an image: `region:` + JSON of a `RegionAnchor`, a
 * normalized x, y, w, h in [0, 1]. Fractions, not pixels, so a region follows
 * the image however it is scaled. Matches the server's
 * `{kind: "region", region: {x, y, w, h}}` selector.
 */
import type { RegionAnchor } from "../annotation-types";

export const REGION_PREFIX = "region:";

const FIELDS = ["x", "y", "w", "h"] as const;

function assertRegion(value: unknown): asserts value is RegionAnchor {
  const region = value as Partial<Record<(typeof FIELDS)[number], unknown>> | null;
  if (typeof region !== "object" || region === null || !FIELDS.every((field) => typeof region[field] === "number" && Number.isFinite(region[field])))
    throw new Error("region must be {x, y, w, h}, four finite numbers");
  const { x, y, w, h } = region as RegionAnchor;
  if (x < 0 || y < 0 || w <= 0 || h <= 0 || x + w > 1 || y + h > 1)
    throw new Error(`region ${JSON.stringify({ x, y, w, h })} must lie inside the image: x, y >= 0, w, h > 0, x + w and y + h <= 1`);
}

export function isRegionAnchor(anchor: string): boolean {
  return anchor.startsWith(REGION_PREFIX);
}

export function regionAnchor(region: RegionAnchor): string {
  assertRegion(region);
  return `${REGION_PREFIX}${JSON.stringify({ x: region.x, y: region.y, w: region.w, h: region.h })}`;
}

/** The region a `region:` anchor holds; throws for any other anchor, malformed JSON or a region outside the image. */
export function parseRegionAnchor(anchor: string): RegionAnchor {
  if (!isRegionAnchor(anchor)) throw new Error(`expected a "region:" region anchor, got ${JSON.stringify(anchor.slice(0, 40))}`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(anchor.slice(REGION_PREFIX.length));
  } catch (cause) {
    throw new Error(`region anchor is not valid JSON: ${cause instanceof Error ? cause.message : String(cause)}`);
  }
  assertRegion(parsed);
  return parsed;
}

type Point = { x: number; y: number };

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

/**
 * The region a drag from `from` to `to` (pixels from the image's top-left)
 * draws over an image of `bounds`, clamped to the image. Null when it covers
 * no area, e.g. a plain click.
 */
export function normalizeRegion({ from, to, bounds }: { from: Point; to: Point; bounds: { width: number; height: number } }): RegionAnchor | null {
  if (!(bounds.width > 0) || !(bounds.height > 0)) throw new Error(`cannot draw a region on an image with no size (${bounds.width}x${bounds.height})`);
  const left = clamp(Math.min(from.x, to.x), bounds.width);
  const right = clamp(Math.max(from.x, to.x), bounds.width);
  const top = clamp(Math.min(from.y, to.y), bounds.height);
  const bottom = clamp(Math.max(from.y, to.y), bounds.height);
  if (right <= left || bottom <= top) return null;
  const x = left / bounds.width;
  const y = top / bounds.height;
  // Two fractions that sum to 1 can land a hair above it in floating point, which gavel rejects.
  return { x, y, w: Math.min((right - left) / bounds.width, 1 - x), h: Math.min((bottom - top) / bounds.height, 1 - y) };
}
