import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useHistoryRoute } from "./use-history-route";

describe("useHistoryRoute history mode", () => {
  const options = { parse: (_path: string, search: string) => ({ page: new URLSearchParams(search).get("page") ?? "" }), build: (route: { page: string }) => `/?page=${route.page}` };

  it("pushes a history entry by default", () => {
    window.history.replaceState(null, "", "/?page=a");
    const push = vi.spyOn(window.history, "pushState");
    const replace = vi.spyOn(window.history, "replaceState");
    const { result } = renderHook(() => useHistoryRoute(options));
    act(() => result.current[1]({ page: "b" }));
    expect(push).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
    expect(window.location.search).toBe("?page=b");
    push.mockRestore();
    replace.mockRestore();
  });

  it("replaces the current history entry when replace is set", () => {
    window.history.replaceState(null, "", "/?page=a");
    const push = vi.spyOn(window.history, "pushState");
    const replace = vi.spyOn(window.history, "replaceState");
    const { result } = renderHook(() => useHistoryRoute(options));
    act(() => result.current[1]({ page: "b" }, { replace: true }));
    expect(replace).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
    expect(result.current[0]).toEqual({ page: "b" });
    expect(window.location.search).toBe("?page=b");
    push.mockRestore();
    replace.mockRestore();
  });
});

describe("useHistoryRoute navigation guard", () => {
  it("preserves Back and Forward entries when an asynchronous decision rejects leaving", async () => {
    window.history.replaceState(null, "", "/?page=a");
    let blocked = false;
    let decide: ((allowed: boolean) => void) | undefined;
    const { result } = renderHook(() => useHistoryRoute({ parse: (_path, search) => ({ page: new URLSearchParams(search).get("page") ?? "" }), build: route => `/?page=${route.page}`, beforeNavigate: () => blocked ? new Promise<boolean>(resolve => { decide = resolve; }) : true }));
    act(() => result.current[1]({ page: "b" }));
    act(() => result.current[1]({ page: "c" }));
    blocked = true;
    act(() => window.history.back());
    await waitFor(() => expect(decide).toBeTypeOf("function"));
    await act(async () => decide!(false));
    await waitFor(() => expect(window.location.search).toBe("?page=c"));
    expect(result.current[0].page).toBe("c");
    blocked = false;
    act(() => window.history.back());
    await waitFor(() => expect(result.current[0].page).toBe("b"));
    act(() => window.history.forward());
    await waitFor(() => expect(result.current[0].page).toBe("c"));
  });
  it("keeps the route mounted until an asynchronous save decision succeeds", async () => {
    window.history.replaceState(null, "", "/?page=draft");
    let decide!: (allowed: boolean) => void;
    const gate = new Promise<boolean>(resolve => { decide = resolve; });
    const { result } = renderHook(() => useHistoryRoute({ parse: (_path, search) => ({ page: new URLSearchParams(search).get("page") ?? "" }), build: route => `/?page=${route.page}`, beforeNavigate: () => gate }));
    act(() => result.current[1]({ page: "next" }));
    expect(result.current[0].page).toBe("draft");
    await act(async () => decide(true));
    expect(result.current[0].page).toBe("next");
  });
  it("retains the draft route for rejected navigation and browser history changes", () => {
    window.history.replaceState(null, "", "/?page=draft");
    const beforeNavigate = vi.fn(() => false);
    const { result } = renderHook(() => useHistoryRoute({ parse: (_path, search) => ({ page: new URLSearchParams(search).get("page") ?? "" }), build: (route) => `/?page=${route.page}`, beforeNavigate }));
    act(() => result.current[1]({ page: "other" }));
    expect(result.current[0]).toEqual({ page: "draft" });
    expect(window.location.search).toBe("?page=draft");
    act(() => { window.history.pushState(null, "", "/?page=other"); window.dispatchEvent(new PopStateEvent("popstate")); });
    expect(result.current[0]).toEqual({ page: "draft" });
    expect(window.location.search).toBe("?page=draft");
    beforeNavigate.mockReturnValue(true);
    act(() => result.current[1]({ page: "other" }));
    expect(result.current[0]).toEqual({ page: "other" });
  });

  it("does not touch history when a replace navigation is rejected", () => {
    window.history.replaceState(null, "", "/?page=draft");
    const beforeNavigate = vi.fn(() => false);
    const push = vi.spyOn(window.history, "pushState");
    const replace = vi.spyOn(window.history, "replaceState");
    const { result } = renderHook(() => useHistoryRoute({ parse: (_path, search) => ({ page: new URLSearchParams(search).get("page") ?? "" }), build: (route) => `/?page=${route.page}`, beforeNavigate }));
    act(() => result.current[1]({ page: "other" }, { replace: true }));
    expect(beforeNavigate).toHaveBeenCalledWith({ page: "other" }, { page: "draft" });
    expect(push).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
    expect(result.current[0]).toEqual({ page: "draft" });
    expect(window.location.search).toBe("?page=draft");
    push.mockRestore();
    replace.mockRestore();
  });
});

describe("useHistoryRoute history state", () => {
  const parse = (_path: string, search: string) => ({ page: new URLSearchParams(search).get("page") ?? "" });
  const build = (route: { page: string }) => `/?page=${route.page}`;
  const hostState = { scrollTop: 120 };

  it("carries the current window.history.state through push and replace navigation", () => {
    window.history.replaceState(hostState, "", "/?page=a");
    const push = vi.spyOn(window.history, "pushState");
    const replace = vi.spyOn(window.history, "replaceState");
    const { result } = renderHook(() => useHistoryRoute({ parse, build }));
    act(() => result.current[1]({ page: "b" }));
    expect(push).toHaveBeenCalledWith(hostState, "", "/?page=b");
    act(() => result.current[1]({ page: "c" }, { replace: true }));
    expect(replace).toHaveBeenCalledWith(hostState, "", "/?page=c");
    push.mockRestore();
    replace.mockRestore();
  });

  it("carries the current window.history.state when restoring a rejected popstate", () => {
    window.history.replaceState(hostState, "", "/?page=draft");
    const push = vi.spyOn(window.history, "pushState");
    renderHook(() => useHistoryRoute({ parse, build, beforeNavigate: () => false }));
    act(() => { window.dispatchEvent(new PopStateEvent("popstate")); });
    expect(push).toHaveBeenCalledWith(hostState, "", "/?page=draft");
    push.mockRestore();
  });
});
