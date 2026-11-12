import {
  capturePatch,
  describePatch,
  isPatchAnchor,
  matchPatch,
  parsePatchAnchor,
  patchAnchor,
  type PatchMatch,
} from "../../comments/anchoring/patch-anchor";
import type { PatchAnchor } from "../../comments/annotation-types";
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

/** The current lines of every placement the file still contains exactly once. */
export function patchLineRanges(placements: ReadonlyMap<string, PatchPlacement>): Map<string, { start: number; end: number }> {
  const ranges = new Map<string, { start: number; end: number }>();
  for (const { anchor, match } of placements.values()) {
    if (match.state === "matched") ranges.set(anchor, { start: match.startLine, end: match.endLine });
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

/** Why a thread is listed apart from the text, for the placements that could not be placed. */
export function patchNote(match: PatchMatch): string | null {
  if (match.state === "outdated") return "The lines this was written on have changed or been removed.";
  if (match.state === "ambiguous") return "The lines this was written on appear more than once in the file.";
  return null;
}

/** The anchor and label for a selection of `raw`'s lines. */
export function patchDraft(raw: string, { startLine, endLine }: LineRange): { anchor: string; label: string } {
  const patch = capturePatch(raw, startLine, endLine);
  return { anchor: patchAnchor(patch), label: describePatch(patch) };
}
