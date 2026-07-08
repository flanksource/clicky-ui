import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  isNearTop,
  isPinnedToBottom,
  nextVisibleCount,
  useSessionScroll,
  windowSlice,
} from "./use-session-scroll";

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

describe("windowSlice", () => {
  it("returns the last visibleCount items with older content remaining", () => {
    const { items, startIndex, hasMore } = windowSlice(range(100), 60);
    expect(items).toEqual(range(100).slice(40));
    expect(startIndex).toBe(40);
    expect(hasMore).toBe(true);
  });

  it("returns every item and no remainder when the window exceeds the list", () => {
    const { items, startIndex, hasMore } = windowSlice(range(10), 60);
    expect(items).toEqual(range(10));
    expect(startIndex).toBe(0);
    expect(hasMore).toBe(false);
  });
});

describe("nextVisibleCount", () => {
  it("grows by the batch size", () => {
    expect(nextVisibleCount(60, 40, 500)).toBe(100);
  });

  it("clamps at the total so the window never overshoots", () => {
    expect(nextVisibleCount(90, 40, 100)).toBe(100);
  });
});

describe("isPinnedToBottom", () => {
  it("is pinned within the threshold of the bottom", () => {
    expect(isPinnedToBottom({ scrollTop: 940, scrollHeight: 1000, clientHeight: 50 }, 64)).toBe(true);
  });

  it("is not pinned when scrolled up past the threshold", () => {
    expect(isPinnedToBottom({ scrollTop: 200, scrollHeight: 1000, clientHeight: 50 }, 64)).toBe(false);
  });
});

describe("isNearTop", () => {
  it("is near the top within the threshold", () => {
    expect(isNearTop(400, 600)).toBe(true);
  });

  it("is not near the top past the threshold", () => {
    expect(isNearTop(900, 600)).toBe(false);
  });
});

describe("useSessionScroll", () => {
  const opts = { windowSize: 60, batchSize: 40, resetKey: "session-1" };

  it("windows to the newest screenful when enabled", () => {
    const { result } = renderHook(() => useSessionScroll({ ...opts, total: 200, enabled: true }));
    expect(result.current.startIndex).toBe(140);
    expect(result.current.hasMore).toBe(true);
  });

  it("renders every event when disabled", () => {
    const { result } = renderHook(() => useSessionScroll({ ...opts, total: 200, enabled: false }));
    expect(result.current.startIndex).toBe(0);
    expect(result.current.hasMore).toBe(false);
  });

  it("has no older content when the session fits in the window", () => {
    const { result } = renderHook(() => useSessionScroll({ ...opts, total: 10, enabled: true }));
    expect(result.current.startIndex).toBe(0);
    expect(result.current.hasMore).toBe(false);
  });
});
