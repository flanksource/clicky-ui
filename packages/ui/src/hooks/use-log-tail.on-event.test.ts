import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLogTail, type LogSessionInfo, type LogTailEvent } from "./use-log-tail";

// onEvent is the reducer seam: a consumer that aggregates the stream (counts,
// durations, per-activity state) must see every row the server sent, not the
// window the visible buffer happens to keep.

class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  onerror: ((e: unknown) => void) | null = null;
  closed = false;
  private listeners: Record<string, ((e: MessageEvent) => void)[]> = {};

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }
  addEventListener(type: string, fn: (e: MessageEvent) => void) {
    (this.listeners[type] ||= []).push(fn);
  }
  emit(type: string, data: unknown) {
    this.emitRaw(type, JSON.stringify(data));
  }
  emitRaw(type: string, data: string) {
    for (const fn of this.listeners[type] ?? []) fn({ data } as MessageEvent);
  }
  close() {
    this.closed = true;
  }
}

const SESSION_ID = "sess-cycle-42";
const PROFILE = "cycle-run-events";

const sessionInfo = (overrides: Partial<LogSessionInfo> = {}): LogSessionInfo => ({
  id: SESSION_ID,
  profile: PROFILE,
  kind: "trace",
  state: "running",
  eventCount: 0,
  startedAt: "2026-09-17T08:00:00Z",
  ...overrides,
});

const frame = (sequence: number, activity: string): LogTailEvent => ({
  sessionId: SESSION_ID,
  sequence,
  row: { activity, status: "01" },
});

function stubCreateSession() {
  const mock = vi.fn(async (_url: string, init?: RequestInit) => {
    if ((init?.method ?? "GET").toUpperCase() !== "POST") {
      return { ok: false, status: 405, json: async () => ({}), text: async () => "not served" };
    }
    return { ok: true, status: 201, json: async () => sessionInfo(), text: async () => "" };
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

const sequences = (fn: ReturnType<typeof vi.fn>) => fn.mock.calls.map(([event]) => (event as LogTailEvent).sequence);

/** Every row onEvent was handed, in delivery order. */
const deliveredRows = (fn: ReturnType<typeof vi.fn>) =>
  fn.mock.calls.flatMap(([call]) => {
    const event = call as LogTailEvent;
    return event.rows ?? (event.row ? [event.row] : []);
  });

describe("useLogTail onEvent", () => {
  beforeEach(() => {
    MockEventSource.instances = [];
    vi.stubGlobal("EventSource", MockEventSource as unknown as typeof EventSource);
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const openStream = async () => {
    await waitFor(() => expect(MockEventSource.instances).toHaveLength(1));
    return MockEventSource.instances[0]!;
  };

  it("hands every frame to onEvent in order while the buffer keeps only maxRows", async () => {
    stubCreateSession();
    const onEvent = vi.fn();
    const maxRows = 2;
    const { result } = renderHook(() => useLogTail({ profile: PROFILE, following: true, maxRows, onEvent }));
    const es = await openStream();

    act(() => {
      es.emit("event", frame(101, "SchemeInstall"));
      es.emit("event", frame(102, "SchemeQualityCheck"));
      es.emit("event", frame(103, "InvoiceStart"));
      es.emit("event", frame(104, "SchemeAccept"));
    });

    await waitFor(() => expect(result.current.droppedRows).toBe(2));
    expect({
      delivered: onEvent.mock.calls.map(([event]) => (event as LogTailEvent).row?.activity),
      buffered: result.current.rows.map((row) => row.activity),
    }).toEqual({
      delivered: ["SchemeInstall", "SchemeQualityCheck", "InvoiceStart", "SchemeAccept"],
      buffered: ["InvoiceStart", "SchemeAccept"],
    });
  });

  it("delivers a frame replayed after a reconnect only once", async () => {
    stubCreateSession();
    const onEvent = vi.fn();
    const { result } = renderHook(() => useLogTail({ profile: PROFILE, following: true, onEvent }));
    const es = await openStream();

    act(() => {
      es.emit("event", frame(7, "SchemeInstall"));
      es.emit("event", frame(8, "SchemeQualityCheck"));
      es.emit("event", frame(7, "SchemeInstall"));
      es.emit("event", frame(8, "SchemeQualityCheck"));
      es.emit("event", frame(9, "InvoiceStart"));
    });

    expect(sequences(onEvent)).toEqual([7, 8, 9]);
    // onEvent's watermark and the buffer's are tracked separately, on purpose.
    // Whatever the buffer kept must still have reached onEvent: a reducer that
    // missed a row the tail is showing would be counting a different run.
    expect(deliveredRows(onEvent)).toEqual(expect.arrayContaining(result.current.rows));
  });

  it("is not called for the done frame or a frame it cannot parse", async () => {
    stubCreateSession();
    const onEvent = vi.fn();
    const { result } = renderHook(() => useLogTail({ profile: PROFILE, following: true, onEvent }));
    const es = await openStream();

    act(() => {
      es.emit("event", frame(1, "SchemeInstall"));
      es.emitRaw("event", "{not json");
      es.emit("done", sessionInfo({ state: "completed", eventCount: 1 }));
    });

    await waitFor(() => expect(result.current.status).toBe("completed"));
    expect(sequences(onEvent)).toEqual([1]);
  });

  it("switches to a new callback without opening a second session or stream", async () => {
    const fetchMock = stubCreateSession();
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ onEvent }) => useLogTail({ profile: PROFILE, following: true, onEvent }),
      { initialProps: { onEvent: first } },
    );
    const es = await openStream();
    act(() => es.emit("event", frame(1, "SchemeInstall")));

    rerender({ onEvent: second });
    act(() => es.emit("event", frame(2, "SchemeQualityCheck")));

    expect({
      sessionsCreated: fetchMock.mock.calls.length,
      streams: MockEventSource.instances.length,
      closed: es.closed,
      first: sequences(first),
      second: sequences(second),
    }).toEqual({ sessionsCreated: 1, streams: 1, closed: false, first: [1], second: [2] });
  });

  it("reports a throwing onEvent as a stream error naming the frame", async () => {
    stubCreateSession();
    const onEvent = vi.fn(() => {
      throw new Error("unknown activity status 99");
    });
    const { result } = renderHook(() => useLogTail({ profile: PROFILE, following: true, onEvent }));
    const es = await openStream();

    // The frame carries its own source error too; the reducer failure must not be hidden behind it.
    act(() => es.emit("event", { ...frame(5, "SchemeInstall"), error: "loki: query timed out after 30s" }));

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error?.scope).toBe("stream");
    expect(result.current.error?.message).toContain("sequence 5");
    expect(result.current.error?.message).toContain("unknown activity status 99");
    expect(result.current.rows.map((row) => row.activity)).toEqual(["SchemeInstall"]);
  });
});
