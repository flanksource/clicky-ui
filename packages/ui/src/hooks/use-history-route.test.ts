import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useHistoryRoute } from "./use-history-route";

describe("useHistoryRoute navigation guard", () => {
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
});
