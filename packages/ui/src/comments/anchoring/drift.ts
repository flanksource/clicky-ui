/**
 * One vocabulary for anchors that no longer sit where they were made, whatever
 * kind of anchor they are, so every surface lists them in the same drift list:
 *
 * - `moved`: found, but only by a minority of its locators (`resolveComment` conflict);
 * - `ambiguous`: more than one place matches (a repeated patch hunk, a repeated quote);
 * - `outdated`: a patch whose lines changed or were removed;
 * - `orphaned`: an element or words that are gone.
 *
 * A thread in drift is kept and listed, never hidden or silently repositioned.
 */
import type { CommentMatch } from "./dom-anchor";
import type { PatchMatch } from "./patch-anchor";
import type { WebTextMatch } from "./web-text-anchor";

export type DriftState = "moved" | "ambiguous" | "outdated" | "orphaned";

/** What a drifted anchor is placed by: source lines, a page element, or words on a page. */
export type DriftSubject = "lines" | "element" | "text";

/** An anchor in drift, as a surface hands it to the drift list. */
export type AnchorDrift = {
  state: DriftState;
  /** Why, in a sentence; `driftNote` has the standard one. */
  note?: string | undefined;
  /** False when this anchor cannot be re-picked from where the list is shown (default true). */
  reanchor?: boolean | undefined;
};

export const DRIFT_LABEL: Record<DriftState, string> = {
  moved: "Moved",
  ambiguous: "Ambiguous",
  outdated: "Outdated",
  orphaned: "Orphaned",
};

export function patchDrift(match: PatchMatch): DriftState | null {
  return match.state === "matched" ? null : match.state;
}

/** Null when `match` found its element and its locators agree. */
export function elementDrift(match: CommentMatch | null): DriftState | null {
  if (!match) return "orphaned";
  return match.conflict ? "moved" : null;
}

export function webTextDrift(match: WebTextMatch): DriftState | null {
  return match.state === "matched" ? null : match.state;
}

const MOVED = "Its element was found somewhere other than where it was written; check it before relying on it.";

const NOTES: Record<DriftSubject, Partial<Record<DriftState, string>>> = {
  lines: {
    outdated: "The lines this was written on have changed or been removed.",
    ambiguous: "The lines this was written on appear more than once in the file.",
  },
  element: {
    orphaned: "The element this was written on is no longer in the document.",
    moved: MOVED,
  },
  text: {
    orphaned: "The words this was written on are no longer in the document.",
    moved: MOVED,
    ambiguous: "The words this was written on appear more than once where it was written.",
  },
};

export function driftNote(state: DriftState, subject: DriftSubject): string {
  const note = NOTES[subject][state];
  if (!note) throw new Error(`an anchor on ${subject} cannot be ${state}`);
  return note;
}
