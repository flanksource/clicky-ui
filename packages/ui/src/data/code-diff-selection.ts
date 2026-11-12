import type { DiffLine } from "./code-diff";

/** A changed line addressed by side and number: added lines are `new`, deleted lines `old`. */
export interface DiffSelectionTarget {
  side: "old" | "new";
  line: number;
}

export type DiffSelectionState = "none" | "partial" | "all";

/** The target of an added/deleted line; `undefined` for context lines, which have no box. */
export function diffLineTarget(line: DiffLine): DiffSelectionTarget | undefined {
  if (line.type === "add" && line.newNumber !== undefined) return { side: "new", line: line.newNumber };
  if (line.type === "remove" && line.oldNumber !== undefined) return { side: "old", line: line.oldNumber };
  return undefined;
}

/** Every changed line of a hunk, in order. */
export function hunkTargets(lines: DiffLine[]): DiffSelectionTarget[] {
  return lines.flatMap((line) => diffLineTarget(line) ?? []);
}

/** The changed lines between hunk-line indexes `from` and `to` inclusive, in either order: a shift-click range. */
export function rangeTargets(lines: DiffLine[], from: number, to: number): DiffSelectionTarget[] {
  const [lo, hi] = from <= to ? [from, to] : [to, from];
  return hunkTargets(lines.slice(lo, hi + 1));
}

export function selectionState(
  targets: DiffSelectionTarget[],
  isSelected: (target: DiffSelectionTarget) => boolean,
): DiffSelectionState {
  const count = targets.filter(isSelected).length;
  if (count === 0) return "none";
  return count === targets.length ? "all" : "partial";
}
