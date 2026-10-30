/**
 * Comment anchors on rendered markdown. A markdown document has a structure
 * that a CSS path ignores: its outline. A comment here is keyed on the block it
 * was left on — named by the headings above it (its table-of-contents path)
 * and its text — so editing other parts of the file never moves it, and a
 * reworded block is still found within its section.
 */
import {
  COMMENT_LOCATOR_TEXT_LIMIT,
  type CommentLocator,
} from "../../plugins/comments-model";

export type MarkdownLocator = Extract<CommentLocator, { kind: "markdown" }>;

/** Rendered markdown whose top-level blocks carry `data-source-start` (Markdown `sourceBlocks`). */
export const MARKDOWN_ROOT = "[data-annotated-markdown]";
const SOURCE_BLOCK = "[data-source-start]";
/** Parts of a top-level block that are commented on by themselves. */
const SUB_BLOCK = "li,tr";
const HEADING = /^h([1-6])$/;
const ANCHOR_PREFIX = "md:";
/** Share of words a reworded block must keep to be taken for the original. */
export const MARKDOWN_SIMILARITY_THRESHOLD = 0.6;
const MAX_LABEL_TEXT = 60;

function normalizeText(text: string | null): string {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

function blockText(element: Element): string {
  return normalizeText(element.textContent).slice(0, COMMENT_LOCATOR_TEXT_LIMIT);
}

type OutlineEntry = { block: Element; path: string[]; line: number };

/** Every top-level block of `root` in document order, with the heading path it sits under. */
function outline(root: Element): OutlineEntry[] {
  const stack: { level: number; text: string }[] = [];
  return [...root.querySelectorAll(SOURCE_BLOCK)]
    .filter((block) => !block.parentElement?.closest(SOURCE_BLOCK))
    .map((block) => {
      const level = HEADING.exec(block.tagName.toLowerCase())?.[1];
      if (level) {
        while (stack.length > 0 && (stack.at(-1)?.level ?? 0) >= Number(level)) stack.pop();
        stack.push({ level: Number(level), text: blockText(block) });
      }
      return {
        block,
        path: stack.map((heading) => heading.text),
        line: Number((block as HTMLElement).dataset.sourceStart),
      };
    });
}

type Candidate = { element: Element; path: string[]; line: number };

function candidates(root: Element): Candidate[] {
  return outline(root).flatMap(({ block, path, line }) => [
    { element: block, path, line },
    ...[...block.querySelectorAll(SUB_BLOCK)].map((element) => ({ element, path, line })),
  ]);
}

function samePath(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((text, index) => text === b[index]);
}

/**
 * The block a click inside rendered markdown comments on: the list item or
 * table row it is in, else its top-level block. A block without text (a rule,
 * an image) yields its section heading, since text is what finds it again.
 * Null outside rendered markdown or outside every block.
 */
export function markdownTarget(target: Element): { root: Element; block: Element } | null {
  const root = target.closest(MARKDOWN_ROOT);
  const top = target.closest(SOURCE_BLOCK);
  if (!root || !top || !root.contains(top)) return null;
  const sub = target.closest(SUB_BLOCK);
  const block = sub && top.contains(sub) ? sub : top;
  if (blockText(block) !== "") return { root, block };
  const entries = outline(root);
  const index = entries.findIndex((entry) => entry.block === top || entry.block.contains(top));
  const heading = entries
    .slice(0, index + 1)
    .reverse()
    .find((entry) => HEADING.test(entry.block.tagName.toLowerCase()));
  return heading ? { root, block: heading.block } : null;
}

/** The locator describing a block `markdownTarget` returned. */
export function markdownLocator(block: Element, root: Element): MarkdownLocator {
  const found = candidates(root).find((candidate) => candidate.element === block);
  if (!found) throw new Error("markdownLocator: the block is not part of the rendered markdown");
  return {
    kind: "markdown",
    path: found.path,
    tag: block.tagName.toLowerCase(),
    text: blockText(block),
    ...(Number.isInteger(found.line) && found.line > 0 ? { line: found.line } : {}),
  };
}

/** The anchor for a markdown block: its locator without the line, so later comments on the block share it. */
export function markdownAnchor(locator: MarkdownLocator): string {
  return `${ANCHOR_PREFIX}${JSON.stringify([locator.path, locator.tag, locator.text])}`;
}

/** The locator a markdown anchor encodes, or null for any other anchor. */
export function parseMarkdownAnchor(anchor: string): MarkdownLocator | null {
  if (!anchor.startsWith(ANCHOR_PREFIX)) return null;
  const parsed: unknown = JSON.parse(anchor.slice(ANCHOR_PREFIX.length));
  const [path, tag, text] = Array.isArray(parsed) ? parsed : [];
  if (
    !Array.isArray(path) ||
    !path.every((heading) => typeof heading === "string") ||
    typeof tag !== "string" ||
    typeof text !== "string"
  ) {
    throw new Error(`malformed markdown comment anchor ${JSON.stringify(anchor)}`);
  }
  return { kind: "markdown", path, tag, text };
}

function words(text: string): Set<string> {
  return new Set(text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []);
}

function similarity(a: string, b: string): number {
  const left = words(a);
  const right = words(b);
  const shared = [...left].filter((word) => right.has(word)).length;
  const union = left.size + right.size - shared;
  return union === 0 ? 0 : shared / union;
}

/** The one candidate, or the one nearest the captured line when several match. */
function nearest(found: Candidate[], line: number | undefined): Element | null {
  if (found.length <= 1) return found[0]?.element ?? null;
  if (line === undefined) return null;
  const distance = (candidate: Candidate) => Math.abs(candidate.line - line);
  const sorted = [...found].sort((a, b) => distance(a) - distance(b));
  const [first, second] = sorted;
  return first && second && distance(first) === distance(second) ? null : (first?.element ?? null);
}

export type MarkdownResolution = {
  element: Element;
  /** How the block was found: unchanged in its section, reworded in it, or by text elsewhere. */
  how: "exact" | "edited" | "relocated";
};

/**
 * Finds a commented block again: by its text within its section, then the
 * section's most similar block of the same kind, then its text anywhere.
 */
export function resolveMarkdown(root: Element, locator: MarkdownLocator): MarkdownResolution | null {
  const all = candidates(root).filter((candidate) => candidate.element.tagName.toLowerCase() === locator.tag);
  const section = all.filter((candidate) => samePath(candidate.path, locator.path));
  const sameText = (candidate: Candidate) => blockText(candidate.element) === locator.text;

  const exact = nearest(section.filter(sameText), locator.line);
  if (exact) return { element: exact, how: "exact" };

  const scored = section
    .map((candidate) => ({ candidate, score: similarity(blockText(candidate.element), locator.text) }))
    .filter(({ score }) => score >= MARKDOWN_SIMILARITY_THRESHOLD)
    .sort((a, b) => b.score - a.score);
  const [best, runnerUp] = scored;
  if (best && best.score !== runnerUp?.score) return { element: best.candidate.element, how: "edited" };

  const relocated = nearest(all.filter(sameText), locator.line);
  return relocated ? { element: relocated, how: "relocated" } : null;
}

const BLOCK_NAMES: Record<string, string> = {
  p: "paragraph",
  li: "list item",
  ul: "list",
  ol: "list",
  tr: "table row",
  blockquote: "quote",
  div: "block",
  pre: "code",
};

/** Reader-facing description of a markdown block: its section, its kind and its opening words. */
export function describeMarkdown(locator: Pick<MarkdownLocator, "path" | "tag" | "text">): string {
  const heading = HEADING.test(locator.tag);
  const kind = heading ? "heading" : (BLOCK_NAMES[locator.tag] ?? locator.tag);
  // A heading is the last entry of its own path.
  const path = heading ? locator.path.slice(0, -1) : locator.path;
  const text =
    locator.text.length > MAX_LABEL_TEXT ? `${locator.text.slice(0, MAX_LABEL_TEXT)}…` : locator.text;
  const section = path.length > 0 ? `${path.join(" › ")} — ` : "";
  return `${section}${kind} “${text}”`;
}
