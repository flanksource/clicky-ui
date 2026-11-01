// Anchors on text in a source file that has no rendered form (code, config):
// the quote is found again by the characters around it, and the line it was
// on only picks between repeats, so edits elsewhere in the file never move it.

import type { SourceSpan } from "./quote-anchor";

/** A quote in the file with the text right before and after it, and the 1-based line it started on. */
export type SourceLocator = { line: number; prefix: string; quote: string; suffix: string };

/** A position in the file: 1-based line, 0-based column. */
export type SourcePoint = { line: number; column: number };

export const SOURCE_PREFIX = "s:";

/** Context kept on each side of a quote. */
const CONTEXT_CHARS = 24;
/** Longest quote shown in a thread label. */
const LABEL_CHARS = 60;

export function sourceAnchor(locator: SourceLocator): string {
  return `${SOURCE_PREFIX}${JSON.stringify([locator.line, locator.prefix, locator.quote, locator.suffix])}`;
}

/** The locator an `s:` anchor encodes; throws for a malformed one. */
export function parseSourceAnchor(anchor: string): SourceLocator {
  if (!anchor.startsWith(SOURCE_PREFIX)) throw new Error(`not a source anchor: ${JSON.stringify(anchor)}`);
  const parsed: unknown = JSON.parse(anchor.slice(SOURCE_PREFIX.length));
  const [line, prefix, quote, suffix] = Array.isArray(parsed) ? parsed : [];
  if (!Number.isInteger(line) || line < 1 || typeof prefix !== "string" || typeof quote !== "string" || typeof suffix !== "string") {
    throw new Error(`malformed source anchor ${JSON.stringify(anchor)}`);
  }
  return { line, prefix, quote, suffix };
}

function lineStarts(source: string): number[] {
  const starts = [0];
  for (let i = source.indexOf("\n"); i !== -1; i = source.indexOf("\n", i + 1)) starts.push(i + 1);
  return starts;
}

/** The offset of a point; a column past the line's end (an empty line's placeholder) clamps to it. */
function offsetOf(source: string, starts: readonly number[], point: SourcePoint): number {
  const start = starts[point.line - 1];
  if (start === undefined) throw new Error(`line ${point.line} is outside the ${starts.length}-line source`);
  const end = starts[point.line] === undefined ? source.length : starts[point.line]! - 1;
  return Math.min(start + point.column, end);
}

/** 1-based line holding `offset`. */
function lineAt(starts: readonly number[], offset: number): number {
  let line = 1;
  while (line < starts.length && starts[line]! <= offset) line++;
  return line;
}

/** The locator for the text between two points, or null when it is only whitespace. */
export function locateSource(source: string, start: SourcePoint, end: SourcePoint): SourceLocator | null {
  const starts = lineStarts(source);
  const from = offsetOf(source, starts, start);
  const to = offsetOf(source, starts, end);
  const quote = source.slice(from, to);
  if (!quote.trim()) return null;
  return {
    line: lineAt(starts, from),
    prefix: source.slice(Math.max(0, from - CONTEXT_CHARS), from),
    quote,
    suffix: source.slice(to, to + CONTEXT_CHARS),
  };
}

/**
 * Where the quote is now, cut into per-line spans: the occurrence with the
 * same surrounding text that is nearest its original line. Empty when the
 * quote or its context has changed.
 */
export function resolveSource(source: string, locator: SourceLocator): SourceSpan[] {
  const needle = locator.prefix + locator.quote + locator.suffix;
  const starts = lineStarts(source);
  let best: number | null = null;
  let bestDistance = Infinity;
  for (let i = source.indexOf(needle); i !== -1; i = source.indexOf(needle, i + 1)) {
    const at = i + locator.prefix.length;
    const distance = Math.abs(lineAt(starts, at) - locator.line);
    if (distance < bestDistance) {
      best = at;
      bestDistance = distance;
    }
  }
  if (best === null) return [];
  const end = best + locator.quote.length;
  const spans: SourceSpan[] = [];
  for (let line = lineAt(starts, best); line <= starts.length && starts[line - 1]! < end; line++) {
    const lineStart = starts[line - 1]!;
    const lineEnd = starts[line] === undefined ? source.length : starts[line]! - 1;
    const span = { line, start: Math.max(best, lineStart) - lineStart, end: Math.min(end, lineEnd) - lineStart };
    if (span.end > span.start) spans.push(span);
  }
  return spans;
}

export function describeSource(locator: SourceLocator): string {
  const quote = locator.quote.replace(/\s+/g, " ").trim();
  return `Line ${locator.line} · “${quote.length > LABEL_CHARS ? `${quote.slice(0, LABEL_CHARS)}…` : quote}”`;
}
