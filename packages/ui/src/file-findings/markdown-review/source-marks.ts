import type { SourceSpan } from "./quote-anchor";

/** A comment thread's quote located in the raw markdown. */
export type SourceMark = { anchor: string; spans: SourceSpan[] };

/** The thread anchors a Source highlight covers; quote anchors hold spaces, so the attribute is a JSON list. */
export const markAnchors = (el: HTMLElement): string[] => JSON.parse(el.dataset.sourceComment!);

/** A source line cut where comment highlights start and end; each piece lists the anchors covering it. */
export function lineSegments(text: string, line: number, marks: readonly SourceMark[]) {
  const here = marks.flatMap((m) => m.spans.filter((s) => s.line === line).map((s) => ({ ...s, anchor: m.anchor })));
  const cuts = [...new Set([0, text.length, ...here.flatMap((s) => [s.start, s.end])])].sort((a, b) => a - b);
  return cuts.slice(0, -1).map((start, i) => ({
    start,
    text: text.slice(start, cuts[i + 1]),
    anchors: here.filter((s) => s.start <= start && s.end > start).map((s) => s.anchor),
  }));
}

/** The source line and columns a selection covers, or null when it is not inside a single line's text. */
export function sourceSpanOf(range: Range): SourceSpan | null {
  const own = (node: Node) => (node instanceof Element ? node : node.parentElement)?.closest<HTMLElement>("[data-source-text]");
  const text = own(range.startContainer);
  if (!text || text !== own(range.endContainer)) return null;
  const lead = document.createRange();
  lead.setStart(text, 0);
  lead.setEnd(range.startContainer, range.startOffset);
  const start = lead.toString().length;
  return { line: Number(text.dataset.sourceText), start, end: start + range.toString().length };
}
