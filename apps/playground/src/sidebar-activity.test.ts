import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("virtual:playground-page-activity", () => ({ default: {} }));
vi.mock("./live-server", () => ({ LIVE_SERVER: true }));

import { matchesActivity, mergeActivity, usePageActivity, type PageActivity } from "./sidebar-activity";

const COMMENTS_URL = "/__playground/comments/activity";
const UPDATES_URL = "/__playground/page-activity";

type Deferred = { resolve: (response: Response) => void; reject: (cause: unknown) => void };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function stubFetch(handlers: Record<string, (call: number) => Promise<Response>>) {
  const calls: Record<string, number> = {};
  vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    const handler = handlers[url];
    if (!handler) throw new Error(`Unexpected fetch: ${url}`);
    calls[url] = (calls[url] ?? 0) + 1;
    return handler(calls[url]);
  }));
}

function deferred(): Deferred & { promise: Promise<Response> } {
  let resolve!: Deferred["resolve"];
  let reject!: Deferred["reject"];
  const promise = new Promise<Response>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

afterEach(() => { vi.unstubAllGlobals(); });

describe("usePageActivity", () => {
  it("drops an older page-activity response that resolves after a newer one", async () => {
    const first = deferred();
    stubFetch({
      [COMMENTS_URL]: async () => json({ pages: {} }),
      [UPDATES_URL]: (call) => call === 1 ? first.promise : Promise.resolve(json({ updated: { "page-new": "2026-10-02T00:00:00Z" } })),
    });
    const { result } = renderHook(() => usePageActivity());
    act(() => { window.dispatchEvent(new Event("focus")); });
    await waitFor(() => expect(result.current.updates).toEqual({ "page-new": "2026-10-02T00:00:00Z" }));
    await act(async () => { first.resolve(json({ updated: { "page-old": "2026-10-01T00:00:00Z" } })); await first.promise; });
    expect(result.current.updates).toEqual({ "page-new": "2026-10-02T00:00:00Z" });
    expect(result.current.updatesError).toBeNull();
  });

  it("drops an older failure that resolves after a newer success", async () => {
    const first = deferred();
    stubFetch({
      [COMMENTS_URL]: async () => json({ pages: {} }),
      [UPDATES_URL]: (call) => call === 1 ? first.promise : Promise.resolve(json({ updated: {} })),
    });
    const { result } = renderHook(() => usePageActivity());
    act(() => { window.dispatchEvent(new Event("focus")); });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { first.reject(new Error("stale network failure")); await first.promise.catch(() => undefined); });
    expect(result.current.updatesError).toBeNull();
  });

  it("is not updatesReady until the first successful page-activity load", async () => {
    const first = deferred();
    stubFetch({
      [COMMENTS_URL]: async () => json({ pages: {} }),
      [UPDATES_URL]: () => first.promise,
    });
    const { result } = renderHook(() => usePageActivity());
    expect(result.current.updatesReady).toBe(false);
    await act(async () => { first.resolve(json({ updated: {} })); await first.promise; });
    await waitFor(() => expect(result.current.updatesReady).toBe(true));
  });

  it("stays not updatesReady when the first page-activity load fails", async () => {
    stubFetch({
      [COMMENTS_URL]: async () => json({ pages: {} }),
      [UPDATES_URL]: async () => json({ error: "git unavailable" }, 500),
    });
    const { result } = renderHook(() => usePageActivity());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.updatesReady).toBe(false);
    expect(result.current.updatesError).toBe("git unavailable");
  });

  it("stays updatesReady and reports updatesError when a later refresh fails", async () => {
    stubFetch({
      [COMMENTS_URL]: async () => json({ pages: {} }),
      [UPDATES_URL]: async (call) => call === 1 ? json({ updated: {} }) : json({ error: "git unavailable" }, 500),
    });
    const { result } = renderHook(() => usePageActivity());
    await waitFor(() => expect(result.current.updatesReady).toBe(true));
    act(() => { window.dispatchEvent(new Event("focus")); });
    await waitFor(() => expect(result.current.updatesError).toBe("git unavailable"));
    expect(result.current.updatesReady).toBe(true);
  });

  it("reports a comment-activity failure without touching updatesError", async () => {
    stubFetch({
      [COMMENTS_URL]: async () => json({}, 503),
      [UPDATES_URL]: async () => json({ updated: {} }),
    });
    const { result } = renderHook(() => usePageActivity());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.commentsError).toBe("Comment activity failed (503)");
    expect(result.current.updatesError).toBeNull();
  });

  it("reports a page-activity failure without touching commentsError", async () => {
    stubFetch({
      [COMMENTS_URL]: async () => json({ pages: {} }),
      [UPDATES_URL]: async () => json({ error: "git unavailable" }, 500),
    });
    const { result } = renderHook(() => usePageActivity());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.updatesError).toBe("git unavailable");
    expect(result.current.commentsError).toBeNull();
  });
});

describe("matchesActivity", () => {
  const activity = (overrides: Partial<PageActivity>): PageActivity => ({ updated: 0, commented: 0, resolved: 0, openCount: 0, resolvedCount: 0, ...overrides });

  it.each([
    [[], activity({}), true],
    [[], undefined, true],
    [["open"], activity({ openCount: 1 }), true],
    [["open"], activity({ resolvedCount: 2 }), false],
    [["resolved"], activity({ resolvedCount: 2 }), true],
    [["resolved"], undefined, false],
    [["open", "resolved"], activity({ resolvedCount: 1 }), true],
    [["open", "resolved"], activity({}), false],
  ] as const)("filters %j against %j -> %s", (filters, value, expected) => {
    expect(matchesActivity(value, [...filters])).toBe(expected);
  });
});

describe("mergeActivity", () => {
  it("overlays source update timestamps on feedback activity", () => {
    const merged = mergeActivity({}, { page: "2026-10-01T00:00:00Z" });
    expect(merged.get("page")).toEqual({ commented: 0, resolved: 0, openCount: 0, resolvedCount: 0, updated: Date.parse("2026-10-01T00:00:00Z") });
  });
});
