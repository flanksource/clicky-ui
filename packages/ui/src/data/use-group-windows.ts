import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { GraphLayoutGroupBox } from "./graph-columns-layout";
import { clampWindowStart, revealMember, wheelRows, windowedPositions, type WindowedPositions, type WindowStarts } from "./graph-group-window";
import type { GraphLayoutPosition } from "./graph-layout";

const DOM_DELTA_LINE = 1;
const DOM_DELTA_PAGE = 2;

export interface GroupWindows extends WindowedPositions {
  starts: WindowStarts;
  /** Scrolls a windowed box by `rows`, kept within its members. */
  scroll: (boxId: string, rows: number) => void;
}

interface UseGroupWindowsOptions {
  boxes: readonly GraphLayoutGroupBox[];
  positions: Record<string, GraphLayoutPosition>;
  /** The member kept in view: scrolled to whenever it changes. */
  reveal: string | undefined;
  /** The stage the boxes and nodes are drawn on: a wheel over a windowed group there scrolls it. */
  stageRef: RefObject<HTMLElement | null>;
  /** The stage's zoom, so a row of wheel travel is a row on screen. */
  scale: number;
}

/**
 * Each windowed group's scroll position, and the positions it draws members at. A plain wheel over a
 * windowed group, or over one of its members, scrolls the group and goes no further, so it never zooms
 * the diagram; ctrl/meta + wheel still does.
 */
export function useGroupWindows({ boxes, positions, reveal, stageRef, scale }: UseGroupWindowsOptions): GroupWindows {
  const [starts, setStarts] = useState<WindowStarts>(() => revealMember(boxes, {}, reveal));
  const [revealed, setRevealed] = useState(reveal);
  if (reveal !== revealed) {
    setRevealed(reveal);
    setStarts((current) => revealMember(boxes, current, reveal));
  }
  const live = useRef({ boxes, scale });
  live.current = { boxes, scale };

  const scroll = useCallback((boxId: string, rows: number) => {
    const memberWindow = live.current.boxes.find((box) => box.id === boxId)?.window;
    if (!memberWindow) throw new Error(`GraphDiagram: group box "${boxId}" has no member window to scroll`);
    setStarts((current) => {
      const next = clampWindowStart(memberWindow, (current[boxId] ?? 0) + rows);
      return next === clampWindowStart(memberWindow, current[boxId] ?? 0) ? current : { ...current, [boxId]: next };
    });
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let carry = { boxId: "", px: 0 };
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || !(event.target instanceof Element)) return;
      const boxId = event.target.closest("[data-graph-window]")?.getAttribute("data-graph-window");
      const memberWindow = live.current.boxes.find((box) => box.id === boxId)?.window;
      if (!boxId || !memberWindow) return;
      event.preventDefault();
      event.stopPropagation();
      const rowPx = (memberWindow.height / memberWindow.rows) * live.current.scale;
      const unit = event.deltaMode === DOM_DELTA_LINE ? rowPx : event.deltaMode === DOM_DELTA_PAGE ? rowPx * memberWindow.rows : 1;
      const moved = wheelRows(carry.boxId === boxId ? carry.px : 0, event.deltaY * unit, rowPx);
      carry = { boxId, px: moved.carry };
      if (moved.rows !== 0) scroll(boxId, moved.rows);
    };
    // React registers wheel listeners as passive, which cannot keep the wheel from zooming the viewport.
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [stageRef, scroll]);

  const windowed = useMemo(() => windowedPositions(positions, boxes, starts), [positions, boxes, starts]);
  return { ...windowed, starts, scroll };
}
