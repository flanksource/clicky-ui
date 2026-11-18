import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { GitDiffPayload } from "../../data/git/types";
import type { GavelCommentsClient, GavelEvent, NativeListItem } from "./client";
import type { NativeComment } from "./gavel-projection";
import type { CursorStore } from "./comment-events";
import { project } from "./gavel-projection";
import { useGavelComments } from "./useGavelComments";

const scope = "gavel://project/site";
const target = `${scope}/files/docs%2FREADME.md`;
const filter = { target };

const native = (overrides: Partial<NativeListItem> = {}): NativeListItem => ({
  id: "c-1",
  bodyMarkdown: "Too small",
  author: { kind: "user", id: "u-1", label: "You" },
  target: { uri: target, scopeUri: scope, kind: "document" },
  status: "open",
  phase: "active",
  version: 4,
  createdAt: "2026-11-01T10:00:00Z",
  updatedAt: "2026-11-01T10:00:00Z",
  content: { playground: { page: "docs/README.md", anchor: "r:1-2" } },
  messages: [{ id: "m-1", bodyMarkdown: "Fixed", author: { kind: "agent", id: "claude", label: "Claude" }, createdAt: "2026-11-01T10:01:00Z" }],
  readVersion: 0,
  unread: true,
  ...overrides,
});

type Fake = { [K in keyof GavelCommentsClient]: ReturnType<typeof vi.fn> };

/** A gavel client whose event stream stays open and silent, as an idle scope's does. */
function fakeClient(overrides: Partial<Record<keyof GavelCommentsClient, unknown>> = {}) {
  const idle = ({ signal }: { signal: AbortSignal }) => new Promise<void>((resolve) => signal.addEventListener("abort", () => resolve()));
  const calls = {
    scope,
    baseUrl: "https://gavel.example",
    attachmentUrl: (commentId: string, attachmentId: string) => `https://gavel.example/${commentId}/${attachmentId}`,
    list: vi.fn(async () => [native()]),
    create: vi.fn(async () => native({ id: "c-2", version: 1, bodyMarkdown: "New", messages: [] })),
    status: vi.fn(async () => native()),
    assign: vi.fn(async () => native()),
    retarget: vi.fn(async () => native()),
    remove: vi.fn(async () => native()),
    update: vi.fn(async () => native()),
    reply: vi.fn(async () => native()),
    editReply: vi.fn(async () => native()),
    deleteReply: vi.fn(async () => native()),
    applyProposal: vi.fn(async () => native()),
    rejectProposal: vi.fn(async () => native()),
    requestRevision: vi.fn(async () => native()),
    proposalDiff: vi.fn(async (): Promise<GitDiffPayload> => ({ diff: "" })),
    deliver: vi.fn(async () => native()),
    deliverBatch: vi.fn(async (): Promise<NativeComment[]> => []),
    markRead: vi.fn(async () => ({ marked: 1 })),
    streamEvents: vi.fn(idle),
    ...overrides,
  } as unknown as Fake;
  return { client: calls as unknown as GavelCommentsClient, calls };
}

/** A cursor store that lives for one test. */
function memoryCursor(initial = 0): CursorStore & { value: number; writes: number[] } {
  const store = {
    value: initial,
    writes: [] as number[],
    get: () => store.value,
    set: (_key: string, sequence: number) => {
      store.value = sequence;
      store.writes.push(sequence);
    },
  };
  return store;
}

const fast = { reconnectMs: 5, debounceMs: 1 };

function mount(client: GavelCommentsClient, options: Partial<Parameters<typeof useGavelComments>[0]> = {}) {
  return renderHook(() => useGavelComments({ client, filter, cursor: memoryCursor(), ...fast, ...options }));
}
async function loaded(client: GavelCommentsClient, options: Partial<Parameters<typeof useGavelComments>[0]> = {}) {
  const hook = mount(client, options);
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}

describe("loading and lifecycle actions", () => {
  it("projects the target's threads for the comment components, root first", async () => {
    const { client, calls } = fakeClient();
    const { result } = await loaded(client);
    expect(result.current.comments.map((comment) => [comment.id, comment.rootId ?? null])).toEqual([["c-1", null], ["m-1", "c-1"]]);
    expect(calls.list).toHaveBeenCalledWith(filter);
  });

  it("lists nothing and is not loading while it has no filter", () => {
    const { client, calls } = fakeClient();
    const { result } = renderHook(() => useGavelComments({ client, filter: undefined, cursor: memoryCursor(), ...fast }));
    expect([result.current.loading, result.current.comments]).toEqual([false, []]);
    expect(calls.list).not.toHaveBeenCalled();
  });

  it("refreshes after a lifecycle action sent at the version it last saw", async () => {
    const { client, calls } = fakeClient();
    const { result } = await loaded(client);
    await act(() => result.current.updateStatus("c-1", "resolved"));
    expect(calls.status).toHaveBeenCalledWith({ id: "c-1", version: 4, action: "resolve" });
    expect(calls.list).toHaveBeenCalledTimes(2);
    await act(() => result.current.updateStatus("c-1", "open"));
    expect(calls.status).toHaveBeenLastCalledWith({ id: "c-1", version: 4, action: "reopen" });
    await act(() => result.current.acknowledge("c-1"));
    expect(calls.status).toHaveBeenLastCalledWith({ id: "c-1", version: 4, action: "acknowledge" });
    await act(() => result.current.close("c-1"));
    expect(calls.status).toHaveBeenLastCalledWith({ id: "c-1", version: 4, action: "close" });
  });

  it("refuses a status gavel cannot set directly and lifecycle actions on replies or unknown comments", async () => {
    const { client } = fakeClient();
    const { result } = await loaded(client);
    await expect(result.current.updateStatus("c-1", "in_progress")).rejects.toThrow(/cannot be set directly/);
    await expect(result.current.close("m-1")).rejects.toThrow(/Only thread roots/);
    await expect(result.current.close("missing")).rejects.toThrow(/not loaded/);
  });

  it("rejects, rather than throwing before a promise exists, when a promise-returning action names a comment that is not loaded", async () => {
    const { client } = fakeClient();
    const { result } = await loaded(client);
    const hook = result.current;
    const moved = { uri: target, scopeUri: scope, kind: "document" };
    const calls: [string, () => Promise<unknown>][] = [
      ["updateStatus", () => hook.updateStatus("missing", "resolved")],
      ["acknowledge", () => hook.acknowledge("missing")],
      ["assign", () => hook.assign("missing", null)],
      ["close", () => hook.close("missing")],
      ["retarget", () => hook.retarget("missing", moved)],
      ["applyProposal", () => hook.applyProposal("missing", "apply")],
      ["rejectProposal", () => hook.rejectProposal("missing")],
      ["requestRevision", () => hook.requestRevision("missing", "again")],
      ["loadProposalDiff", () => hook.loadProposalDiff("missing")],
    ];
    for (const [name, call] of calls) {
      let pending: Promise<unknown> | undefined;
      expect(() => { pending = call(); }, name).not.toThrow();
      await expect(pending, name).rejects.toThrow(/not loaded/);
    }
  });

  it("replies on the thread root, with the host's reply content when it supplies one", async () => {
    const { client, calls } = fakeClient();
    const { result } = await loaded(client, { replyContent: (input) => ({ playground: { page: "docs/README.md", body: input.body } }) });
    await act(() => result.current.reply({ parentId: "m-1", body: "Thanks" }));
    expect(calls.reply).toHaveBeenCalledWith({ id: "c-1", version: 4, body: "Thanks", content: { playground: { page: "docs/README.md", body: "Thanks" } } });
  });

  it("edits a root's body and a reply's body through the thread root", async () => {
    const { client, calls } = fakeClient();
    const { result } = await loaded(client);
    await act(() => result.current.edit("c-1", "Bigger"));
    expect(calls.update).toHaveBeenCalledWith({ id: "c-1", version: 4, body: "Bigger" });
    await act(() => result.current.edit("m-1", "Fixed!"));
    expect(calls.editReply).toHaveBeenCalledWith({ id: "c-1", version: 4, messageId: "m-1", body: "Fixed!" });
  });

  it("deletes a reply through its root and a root outright", async () => {
    const { client, calls } = fakeClient();
    const { result } = await loaded(client);
    await act(() => result.current.remove("m-1"));
    expect(calls.deleteReply).toHaveBeenCalledWith({ id: "c-1", version: 4, messageId: "m-1" });
    await act(() => result.current.remove("c-1"));
    expect(calls.remove).toHaveBeenCalledWith({ id: "c-1", version: 4 });
  });

  it("assigns a thread with the assignee as gavel's actor, or clears it", async () => {
    const { client, calls } = fakeClient();
    const { result } = await loaded(client);
    await act(() => result.current.assign("c-1", { id: "claude", name: "Claude", kind: "agent" }));
    expect(calls.assign).toHaveBeenLastCalledWith({ id: "c-1", version: 4, assignee: { kind: "agent", id: "claude", label: "Claude" } });
    await act(() => result.current.assign("c-1", null));
    expect(calls.assign).toHaveBeenLastCalledWith({ id: "c-1", version: 4, assignee: null });
  });

  it("re-anchors a thread by retargeting it at the version last seen", async () => {
    const { client, calls } = fakeClient();
    const { result } = await loaded(client);
    const moved = { uri: target, scopeUri: scope, kind: "document", selector: { kind: "patch" } };
    await act(() => result.current.retarget("c-1", moved));
    expect(calls.retarget).toHaveBeenCalledWith({ id: "c-1", version: 4, target: moved });
  });

  it("marks the filtered target read, and refuses to without one", async () => {
    const { client, calls } = fakeClient();
    const { result } = await loaded(client);
    await act(() => result.current.markRead());
    expect(calls.markRead).toHaveBeenCalledWith(target);
    const all = await loaded(client, { filter: {} });
    await expect(all.result.current.markRead()).rejects.toThrow(/needs a target/);
  });
});

describe("proposals", () => {
  it("decides a proposed patch through the thread root at the version it last saw, then refreshes", async () => {
    const { client, calls } = fakeClient();
    const { result } = await loaded(client);
    await act(() => result.current.applyProposal("m-1", "stage"));
    expect(calls.applyProposal).toHaveBeenLastCalledWith({ id: "c-1", version: 4, messageId: "m-1", mode: "stage" });
    await act(() => result.current.rejectProposal("m-1", "Too broad"));
    expect(calls.rejectProposal).toHaveBeenLastCalledWith({ id: "c-1", version: 4, messageId: "m-1", reason: "Too broad" });
    await act(() => result.current.rejectProposal("m-1"));
    expect(calls.rejectProposal).toHaveBeenLastCalledWith({ id: "c-1", version: 4, messageId: "m-1" });
    await act(() => result.current.requestRevision("m-1", "Keep the API"));
    expect(calls.requestRevision).toHaveBeenLastCalledWith({ id: "c-1", version: 4, messageId: "m-1", feedback: "Keep the API" });
    expect(calls.list).toHaveBeenCalledTimes(5);
  });

  it("loads a proposal's diff for its reply and refuses a decision on a comment that is not a loaded reply", async () => {
    const payload = { diff: "diff --git a/x b/x\n", commit: "def456" };
    const { client, calls } = fakeClient({ proposalDiff: vi.fn(async () => payload) });
    const { result } = await loaded(client);
    expect(await result.current.loadProposalDiff("m-1")).toEqual(payload);
    expect(calls.proposalDiff).toHaveBeenCalledWith("c-1", "m-1");
    await expect(result.current.applyProposal("c-1", "apply")).rejects.toThrow(/not a reply/);
    await expect(result.current.rejectProposal("missing")).rejects.toThrow(/not loaded/);
    await expect(result.current.loadProposalDiff("missing")).rejects.toThrow(/not loaded/);
  });

  it("shows a reply's proposal and its decided state on the projected reply", async () => {
    const proposal = { ref: "refs/gavel/proposals/c-1/m-2", base: "abc", commit: "def", files: [{ path: "a.md", additions: 2, deletions: 1 }], state: "rejected" as const, decidedBy: { kind: "user", id: "u-1", label: "Ada" }, feedback: "Too broad" };
    const withProposal = native({ messages: [{ id: "m-2", bodyMarkdown: "Proposed", author: { kind: "agent", id: "claude", label: "Claude" }, createdAt: "2026-11-01T10:02:00Z", content: { proposal } }] });
    const { client } = fakeClient({ list: vi.fn(async () => [withProposal]) });
    const { result } = await loaded(client);
    expect(result.current.comments.find((comment) => comment.id === "m-2")?.proposal).toEqual({ ...proposal, decidedBy: { id: "u-1", name: "Ada", kind: "user" } });
  });
});

describe("delivery", () => {
  it("reloads the thread after a failed delivery so the recorded hand-off error shows", async () => {
    const { client, calls } = fakeClient({ deliver: vi.fn(async () => { throw new Error("no live agent session"); }) });
    const { result } = await loaded(client);
    await act(async () => {
      await expect(result.current.deliver("c-1", { kind: "session", sessionId: "s-1" })).rejects.toThrow(/no live agent session/);
    });
    expect(calls.deliver).toHaveBeenCalledWith({ id: "c-1", version: 4, requestId: expect.any(String), target: { kind: "session", sessionId: "s-1" } });
    expect(calls.list).toHaveBeenCalledTimes(2);
  });

  it("delivers several threads in one batch at the versions last seen, with the target's edits, then reloads", async () => {
    const other = native({ id: "c-3", version: 7 });
    const { client, calls } = fakeClient({ list: vi.fn(async () => [native(), other]), deliverBatch: vi.fn(async () => [native(), other]) });
    const { result } = await loaded(client);
    await act(() => result.current.deliverAll(["c-1", "c-3"], { kind: "session", sessionId: "s-1", edits: "propose" }));
    expect(calls.deliverBatch).toHaveBeenCalledWith({
      requestId: expect.any(String),
      target: { kind: "session", sessionId: "s-1", edits: "propose" },
      threads: [{ id: "c-1", expectedVersion: 4 }, { id: "c-3", expectedVersion: 7 }],
    });
    expect(calls.list).toHaveBeenCalledTimes(2);
  });

  it("refuses a batch naming a thread that is not loaded and reloads after a refused batch", async () => {
    const { client, calls } = fakeClient({ deliverBatch: vi.fn(async () => { throw new Error("comment c-1 changed (409)"); }) });
    const { result } = await loaded(client);
    await act(async () => {
      await expect(result.current.deliverAll(["c-1", "missing"], { kind: "session", sessionId: "s-1" })).rejects.toThrow(/not loaded/);
      await expect(result.current.deliverAll(["c-1"], { kind: "session", sessionId: "s-1" })).rejects.toThrow(/409/);
    });
    expect(calls.list).toHaveBeenCalledTimes(2);
  });
});

describe("live updates", () => {
  it("opens the event stream from the stored cursor and reloads when an event arrives after it", async () => {
    const cursor = memoryCursor(5);
    let emit: (event: GavelEvent) => void = () => undefined;
    const streamEvents = vi.fn(({ onEvent, signal }: { onEvent: (event: GavelEvent) => void; signal: AbortSignal }) => {
      emit = onEvent;
      return new Promise<void>((resolve) => signal.addEventListener("abort", () => resolve()));
    });
    const { client, calls } = fakeClient({ streamEvents });
    await loaded(client, { cursor });
    expect(streamEvents).toHaveBeenCalledWith(expect.objectContaining({ after: 5 }));
    expect(calls.list).toHaveBeenCalledTimes(1);
    act(() => emit({ sequence: 6, commentId: "c-1", kind: "reply" }));
    await waitFor(() => expect(calls.list).toHaveBeenCalledTimes(2));
    expect(cursor.writes).toEqual([6]);
  });

  it("keys the cursor by server and scope so each project on each gavel resumes from its own position", async () => {
    const keys: string[] = [];
    const cursor: CursorStore = { get: (key) => { keys.push(key); return 0; }, set: () => undefined };
    const { client } = fakeClient();
    await loaded(client, { cursor });
    expect(keys).toEqual([`gavel.events.https://gavel.example.${scope}`]);
  });

  it("shows a corrupt stored cursor as live updates that did not start, not as an idle feed", async () => {
    const cursor: CursorStore = { get: () => { throw new Error("The stored event cursor k is \"oops\", not a sequence number"); }, set: () => undefined };
    const { client, calls } = fakeClient();
    const { result } = await loaded(client, { cursor });
    await waitFor(() => expect(result.current.error).toMatch(/Live updates did not start: .*not a sequence number/));
    expect(calls.streamEvents).not.toHaveBeenCalled();
  });

  it("reconnects after the stream closes, resuming from the last event it applied", async () => {
    const cursor = memoryCursor();
    const streamEvents = vi
      .fn()
      .mockImplementationOnce(async ({ onEvent }: { onEvent: (event: GavelEvent) => void }) => {
        onEvent({ sequence: 3, commentId: "c-1", kind: "create" });
        onEvent({ sequence: 4, commentId: "c-1", kind: "reply" });
      })
      .mockImplementation(({ signal }: { signal: AbortSignal }) => new Promise<void>((resolve) => signal.addEventListener("abort", () => resolve())));
    const { client } = fakeClient({ streamEvents });
    await loaded(client, { cursor });
    await waitFor(() => expect(streamEvents).toHaveBeenCalledTimes(2));
    expect(streamEvents.mock.calls.map(([stream]) => (stream as { after: number }).after)).toEqual([0, 4]);
    expect(cursor.value).toBe(4);
  });

  it("reconnects after the stream fails and shows that live updates stopped until it reopens", async () => {
    let reopen: () => void = () => undefined;
    const streamEvents = vi
      .fn()
      .mockRejectedValueOnce(new Error("connection reset"))
      .mockImplementation(({ onOpen, signal }: { onOpen: () => void; signal: AbortSignal }) => {
        reopen = onOpen;
        return new Promise<void>((resolve) => signal.addEventListener("abort", () => resolve()));
      });
    const { client } = fakeClient({ streamEvents });
    const { result } = await loaded(client, { reconnectMs: 20 });
    await waitFor(() => expect(result.current.error).toBe("Live updates stopped: connection reset"));
    await waitFor(() => expect(streamEvents).toHaveBeenCalledTimes(2));
    expect(result.current.error).toBe("Live updates stopped: connection reset");
    act(() => reopen());
    expect(result.current.error).toBeNull();
    expect(streamEvents).toHaveBeenCalledTimes(2);
  });

  it("stops the stream when the host unmounts", async () => {
    let aborted = false;
    const streamEvents = vi.fn(({ signal }: { signal: AbortSignal }) => new Promise<void>((resolve) => signal.addEventListener("abort", () => { aborted = true; resolve(); })));
    const { client } = fakeClient({ streamEvents });
    const { unmount } = await loaded(client);
    unmount();
    expect(aborted).toBe(true);
  });

  it("surfaces a failed load instead of showing no comments", async () => {
    const { client } = fakeClient({ list: vi.fn(async () => { throw new Error("Cannot reach gavel"); }) });
    const { result } = mount(client);
    await waitFor(() => expect(result.current.error).toBe("Cannot reach gavel"));
    expect(result.current.loading).toBe(false);
  });
});

describe("optimistic outbox", () => {
  const preview = { body: "New", anchor: "r:3-4" };
  const request = { target: { uri: target, scopeUri: scope, kind: "document" }, bodyMarkdown: "New", requestId: "req-1", content: { playground: { page: "docs/README.md" } } };
  const deferred = <T,>() => {
    let resolve!: (value: T) => void;
    let reject!: (cause: unknown) => void;
    const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail; });
    return { promise, resolve, reject };
  };

  it("shows the new comment as sending at once, then swaps it for gavel's stored thread without duplicating it", async () => {
    const created = deferred<NativeComment>();
    const { client, calls } = fakeClient({ create: vi.fn(() => created.promise) });
    const { result } = await loaded(client);
    let posted!: Promise<string>;
    act(() => { posted = result.current.create({ preview, request }); });
    const pending = result.current.comments.find((comment) => comment.id.startsWith("pending-"));
    expect(pending).toMatchObject({ body: "New", anchor: "r:3-4", author: { name: "You", kind: "user" }, submission: { state: "sending" } });
    await act(async () => {
      created.resolve(native({ id: "c-2", version: 1, bodyMarkdown: "New", messages: [] }));
      expect(await posted).toBe("c-2");
    });
    expect(result.current.comments.map((comment) => comment.id)).toEqual(["c-1", "m-1", "c-2"]);
    expect(result.current.comments.some((comment) => comment.submission)).toBe(false);
    expect(calls.create).toHaveBeenCalledWith({ request });
  });

  it("passes the screenshot to the client", async () => {
    const { client, calls } = fakeClient();
    const { result } = await loaded(client);
    const png = Uint8Array.from([1, 2]);
    await act(() => result.current.create({ preview, request, screenshot: png }));
    expect(calls.create).toHaveBeenCalledWith({ request, screenshot: png });
  });

  it("keeps a refused comment visible as failed with gavel's error, rethrows it, and rolls it back on discard", async () => {
    const { client } = fakeClient({ create: vi.fn(async () => { throw new Error("target is outside the scope"); }) });
    const { result } = await loaded(client);
    await act(async () => {
      await expect(result.current.create({ preview, request })).rejects.toThrow(/outside the scope/);
    });
    const failed = result.current.comments.find((comment) => comment.id.startsWith("pending-"));
    expect(failed?.submission).toEqual({ state: "failed", error: "target is outside the scope" });
    act(() => result.current.discard(failed!.id));
    expect(result.current.comments.map((comment) => comment.id)).toEqual(["c-1", "m-1"]);
  });

  it("refuses to discard a comment that is not a pending one", async () => {
    const { client } = fakeClient();
    const { result } = await loaded(client);
    expect(() => result.current.discard("c-1")).toThrow(/not a pending comment/);
  });

  const saved = () => native({ id: "c-2", version: 1, bodyMarkdown: "New", messages: [] });
  const ids = (comments: { id: string }[]) => comments.map((comment) => comment.id);

  it("drops a reload that started before the post finished, so the saved comment does not vanish", async () => {
    const stale = deferred<NativeListItem[]>();
    const list = vi.fn().mockResolvedValueOnce([native()]).mockReturnValueOnce(stale.promise).mockResolvedValue([native(), saved()]);
    const { client } = fakeClient({ list });
    const { result } = await loaded(client);
    let reload!: Promise<void>;
    act(() => { reload = result.current.refresh(); });
    await act(() => result.current.create({ preview, request }));
    expect(ids(result.current.comments)).toContain("c-2");
    await act(async () => {
      stale.resolve([native()]);
      await reload;
    });
    expect(ids(result.current.comments)).toContain("c-2");
  });

  it("reloads once posting settles when a reload was dropped, so an event that arrived mid-post is not lost", async () => {
    const created = deferred<NativeComment>();
    const list = vi.fn().mockResolvedValueOnce([native()]).mockResolvedValue([native({ bodyMarkdown: "Edited elsewhere" }), saved()]);
    const { client } = fakeClient({ create: vi.fn(() => created.promise), list });
    const { result } = await loaded(client);
    let posted!: Promise<string>;
    act(() => { posted = result.current.create({ preview, request }); });
    await act(() => result.current.refresh());
    expect(list).toHaveBeenCalledTimes(1);
    await act(async () => {
      created.resolve(saved());
      await posted;
    });
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.comments.find((comment) => comment.id === "c-1")?.body).toBe("Edited elsewhere"));
  });

  it("applies a reload that finished while posting was still going on once posting settles, instead of dropping it for good", async () => {
    const created = deferred<NativeComment>();
    const midPost = deferred<NativeListItem[]>();
    const list = vi.fn().mockResolvedValueOnce([native()]).mockReturnValueOnce(midPost.promise).mockResolvedValue([native({ bodyMarkdown: "Edited elsewhere" }), saved()]);
    const { client } = fakeClient({ create: vi.fn(() => created.promise), list });
    const { result } = await loaded(client);
    let reload!: Promise<void>;
    act(() => { reload = result.current.refresh(); });
    let posted!: Promise<string>;
    act(() => { posted = result.current.create({ preview, request }); });
    await act(async () => {
      midPost.resolve([native({ bodyMarkdown: "Edited elsewhere" })]);
      await reload;
    });
    await act(async () => {
      created.resolve(saved());
      await posted;
    });
    await waitFor(() => expect(ids(result.current.comments)).toEqual(["c-1", "m-1", "c-2"]));
    expect(result.current.comments[0]?.body).toBe("Edited elsewhere");
  });

  it("does not show another filter's pending comment, nor an empty list as loaded while the post that held its reload is still going", async () => {
    const created = deferred<NativeComment>();
    const other = `${scope}/files/other.md`;
    const list = vi.fn(async (current: { target?: string }) => (current.target === other ? [native({ id: "o-1", target: { uri: other, scopeUri: scope, kind: "document" }, messages: [] })] : [native()]));
    const { client } = fakeClient({ create: vi.fn(() => created.promise), list });
    const hook = renderHook(({ current }: { current: { target: string } }) => useGavelComments({ client, filter: current, cursor: memoryCursor(), ...fast }), { initialProps: { current: filter } });
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    act(() => { void hook.result.current.create({ preview, request }).catch(() => undefined); });
    expect(hook.result.current.comments.some((comment) => comment.id.startsWith("pending-"))).toBe(true);
    hook.rerender({ current: { target: other } });
    expect(hook.result.current.comments.some((comment) => comment.id.startsWith("pending-"))).toBe(false);
    expect([hook.result.current.comments.length, hook.result.current.loading]).toEqual([0, true]);
    await act(async () => { created.reject(new Error("done")); });
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    expect(ids(hook.result.current.comments)).toEqual(["o-1"]);
  });

  it("ignores the saved rows of a create that finishes after the filter changed", async () => {
    const created = deferred<NativeComment>();
    const other = `${scope}/files/other.md`;
    const list = vi.fn(async (current: { target?: string }) => (current.target === other ? [native({ id: "o-1", target: { uri: other, scopeUri: scope, kind: "document" }, messages: [] })] : [native()]));
    const { client } = fakeClient({ create: vi.fn(() => created.promise), list });
    const hook = renderHook(({ current }: { current: { target: string } }) => useGavelComments({ client, filter: current, cursor: memoryCursor(), ...fast }), { initialProps: { current: filter } });
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    let posted!: Promise<string>;
    act(() => { posted = hook.result.current.create({ preview, request }); });
    hook.rerender({ current: { target: other } });
    await act(async () => {
      created.resolve(saved());
      await posted;
    });
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    expect(ids(hook.result.current.comments)).toEqual(["o-1"]);
  });

  it("applies only the newest of concurrent reloads, even when an older one answers last", async () => {
    const older = deferred<NativeListItem[]>();
    const newer = deferred<NativeListItem[]>();
    const list = vi.fn().mockResolvedValueOnce([native()]).mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
    const { client } = fakeClient({ list });
    const { result } = await loaded(client);
    let first!: Promise<void>;
    let second!: Promise<void>;
    act(() => { first = result.current.refresh(); });
    act(() => { second = result.current.refresh(); });
    await act(async () => {
      newer.resolve([native({ bodyMarkdown: "Newest" })]);
      await second;
    });
    await act(async () => {
      older.resolve([native({ bodyMarkdown: "Oldest" })]);
      await first;
    });
    expect(result.current.comments[0]?.body).toBe("Newest");
  });

  it("does not let an older reload's failure replace the newest reload's result", async () => {
    const older = deferred<NativeListItem[]>();
    const list = vi.fn().mockResolvedValueOnce([native()]).mockReturnValueOnce(older.promise).mockResolvedValueOnce([native({ bodyMarkdown: "Newest" })]);
    const { client } = fakeClient({ list });
    const { result } = await loaded(client);
    let first!: Promise<void>;
    act(() => { first = result.current.refresh(); });
    await act(() => result.current.refresh());
    await act(async () => {
      older.reject(new Error("timed out"));
      await first;
    });
    expect([result.current.comments[0]?.body, result.current.error]).toEqual(["Newest", null]);
  });
});

describe("projection", () => {
  it("projects a thread with no playground metadata by default, as an editor, CLI or agent thread is", async () => {
    const { content: _playground, ...editor } = native({ target: { uri: target, scopeUri: scope, kind: "document", selector: { kind: "document", version: 1, view: "preview" } } });
    const { client } = fakeClient({ list: vi.fn(async () => [editor]) });
    const { result } = await loaded(client);
    expect(result.current.comments.map((comment) => [comment.id, comment.rootId ?? null])).toEqual([["c-1", null], ["m-1", "c-1"]]);
    expect(result.current.error).toBeNull();
  });

  it("uses the playground projection only when the host passes it, and then fails loudly on a thread without its metadata", async () => {
    const { content: _playground, ...editor } = native();
    const { client } = fakeClient({ list: vi.fn(async () => [editor]) });
    const { result } = mount(client, { project: (comment) => project(comment, { attachmentUrl: client.attachmentUrl }) });
    await waitFor(() => expect(result.current.error).toMatch(/missing playground metadata/));
  });

  it("carries a patch-anchored thread's anchor and quote to the comment components", async () => {
    const patch = { version: 1, startLine: 3, endLine: 3, before: [], lines: ["Tag the commit with the next version."], after: [] };
    const quote = { prefix: "with the", exact: "next version", suffix: "." };
    const { client } = fakeClient({ list: vi.fn(async () => [native({ target: { uri: target, scopeUri: scope, kind: "document", selector: { kind: "code-range", version: 1, view: "source", patch, quote } } })]) });
    const { result } = await loaded(client);
    expect([result.current.comments[0]?.anchor, result.current.comments[0]?.quote]).toEqual([`r:${JSON.stringify(patch)}`, quote]);
  });
});
