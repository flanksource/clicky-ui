import { useCallback, useEffect, useMemo, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

// Row virtualization for DataTable. A table of a few thousand rows costs tens of
// thousands of DOM nodes (measured at ~48 per row on a real dashboard), which is
// enough to stall first paint and make every subsequent re-render expensive.
// Virtualizing keeps only the rows near the viewport in the DOM and represents
// the rest with two spacer rows.
//
// This replaces an earlier `clientReveal` batch window, which kept a
// `visibleCount` in component state and reset it whenever the `data` array
// changed identity — so a parent that rebuilt its rows array (even with
// identical contents) threw away everything the reader had scrolled to. There is
// deliberately no window state here: scroll offset lives in the DOM and row
// measurements are keyed by row id, so a same-content-new-identity array is a
// no-op.
//
// Row heights are measured rather than assumed. Cells are `align-top` with
// density padding and arbitrary caller-rendered content, so a fixed row height
// would be wrong for any table with wrapping cells.

/** Resolved form of the `virtualize` prop. */
export interface VirtualizeOptions {
  overscan: number;
  estimateRowHeight: number;
}

// Overscan is deliberately higher than the virtualizer's default of 5: a row
// carrying wrapped text or a tag list can be several times the estimate, so a
// tight window shows gaps while fast-scrolling.
const DEFAULT_OVERSCAN = 8;
// A comfortable-density single-line row. Only the starting guess — every
// rendered row is measured and the estimate stops mattering once it has been.
const DEFAULT_ESTIMATE_ROW_HEIGHT = 40;

export function resolveVirtualizeOptions(
  virtualize: boolean | Partial<VirtualizeOptions> | undefined,
): VirtualizeOptions | null {
  if (!virtualize) return null;
  const opts = typeof virtualize === "object" ? virtualize : {};
  return {
    overscan: opts.overscan ?? DEFAULT_OVERSCAN,
    estimateRowHeight: opts.estimateRowHeight ?? DEFAULT_ESTIMATE_ROW_HEIGHT,
  };
}

/** Heights of the spacer rows that stand in for the rows outside the window.
 *  `scrollMargin` is the distance from the scroll container's top to the first
 *  virtualized row — the sticky `<thead>` occupies real layout space, so
 *  without subtracting it every offset is shifted by the header's height. */
export function spacerHeights(
  items: readonly { start: number; end: number }[],
  totalSize: number,
  scrollMargin: number,
): { top: number; bottom: number } {
  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) return { top: 0, bottom: 0 };
  return {
    top: Math.max(0, first.start - scrollMargin),
    bottom: Math.max(0, totalSize - (last.end - scrollMargin)),
  };
}

/**
 * Wires a virtualizer to DataTable's own scroll container.
 *
 * The scroll element is tracked in state rather than a ref because
 * `getScrollElement` is read during render, before a ref would be attached, and
 * nothing would re-run the virtualizer once it was.
 */
export function useDataTableVirtual({
  count,
  options,
  getItemKey,
}: {
  count: number;
  options: VirtualizeOptions | null;
  getItemKey: (index: number) => string;
}) {
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const [tbodyEl, setTbodyEl] = useState<HTMLTableSectionElement | null>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  // The sticky header sits inside the scroll container, so the first row starts
  // below it. Re-measure when the header can change height: density switches and
  // a filter bar that wraps at narrow widths both move it.
  useEffect(() => {
    if (!options || !tbodyEl) return;
    const measure = () => setScrollMargin(tbodyEl.offsetTop);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    if (tbodyEl.parentElement) observer.observe(tbodyEl.parentElement);
    return () => observer.disconnect();
  }, [options, tbodyEl]);

  const estimateSize = useCallback(
    () => options?.estimateRowHeight ?? DEFAULT_ESTIMATE_ROW_HEIGHT,
    [options?.estimateRowHeight],
  );

  const virtualizer = useVirtualizer({
    count: options ? count : 0,
    getScrollElement: () => scrollEl,
    estimateSize,
    overscan: options?.overscan ?? DEFAULT_OVERSCAN,
    getItemKey,
    scrollMargin,
  });

  const virtualItems = options ? virtualizer.getVirtualItems() : [];
  const spacers = useMemo(
    () => spacerHeights(virtualItems, virtualizer.getTotalSize(), scrollMargin),
    // getTotalSize() is derived from the measurement cache, which the
    // virtualizer mutates; virtualItems changing is the signal that it moved.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [virtualItems, scrollMargin],
  );

  return {
    enabled: !!options,
    setScrollEl,
    setTbodyEl,
    virtualizer,
    virtualItems,
    spacers,
  };
}
