/**
 * Anchors on words selected in a live web page that has no source to patch:
 * the quote (the words with a little text on each side, as the W3C
 * TextQuoteSelector) plus `captureLocators` of the element holding them.
 *
 * It resolves in two steps. The locators vote for the element, exactly as for
 * a picked element, so a rewrapped or reordered page still finds it. The quote
 * is then looked for inside that element only, so the same words elsewhere on
 * the page are never mistaken for it. Words that are gone are orphaned, never
 * guessed at; an element found only by a minority of its locators is moved.
 */
import type { TextQuote } from "../annotation-types";
import { captureLocators, resolveLocators } from "./dom-anchor";
import type { CommentLocator } from "./model";

/** Characters of text kept on each side of the selection. */
const CONTEXT_CHARS = 32;

export type WebTextAnchor = { quote: TextQuote; locators: CommentLocator[] };

export type WebTextMatch =
  | { state: "matched" | "moved"; element: Element; range: Range }
  /** The element is found but the quote occurs more than once and its context no longer tells the occurrences apart. */
  | { state: "ambiguous"; element: Element }
  | { state: "orphaned" };

function textNodesOf(element: Element): Text[] {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node as Text);
  return nodes;
}

/**
 * The words `range` selects and where they sit in the page. Null when the
 * selection is blank or outside `root`, or no element holding it can be told
 * apart from the rest of `root` (so there is nothing to find it by later).
 */
export function captureWebText(range: Range, root: Element): WebTextAnchor | null {
  if (range.collapsed) return null;
  const common = range.commonAncestorContainer;
  let element: Element | null = common instanceof Element ? common : common.parentElement;
  if (!element || !root.contains(element)) return null;
  let locators: CommentLocator[] = [];
  while (element && element !== root) {
    locators = captureLocators(element, root);
    if (locators.length > 0) break;
    element = element.parentElement;
  }
  if (!element || element === root) return null;

  const lead = document.createRange();
  lead.setStart(element, 0);
  lead.setEnd(range.startContainer, range.startOffset);
  const selected = range.toString();
  const start = lead.toString().length + (selected.length - selected.trimStart().length);
  const end = start + selected.trim().length;
  if (end <= start) return null;
  const text = textNodesOf(element)
    .map((node) => node.data)
    .join("");
  return {
    quote: { prefix: text.slice(Math.max(0, start - CONTEXT_CHARS), start), exact: text.slice(start, end), suffix: text.slice(end, end + CONTEXT_CHARS) },
    locators,
  };
}

const words = (text: string) =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("\\s+");

/** Strictest first: a looser tier is tried only when the stricter one finds nothing. */
const TIERS = [
  { prefix: true, suffix: true },
  { prefix: true, suffix: false },
  { prefix: false, suffix: true },
  { prefix: false, suffix: false },
] as const;

function rangeOver(nodes: readonly Text[], start: number, end: number): Range {
  const range = document.createRange();
  let offset = 0;
  let started = false;
  for (const node of nodes) {
    if (!started && start < offset + node.length) {
      range.setStart(node, start - offset);
      started = true;
    }
    if (started && end <= offset + node.length) {
      range.setEnd(node, end - offset);
      return range;
    }
    offset += node.length;
  }
  throw new Error(`web-text-anchor: offsets ${start}-${end} lie outside the element`);
}

/** The quote's one occurrence in `element`, "ambiguous" when it repeats, null when it is gone. */
function findQuote(element: Element, { prefix, exact, suffix }: TextQuote): Range | "ambiguous" | null {
  const nodes = textNodesOf(element);
  const text = nodes.map((node) => node.data).join("");
  for (const tier of TIERS) {
    const before = tier.prefix && prefix.trim() ? `(?<=${words(prefix)}\\s*)` : "";
    const after = tier.suffix && suffix.trim() ? `(?=\\s*${words(suffix)})` : "";
    const found = [...text.matchAll(new RegExp(`${before}${words(exact)}${after}`, "g"))];
    if (found.length > 1) return "ambiguous";
    const [only] = found;
    if (only) return rangeOver(nodes, only.index, only.index + only[0].length);
  }
  return null;
}

/** Where `anchor` sits in `root` now, or why it cannot be placed. */
export function resolveWebText(root: Element, anchor: WebTextAnchor): WebTextMatch {
  const match = resolveLocators(root, anchor.locators);
  if (!match) return { state: "orphaned" };
  const found = findQuote(match.element, anchor.quote);
  if (found === "ambiguous") return { state: "ambiguous", element: match.element };
  if (!found) return { state: "orphaned" };
  return { state: match.conflict ? "moved" : "matched", element: match.element, range: found };
}
