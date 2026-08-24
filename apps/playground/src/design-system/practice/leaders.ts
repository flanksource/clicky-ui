/**
 * Geometry for the annotation gutter: where a note's marker sits on the
 * specimen, and the curve that ties it to the note card beside it.
 *
 * Pure so the arithmetic can be tested without a layout engine — jsdom reports
 * every rect as zero, so measuring in a test would only ever assert nothing.
 */

export type Rect = { left: number; top: number; width: number; height: number };

export type Point = { x: number; y: number };

export type Leader = {
  id: string;
  /** 1-based badge number, shared by the marker and the card. */
  index: number;
  /** Where the numbered badge is drawn, on the target's trailing edge. */
  marker: Point;
  /** Cubic path from the marker to the card, or null when they do not sit side by side. */
  path: string | null;
};

/**
 * Both endpoints sit near the top of their box rather than at its middle: a
 * full-height nav rail centred at 350px would drag its line diagonally across
 * the whole specimen to reach a card that starts level with its heading.
 */
const EDGE_INSET = 28;

/** Clears the badge off the element it marks, so it never covers a control. */
const MARKER_OFFSET = 10;

function trailingEdge(rect: Rect): Point {
  return {
    x: rect.left + rect.width + MARKER_OFFSET,
    y: rect.top + Math.min(rect.height / 2, EDGE_INSET),
  };
}

function leadingEdge(rect: Rect): Point {
  return { x: rect.left, y: rect.top + Math.min(rect.height / 2, EDGE_INSET) };
}

/**
 * A card only earns a leader line when it is genuinely to the right of its
 * target. Once the layout stacks (narrow viewports), a line would cut back
 * across the specimen and read as a mistake, so the marker stands alone.
 */
export function computeLeaders(
  order: readonly string[],
  targets: ReadonlyMap<string, Rect>,
  cards: ReadonlyMap<string, Rect>,
): Leader[] {
  return order.flatMap((id, position) => {
    const target = targets.get(id);
    if (!target) return [];
    const marker = trailingEdge(target);
    const card = cards.get(id);
    return [
      {
        id,
        index: position + 1,
        marker,
        path: card ? leaderPath(marker, leadingEdge(card)) : null,
      },
    ];
  });
}

const MIN_GAP = 24;

export function leaderPath(from: Point, to: Point): string | null {
  if (to.x - from.x < MIN_GAP) return null;
  const bend = Math.max((to.x - from.x) / 2, MIN_GAP);
  return `M ${round(from.x)} ${round(from.y)} C ${round(from.x + bend)} ${round(from.y)}, ${round(to.x - bend)} ${round(to.y)}, ${round(to.x)} ${round(to.y)}`;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
