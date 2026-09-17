import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ClickyRow } from "../data/Clicky";
import {
  appendTailEvent,
  emptyLogTailBuffer,
  encodeTailParams,
  isTerminalSessionState,
  useLogTail,
  type LogSessionInfo,
  type LogSessionState,
  type LogTailEvent,
} from "./use-log-tail";

// MockEventSource is the same minimal stand-in use-task-run.test.ts drives, so
// the SSE-first path can be stepped frame by frame.
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
      fn({ data: JSON.stringify(data) } as MessageEvent);
    }
  }
  emitRaw(type: string, data: string) {
    for (const fn of this.listeners[type] ?? []) {
      fn({ data } as MessageEvent);
    }
  }
  close() {
    this.closed = true;
  }
}

const SESSION_ID = "sess-7f3a";
const PROFILE = "k8s-pod-logs";

const sessionInfo = (overrides: Partial<LogSessionInfo> = {}): LogSessionInfo => ({
  id: SESSION_ID,
  profile: PROFILE,
  kind: "logs",
  state: "running",
  eventCount: 0,
  startedAt: "2026-08-18T09:14:02Z",
  ...overrides,
});

const podRow = (message: string, level = "info") => ({
  timestamp: "2026-08-18T09:14:07.412Z",
  level,
  pod: "checkout-api-7d9c4f",
  namespace: "storefront",
  message,
});

const frame = (sequence: number, message: string): LogTailEvent => ({
  sessionId: SESSION_ID,
  sequence,
  time: "2026-08-18T09:14:07.412Z",
  row: podRow(message),
});

const response = (status: number, body: unknown) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
  text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
});

/**
 * A fetch double for the one request the hook makes: creating the session.
 * Events only ever arrive over EventSource, so any other request is a defect
 * and answers 405 where the spec can see it.
 */
function stubFetch(
  handlers: {
    create?: (init: RequestInit | undefined) => { status: number; body: unknown } | Promise<{ status: number; body: unknown }>;
  } = {},
) {
  const mock = vi.fn(async (url: string, init?: RequestInit) => {
    const method = (init?.method ?? "GET").toUpperCase();
    if (method === "POST") {
      const { status, body } = (await handlers.create?.(init)) ?? { status: 201, body: sessionInfo() };
      return response(status, body);
    }
    return response(405, `${method} ${url} is not served`);
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

const deleteCalls = (mock: ReturnType<typeof stubFetch>) =>
  mock.mock.calls.filter(([, init]) => (init as RequestInit | undefined)?.method === "DELETE");

describe("encodeTailParams", () => {
  it("appends sorted parameters to a query that already carries follow=true", () => {
    // Sorted so two callers passing the same filters in a different order
    // produce the same string: the effect that opens the session depends on it,
    // and an unstable spelling restarts a live tail on a render that changed
    // nothing.
    expect(encodeTailParams({ namespace: "tenant-x", "filter.Level": "error" })).toBe(
      "&filter.Level=error&namespace=tenant-x",
    );
  });

  it("contributes nothing when there are no parameters", () => {
    expect(encodeTailParams(undefined)).toBe("");
    expect(encodeTailParams({})).toBe("");
  });

  it("omits an absent value rather than spelling it out", () => {
    // The server reads every query key as a supplied parameter, so "kind=null"
    // would state a filter the caller never asked for.
    expect(encodeTailParams({ kind: null, name: undefined, namespace: "tenant-x" })).toBe(
      "&namespace=tenant-x",
    );
  });
});

describe("isTerminalSessionState", () => {
  it.each<[LogSessionState, boolean]>([
    ["starting", false],
    ["running", false],
    ["stopping", false],
    ["completed", true],
    ["failed", true],
    ["stopped", true],
    ["interrupted", true],
  ])("treats %s as terminal=%s", (state, terminal) => {
    // `stopping` is a stop in flight: the session still owns its source and
    // may still emit rows, so a tail must keep reading until the done frame.
    expect(isTerminalSessionState(state)).toBe(terminal);
  });
});

describe("appendTailEvent", () => {
  it("orders rows oldest-first and ignores a replayed sequence", () => {
    // A reconnecting EventSource sends Last-Event-ID and the server replays from
    // there, so frames 7 and 8 arrive twice; only 9 is new.
    const applied = [frame(7, "starting"), frame(8, "ready"), frame(7, "starting"), frame(8, "ready"), frame(9, "serving")].reduce(
      (buffer, event) => appendTailEvent(buffer, event, 100),
      emptyLogTailBuffer,
    );

    expect(applied.rows.map((row) => row.message)).toEqual(["starting", "ready", "serving"]);
    expect(applied.lastSequence).toBe(9);
    expect(applied.dropped).toBe(0);
  });

  it("keeps the newest rows within the cap and counts what it dropped", () => {
    const applied = [frame(41, "one"), frame(42, "two"), frame(43, "three")].reduce(
      (buffer, event) => appendTailEvent(buffer, event, 2),
      emptyLogTailBuffer,
    );

    expect(applied.rows.map((row) => row.message)).toEqual(["two", "three"]);
    expect(applied.dropped).toBe(1);
  });

  it("returns the same buffer when a duplicate carries nothing new", () => {
    const first = appendTailEvent(emptyLogTailBuffer, frame(5, "hello"), 10);
    expect(appendTailEvent(first, frame(5, "hello"), 10)).toBe(first);
  });

  it("keeps clickyRow index-aligned with the raw row it presents", () => {
    // A trace/follow session's per-row event carries the exact ClickyRow the
    // list document's own node.rows[n] uses — a plain log tail never sets
    // this, so it must default to undefined without disturbing `rows` itself.
    const presented: ClickyRow = { cells: { message: { kind: "text", plain: "ready" } } };
    const withRow: LogTailEvent = { ...frame(1, "starting") };
    const withClickyRow: LogTailEvent = { ...frame(2, "ready"), clickyRow: presented };

    const applied = [withRow, withClickyRow].reduce(
      (buffer, event) => appendTailEvent(buffer, event, 10),
      emptyLogTailBuffer,
    );

    expect(applied.rows.map((row) => row.message)).toEqual(["starting", "ready"]);
    expect(applied.clickyRows).toEqual([undefined, presented]);
  });

  it("pads a batched rows frame with undefined clickyRows, one per row", () => {
    const batch: LogTailEvent = {
      sessionId: SESSION_ID,
      sequence: 3,
      rows: [podRow("one"), podRow("two")],
    };
    const applied = appendTailEvent(emptyLogTailBuffer, batch, 10);
    expect(applied.clickyRows).toEqual([undefined, undefined]);
  });

  it("evicts clickyRows in step with the rows the cap drops", () => {
    const presented: ClickyRow = { cells: { message: { kind: "text", plain: "three" } } };
    const applied = [
      frame(41, "one"),
      frame(42, "two"),
      { ...frame(43, "three"), clickyRow: presented },
    ].reduce((buffer, event) => appendTailEvent(buffer, event, 2), emptyLogTailBuffer);

    expect(applied.rows.map((row) => row.message)).toEqual(["two", "three"]);
    expect(applied.clickyRows).toEqual([undefined, presented]);
  });
});

describe("useLogTail (SSE)", () => {
  beforeEach(() => {
    vi.stubGlobal("EventSource", MockEventSource as unknown as typeof EventSource);
  });
  afterEach(() => {
    // Unmount before the globals go back, so any request the hook made on the
    // way out would still land on the fetch double rather than a real socket.
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    MockEventSource.last = null;
  });

  it("opens a follow session, streams rows ascending, and only closes the stream on unmount", async () => {
    const fetchMock = stubFetch();
    const { result, unmount } = renderHook(() =>
      useLogTail({ profile: PROFILE, params: { namespace: "storefront" }, following: true }),
    );

    await waitFor(() => expect(MockEventSource.last).not.toBeNull());
    // The parameters have to be in the URL, not a body: sessionHandler.start
    // builds its params from r.URL.Query() and never reads the body, so a posted
    // filter is one the server silently drops — the tail would run the profile's
    // defaults while the reader believed they were following what they filtered.
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/v1/profile/${PROFILE}/sessions?follow=true&namespace=storefront`,
      expect.objectContaining({ method: "POST" }),
    );
    const es = MockEventSource.last!;
    expect(es.url).toContain(`/sessions/${SESSION_ID}/events`);
    await waitFor(() => expect(result.current.sessionId).toBe(SESSION_ID));
    expect(result.current.following).toBe(true);

    act(() => {
      es.emit("event", frame(12, "GET /checkout 200"));
      es.emit("event", { ...frame(13, "ignored"), row: undefined, rows: [podRow("GET /cart 200"), podRow("GET /cart 500", "error")] });
    });

    await waitFor(() => expect(result.current.rows).toHaveLength(3));
    expect(result.current.rows.map((row) => row.message)).toEqual([
      "GET /checkout 200",
      "GET /cart 200",
      "GET /cart 500",
    ]);
    expect(result.current.status).toBe("streaming");
    expect(result.current.error).toBeNull();

    unmount();
    expect(es.closed).toBe(true);
    // The server reaps a view session once it has no subscriber; there is no
    // DELETE route to call.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(deleteCalls(fetchMock)).toHaveLength(0);
  });

  it("closes the stream when the caller stops following, keeping the rows already tailed", async () => {
    const fetchMock = stubFetch();
    const { result, rerender } = renderHook(({ following }) => useLogTail({ profile: PROFILE, following }), {
      initialProps: { following: true },
    });

    await waitFor(() => expect(MockEventSource.last).not.toBeNull());
    const es = MockEventSource.last!;
    act(() => es.emit("event", frame(3, "worker booted")));
    await waitFor(() => expect(result.current.rows).toHaveLength(1));

    rerender({ following: false });

    await waitFor(() => expect(es.closed).toBe(true));
    expect(deleteCalls(fetchMock)).toHaveLength(0);
    expect(result.current.following).toBe(false);
    expect(result.current.status).toBe("idle");
    expect(result.current.rows).toHaveLength(1);
  });

  it("reports the session cap as a start failure, not as a quiet stop", async () => {
    const fetchMock = stubFetch({
      create: () => ({ status: 409, body: "max concurrent sessions reached (8 of 8)" }),
    });

    const { result } = renderHook(() => useLogTail({ profile: PROFILE, following: true }));

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error).toMatchObject({ scope: "start", httpStatus: 409 });
    expect(result.current.error?.message).toContain("max concurrent sessions reached (8 of 8)");
    expect(result.current.status).toBe("failed");
    expect(result.current.following).toBe(false);
    expect(result.current.sessionId).toBeNull();
    expect(MockEventSource.last).toBeNull();
    expect(deleteCalls(fetchMock)).toHaveLength(0);
  });

  it("keeps following a session that reports stopping until its done frame", async () => {
    stubFetch({ create: () => ({ status: 201, body: sessionInfo({ state: "stopping" }) }) });
    const { result } = renderHook(() => useLogTail({ profile: PROFILE, following: true }));

    await waitFor(() => expect(result.current.session?.state).toBe("stopping"));
    const es = MockEventSource.last!;
    act(() => es.emit("event", frame(4, "flushed after stop")));

    await waitFor(() => expect(result.current.rows).toHaveLength(1));
    expect(result.current.following).toBe(true);
    expect(es.closed).toBe(false);
  });

  it("surfaces an event-level error without abandoning the stream", async () => {
    stubFetch();
    const { result } = renderHook(() => useLogTail({ profile: PROFILE, following: true }));

    await waitFor(() => expect(MockEventSource.last).not.toBeNull());
    const es = MockEventSource.last!;
    act(() => {
      es.emit("event", { sessionId: SESSION_ID, sequence: 20, error: "loki: query timed out after 30s" });
      es.emit("event", frame(21, "reconnected to loki"));
    });

    await waitFor(() => expect(result.current.error?.message).toContain("loki: query timed out"));
    expect(result.current.error?.scope).toBe("stream");
    expect(result.current.rows.map((row) => row.message)).toEqual(["reconnected to loki"]);
    expect(result.current.following).toBe(true);
  });

  it("reports a terminal failed session with the server's reason", async () => {
    stubFetch();
    const { result } = renderHook(() => useLogTail({ profile: PROFILE, following: true }));

    await waitFor(() => expect(MockEventSource.last).not.toBeNull());
    const es = MockEventSource.last!;
    act(() =>
      es.emit("done", sessionInfo({ state: "failed", error: "kubelet closed the log stream", eventCount: 4 })),
    );

    await waitFor(() => expect(result.current.status).toBe("failed"));
    expect(result.current.error).toMatchObject({ scope: "session" });
    expect(result.current.error?.message).toContain("kubelet closed the log stream");
    expect(result.current.following).toBe(false);
    expect(es.closed).toBe(true);
  });

  it("ends cleanly on a stopped session without inventing an error", async () => {
    stubFetch();
    const { result } = renderHook(() => useLogTail({ profile: PROFILE, following: true }));

    await waitFor(() => expect(MockEventSource.last).not.toBeNull());
    act(() => MockEventSource.last!.emit("done", sessionInfo({ state: "stopped", stoppedAt: "2026-08-18T09:19:00Z" })));

    await waitFor(() => expect(result.current.status).toBe("stopped"));
    expect(result.current.error).toBeNull();
    expect(result.current.following).toBe(false);
  });

  it("reports a frame it cannot parse rather than dropping it silently", async () => {
    stubFetch();
    const { result } = renderHook(() => useLogTail({ profile: PROFILE, following: true }));

    await waitFor(() => expect(MockEventSource.last).not.toBeNull());
    act(() => MockEventSource.last!.emitRaw("event", "{not json"));

    await waitFor(() => expect(result.current.error?.scope).toBe("stream"));
    expect(result.current.error?.message).toContain("unparseable");
  });

  it("bounds the buffer at maxRows and reports the rows it dropped", async () => {
    stubFetch();
    const { result } = renderHook(() => useLogTail({ profile: PROFILE, following: true, maxRows: 2 }));

    await waitFor(() => expect(MockEventSource.last).not.toBeNull());
    const es = MockEventSource.last!;
    act(() => {
      es.emit("event", frame(1, "first"));
      es.emit("event", frame(2, "second"));
      es.emit("event", frame(3, "third"));
    });

    await waitFor(() => expect(result.current.droppedRows).toBe(1));
    expect(result.current.rows.map((row) => row.message)).toEqual(["second", "third"]);
  });
});

describe("useLogTail (release)", () => {
  beforeEach(() => {
    vi.stubGlobal("EventSource", MockEventSource as unknown as typeof EventSource);
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    MockEventSource.last = null;
  });

  const flush = () => new Promise((resolve) => setTimeout(resolve, 10));

  it("aborts a start still in flight on unmount and never subscribes or fetches afterwards", async () => {
    let answer: ((value: { status: number; body: unknown }) => void) | undefined;
    let signal: AbortSignal | undefined;
    const fetchMock = stubFetch({
      create: (init) => {
        signal = init?.signal ?? undefined;
        return new Promise((resolve) => {
          answer = resolve;
        });
      },
    });
    const { result, unmount } = renderHook(() => useLogTail({ profile: PROFILE, following: true }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    unmount();
    expect(signal?.aborted).toBe(true);
    answer?.({ status: 201, body: sessionInfo() });
    await flush();

    expect({ fetches: fetchMock.mock.calls.length, subscribed: MockEventSource.last, error: result.current.error }).toEqual({
      fetches: 1,
      subscribed: null,
      error: null,
    });
  });

  it("makes no request after unmounting a live stream", async () => {
    const fetchMock = stubFetch();
    const { unmount } = renderHook(() => useLogTail({ profile: PROFILE, following: true }));
    await waitFor(() => expect(MockEventSource.last).not.toBeNull());
    const es = MockEventSource.last!;

    unmount();
    act(() => es.onerror?.(new Event("error")));
    await flush();

    expect({ closed: es.closed, fetches: fetchMock.mock.calls.length }).toEqual({ closed: true, fetches: 1 });
  });

  it("closes the old stream and opens a new session when the parameters change", async () => {
    let nextId = 1;
    const fetchMock = stubFetch({
      create: () => ({ status: 201, body: sessionInfo({ id: `sess-${nextId++}` }) }),
    });
    const { result, rerender } = renderHook(
      ({ namespace }) => useLogTail({ profile: PROFILE, params: { namespace }, following: true }),
      { initialProps: { namespace: "storefront" } },
    );
    await waitFor(() => expect(MockEventSource.last?.url).toContain("/sessions/sess-1/events"));
    const first = MockEventSource.last!;

    rerender({ namespace: "tenant-x" });

    await waitFor(() => expect(MockEventSource.last?.url).toContain("/sessions/sess-2/events"));
    expect(first.closed).toBe(true);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      `/api/v1/profile/${PROFILE}/sessions?follow=true&namespace=storefront`,
      `/api/v1/profile/${PROFILE}/sessions?follow=true&namespace=tenant-x`,
    ]);
    expect(result.current.sessionId).toBe("sess-2");
  });
});

describe("useLogTail without EventSource", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    MockEventSource.last = null;
  });

  it("fails with an explicit start error and never creates a session nobody would read", async () => {
    vi.stubGlobal("EventSource", undefined);
    const fetchMock = stubFetch();

    const { result } = renderHook(() => useLogTail({ profile: PROFILE, following: true }));

    await waitFor(() => expect(result.current.status).toBe("failed"));
    expect(result.current.error).toMatchObject({ scope: "start" });
    expect(result.current.error?.message).toContain("EventSource");
    expect(result.current.following).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
