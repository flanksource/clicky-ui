import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { quoteAnchor } from "@flanksource/clicky-ui/file-findings";
import { anchorTarget, useComments } from "./useComments";
import { PageReloadProvider } from "../page-reload";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("feedback loading scope", () => {
  it("shows a pending root immediately and replaces it with the server result", async () => {
    let complete!: (response: Response) => void;
    vi.stubGlobal("fetch", vi.fn((_url: string, init?: RequestInit) => init?.method === "POST" ? new Promise<Response>(resolve => { complete = resolve; }) : Promise.resolve(Response.json({ comments: [] }))));
    const { result } = renderHook(() => useComments("optimistic", { current: null }, { capture: async () => ({ source: "optimistic.tsx", html: "<p>Target</p>" }) }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    let posting!: Promise<void>;
    act(() => { posting = result.current.create({ body: "Check alignment" }); });
    expect(result.current.comments).toMatchObject([{ body: "Check alignment", submission: { state: "sending" } }]);
    await waitFor(() => expect(complete).toBeTypeOf("function"));
    const saved = { id: "saved-root", body: "Check alignment", createdAt: "2026-01-01T00:00:00Z", author: null };
    await act(async () => { complete(Response.json(saved)); await posting; });
    expect(result.current.comments).toEqual([saved]);
  });

  it("retains a failed optimistic root with its content and error", async () => {
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init?: RequestInit) => init?.method === "POST" ? Response.json({ error: "Storage unavailable" }, { status: 503 }) : Response.json({ comments: [] })));
    const { result } = renderHook(() => useComments("optimistic", { current: null }, { capture: async () => ({ source: "optimistic.tsx", html: "<p>Target</p>" }) }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await expect(result.current.create({ body: "Keep this draft" })).rejects.toThrow(); });
    expect(result.current.comments).toMatchObject([{ body: "Keep this draft", submission: { state: "failed", error: "Storage unavailable" } }]);
  });
  it.each(["element", "frame"])("posts a %s review decision before reloading through the host callback", async (mode) => {
    const source = "export default () => <div />;";
    const fetcher = vi.fn(async (url: string, init?: RequestInit) => Response.json(
      url.startsWith("/__playground/sources") ? { source } : init?.method === "POST" ? { id: "decision" } : { comments: [] },
    ));
    vi.stubGlobal("fetch", fetcher);
    const reload = vi.fn();
    const content = document.createElement("div");
    content.textContent = "Review me";
    const { result } = renderHook(() => useComments("example", { current: content }, mode === "frame" ? { capture: async () => ({ source: "example.tsx", html: "<div>Review me</div>" }) } : {}), {
      wrapper: ({ children }) => <PageReloadProvider value={reload}>{children}</PageReloadProvider>,
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => result.current.create({ body: "", reviewDecision: "approved" }));
    const posted = fetcher.mock.calls.find(([, init]) => init?.method === "POST");
    expect(JSON.parse(String(posted?.[1]?.body))).toMatchObject({ reviewDecision: "approved", expectedSource: source, page: "example" });
    expect(reload).toHaveBeenCalledExactlyOnceWith({ reason: "review", page: "example" });
  });

  it("loads only page feedback until global feedback is requested", async () => {
    const fetcher = vi.fn(async (_url: string) => new Response(JSON.stringify({ comments: [] }), { headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetcher);
    const { result, rerender } = renderHook(({ all }) => useComments("example", { current: null }, { all }), { initialProps: { all: false } });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetcher.mock.calls.map((call) => call[0])).toEqual(["/__playground/comments?page=example"]);
    rerender({ all: true });
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetcher.mock.calls.map((call) => call[0])).toEqual([
      "/__playground/comments?page=example", "/__playground/comments?page=example", "/__playground/comments",
    ]);
  });
});

describe("comment capture target", () => {
  const RENDERED = `<div data-annotated-markdown="">
    <h1 data-source-start="1" data-source-end="1">Runbook</h1>
    <p data-source-start="3" data-source-end="3" id="deploy">Check the error rate, then roll back.</p>
    <p data-source-start="5" data-source-end="5" id="after">Post a summary.</p>
  </div>`;
  const locator = { path: ["Runbook"], prefix: "Check the", quote: "error rate", suffix: "then roll" };

  it("captures the rendered block holding a quote anchor's words", () => {
    document.body.innerHTML = `<main>${RENDERED}</main>`;
    expect(anchorTarget(document.querySelector("main")!, quoteAnchor(locator))?.id).toBe("deploy");
  });

  it("has no target once the quoted words are gone", () => {
    document.body.innerHTML = `<main>${RENDERED.replace("error rate", "latency")}</main>`;
    expect(anchorTarget(document.querySelector("main")!, quoteAnchor(locator))).toBeNull();
  });
});
