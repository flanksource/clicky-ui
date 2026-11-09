import { createElement } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTaskRun, useTaskRuns } from "./use-task-run";
import type { EventSourceFactory, EventSourceLike } from "./event-source";
import { EventSourceProvider } from "./event-source-provider";
import type { TaskRunMeta, TaskSnapshot } from "../data/TaskSnapshot";

// MockEventSource is a minimal stand-in for the browser EventSource so the
// SSE-first path can be driven deterministically.
class MockEventSource {
  static last: MockEventSource | null = null;
  url: string;
  onerror: ((e: unknown) => void) | null = null;
  closed = false;
  private listeners: Record<string, ((e: MessageEvent) => void)[]> = {};

  constructor(url: string) {
    this.url = url;
    MockEventSource.last = this;
  }
  addEventListener(type: string, fn: (e: MessageEvent) => void) {
    (this.listeners[type] ||= []).push(fn);
  }
  emit(type: string, data: unknown) {
    for (const fn of this.listeners[type] ?? []) {
      fn({ data: typeof data === "string" ? data : JSON.stringify(data) } as MessageEvent);
    }
  }
  close() {
    this.closed = true;
  }
}

const groupSnap = (status: string): TaskSnapshot => ({
  id: "fix-run",
  name: "fix-run",
  type: "group",
  status,
  groupId: "g1",
  total: 1,
  completed: status === "success" ? 1 : 0,
});
const taskSnap = (status: string): TaskSnapshot => ({
  id: "t1",
  name: "rebuild",
  type: "task",
  groupId: "g1",
  status,
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  return {
    promise: new Promise<T>((done) => {
      resolve = done;
    }),
    resolve,
  };
}

describe("useTaskRun (SSE)", () => {
  beforeEach(() => {
    vi.stubGlobal("EventSource", MockEventSource as unknown as typeof EventSource);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    MockEventSource.last = null;
  });

  it("accumulates task snapshots and completes + closes on done", async () => {
    const { result } = renderHook(() => useTaskRun({ id: "g1" }));

    const es = MockEventSource.last!;
    expect(es.url).toContain("tasks=g1");

    act(() => {
      es.emit("task", { ...groupSnap("running"), controls: ["stop"] });
      es.emit("task", taskSnap("running"));
    });
    await waitFor(() => expect(result.current.snapshots).toHaveLength(2));
    expect(result.current.isComplete).toBe(false);

    act(() => {
      es.emit("task", groupSnap("success"));
      es.emit("task", taskSnap("success"));
      es.emit("done", { status: "completed" });
    });

    await waitFor(() => expect(result.current.isComplete).toBe(true));
    expect(es.closed).toBe(true);
    // Latest snapshot per id wins.
    const group = result.current.snapshots.find((s) => s.type === "group");
    expect(group?.status).toBe("success");
    expect(group?.controls).toBeUndefined();
  });

  it("applies stdout and stderr SSE deltas without replacing task metadata", async () => {
    const { result } = renderHook(() => useTaskRun({ id: "g1" }));
    const es = MockEventSource.last!;

    act(() => {
      es.emit("task", groupSnap("running"));
      es.emit("task", taskSnap("running"));
      es.emit("output", { id: "t1", groupId: "g1", stream: "stdout", data: "first", offset: 0 });
      es.emit("output", { id: "t1", groupId: "g1", stream: "stdout", data: " second", offset: 5 });
      es.emit("output", { id: "t1", groupId: "g1", stream: "stderr", data: "warn", offset: 0 });
    });

    await waitFor(() => {
      const task = result.current.snapshots.find((snapshot) => snapshot.id === "t1");
      expect(task).toMatchObject({ name: "rebuild", stdout: "first second", stderr: "warn" });
    });

    act(() => {
      es.emit("output", { id: "t1", groupId: "g1", stream: "stdout", data: "tail", offset: 0, reset: true, truncated: true });
    });
    await waitFor(() => {
      const task = result.current.snapshots.find((snapshot) => snapshot.id === "t1");
      expect(task).toMatchObject({ stdout: "tail", stdoutTruncated: true });
    });
  });

  // The regression this whole accumulator exists for. clicky strips output from
  // every task frame and sends it only as deltas, and it never re-sends what a
  // client has already been given. A supervised task's snapshot changes on almost
  // every poll (its resource sample is re-read), so if the
  // accumulated output lived on the snapshot object it would be destroyed roughly
  // once a second — the stdout tab appearing, then vanishing, for the whole run.
  it("keeps accumulated output when a later task frame replaces the snapshot", async () => {
    const { result } = renderHook(() => useTaskRun({ id: "g1" }));
    const es = MockEventSource.last!;

    act(() => {
      es.emit("task", taskSnap("running"));
      es.emit("output", { id: "t1", groupId: "g1", stream: "stdout", data: "building\n", offset: 0 });
    });
    await waitFor(() => {
      expect(result.current.snapshots.find((s) => s.id === "t1")?.stdout).toBe("building\n");
    });

    // A new task frame for the same task, carrying no stdout key at all.
    act(() => es.emit("task", { ...taskSnap("running"), startedAt: "2026-10-15T07:00:00Z", description: "linking" }));

    await waitFor(() => {
      expect(result.current.snapshots.find((s) => s.id === "t1")).toMatchObject({
        description: "linking",
        startedAt: "2026-10-15T07:00:00Z",
        stdout: "building\n",
      });
    });
  });

  it("accumulates logs frames onto a task frame that carries no logs", async () => {
    const { result } = renderHook(() => useTaskRun({ id: "g1" }));
    const es = MockEventSource.last!;
    const log = (seq: number) => ({ seq, level: "info", message: `line ${seq}`, time: "2026-10-15T07:00:00Z" });
    const logsOf = () => result.current.snapshots.find((s) => s.id === "t1")?.logs;

    act(() => {
      es.emit("task", taskSnap("running"));
      es.emit("logs", { id: "t1", groupId: "g1", entries: [log(1), log(2)], reset: true });
    });
    await waitFor(() => expect(logsOf()).toEqual([log(1), log(2)]));

    act(() => es.emit("logs", { id: "t1", groupId: "g1", entries: [log(2), log(3)] }));
    await waitFor(() => expect(logsOf()).toEqual([log(1), log(2), log(3)]));

    // The next task frame replaces the snapshot and must not take the logs with it.
    act(() => es.emit("task", { ...taskSnap("running"), description: "linking" }));
    await waitFor(() => expect(result.current.snapshots.find((s) => s.id === "t1")?.description).toBe("linking"));
    expect(logsOf()).toEqual([log(1), log(2), log(3)]);

    act(() => es.emit("logs", { id: "t1", groupId: "g1", entries: [log(9)], reset: true }));
    await waitFor(() => expect(logsOf()).toEqual([log(9)]));
  });

  it("reports an unparseable logs frame instead of dropping it silently", async () => {
    const { result } = renderHook(() => useTaskRun({ id: "g1" }));
    const es = MockEventSource.last!;

    act(() => es.emit("logs", { id: "t1", entries: "not-a-list" }));

    await waitFor(() => expect(result.current.status).toBe("invalid task logs data"));
  });

  it("holds output that arrives before its task frame", async () => {
    const { result } = renderHook(() => useTaskRun({ id: "g1" }));
    const es = MockEventSource.last!;

    act(() => es.emit("output", { id: "t1", groupId: "g1", stream: "stdout", data: "early\n", offset: 0 }));
    act(() => es.emit("task", taskSnap("running")));

    await waitFor(() => {
      expect(result.current.snapshots.find((s) => s.id === "t1")?.stdout).toBe("early\n");
    });
  });

  it("never renders a finished run's state as the state of the run it switches to", async () => {
    const renders: Array<{ id: string; isComplete: boolean; snapshotIds: string[] }> = [];
    const { result, rerender } = renderHook(
      ({ id }) => {
        const state = useTaskRun({ id });
        renders.push({ id, isComplete: state.isComplete, snapshotIds: state.snapshots.map((s) => s.id) });
        return state;
      },
      { initialProps: { id: "finished-run" } },
    );
    act(() => {
      MockEventSource.last!.emit("task", groupSnap("success"));
      MockEventSource.last!.emit("done", { status: "completed" });
    });
    await waitFor(() => expect(result.current.isComplete).toBe(true));

    rerender({ id: "retried-run" });

    const switched = renders.filter((render) => render.id === "retried-run");
    expect(switched.length).toBeGreaterThan(0);
    expect(switched).toEqual(switched.map(() => ({ id: "retried-run", isComplete: false, snapshotIds: [] })));
  });

  it("clears snapshots when the subscription is disabled", async () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useTaskRun({ id: "g1", enabled }),
      { initialProps: { enabled: true } },
    );
    const es = MockEventSource.last!;

    act(() => es.emit("task", taskSnap("running")));
    await waitFor(() => expect(result.current.snapshots).toHaveLength(1));

    rerender({ enabled: false });

    await waitFor(() => expect(result.current).toMatchObject({
      snapshots: [],
      status: "idle",
      isComplete: false,
    }));
    expect(es.closed).toBe(true);
  });
});

describe("useTaskRun session feed", () => {
  const CAPTAIN = { type: "captain", id: "abc" };
  const OTHER = { type: "captain", id: "other" };
  const entry = { id: "m1", role: "assistant", parts: [{ type: "text", text: "hello" }] };
  const state = { revision: 2, lifecycleStatus: "running", activityState: "active", facets: "f1" };

  const handlers = () => ({ onEntry: vi.fn(), onState: vi.fn(), onError: vi.fn() });

  beforeEach(() => {
    vi.stubGlobal("EventSource", MockEventSource as unknown as typeof EventSource);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    MockEventSource.last = null;
  });

  it("dispatches session, session-state and session-error frames to the subscriber of that ref only", () => {
    const { result } = renderHook(() => useTaskRun({ id: "g1" }));
    const es = MockEventSource.last!;
    const mine = handlers();
    const theirs = handlers();
    result.current.sessionFeed!.subscribe(CAPTAIN, mine);
    result.current.sessionFeed!.subscribe(OTHER, theirs);

    act(() => es.emit("session", { session: CAPTAIN, entry }));
    act(() => es.emit("session-state", { session: CAPTAIN, state }));
    act(() => es.emit("session-error", { session: CAPTAIN, error: "LISTEN failed" }));

    expect(mine.onEntry).toHaveBeenCalledExactlyOnceWith(entry);
    expect(mine.onState).toHaveBeenCalledExactlyOnceWith(state);
    expect(mine.onError).toHaveBeenCalledExactlyOnceWith("LISTEN failed");
    expect(theirs.onEntry).not.toHaveBeenCalled();
    expect(theirs.onState).not.toHaveBeenCalled();
    expect(theirs.onError).not.toHaveBeenCalled();
  });

  it("delivers to every subscriber of a ref and keeps the feed identity stable across renders", () => {
    const { result, rerender } = renderHook(() => useTaskRun({ id: "g1" }));
    const first = result.current.sessionFeed;
    const a = handlers();
    const b = handlers();
    first!.subscribe(CAPTAIN, a);
    first!.subscribe(CAPTAIN, b);

    rerender();
    act(() => MockEventSource.last!.emit("session", { session: CAPTAIN, entry }));

    expect(result.current.sessionFeed).toBe(first);
    expect(a.onEntry).toHaveBeenCalledTimes(1);
    expect(b.onEntry).toHaveBeenCalledTimes(1);
  });

  it("stops delivering to a subscriber once it unsubscribes", () => {
    const { result } = renderHook(() => useTaskRun({ id: "g1" }));
    const es = MockEventSource.last!;
    const gone = handlers();
    const kept = handlers();
    const unsubscribe = result.current.sessionFeed!.subscribe(CAPTAIN, gone);
    result.current.sessionFeed!.subscribe(CAPTAIN, kept);

    unsubscribe();
    act(() => es.emit("session", { session: CAPTAIN, entry }));

    expect(gone.onEntry).not.toHaveBeenCalled();
    expect(kept.onEntry).toHaveBeenCalledTimes(1);
  });

  it("does not buffer: a frame sent before anyone subscribed is never replayed", () => {
    const { result } = renderHook(() => useTaskRun({ id: "g1" }));
    act(() => MockEventSource.last!.emit("session", { session: CAPTAIN, entry }));

    const late = handlers();
    result.current.sessionFeed!.subscribe(CAPTAIN, late);

    expect(late.onEntry).not.toHaveBeenCalled();
  });

  it.each([
    { name: "a session frame without a session ref", event: "session", data: { entry } },
    { name: "a session frame whose ref has no id", event: "session", data: { session: { type: "captain" }, entry } },
    { name: "a session frame without an entry", event: "session", data: { session: CAPTAIN } },
    { name: "a session frame whose entry has no message id", event: "session", data: { session: CAPTAIN, entry: { role: "assistant" } } },
    { name: "a session-state frame without a revision", event: "session-state", data: { session: CAPTAIN, state: { lifecycleStatus: "running", facets: "f1" } } },
    { name: "a session-state frame without facets", event: "session-state", data: { session: CAPTAIN, state: { revision: 1, lifecycleStatus: "running" } } },
    { name: "a session-error frame without an error string", event: "session-error", data: { session: CAPTAIN, error: 7 } },
  ])("rejects $name loudly and delivers nothing", async ({ event, data }) => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { result } = renderHook(() => useTaskRun({ id: "g1" }));
    const subscriber = handlers();
    result.current.sessionFeed!.subscribe(CAPTAIN, subscriber);

    act(() => MockEventSource.last!.emit(event, data));

    await waitFor(() => expect(result.current.status).toBe("invalid task session data"));
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(String(consoleError.mock.calls[0]?.[0])).toContain(event);
    for (const fn of Object.values(subscriber)) expect(fn).not.toHaveBeenCalled();
  });

  it("rejects a session frame that is not JSON", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { result } = renderHook(() => useTaskRun({ id: "g1" }));
    const subscriber = handlers();
    result.current.sessionFeed!.subscribe(CAPTAIN, subscriber);

    act(() => MockEventSource.last!.emit("session", "{not json"));

    await waitFor(() => expect(result.current.status).toBe("invalid task session data"));
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(subscriber.onEntry).not.toHaveBeenCalled();
  });

  it("has no session feed on the polling transport, which carries no session frames", () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [groupSnap("running")] }));
    const { result } = renderHook(() => useTaskRun({ id: "g1", forcePoll: true }));

    expect(result.current.sessionFeed).toBeUndefined();
  });
});

describe("useTaskRun (polling fallback)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("passes caller headers to polling so a run stays in its selected context", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [groupSnap("success")] });
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useTaskRun({ id: "g1", forcePoll: true, headers: { "X-Context": "dev" } }));
    await waitFor(() => expect(result.current.isComplete).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/tasks/g1"), { headers: { Accept: "application/json", "X-Context": "dev" } });
  });

  it("polls the JSON endpoint and stops once all groups are terminal", async () => {
    // No EventSource available → fall back to polling.
    vi.stubGlobal("EventSource", undefined);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [groupSnap("success"), taskSnap("success")],
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useTaskRun({ id: "g1", pollMs: 10 }));

    await waitFor(() => expect(result.current.isComplete).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/tasks/g1"),
      expect.anything(),
    );
    expect(result.current.snapshots).toHaveLength(2);
  });

  it("ignores an older polling response after the run id changes", async () => {
    vi.stubGlobal("EventSource", undefined);
    const first = deferred<Response>();
    const second = deferred<Response>();
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    vi.stubGlobal("fetch", fetchMock);
    const { result, rerender } = renderHook(
      ({ id }) => useTaskRun({ id, forcePoll: true }),
      { initialProps: { id: "older-run" } },
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    rerender({ id: "newer-run" });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await act(async () => {
      second.resolve(new Response(JSON.stringify([
        { ...groupSnap("success"), id: "newer-run", groupId: "newer-run" },
      ])));
    });
    await waitFor(() => expect(result.current.snapshots.map(({ id }) => id)).toEqual(["newer-run"]));

    await act(async () => {
      first.resolve(new Response(JSON.stringify([
        { ...groupSnap("success"), id: "older-run", groupId: "older-run" },
      ])));
    });
    expect(result.current.snapshots.map(({ id }) => id)).toEqual(["newer-run"]);
  });
});

const runMeta = (id: string, status: string): TaskRunMeta => ({
  id,
  name: id,
  status,
  total: 1,
  completed: status === "success" ? 1 : 0,
  failed: 0,
  running: status === "running" ? 1 : 0,
});

describe("useTaskRuns (SSE)", () => {
  beforeEach(() => {
    vi.stubGlobal("EventSource", MockEventSource as unknown as typeof EventSource);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    MockEventSource.last = null;
  });

  it("subscribes to the runs stream and replaces the listing on each frame", async () => {
    const { result } = renderHook(() => useTaskRuns({ kind: "sql-fix" }));

    const es = MockEventSource.last!;
    expect(es.url).toContain("/tasks/runs/stream");
    expect(es.url).toContain("kind=sql-fix");

    act(() => {
      es.emit("runs", [runMeta("a", "running")]);
    });
    await waitFor(() => expect(result.current.runs).toHaveLength(1));

    // A later frame carries the full listing → it replaces, not accumulates.
    act(() => {
      es.emit("runs", [runMeta("a", "success"), runMeta("b", "running")]);
    });
    await waitFor(() => expect(result.current.runs).toHaveLength(2));
    expect(result.current.runs.find((r) => r.id === "a")?.status).toBe("success");
  });
});

describe("useTaskRuns (polling fallback)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("polls the JSON runs endpoint when EventSource is unavailable", async () => {
    vi.stubGlobal("EventSource", undefined);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [runMeta("a", "running")],
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useTaskRuns({ pollMs: 10 }));

    await waitFor(() => expect(result.current.runs).toHaveLength(1));
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/tasks"),
      expect.anything(),
    );
  });

  it("polls when forcePoll is set even though EventSource exists", async () => {
    vi.stubGlobal("EventSource", MockEventSource as unknown as typeof EventSource);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [runMeta("a", "running")],
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useTaskRuns({ pollMs: 10, forcePoll: true }));

    await waitFor(() => expect(result.current.runs).toHaveLength(1));
    expect(MockEventSource.last).toBeNull();
    expect(fetchMock).toHaveBeenCalled();
  });

  it("ignores an older listing response after the filters change", async () => {
    vi.stubGlobal("EventSource", undefined);
    const first = deferred<Response>();
    const second = deferred<Response>();
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    vi.stubGlobal("fetch", fetchMock);
    const { result, rerender } = renderHook(
      ({ kind }) => useTaskRuns({ kind, forcePoll: true }),
      { initialProps: { kind: "older-kind" } },
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    rerender({ kind: "newer-kind" });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await act(async () => {
      second.resolve(new Response(JSON.stringify([runMeta("newer-run", "success")])));
    });
    await waitFor(() => expect(result.current.runs.map(({ id }) => id)).toEqual(["newer-run"]));

    await act(async () => {
      first.resolve(new Response(JSON.stringify([runMeta("older-run", "success")])));
    });
    expect(result.current.runs.map(({ id }) => id)).toEqual(["newer-run"]);
  });
});

// A minimal EventSourceLike — deliberately not built on the DOM EventSource —
// so this proves the hooks work against the injected surface alone (no
// `instanceof EventSource` anywhere in the implementation).
class InjectedEventSource implements EventSourceLike {
  closed = false;
  readyState = 0;
  onopen: EventSourceLike["onopen"] = null;
  onmessage: EventSourceLike["onmessage"] = null;
  onerror: EventSourceLike["onerror"] = null;
  private listeners: Record<string, ((e: MessageEvent) => void)[]> = {};

  constructor(public url: string) {}

  addEventListener(type: string, fn: EventListenerOrEventListenerObject) {
    (this.listeners[type] ||= []).push(fn as (e: MessageEvent) => void);
  }
  removeEventListener(type: string, fn: EventListenerOrEventListenerObject) {
    this.listeners[type] = (this.listeners[type] ?? []).filter((l) => l !== fn);
  }
  close() {
    this.closed = true;
  }
}

describe("useTaskRun (injected EventSourceFactory)", () => {
  // hasEventSource() still gates on the *global* EventSource existing (a
  // browser without SSE at all falls back to polling regardless of a host's
  // injected transport) — stub something truthy so the gate opens and the
  // hook reaches the injected factory instead.
  beforeEach(() => {
    vi.stubGlobal("EventSource", class {} as unknown as typeof EventSource);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens through the provided factory with the expected URL and closes it on unmount", () => {
    const created: InjectedEventSource[] = [];
    const factory: EventSourceFactory = (url) => {
      const source = new InjectedEventSource(url);
      created.push(source);
      return source;
    };

    const { unmount } = renderHook(() => useTaskRun({ id: "g1" }), {
      wrapper: ({ children }) => createElement(EventSourceProvider, { value: factory }, children),
    });

    expect(created).toHaveLength(1);
    expect(created[0]?.url).toContain("tasks=g1");
    expect(created[0]?.closed).toBe(false);

    unmount();

    expect(created[0]?.closed).toBe(true);
  });

  it("opens the runs listing stream through the provided factory and closes it on unmount", () => {
    const created: InjectedEventSource[] = [];
    const factory: EventSourceFactory = (url) => {
      const source = new InjectedEventSource(url);
      created.push(source);
      return source;
    };

    const { unmount } = renderHook(() => useTaskRuns({ kind: "sql-fix" }), {
      wrapper: ({ children }) => createElement(EventSourceProvider, { value: factory }, children),
    });

    expect(created).toHaveLength(1);
    expect(created[0]?.url).toContain("/tasks/runs/stream");
    expect(created[0]?.url).toContain("kind=sql-fix");

    unmount();

    expect(created[0]?.closed).toBe(true);
  });
});
