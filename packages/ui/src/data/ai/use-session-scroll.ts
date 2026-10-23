import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

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
  return {
    items: items.slice(startIndex),
    startIndex,
    hasMore: startIndex > 0,
  };
}

/** Grow the window by `batchSize`, never past `total`. */
export function nextVisibleCount(
  current: number,
  batchSize: number,
  total: number,
): number {
  return Math.min(current + Math.max(1, batchSize), total);
}

/** True when the scroll position sits within `threshold` px of the bottom. */
export function isPinnedToBottom(
  metrics: { scrollTop: number; scrollHeight: number; clientHeight: number },
  threshold: number,
): boolean {
  return (
    metrics.scrollHeight - metrics.scrollTop - metrics.clientHeight <= threshold
  );
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
  /** Identity of the first item. When it changes under the same resetKey while
   *  `total` grows, older items were prepended (a fetched page of history): the
   *  window grows to include them and the reader's position is kept. */
  firstKey?: string;
  /** Called as the reader scrolls up near the top with every local item
   *  already rendered — the cue to fetch older history. */
  onReachStart?: () => void;
}

export interface SessionScrollState {
  scrollRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  startIndex: number;
  hasMore: boolean;
  following: boolean;
  jumpToStart: () => void;
  resumeFollowing: () => void;
}

export function useSessionScroll(
  options: SessionScrollOptions,
): SessionScrollState {
  const { total, enabled, windowSize, batchSize, resetKey } = options;
  const bottomThreshold = options.bottomThreshold ?? 64;
  const topThreshold = options.topThreshold ?? 600;

  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const followingRef = useRef(true);
  const lastScrollTopRef = useRef(0);
  const anchorHeightRef = useRef<number | null>(null);
  const scrollStartPendingRef = useRef(false);
  const scrollBottomPendingRef = useRef(true);
  const loadingOlderRef = useRef(false);
  const firstKey = options.firstKey;
  const previousTotalRef = useRef({ resetKey, total, firstKey });
  const lastScrollHeightRef = useRef<number | null>(null);
  const prependedRef = useRef(false);
  const onReachStartRef = useRef(options.onReachStart);
  onReachStartRef.current = options.onReachStart;

  const [visibleCount, setVisibleCount] = useState(windowSize);
  const [following, setFollowing] = useState(true);
  // A prepend grows the window during render, so the commit that mounts the
  // older rows is the one whose layout effect restores the reader's position.
  const [tracked, setTracked] = useState({ resetKey, total, firstKey });
  if (
    tracked.resetKey !== resetKey ||
    tracked.total !== total ||
    tracked.firstKey !== firstKey
  ) {
    if (
      enabled &&
      tracked.resetKey === resetKey &&
      tracked.firstKey !== firstKey &&
      total > tracked.total
    ) {
      prependedRef.current = true;
      setVisibleCount((count) => count + total - tracked.total);
    }
    setTracked({ resetKey, total, firstKey });
  }
  const effectiveCount = enabled ? visibleCount : total;
  const startIndex = Math.max(0, total - effectiveCount);
  const hasMore = enabled && startIndex > 0;
  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
      lastScrollTopRef.current = el.scrollTop;
    }
  }, []);

  const resumeFollowing = useCallback(() => {
    scrollStartPendingRef.current = false;
    followingRef.current = true;
    setFollowing(true);
    scrollToBottom();
  }, [scrollToBottom]);

  const jumpToStart = useCallback(() => {
    followingRef.current = false;
    setFollowing(false);
    anchorHeightRef.current = null;
    scrollBottomPendingRef.current = false;
    if (hasMoreRef.current) {
      scrollStartPendingRef.current = true;
      setVisibleCount(total);
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      lastScrollTopRef.current = 0;
    }
  }, [total]);

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
    setVisibleCount(windowSize);
    followingRef.current = true;
    setFollowing(true);
    loadingOlderRef.current = false;
    scrollStartPendingRef.current = false;
    scrollBottomPendingRef.current = true;
  }, [enabled, resetKey, windowSize]);

  useLayoutEffect(() => {
    const previous = previousTotalRef.current;
    previousTotalRef.current = { resetKey, total, firstKey };
    if (
      enabled &&
      previous.resetKey === resetKey &&
      previous.firstKey === firstKey &&
      !followingRef.current &&
      total > previous.total
    ) {
      setVisibleCount((count) => count + total - previous.total);
    }
  }, [enabled, resetKey, total, firstKey]);

  // After each commit, either snap to bottom (pending pin) or preserve the reader's
  // position when older rows were prepended (anchor), then release the load latch.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!enabled || !el) return;
    if (scrollStartPendingRef.current) {
      scrollStartPendingRef.current = false;
      el.scrollTop = 0;
      lastScrollTopRef.current = 0;
    } else if (scrollBottomPendingRef.current) {
      scrollBottomPendingRef.current = false;
      anchorHeightRef.current = null;
      scrollToBottom();
    } else if (prependedRef.current && lastScrollHeightRef.current != null) {
      el.scrollTop += el.scrollHeight - lastScrollHeightRef.current;
      lastScrollTopRef.current = el.scrollTop;
    } else if (anchorHeightRef.current != null) {
      el.scrollTop += el.scrollHeight - anchorHeightRef.current;
      anchorHeightRef.current = null;
      lastScrollTopRef.current = el.scrollTop;
    } else if (followingRef.current) {
      scrollToBottom();
    }
    prependedRef.current = false;
    lastScrollHeightRef.current = el.scrollHeight;
    loadingOlderRef.current = false;
  }, [enabled, visibleCount, total, scrollToBottom]);

  // Track pinned-to-bottom, and load older rows as the reader nears the top.
  useEffect(() => {
    const el = scrollRef.current;
    if (!enabled || !el) return;
    const onScroll = () => {
      const movedUp = el.scrollTop < lastScrollTopRef.current;
      if (movedUp || !isPinnedToBottom(el, bottomThreshold)) {
        followingRef.current = false;
        setFollowing(false);
      }
      lastScrollTopRef.current = el.scrollTop;
      lastScrollHeightRef.current = el.scrollHeight;
      if (movedUp && isNearTop(el.scrollTop, topThreshold)) loadOlder();
    };
    const onWheel = (event: WheelEvent) => {
      if (event.deltaY >= 0) return;
      followingRef.current = false;
      setFollowing(false);
      if (isNearTop(el.scrollTop, topThreshold)) loadOlder();
    };
    // Rendered rows first; once every local row is mounted, ask for history.
    const loadOlder = () => {
      if (hasMoreRef.current) growOlderRef.current();
      else onReachStartRef.current?.();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", onWheel);
    };
  }, [enabled, bottomThreshold, topThreshold]);

  // Keep the newest row in view as rows grow (shiki highlighting settles after paint).
  useEffect(() => {
    const content = contentRef.current;
    if (!enabled || !content || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (followingRef.current) scrollToBottom();
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [enabled, scrollToBottom]);

  return {
    scrollRef,
    contentRef,
    startIndex,
    hasMore,
    following,
    jumpToStart,
    resumeFollowing,
  };
}
