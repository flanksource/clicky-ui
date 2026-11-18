import {
  capturePatch,
  describePatch,
  isPatchAnchor,
  matchPatch,
  parsePatchAnchor,
  patchAnchor,
  type PatchMatch,
} from "../../comments/anchoring/patch-anchor";
import type { PatchAnchor, TextQuote } from "../../comments/annotation-types";
import { quoteLiesInLines } from "./quote-anchor";
import type { LineRange } from "./selection-lines";
import type { SourceMark } from "./source-marks";

/** An `r:` thread's patch and where it sits in the file's current text. */
export type PatchPlacement = { anchor: string; patch: PatchAnchor; match: PatchMatch };

/** Where each `r:` anchor in `anchors` sits in `raw` now; other kinds of anchor are left out. */
export function placePatches(raw: string, anchors: readonly string[]): Map<string, PatchPlacement> {
  return new Map(
    anchors.filter(isPatchAnchor).map((anchor) => {
      const patch = parsePatchAnchor(anchor);
      return [anchor, { anchor, patch, match: matchPatch(raw, patch) }];
    }),
  );
}

/** The current lines of a placed patch, with the quote it was made on, if any. */
export type PatchLineRange = { start: number; end: number; quote?: TextQuote };

/**
 * The current lines of every placement the file still contains exactly once.
 * `quotes` are the selected words each thread was written on, kept by the host
 * beside the patch (never in the anchor), keyed by anchor.
 */
export function patchLineRanges(placements: ReadonlyMap<string, PatchPlacement>, quotes: ReadonlyMap<string, TextQuote> = new Map()): Map<string, PatchLineRange> {
  const ranges = new Map<string, PatchLineRange>();
  for (const { anchor, match } of placements.values()) {
    const quote = quotes.get(anchor);
    if (match.state === "matched") ranges.set(anchor, { start: match.startLine, end: match.endLine, ...(quote ? { quote } : {}) });
  }
  return ranges;
}

/** Source highlights for the placed patches: one whole-line span per covered line. */
export function patchSourceMarks(raw: string, placements: ReadonlyMap<string, PatchPlacement>): SourceMark[] {
  const lines = raw.split("\n");
  return [...patchLineRanges(placements)].map(([anchor, { start, end }]) => ({
    anchor,
    spans: Array.from({ length: end - start + 1 }, (_, i) => ({ line: start + i, start: 0, end: lines[start + i - 1]?.length ?? 0 })),
  }));
}

/** The lines a placed thread covers now; for one that cannot be placed, why, and the lines it was captured on. */
export function patchLabel({ patch, match }: PatchPlacement): string {
  if (match.state === "matched") return describePatch({ ...patch, startLine: match.startLine, endLine: match.endLine });
  return `${match.state === "outdated" ? "Outdated" : "Ambiguous"} · ${describePatch(patch)}`;
}

/**
 * The anchor and label for a selection of `raw`'s lines. A `quote` of the
 * selected words is returned beside the anchor (the host stores it next to the
 * patch, never inside it) only when it lies inside those lines, which the
 * server requires; otherwise the patch alone anchors the thread.
 */
export function patchDraft({ raw, lines, quote }: { raw: string; lines: LineRange; quote?: TextQuote | null | undefined }): { anchor: string; label: string; quote?: TextQuote } {
  const patch = capturePatch(raw, lines.startLine, lines.endLine);
  return { anchor: patchAnchor(patch), label: describePatch(patch), ...(quote && quoteLiesInLines(quote, patch.lines) ? { quote } : {}) };
}
