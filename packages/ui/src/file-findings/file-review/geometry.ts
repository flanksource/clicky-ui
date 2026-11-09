import { ELEMENT_PREFIX, resolveElementAnchor } from "../../comments/anchoring/dom-anchor";
import { isPatchAnchor } from "../../comments/anchoring/patch-anchor";
import { blockAnchor, lineRangeAnchorResolver } from "../findings-comments";

import { QUOTE_PREFIX, parseQuoteAnchor, resolveQuote } from "./quote-anchor";

/** A rectangle relative to the annotated document's top-left corner. */
export type Box = { top: number; left: number; width: number; height: number };

/** How a quote anchor is drawn: its exact text, or the whole block holding it. */
export type AnchorMode = "text" | "block";

const SOURCE_BLOCK = "[data-source-start]";

/** The rendered source block holding `node`, if any. */
export function sourceBlockOf(node: Node | null): Element | null {
  const element = node instanceof Element ? node : (node?.parentElement ?? null);
  return element?.closest(SOURCE_BLOCK) ?? null;
}

/**
 * Boxes for each anchor, relative to `origin`. A `q:` anchor finds its quote in
 * `markdown` through its section and context words; a `line:N` anchor resolves to its block like a line finding's
 * does. An anchor in `patchRanges` (an `r:` thread already placed in the
 * source) covers every block that overlaps its lines; an `e:` anchor finds its
 * element by its locators and takes that element's box. An anchor that no
 * longer finds its target is left out. Entries come in document order.
 */
export function measureAnchors({
  origin,
  markdown,
  anchors,
  mode,
  patchRanges,
}: {
  origin: Element;
  markdown: Element;
  anchors: readonly string[];
  mode: AnchorMode;
  patchRanges?: ReadonlyMap<string, { start: number; end: number }>;
}): Map<string, Box[]> {
  const base = origin.getBoundingClientRect();
  const rel = (rect: DOMRect): Box => ({
    top: rect.top - base.top,
    left: rect.left - base.left,
    width: rect.width,
    height: rect.height,
  });
  const blocks = new Map<string, Element>();
  for (const el of markdown.querySelectorAll<HTMLElement>(SOURCE_BLOCK)) {
    const key = blockAnchor(Number(el.dataset.sourceStart), Number(el.dataset.sourceEnd));
    if (!blocks.has(key)) blocks.set(key, el);
  }

  /** One box per rendered line of `block`'s text, or the block itself when it has none. */
  const blockBoxes = (block: Element): Box[] => {
    const range = document.createRange();
    range.selectNodeContents(block);
    const lines = textLines([...range.getClientRects()].filter((rect) => rect.width > 0).map(rel));
    return lines.length > 0 ? lines : [rel(block.getBoundingClientRect())];
  };

  // `at` is where the anchored text itself starts, so anchors sharing a block keep document order.
  const found: { anchor: string; boxes: Box[]; at: number }[] = [];
  for (const anchor of anchors) {
    if (anchor.startsWith(QUOTE_PREFIX)) {
      const range = resolveQuote(markdown, parseQuoteAnchor(anchor));
      if (!range) continue;
      const text = [...range.getClientRects()].filter((rect) => rect.width > 0).map(rel);
      const block = sourceBlockOf(range.startContainer);
      const boxes = mode === "text" ? text : block ? [rel(block.getBoundingClientRect())] : [];
      if (boxes.length > 0) found.push({ anchor, boxes, at: text[0]?.top ?? boxes[0]!.top });
      continue;
    }
    if (anchor.startsWith(ELEMENT_PREFIX)) {
      const element = resolveElementAnchor(markdown, anchor)?.element;
      const box = element && rel(element.getBoundingClientRect());
      if (box) found.push({ anchor, boxes: [box], at: box.top });
      continue;
    }
    if (isPatchAnchor(anchor)) {
      const lines = patchRanges?.get(anchor);
      if (!lines) continue;
      const covered = [...markdown.querySelectorAll<HTMLElement>(SOURCE_BLOCK)]
        .filter((el) => Number(el.dataset.sourceStart) <= lines.end && Number(el.dataset.sourceEnd) >= lines.start)
        .flatMap(blockBoxes);
      if (covered.length > 0) found.push({ anchor, boxes: covered, at: covered[0]!.top });
      continue;
    }
    const key = lineRangeAnchorResolver(anchor, [...blocks.keys()]);
    const block = key ? blocks.get(key) : undefined;
    if (block) {
      const boxes = blockBoxes(block);
      found.push({ anchor, boxes, at: boxes[0]!.top });
    }
  }
  return new Map(found.sort((a, b) => a.at - b.at).map(({ anchor, boxes }) => [anchor, boxes]));
}

/**
 * One box per visual line: text rects that overlap vertically merge into their
 * horizontal union, so a finding's squiggle runs under each rendered line.
 */
export function textLines(rects: readonly Box[]): Box[] {
  const lines: Box[] = [];
  for (const rect of [...rects].sort((a, b) => a.top - b.top || a.left - b.left)) {
    const line = lines.find((l) => rect.top < l.top + l.height && rect.top + rect.height > l.top);
    if (!line) {
      lines.push({ ...rect });
      continue;
    }
    const right = Math.max(line.left + line.width, rect.left + rect.width);
    const bottom = Math.max(line.top + line.height, rect.top + rect.height);
    line.left = Math.min(line.left, rect.left);
    line.top = Math.min(line.top, rect.top);
    line.width = right - line.left;
    line.height = bottom - line.top;
  }
  return lines;
}

/**
 * Margin layout in the style of Google Docs: each card wants the top of its
 * anchor; the focused card gets exactly that, cards above it are pushed up and
 * cards below it pushed down so none overlap.
 */
export function layoutCards({
  cards,
  focused,
  gap = 8,
}: {
  /** `order` breaks ties between cards that want the same top, e.g. two quotes in one block. */
  cards: readonly { anchor: string; desired: number; order: number; height: number }[];
  focused: string | null;
  gap?: number;
}): Map<string, number> {
  const sorted = [...cards].sort((a, b) => a.desired - b.desired || a.order - b.order);
  const tops = sorted.map((card) => card.desired);
  const pivot = sorted.findIndex((card) => card.anchor === focused);
  if (pivot >= 0) {
    for (let i = pivot - 1; i >= 0; i--) {
      tops[i] = Math.min(tops[i]!, tops[i + 1]! - gap - sorted[i]!.height);
    }
  }
  // Cards pushed above the top, and everything below the pivot, flow downward.
  for (let i = 0; i < sorted.length; i++) {
    const floor = i === 0 ? 0 : tops[i - 1]! + sorted[i - 1]!.height + gap;
    tops[i] = Math.max(tops[i]!, floor);
  }
  return new Map(sorted.map((card, i) => [card.anchor, tops[i]!]));
}
