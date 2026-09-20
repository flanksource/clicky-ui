import { autoUpdate, flip, offset, shift, size, useFloating, type Placement } from "@floating-ui/react";
import { useLayoutEffect, useMemo, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";

/**
 * Where a DataTable panel (the column menu, a column's filter) opens from: the
 * box it is anchored to — the pressed trigger, or the point of a right-click —
 * and which of that box's corners it starts at.
 */
export type ColumnMenuState = {
  reference: { x: number; y: number; width: number; height: number };
  placement: Placement;
  columnKey?: string;
};

export function menuStateFromPointer(event: ReactMouseEvent<HTMLElement>, columnKey?: string): ColumnMenuState {
  return {
    reference: { x: event.clientX, y: event.clientY, width: 0, height: 0 },
    placement: "bottom-start",
    ...(columnKey ? { columnKey } : {}),
  };
}

export function menuStateFromTrigger(event: ReactMouseEvent<HTMLElement>, columnKey?: string): ColumnMenuState {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    reference: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
    placement: "bottom-end",
    ...(columnKey ? { columnKey } : {}),
  };
}

const PANEL_PADDING = 8;

/**
 * useMenuPanelPosition places a fixed panel against its anchor and keeps all of
 * it on screen, whatever its height. The panel's height is measured, not
 * assumed: a column menu grows with every column, so one placed for a fixed
 * height ran off the bottom of the viewport, taking its last rows — the actions
 * — out of reach. It flips above the anchor when there is more room there, and
 * is capped to the room it has, so a panel taller than either side scrolls.
 */
export function useMenuPanelPosition(anchor: ColumnMenuState): {
  ref: (node: HTMLElement | null) => void;
  style: CSSProperties;
} {
  const { x, y, width, height } = anchor.reference;
  const reference = useMemo(
    () => ({
      getBoundingClientRect: () =>
        ({
          x,
          y,
          top: y,
          left: x,
          width,
          height,
          right: x + width,
          bottom: y + height,
          toJSON: () => ({}),
        }) as DOMRect,
    }),
    [x, y, width, height],
  );
  const { refs, floatingStyles } = useFloating({
    strategy: "fixed",
    placement: anchor.placement,
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ padding: PANEL_PADDING }),
      shift({ padding: PANEL_PADDING }),
      size({
        padding: PANEL_PADDING,
        apply({ availableHeight, elements }) {
          elements.floating.style.maxHeight = `${Math.max(0, Math.floor(availableHeight))}px`;
        },
      }),
    ],
  });
  useLayoutEffect(() => {
    refs.setPositionReference(reference);
  }, [refs, reference]);
  return { ref: refs.setFloating, style: floatingStyles };
}
