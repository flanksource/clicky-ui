// Anchors on words inside rendered markdown, in the spirit of the W3C
// TextQuoteSelector: a quote is found again through the heading outline (the
// section it sits in) plus a few words on each side, so the same words
// elsewhere — or edits to other sections — never move it.

/** A quote inside the section named by `path` (its heading trail), with the words around it. */
export type QuoteLocator = { path: string[]; prefix: string; quote: string; suffix: string };

export const QUOTE_PREFIX = "q:";

const SOURCE_BLOCK = "[data-source-start]";
const HEADING = /^h([1-6])$/;
/** Heading text kept in a path; longer headings are cut so stored anchors stay bounded. */
export const OUTLINE_HEADING_LIMIT = 200;
/** Context words taken on each side to start with; grown until the anchor is unique. */
const MIN_CONTEXT_WORDS = 2;

export function quoteAnchor(locator: QuoteLocator): string {
  return `${QUOTE_PREFIX}${JSON.stringify([locator.path, locator.prefix, locator.quote, locator.suffix])}`;
}

/** The locator a `q:` anchor encodes; throws for a malformed one. */
export function parseQuoteAnchor(anchor: string): QuoteLocator {
  if (!anchor.startsWith(QUOTE_PREFIX)) throw new Error(`not a quote anchor: ${JSON.stringify(anchor)}`);
  const parsed: unknown = JSON.parse(anchor.slice(QUOTE_PREFIX.length));
  const [path, prefix, quote, suffix] = Array.isArray(parsed) ? parsed : [];
  if (
    !Array.isArray(path) ||
    !path.every((heading) => typeof heading === "string") ||
    typeof prefix !== "string" ||
    typeof quote !== "string" ||
    typeof suffix !== "string"
  ) {
    throw new Error(`malformed quote anchor ${JSON.stringify(anchor)}`);
  }
  return { path, prefix, quote, suffix };
}

/** A top-level rendered block, the heading trail it sits under, and its first source line. */
export type OutlineEntry = { block: Element; path: string[]; line: number };

/**
 * Every top-level block of rendered markdown (`Markdown sourceBlocks`) in
 * document order, with the headings above it: its table-of-contents path.
 */
export function markdownOutline(root: Element): OutlineEntry[] {
  const stack: { level: number; text: string }[] = [];
  return [...root.querySelectorAll(SOURCE_BLOCK)]
    .filter((block) => !block.parentElement?.closest(SOURCE_BLOCK))
    .map((block) => {
      const level = HEADING.exec(block.tagName.toLowerCase())?.[1];
      if (level) {
        while (stack.length > 0 && (stack.at(-1)?.level ?? 0) >= Number(level)) stack.pop();
        const text = blockText(block).replace(/\s+/g, " ").trim().slice(0, OUTLINE_HEADING_LIMIT);
        stack.push({ level: Number(level), text });
      }
      return { block, path: stack.map((heading) => heading.text), line: Number((block as HTMLElement).dataset.sourceStart) };
    });
}

type Section = Pick<OutlineEntry, "block" | "path">;

const sections = (root: Element): Section[] => markdownOutline(root);

function textNodes(block: Element): Text[] {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.parentElement?.closest("[data-comment-author]")) nodes.push(node as Text);
  }
  return nodes;
}

/** A block's text exactly as its text nodes concatenate, so offsets map back onto them. */
function blockText(block: Element): string {
  return textNodes(block)
    .map((node) => node.data)
    .join("");
}

function rangeIn(block: Element, start: number, end: number): Range {
  const range = document.createRange();
  let offset = 0;
  let started = false;
  for (const node of textNodes(block)) {
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
  throw new Error(`quote-anchor: offsets ${start}-${end} lie outside the block`);
}

// Rendered cells and list items concatenate without whitespace ("lead5 min"),
// so any run of whitespace in the locator matches zero or more in the text.
function pattern(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("\\s*");
}

type Match = { block: Element; start: number; end: number };

function matches(candidates: readonly Section[], locator: QuoteLocator, context: { prefix: boolean; suffix: boolean }): Match[] {
  const before = context.prefix && locator.prefix.trim() ? `(?<=${pattern(locator.prefix)}\\s*)` : "";
  const after = context.suffix && locator.suffix.trim() ? `(?=\\s*${pattern(locator.suffix)})` : "";
  const regex = new RegExp(`${before}${pattern(locator.quote)}${after}`, "g");
  return candidates.flatMap(({ block }) =>
    [...blockText(block).matchAll(regex)].map((m) => ({ block, start: m.index, end: m.index + m[0].length })),
  );
}

const samePath = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((h, i) => h === b[i]);

// Strictest first. A looser tier is tried only when a stricter one finds
// nothing, so edited context still resolves, but never guesses between two.
const TIERS = [
  { prefix: true, suffix: true },
  { prefix: true, suffix: false },
  { prefix: false, suffix: true },
] as const;

/**
 * Finds a quote again: in its section by quote plus context, then with one
 * side of the context edited away; failing that (a renamed heading), anywhere
 * by the full context. Null when it is gone or ambiguous.
 */
export function resolveQuote(root: Element, locator: QuoteLocator): Range | null {
  const all = sections(root);
  const section = all.filter((s) => samePath(s.path, locator.path));
  for (const tier of TIERS) {
    const found = matches(section, locator, tier);
    if (found.length === 1) return rangeIn(found[0]!.block, found[0]!.start, found[0]!.end);
  }
  const relocated = matches(all, locator, TIERS[0]);
  return relocated.length === 1 ? rangeIn(relocated[0]!.block, relocated[0]!.start, relocated[0]!.end) : null;
}

/**
 * The locator for a selection inside one block, with just enough context on
 * each side to make it unique in its section. Null when the selection spans
 * blocks, is blank, or repeats so exactly that no context tells it apart.
 */
export function locateSelection(root: Element, range: Range): QuoteLocator | null {
  const all = sections(root);
  const own = all.find(({ block }) => block.contains(range.startContainer) && block.contains(range.endContainer));
  if (!own) return null;
  const text = blockText(own.block);
  const lead = document.createRange();
  lead.setStart(own.block, 0);
  lead.setEnd(range.startContainer, range.startOffset);
  const raw = rangeText(range);
  const start = rangeText(lead).length + (raw.length - raw.trimStart().length);
  const end = rangeText(lead).length + raw.trimEnd().length;
  if (end <= start) return null;

  const before = text.slice(0, start).split(/\s+/).filter(Boolean);
  const after = text.slice(end).split(/\s+/).filter(Boolean);
  const section = all.filter((s) => samePath(s.path, own.path));
  for (let words = MIN_CONTEXT_WORDS; ; words++) {
    const locator = {
      path: own.path,
      prefix: before.slice(-words).join(" "),
      quote: text.slice(start, end),
      suffix: after.slice(0, words).join(" "),
    };
    const found = matches(section, locator, TIERS[0]);
    if (found.length === 1 && found[0]!.block === own.block && found[0]!.start === start) return locator;
    if (words >= before.length && words >= after.length) return null;
  }
}

/** A run of characters on one source line (1-based line, 0-based columns). */
export type SourceSpan = { line: number; start: number; end: number };

// Markdown markup that renders as nothing (emphasis, code ticks, table pipes,
// quote and heading markers, list bullets), so it may sit between source words.
const MARKUP = /[*_`|>#~]|(?:^|\s)[-+](?=\s)/g;

function sourcePattern(quote: string): string {
  return pattern(quote.replace(MARKUP, " ")).replaceAll("\\s*", "[\\s*_`|>#~]*");
}

function sourceBlocks(root: Element, lines: readonly string[]) {
  return sections(root).map(({ block }) => {
    const first = Number((block as HTMLElement).dataset.sourceStart);
    const last = Number((block as HTMLElement).dataset.sourceEnd);
    return { block, first, last, text: lines.slice(first - 1, last).join("\n") };
  });
}

const allMatches = (text: string, source: string) => [...text.matchAll(new RegExp(source, "g"))];

/**
 * The quote locator for a selection in the raw markdown: the selection's words
 * are found in the rendered block built from that line, as the same occurrence
 * they are in the source, so a comment made in Source shows in Preview too.
 * Null when the selection is only markup or its block renders no such words.
 */
export function locateSourceSelection(root: Element, lines: readonly string[], span: SourceSpan): QuoteLocator | null {
  const selected = lines[span.line - 1]?.slice(span.start, span.end) ?? "";
  if (!selected.replace(MARKUP, " ").trim()) return null;
  const own = sourceBlocks(root, lines).find((b) => span.line >= b.first && span.line <= b.last);
  if (!own) return null;
  const at = lines.slice(own.first - 1, span.line - 1).reduce((sum, l) => sum + l.length + 1, 0) + span.start;
  const k = allMatches(own.text, sourcePattern(selected)).findIndex((m) => m.index + m[0].length > at && m.index < at + selected.length);
  const hit = k < 0 ? undefined : allMatches(blockText(own.block), pattern(selected.replace(MARKUP, " ")))[k];
  return hit ? locateSelection(root, rangeIn(own.block, hit.index, hit.index + hit[0].length)) : null;
}

/** Where a quote anchor's text sits in the raw markdown, one span per source line it covers. */
export function sourceSpans(root: Element, lines: readonly string[], locator: QuoteLocator): SourceSpan[] {
  const range = resolveQuote(root, locator);
  const own = range && sourceBlocks(root, lines).find(({ block }) => block.contains(range.startContainer));
  if (!range || !own) return [];
  const lead = document.createRange();
  lead.setStart(own.block, 0);
  lead.setEnd(range.startContainer, range.startOffset);
  const offset = rangeText(lead).length;
  const k = allMatches(blockText(own.block), pattern(locator.quote)).findIndex((m) => m.index === offset);
  const hit = k < 0 ? undefined : allMatches(own.text, sourcePattern(locator.quote))[k];
  if (!hit) return [];
  const spans: SourceSpan[] = [];
  let lineStart = 0;
  for (let line = own.first; line <= own.last; line++) {
    const text = lines[line - 1] ?? "";
    const start = Math.max(hit.index, lineStart) - lineStart;
    const end = Math.min(hit.index + hit[0].length, lineStart + text.length) - lineStart;
    if (end > start) spans.push({ line, start, end });
    lineStart += text.length + 1;
  }
  return spans;
}

function rangeText(range: Range): string {
  const content = range.cloneContents();
  for (const avatar of content.querySelectorAll("[data-comment-author]")) avatar.remove();
  return content.textContent ?? "";
}

/** Reader-facing label: the section and the quoted words. */
export function describeQuote(locator: QuoteLocator): string {
  const section = locator.path.at(-1);
  return `${section ? `${section} › ` : ""}“${locator.quote}”`;
}
