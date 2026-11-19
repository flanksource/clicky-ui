import {
  capturePatch,
  describePatch,
  isPatchAnchor,
  matchPatch,
  parsePatchAnchor,
  patchAnchor,
  type PatchMatch,
} from "../../comments/anchoring/patch-anchor";
import type { PatchAnchor, TableCell, TextQuote } from "../../comments/annotation-types";
import { quoteLiesInLines } from "./quote-anchor";
import { describeCell } from "./table-cell";
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

/** What a host keeps beside a patch (never inside it) to sharpen its highlight: the selected words, and the table cell they lie in. */
export type PatchExtras = { quote?: TextQuote; cell?: TableCell };

/** The current lines of a placed patch, with the quote and cell it was made on, if any. */
export type PatchLineRange = { start: number; end: number } & PatchExtras;

/** Only the extras that are set, so none is spread as an undefined key. */
export const patchExtras = ({ quote, cell }: { quote?: TextQuote | undefined; cell?: TableCell | undefined }): PatchExtras => ({ ...(quote ? { quote } : {}), ...(cell ? { cell } : {}) });

/**
 * The current lines of every placement the file still contains exactly once,
 * with the `extras` each thread was written on, keyed by anchor.
 */
export function patchLineRanges(placements: ReadonlyMap<string, PatchPlacement>, extras: ReadonlyMap<string, PatchExtras> = new Map()): Map<string, PatchLineRange> {
  const ranges = new Map<string, PatchLineRange>();
  for (const { anchor, match } of placements.values()) {
    if (match.state === "matched") ranges.set(anchor, { start: match.startLine, end: match.endLine, ...patchExtras(extras.get(anchor) ?? {}) });
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
 * server requires; otherwise the patch alone anchors the thread. A `cell` (the
 * table cell the selection lies in) needs `lines` to be its row's one line, and
 * names the thread.
 */
export function patchDraft({
  raw,
  lines,
  quote,
  cell,
}: {
  raw: string;
  lines: LineRange;
  quote?: TextQuote | null | undefined;
  cell?: TableCell | null | undefined;
}): { anchor: string; label: string } & PatchExtras {
  if (cell && lines.startLine !== lines.endLine) throw new Error(`a table cell lies on one line, not lines ${lines.startLine}-${lines.endLine}`);
  const patch = capturePatch(raw, lines.startLine, lines.endLine);
  return {
    anchor: patchAnchor(patch),
    label: cell ? describeCell(cell) : describePatch(patch),
    ...(quote && quoteLiesInLines(quote, patch.lines) ? { quote } : {}),
    ...(cell ? { cell } : {}),
  };
}
