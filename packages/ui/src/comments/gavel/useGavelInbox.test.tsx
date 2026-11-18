import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { GavelCommentsClient, GavelEvent, NativeListItem } from "./client";
import type { CursorStore } from "./comment-events";
import { useGavelInbox, type InboxSource } from "./useGavelInbox";

const DEMO = "gavel://project/demo";
const DOCS = "gavel://project/docs";

const row = (scope: string, id: string, overrides: Partial<NativeListItem> = {}): NativeListItem => ({
  id,
  bodyMarkdown: `comment ${id}`,
  author: { kind: "user", id: "user:ada", label: "Ada" },
  target: { uri: `${scope}/files/README.md`, scopeUri: scope, kind: "document" },
  status: "open",
  phase: "active",
  version: 1,
  createdAt: "2026-11-01T10:00:00Z",
  updatedAt: "2026-11-01T10:00:00Z",
  readVersion: 0,
  unread: true,
  ...overrides,
});

const idle = ({ signal }: { signal: AbortSignal }) => new Promise<void>((resolve) => signal.addEventListener("abort", () => resolve()));

/** A gavel client for one scope whose event stream stays open and silent. */
function fakeClient(scope: string, overrides: Partial<Record<keyof GavelCommentsClient, unknown>> = {}) {
  const calls = {
    scope,
    baseUrl: "https://gavel.example",
    list: vi.fn(async () => [row(scope, `${scope}-1`)]),
    markRead: vi.fn(async () => ({ marked: 1 })),
    streamEvents: vi.fn(idle),
    ...overrides,
  };
  return { client: calls as unknown as GavelCommentsClient, calls };
}

const memoryCursor = (): CursorStore => ({ get: () => 0, set: () => undefined });
const fast = { reconnectMs: 5, debounceMs: 1 };

function mount(sources: InboxSource[], options: Partial<Parameters<typeof useGavelInbox>[0]> = {}) {
  return renderHook(() => useGavelInbox({ sources, cursor: memoryCursor(), ...fast, ...options }));
}

describe("useGavelInbox", () => {
  it("is not loaded until every source has listed, then has one listing per scope with the project's name", async () => {
    const demo = fakeClient(DEMO);
    const docs = fakeClient(DOCS);
    const { result } = mount([{ project: "demo", client: demo.client }, { project: "docs", client: docs.client }]);
    expect(result.current.listings).toBeUndefined();
    await waitFor(() => expect(result.current.listings).toBeDefined());
    expect(result.current.listings?.map((listing) => [listing.scope, listing.project, listing.threads.map((thread) => thread.id)])).toEqual([
      [DEMO, "demo", [`${DEMO}-1`]],
      [DOCS, "docs", [`${DOCS}-1`]],
    ]);
    expect(result.current.error).toBeNull();
  });

  it("lists the whole scope unless told otherwise, and passes the host's filter through", async () => {
    const whole = fakeClient(DEMO);
    const wholeHook = mount([{ project: "demo", client: whole.client }]);
    await waitFor(() => expect(wholeHook.result.current.listings).toBeDefined());
    expect(whole.calls.list).toHaveBeenCalledWith({});
    const narrowed = fakeClient(DEMO);
    const { result } = mount([{ project: "demo", client: narrowed.client }], { filter: { phase: "active" } });
    await waitFor(() => expect(result.current.listings).toBeDefined());
    expect(narrowed.calls.list).toHaveBeenCalledWith({ phase: "active" });
  });

  it("carries the anchor the server resolved for each thread, which is where the inbox gets its deep links", async () => {
    const anchored = row(DEMO, "t-1", { anchor: { state: "matched", startLine: 12, endLine: 13 } });
    const { client } = fakeClient(DEMO, { list: vi.fn(async () => [anchored]) });
    const { result } = mount([{ project: "demo", client }]);
    await waitFor(() => expect(result.current.listings).toBeDefined());
    expect(result.current.listings?.[0]?.threads[0]?.anchor).toEqual({ state: "matched", startLine: 12, endLine: 13 });
  });

  it("reloads every scope when any scope's event stream reports a change", async () => {
    let emit: (event: GavelEvent) => void = () => undefined;
    const streamEvents = vi.fn(({ onEvent, signal }: { onEvent: (event: GavelEvent) => void; signal: AbortSignal }) => {
      emit = onEvent;
      return new Promise<void>((resolve) => signal.addEventListener("abort", () => resolve()));
    });
    const demo = fakeClient(DEMO, { streamEvents });
    const docs = fakeClient(DOCS);
    const { result } = mount([{ project: "demo", client: demo.client }, { project: "docs", client: docs.client }]);
    await waitFor(() => expect(result.current.listings).toBeDefined());
    act(() => emit({ sequence: 1, commentId: "x", kind: "reply" }));
    await waitFor(() => expect(demo.calls.list).toHaveBeenCalledTimes(2));
    expect(docs.calls.list).toHaveBeenCalledTimes(2);
  });

  it("marks a target read through the client of its scope, then reloads", async () => {
    const demo = fakeClient(DEMO);
    const docs = fakeClient(DOCS);
    const { result } = mount([{ project: "demo", client: demo.client }, { project: "docs", client: docs.client }]);
    await waitFor(() => expect(result.current.listings).toBeDefined());
    const uri = `${DOCS}/files/README.md`;
    await act(() => result.current.markRead({ scope: DOCS, uri }));
    expect(docs.calls.markRead).toHaveBeenCalledWith(uri);
    expect(demo.calls.markRead).not.toHaveBeenCalled();
    expect(docs.calls.list).toHaveBeenCalledTimes(2);
  });

  it("refuses to mark read in a scope it has no source for", async () => {
    const { client } = fakeClient(DEMO);
    const { result } = mount([{ project: "demo", client }]);
    await waitFor(() => expect(result.current.listings).toBeDefined());
    await expect(result.current.markRead({ scope: DOCS, uri: `${DOCS}/files/a.md` })).rejects.toThrow(/no source for scope gavel:\/\/project\/docs/);
  });

  it("reports a failed load as an error with no listings, so it is never an empty inbox", async () => {
    const { client } = fakeClient(DEMO, { list: vi.fn(async () => { throw new Error("Cannot reach gavel"); }) });
    const { result } = mount([{ project: "demo", client }]);
    await waitFor(() => expect(result.current.error).toBe("Cannot reach gavel"));
    expect(result.current.listings).toBeUndefined();
  });

  it("keeps the last listings when a reload fails, and says so", async () => {
    const list = vi.fn().mockResolvedValueOnce([row(DEMO, "t-1")]).mockRejectedValueOnce(new Error("gavel is down"));
    const { client } = fakeClient(DEMO, { list });
    const { result } = mount([{ project: "demo", client }]);
    await waitFor(() => expect(result.current.listings).toBeDefined());
    await act(() => result.current.refresh());
    expect([result.current.listings?.[0]?.threads.length, result.current.error]).toEqual([1, "gavel is down"]);
  });

  it("applies only the newest of concurrent reloads", async () => {
    let release: (rows: NativeListItem[]) => void = () => undefined;
    const slow = new Promise<NativeListItem[]>((resolve) => { release = resolve; });
    const list = vi.fn().mockResolvedValueOnce([row(DEMO, "initial")]).mockReturnValueOnce(slow).mockResolvedValueOnce([row(DEMO, "newest")]);
    const { client } = fakeClient(DEMO, { list });
    const { result } = mount([{ project: "demo", client }]);
    await waitFor(() => expect(result.current.listings).toBeDefined());
    let older!: Promise<void>;
    act(() => { older = result.current.refresh(); });
    await act(() => result.current.refresh());
    await act(async () => {
      release([row(DEMO, "oldest")]);
      await older;
    });
    expect(result.current.listings?.[0]?.threads.map((thread) => thread.id)).toEqual(["newest"]);
  });

  it("shows live updates stopping as an error beside the listings", async () => {
    const streamEvents = vi.fn().mockRejectedValueOnce(new Error("connection reset")).mockImplementation(idle);
    const { client } = fakeClient(DEMO, { streamEvents });
    const { result } = mount([{ project: "demo", client }], { reconnectMs: 20 });
    await waitFor(() => expect(result.current.error).toBe("Live updates stopped: connection reset"));
    expect(result.current.listings).toBeDefined();
  });

  it("stops every stream when the host unmounts", async () => {
    const aborted: boolean[] = [];
    const streamEvents = vi.fn(({ signal }: { signal: AbortSignal }) => new Promise<void>((resolve) => signal.addEventListener("abort", () => { aborted.push(true); resolve(); })));
    const demo = fakeClient(DEMO, { streamEvents });
    const docs = fakeClient(DOCS, { streamEvents });
    const { result, unmount } = mount([{ project: "demo", client: demo.client }, { project: "docs", client: docs.client }]);
    await waitFor(() => expect(result.current.listings).toBeDefined());
    unmount();
    expect(aborted).toHaveLength(2);
  });
});
