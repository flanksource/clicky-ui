import type { HighlightedLine, HighlightedToken } from "../../data/code-highlight";
import type { SourceSpan } from "./quote-anchor";
import type { SourcePoint } from "./source-anchor";

/** A comment thread's quote located in the source. */
export type SourceMark = { anchor: string; spans: SourceSpan[] };

/** A run of one source line with one syntax token and one set of covering highlights. */
export type LineSegment = { start: number; text: string; anchors: string[]; token?: HighlightedToken };

/** The thread anchors a Source highlight covers; quote anchors hold spaces, so the attribute is a JSON list. */
export const markAnchors = (el: HTMLElement): string[] => JSON.parse(el.dataset.sourceComment!);

/** A source line cut wherever a syntax token or a comment highlight starts or ends. */
export function lineSegments(text: string, line: number, marks: readonly SourceMark[], tokens?: HighlightedLine): LineSegment[] {
  const here = marks.flatMap((m) => m.spans.filter((s) => s.line === line).map((s) => ({ ...s, anchor: m.anchor })));
  let at = 0;
  const starts = (tokens ?? []).map((token) => {
    const start = at;
    at += token.content.length;
    return { start, token };
  });
  const cuts = [...new Set([0, text.length, ...here.flatMap((s) => [s.start, s.end]), ...starts.map((t) => t.start)])]
    .filter((cut) => cut <= text.length)
    .sort((a, b) => a - b);
  return cuts.slice(0, -1).map((start, i) => {
    const token = starts.filter((t) => t.start <= start).at(-1)?.token;
    return {
      start,
      text: text.slice(start, cuts[i + 1]),
      anchors: here.filter((s) => s.start <= start && s.end > start).map((s) => s.anchor),
      ...(token ? { token } : {}),
    };
  });
}

/** The source points a selection runs between, or null when either end is outside the lines' text. */
export function sourceRangeOf(range: Range): { start: SourcePoint; end: SourcePoint } | null {
  const own = (node: Node) => (node instanceof Element ? node : node.parentElement)?.closest<HTMLElement>("[data-source-text]");
  const point = (node: Node, offset: number): SourcePoint | null => {
    const text = own(node);
    if (!text) return null;
    const lead = document.createRange();
    lead.setStart(text, 0);
    lead.setEnd(node, offset);
    return { line: Number(text.dataset.sourceText), column: lead.toString().length };
  };
  const start = point(range.startContainer, range.startOffset);
  const end = point(range.endContainer, range.endOffset);
  return start && end ? { start, end } : null;
}

/** The line and columns a selection covers, or null when it is not inside a single line's text. */
export function sourceSpanOf(range: Range): SourceSpan | null {
  const covered = sourceRangeOf(range);
  if (!covered || covered.start.line !== covered.end.line) return null;
  return { line: covered.start.line, start: covered.start.column, end: covered.end.column };
}
