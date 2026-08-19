import { useCallback, useEffect, useRef } from "react";
import type { DataTableInfinite } from "./DataTable";

/**
 * useInfiniteRows turns the trailing sentinel's intersection callbacks into at
 * most one page request, and returns the callback DataTable hands the observer.
 *
 * The `loading` flag on its own is not a sufficient guard. One scroll delivers a
 * burst of intersections inside a single frame, long before the caller has
 * re-rendered with the flag set, so the burst would be spent asking for the same
 * page over and over. A request therefore latches, and the latch is released
 * only by the caller answering: rows arriving, or `loading` moving — which is
 * also what stops a page that legitimately returned nothing from wedging the
 * list closed. Everything else the observer delivers in between is dropped.
 *
 * `infinite` is read through a ref because callers rebuild it inline on every
 * render. Depending on it directly would give the returned callback a new
 * identity each time, and DataTable would tear down and re-create the
 * IntersectionObserver with it.
 */
export function useInfiniteRows(
  infinite: DataTableInfinite | undefined,
  rowCount: number,
): () => void {
  const latest = useRef(infinite);
  latest.current = infinite;
  const pending = useRef(false);
  const loading = infinite?.loading ?? false;

  useEffect(() => {
    pending.current = false;
  }, [loading, rowCount]);

  return useCallback(() => {
    const current = latest.current;
    if (!current || current.loading || !current.hasMore || pending.current) return;
    pending.current = true;
    current.onLoadMore();
  }, []);
}
