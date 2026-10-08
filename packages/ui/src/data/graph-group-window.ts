// Scrolling the members of a windowed group (see `GroupMemberWindow`): which rows show, where shown
// members are drawn, and where the edges of hidden ones attach. Pure math, no React.

import type { GraphLayoutGroupBox, GroupMemberWindow } from "./graph-columns-layout";
import type { GraphLayoutPosition } from "./graph-layout";

/** Window starts, in rows, by group box id. A box without one starts at its first member. */
export type WindowStarts = Readonly<Record<string, number>>;

/** The start kept between the first row and the last full window. */
export function clampWindowStart(memberWindow: GroupMemberWindow, start: number): number {
  return Math.min(Math.max(0, memberWindow.members.length - memberWindow.rows), Math.max(0, Math.round(start)));
}

/** The start that brings member `id` into view, moving no further than needed; unchanged for a shown member or a stranger. */
export function revealWindowStart(memberWindow: GroupMemberWindow, start: number, id: string): number {
  const index = memberWindow.members.indexOf(id);
  const current = clampWindowStart(memberWindow, start);
  if (index < 0) return current;
  if (index < current) return index;
  return index >= current + memberWindow.rows ? clampWindowStart(memberWindow, index - memberWindow.rows + 1) : current;
}

/** The starts after revealing `id` in the windowed box holding it: the same object when nothing moves. */
export function revealMember(boxes: readonly GraphLayoutGroupBox[], starts: WindowStarts, id: string | undefined): WindowStarts {
  if (id === undefined) return starts;
  const box = boxes.find((candidate) => candidate.window?.members.includes(id));
  if (!box?.window) return starts;
  const current = starts[box.id] ?? 0;
  const next = revealWindowStart(box.window, current, id);
  return next === clampWindowStart(box.window, current) ? starts : { ...starts, [box.id]: next };
}

export interface WindowedPositions {
  positions: Record<string, GraphLayoutPosition>;
  /** Members scrolled out of view: not drawn, their edges attached at the window's edge. */
  hidden: Set<string>;
}

/**
 * Where each node is drawn once windows scroll: a shown member moves up by the rows scrolled past, a
 * member above the window sits on its top edge and one below on its bottom edge, so its edges still
 * reach the group. Every other node keeps its layout position.
 */
export function windowedPositions(
  positions: Readonly<Record<string, GraphLayoutPosition>>,
  boxes: readonly GraphLayoutGroupBox[],
  starts: WindowStarts,
): WindowedPositions {
  const moved: Record<string, GraphLayoutPosition> = { ...positions };
  const hidden = new Set<string>();
  for (const box of boxes) {
    const memberWindow = box.window;
    if (!memberWindow) continue;
    const start = clampWindowStart(memberWindow, starts[box.id] ?? 0);
    const shift = memberWindow.tops[start] ?? 0;
    memberWindow.members.forEach((id, index) => {
      const at = positions[id];
      if (!at) throw new Error(`GraphDiagram: windowed member "${id}" of "${box.id}" has no layout position`);
      if (index < start || index >= start + memberWindow.rows) {
        hidden.add(id);
        moved[id] = { x: at.x, y: index < start ? memberWindow.top : memberWindow.top + memberWindow.height };
      } else {
        moved[id] = { x: at.x, y: at.y - shift };
      }
    });
  }
  return { positions: moved, hidden };
}

/** The rows shown, counted from one, as the footer says them. */
export function windowRows(memberWindow: GroupMemberWindow, start: number): { first: number; last: number; total: number } {
  const first = clampWindowStart(memberWindow, start);
  return { first: first + 1, last: Math.min(memberWindow.members.length, first + memberWindow.rows), total: memberWindow.members.length };
}

/** Whole rows of wheel travel, `rowPx` each, the remainder carried to the next event so small deltas add up. */
export function wheelRows(carry: number, deltaPx: number, rowPx: number): { rows: number; carry: number } {
  const total = carry + deltaPx;
  const rows = Math.trunc(total / rowPx);
  return { rows, carry: total - rows * rowPx };
}
