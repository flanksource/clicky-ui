import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  appendTailEvent,
  emptyLogTailBuffer,
  encodeTailParams,
  useLogTail,
  type LogSessionInfo,
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

/** A fetch double that answers the three calls the hook makes: create, poll, delete. */
function stubFetch(
  handlers: {
    create?: () => { status: number; body: unknown };
    poll?: (url: string) => LogTailEvent[] | { status: number; body: unknown };
  } = {},
) {
  const mock = vi.fn(async (url: string, init?: RequestInit) => {
    const method = (init?.method ?? "GET").toUpperCase();
    if (method === "POST") {
      const { status, body } = handlers.create?.() ?? { status: 201, body: sessionInfo() };
      return response(status, body);
    }
    if (method === "DELETE") return response(204, "");
    const polled = handlers.poll?.(url) ?? [];
    if (Array.isArray(polled)) return response(200, polled);
    return response(polled.status, polled.body);
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
});

describe("useLogTail (SSE)", () => {
  beforeEach(() => {
    vi.stubGlobal("EventSource", MockEventSource as unknown as typeof EventSource);
  });
  afterEach(() => {
    // Unmount before the globals go back, so the DELETE the hook issues on the
    // way out still lands on the fetch double rather than on a real socket.
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    MockEventSource.last = null;
  });

  it("opens a follow session, streams rows ascending, and releases it on unmount", async () => {
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
    await waitFor(() =>
      expect(deleteCalls(fetchMock)[0]?.[0]).toContain(`/sessions/${SESSION_ID}`),
    );
  });

  it("stops the session when the caller stops following, keeping the rows already tailed", async () => {
    const fetchMock = stubFetch();
    const { result, rerender } = renderHook(({ following }) => useLogTail({ profile: PROFILE, following }), {
      initialProps: { following: true },
    });

    await waitFor(() => expect(MockEventSource.last).not.toBeNull());
    const es = MockEventSource.last!;
    act(() => es.emit("event", frame(3, "worker booted")));
    await waitFor(() => expect(result.current.rows).toHaveLength(1));

    rerender({ following: false });

    await waitFor(() => expect(deleteCalls(fetchMock)).toHaveLength(1));
    expect(es.closed).toBe(true);
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
    // Nothing was created, so nothing may be deleted.
    expect(deleteCalls(fetchMock)).toHaveLength(0);
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

describe("useLogTail (polling fallback)", () => {
  afterEach(() => {
    // Unmount before the globals go back, so the DELETE the hook issues on the
    // way out still lands on the fetch double rather than on a real socket.
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    MockEventSource.last = null;
  });

  it("polls the events endpoint from the last sequence it applied", async () => {
    vi.stubGlobal("EventSource", undefined);
    let served = false;
    const fetchMock = stubFetch({
      poll: () => {
        if (served) return [];
        served = true;
        return [frame(31, "poller saw this"), frame(32, "and this")];
      },
    });

    const { result } = renderHook(() => useLogTail({ profile: PROFILE, following: true, pollMs: 5 }));

    await waitFor(() => expect(result.current.rows).toHaveLength(2));
    expect(result.current.status).toBe("polling");
    // The next poll resumes after the highest sequence applied, the same way a
    // reconnecting EventSource resumes from Last-Event-ID.
    await waitFor(() =>
      expect(fetchMock.mock.calls.some(([url]) => String(url).includes("after=32"))).toBe(true),
    );
  });

  it("polls when forcePoll is set even though EventSource exists", async () => {
    vi.stubGlobal("EventSource", MockEventSource as unknown as typeof EventSource);
    stubFetch({ poll: () => [frame(1, "forced poll")] });

    const { result } = renderHook(() =>
      useLogTail({ profile: PROFILE, following: true, pollMs: 5, forcePoll: true }),
    );

    await waitFor(() => expect(result.current.rows).toHaveLength(1));
    expect(MockEventSource.last).toBeNull();
  });

  it("treats a rejected poll as a session error rather than an empty tail", async () => {
    vi.stubGlobal("EventSource", undefined);
    stubFetch({ poll: () => ({ status: 404, body: "no such session" }) });

    const { result } = renderHook(() => useLogTail({ profile: PROFILE, following: true, pollMs: 5 }));

    await waitFor(() => expect(result.current.error?.scope).toBe("session"));
    expect(result.current.error?.message).toContain("404");
    expect(result.current.status).toBe("failed");
  });
});
