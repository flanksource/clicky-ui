import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";

// Progressive windowing for the SessionViewer log. A recorded session runs to
// thousands of rows (many with syntax-highlighted code blocks), so rendering the
// whole transcript blocks first paint. Instead we render the *newest* screenful,
// keep the view pinned to the bottom (most recent activity), and backfill older
// rows as the reader scrolls up — the classic reverse-infinite-scroll of a chat
// log. The pure helpers below hold the windowing math; the hook wires the DOM
// listeners that drive it. Load-more is driven off scroll position rather than an
// IntersectionObserver so it stays reliable in backgrounded/hidden tabs (where the
// browser pauses observer callbacks tied to the render loop).

/** The last `visibleCount` of `items`, plus where the window starts and whether
 *  older items remain above it. */
export function windowSlice<T>(
  items: readonly T[],
  visibleCount: number,
): { items: T[]; startIndex: number; hasMore: boolean } {
  const clamped = Math.max(0, Math.min(visibleCount, items.length));
  const startIndex = items.length - clamped;
  return { items: items.slice(startIndex), startIndex, hasMore: startIndex > 0 };
}

/** Grow the window by `batchSize`, never past `total`. */
export function nextVisibleCount(current: number, batchSize: number, total: number): number {
  return Math.min(current + Math.max(1, batchSize), total);
}

/** True when the scroll position sits within `threshold` px of the bottom. */
export function isPinnedToBottom(
  metrics: { scrollTop: number; scrollHeight: number; clientHeight: number },
  threshold: number,
): boolean {
  return metrics.scrollHeight - metrics.scrollTop - metrics.clientHeight <= threshold;
}

/** True when the scroll position sits within `threshold` px of the top. */
export function isNearTop(scrollTop: number, threshold: number): boolean {
  return scrollTop <= threshold;
}

export interface SessionScrollOptions {
  /** Number of filtered events available to render. */
  total: number;
  /** Turns the whole mechanism on; when false the hook renders every event. */
  enabled: boolean;
  /** Rows rendered on first paint (and after a session change). */
  windowSize: number;
  /** Rows added each time older content is loaded. */
  batchSize: number;
  /** Changing this resets the window and re-pins to the bottom — pass a value
   *  derived from the session identity, not the filter state. */
  resetKey: string;
  /** Distance (px) from the bottom still counted as "pinned". */
  bottomThreshold?: number;
  /** Distance (px) from the top at which older rows start loading. */
  topThreshold?: number;
}

export interface SessionScrollState {
  scrollRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  startIndex: number;
  hasMore: boolean;
}

const idleWindow = () =>
  (typeof window === "undefined" ? undefined : window) as
    | (Window & {
        requestIdleCallback?: (cb: () => void) => number;
        cancelIdleCallback?: (handle: number) => void;
      })
    | undefined;

export function useSessionScroll(options: SessionScrollOptions): SessionScrollState {
  const { total, enabled, windowSize, batchSize, resetKey } = options;
  const bottomThreshold = options.bottomThreshold ?? 64;
  const topThreshold = options.topThreshold ?? 600;

  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const anchorHeightRef = useRef<number | null>(null);
  const scrollBottomPendingRef = useRef(true);
  const loadingOlderRef = useRef(false);

  const [visibleCount, setVisibleCount] = useState(() => Math.min(windowSize, total));
  const effectiveCount = enabled ? visibleCount : total;
  const startIndex = Math.max(0, total - effectiveCount);
  const hasMore = enabled && startIndex > 0;
  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // Prepend an older batch, latching until the layout effect settles the prepend so
  // rapid scroll events don't stack multiple batches at once.
  const growOlder = useCallback(() => {
    if (loadingOlderRef.current || !hasMoreRef.current) return;
    loadingOlderRef.current = true;
    const el = scrollRef.current;
    anchorHeightRef.current = el ? el.scrollHeight : null;
    setVisibleCount((count) => nextVisibleCount(count, batchSize, total));
  }, [batchSize, total]);

  const growOlderRef = useRef(growOlder);
  growOlderRef.current = growOlder;

  // A new session (resetKey change) snaps back to the newest screenful and re-pins.
  useLayoutEffect(() => {
    if (!enabled) return;
    setVisibleCount(Math.min(windowSize, total));
    pinnedRef.current = true;
    loadingOlderRef.current = false;
    scrollBottomPendingRef.current = true;
  }, [enabled, resetKey, windowSize, total]);

  // After each commit, either snap to bottom (pending pin) or preserve the reader's
  // position when older rows were prepended (anchor), then release the load latch.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!enabled || !el) return;
    if (scrollBottomPendingRef.current) {
      scrollBottomPendingRef.current = false;
      anchorHeightRef.current = null;
      el.scrollTop = el.scrollHeight;
    } else if (anchorHeightRef.current != null) {
      el.scrollTop += el.scrollHeight - anchorHeightRef.current;
      anchorHeightRef.current = null;
    }
    loadingOlderRef.current = false;
  }, [enabled, visibleCount]);

  // Track pinned-to-bottom, and load older rows as the reader nears the top.
  useEffect(() => {
    const el = scrollRef.current;
    if (!enabled || !el) return;
    const onScroll = () => {
      pinnedRef.current = isPinnedToBottom(el, bottomThreshold);
      if (hasMoreRef.current && isNearTop(el.scrollTop, topThreshold)) growOlderRef.current();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [enabled, bottomThreshold, topThreshold]);

  // Keep the newest row in view as rows grow (shiki highlighting settles after paint).
  useEffect(() => {
    const content = contentRef.current;
    if (!enabled || !content || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (pinnedRef.current) scrollToBottom();
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [enabled, scrollToBottom]);

  // Prefetch one batch while idle so the first scroll up is instant.
  useEffect(() => {
    if (!enabled || !hasMore) return;
    const win = idleWindow();
    const request = win?.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancel = win?.cancelIdleCallback ?? window.clearTimeout;
    const handle = request(() => growOlderRef.current());
    return () => cancel(handle);
  }, [enabled, resetKey, hasMore]);

  return { scrollRef, contentRef, startIndex, hasMore };
}
