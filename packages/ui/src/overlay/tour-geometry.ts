/**
 * Pure spotlight maths. The dim layer is one full-viewport element clipped with
 * `clip-path: path(evenodd, ...)`: the clipped-away hole does not hit-test, so
 * the dim blocks clicks while the anchor underneath stays live — the pointer
 * semantics come free, which no other cutout technique gives us (a
 * `box-shadow: 0 0 0 9999px` ring has them exactly inverted).
 */

export type Viewport = { width: number; height: number };

export type SpotlightRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * The anchor's own computed corner radius, so the cutout traces the control
 * rather than boxing it. A percentage radius resolves against the element's
 * width, matching how the browser paints it.
 */
export function anchorRadius(element: HTMLElement): number {
  const view = element.ownerDocument.defaultView;
  if (!view) return 0;
  const raw = view.getComputedStyle(element).borderTopLeftRadius;
  if (!raw) return 0;
  if (raw.endsWith("%")) {
    const percent = Number.parseFloat(raw);
    if (!Number.isFinite(percent)) return 0;
    return (element.getBoundingClientRect().width * percent) / 100;
  }
  const px = Number.parseFloat(raw);
  return Number.isFinite(px) ? px : 0;
}

/**
 * Anchor rect grown by `padding` and clamped to the viewport. The radius grows
 * with the padding so the cutout stays concentric with the control it traces,
 * and is capped at half the shorter side so an over-large radius cannot fold the
 * path in on itself.
 */
export function spotlightRect(options: {
  anchor: DOMRect;
  padding: number;
  radius?: number | undefined;
  viewport: Viewport;
}): SpotlightRect {
  const { anchor, padding, radius, viewport } = options;
  const left = clamp(anchor.left - padding, 0, viewport.width);
  const top = clamp(anchor.top - padding, 0, viewport.height);
  const right = clamp(anchor.right + padding, 0, viewport.width);
  const bottom = clamp(anchor.bottom + padding, 0, viewport.height);

  const width = Math.max(right - left, 0);
  const height = Math.max(bottom - top, 0);
  const requested = radius ?? 0;

  return {
    x: left,
    y: top,
    width,
    height,
    radius: clamp(requested, 0, Math.min(width, height) / 2),
  };
}

function roundedRectPath(rect: SpotlightRect): string {
  const { x, y, width, height, radius: r } = rect;
  if (r <= 0) {
    return `M${x},${y} H${x + width} V${y + height} H${x} Z`;
  }
  return [
    `M${x + r},${y}`,
    `H${x + width - r}`,
    `A${r},${r} 0 0 1 ${x + width},${y + r}`,
    `V${y + height - r}`,
    `A${r},${r} 0 0 1 ${x + width - r},${y + height}`,
    `H${x + r}`,
    `A${r},${r} 0 0 1 ${x},${y + height - r}`,
    `V${y + r}`,
    `A${r},${r} 0 0 1 ${x + r},${y}`,
    "Z",
  ].join(" ");
}

/**
 * `path(evenodd, "...")` for the dim: the viewport rect minus a rounded cutout.
 * A missing or degenerate cutout yields the plain viewport rect, so a zero-size
 * anchor dims the page rather than emitting an invalid path the browser drops
 * (which would leave the dim uncut and the page unusable).
 */
export function spotlightClipPath(options: {
  viewport: Viewport;
  cutout: SpotlightRect | null;
}): string {
  const { viewport, cutout } = options;
  const outer = `M0,0 H${viewport.width} V${viewport.height} H0 Z`;
  if (!cutout || cutout.width <= 0 || cutout.height <= 0) {
    return `path(evenodd, "${outer}")`;
  }
  return `path(evenodd, "${outer} ${roundedRectPath(cutout)}")`;
}
