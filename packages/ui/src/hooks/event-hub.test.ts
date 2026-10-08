import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEventHub } from "./event-hub";
import type { EventSourceFactory, EventSourceLike } from "./event-source";

class FakeRealEventSource {
  static instances: FakeRealEventSource[] = [];
  readonly listeners = new Map<string, Set<(ev: Event) => void>>();
  onerror: ((ev: Event) => void) | null = null;
  readyState = 0;
  readonly close = vi.fn();

  constructor(readonly url: string) {
    FakeRealEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: (ev: Event) => void) {
    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    set.add(listener);
  }

  removeEventListener(type: string, listener: (ev: Event) => void) {
    this.listeners.get(type)?.delete(listener);
  }

  emit(type: string, data: string, lastEventId?: string) {
    for (const listener of this.listeners.get(type) ?? []) {
      listener(new MessageEvent(type, { data, lastEventId }));
    }
  }

  // terminal mirrors a non-200 / wrong Content-Type response: the browser sets
  // CLOSED and never reconnects on its own.
  fail({ terminal = false }: { terminal?: boolean } = {}) {
    this.readyState = terminal ? 2 : 0;
    this.onerror?.(new Event("error"));
  }
}

function helloPayload(conn: string, build?: string) {
  return JSON.stringify(build === undefined ? { conn } : { conn, build });
}

function closedPayload(status: number, error?: string) {
  return JSON.stringify(error ? { status, error } : { status });
}

// fetchLog records every POST subscribe / DELETE unsubscribe the hub issues,
// and fetchResponses lets a test script a status per call (default 204).
let fetchLog: { url: string; method: string; body?: unknown }[] = [];
let fetchResponses: (number | (() => number))[] = [];

function installFetchMock() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      fetchLog.push({ url, method, body: init?.body ? JSON.parse(String(init.body)) : undefined });
      const scripted = fetchResponses.shift();
      const status = typeof scripted === "function" ? scripted() : (scripted ?? 204);
      return new Response(null, { status });
    }),
  );
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

const posts = () => fetchLog.filter((call) => call.method === "POST");

beforeEach(() => {
  FakeRealEventSource.instances = [];
  fetchLog = [];
  fetchResponses = [];
  vi.stubGlobal("EventSource", FakeRealEventSource);
  installFetchMock();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("createEventHub", () => {
  it("opens CONNECTING, subscribes once hello arrives, and dispatches open on 204", async () => {
    const open = createEventHub();
    const stream = open("/api/prs/stream");
    expect(stream.readyState).toBe(0);
    expect(FakeRealEventSource.instances).toHaveLength(1);
    expect(FakeRealEventSource.instances[0].url).toBe("/api/events");
    expect(fetchLog).toHaveLength(0); // no hello yet — nothing subscribed

    const opened = vi.fn();
    stream.onopen = opened;
    FakeRealEventSource.instances[0].emit("__hello", helloPayload("conn-1"));
    await flush();

    expect(fetchLog).toEqual([
      { url: "/api/events/conn-1/subs", method: "POST", body: { id: "s1", path: "/api/prs/stream" } },
    ]);
    expect(stream.readyState).toBe(1);
    expect(opened).toHaveBeenCalledTimes(1);
  });

  it("uses the configured url for the real connection, subscribes and unsubscribes", async () => {
    const open = createEventHub({ url: "/custom/events" });
    const stream = open("/api/prs/stream");
    const real = FakeRealEventSource.instances[0];
    expect(real.url).toBe("/custom/events");

    real.emit("__hello", helloPayload("conn-1"));
    await flush();
    stream.close();
    await flush();

    expect(fetchLog.map((call) => `${call.method} ${call.url}`)).toEqual([
      "POST /custom/events/conn-1/subs",
      "DELETE /custom/events/conn-1/subs/s1",
    ]);
  });

  it("routes a named event, including multi-line data, only to the matching virtual source", async () => {
    const open = createEventHub();
    const first = open("/api/prs/stream");
    const second = open("/api/proc/status/stream");
    const real = FakeRealEventSource.instances[0];
    real.emit("__hello", helloPayload("conn-1"));
    await flush();

    const firstMessages: string[] = [];
    const secondMessages: string[] = [];
    first.addEventListener("message", (event) => firstMessages.push((event as MessageEvent).data));
    second.addEventListener("message", (event) => secondMessages.push((event as MessageEvent).data));

    real.emit("s1/message", "line one\nline two");
    real.emit("s2/message", "other stream");

    expect(firstMessages).toEqual(["line one\nline two"]);
    expect(secondMessages).toEqual(["other stream"]);
  });

  it("routes server-named events registered through addEventListener", async () => {
    const open = createEventHub();
    const stream = open("/api/tests/stream");
    const real = FakeRealEventSource.instances[0];
    real.emit("__hello", helloPayload("conn-1"));
    await flush();

    const snapshots: string[] = [];
    stream.addEventListener("snapshot", (event) => snapshots.push((event as MessageEvent).data));
    real.emit("s1/snapshot", "{}");

    expect(snapshots).toEqual(["{}"]);
  });

  it("multiplexes two virtual sources over a single real connection", async () => {
    const open = createEventHub();
    open("/api/prs/stream");
    open("/api/tests/stream");

    expect(FakeRealEventSource.instances).toHaveLength(1);
    FakeRealEventSource.instances[0].emit("__hello", helloPayload("conn-1"));
    await flush();

    expect(posts().map((call) => (call.body as { path: string }).path)).toEqual([
      "/api/prs/stream",
      "/api/tests/stream",
    ]);
  });

  it("keeps two hubs independent: separate real connections, sub ids and routing", async () => {
    const hubA: EventSourceFactory = createEventHub();
    const hubB: EventSourceFactory = createEventHub({ url: "/other/events" });
    const a = hubA("/api/a");
    const b = hubB("/api/b");

    expect(FakeRealEventSource.instances.map((instance) => instance.url)).toEqual([
      "/api/events",
      "/other/events",
    ]);
    const [realA, realB] = FakeRealEventSource.instances;
    realA.emit("__hello", helloPayload("conn-a"));
    realB.emit("__hello", helloPayload("conn-b"));
    await flush();

    expect(fetchLog).toEqual([
      { url: "/api/events/conn-a/subs", method: "POST", body: { id: "s1", path: "/api/a" } },
      { url: "/other/events/conn-b/subs", method: "POST", body: { id: "s1", path: "/api/b" } },
    ]);

    const aMessages: string[] = [];
    const bMessages: string[] = [];
    a.addEventListener("message", (event) => aMessages.push((event as MessageEvent).data));
    b.addEventListener("message", (event) => bMessages.push((event as MessageEvent).data));
    realA.emit("s1/message", "for a");
    realB.emit("s1/message", "for b");
    expect(aMessages).toEqual(["for a"]);
    expect(bMessages).toEqual(["for b"]);

    // Closing every sub on one hub must not tear down the other hub's connection.
    vi.useFakeTimers();
    a.close();
    await vi.advanceTimersByTimeAsync(1000);
    expect(realA.close).toHaveBeenCalledTimes(1);
    expect(realB.close).not.toHaveBeenCalled();
  });

  it("DELETEs the sub and stops dispatching once close() is called", async () => {
    const open = createEventHub();
    const stream = open("/api/activity/stream");
    const real = FakeRealEventSource.instances[0];
    real.emit("__hello", helloPayload("conn-1"));
    await flush();

    const messages: string[] = [];
    stream.addEventListener("message", (event) => messages.push((event as MessageEvent).data));
    stream.close();
    await flush();

    expect(stream.readyState).toBe(2);
    expect(fetchLog.at(-1)).toEqual({ url: "/api/events/conn-1/subs/s1", method: "DELETE", body: undefined });

    // A frame for the now-closed sub id must not reach a dead listener — the
    // hub removed its real-connection routing on close().
    real.emit("s1/message", "late frame");
    expect(messages).toEqual([]);
  });

  it("re-subscribes one second after a 2xx __closed frame, mirroring native reconnect", async () => {
    vi.useFakeTimers();
    const open = createEventHub();
    const stream = open("/api/prs/stream");
    const real = FakeRealEventSource.instances[0];
    real.emit("__hello", helloPayload("conn-1"));
    await vi.advanceTimersByTimeAsync(0);
    expect(stream.readyState).toBe(1);

    const errored = vi.fn();
    stream.onerror = errored;
    real.emit("s1/__closed", closedPayload(200));

    expect(stream.readyState).toBe(0);
    expect(errored).toHaveBeenCalledTimes(1);
    expect(posts()).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(1000);
    expect(posts()).toHaveLength(2);
    expect(stream.readyState).toBe(1);
  });

  it("closes without retry on a non-2xx __closed frame and logs the failure", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const open = createEventHub();
    const stream = open("/api/todos/session/stream");
    const real = FakeRealEventSource.instances[0];
    real.emit("__hello", helloPayload("conn-1"));
    await flush();

    const errored = vi.fn();
    stream.onerror = errored;
    real.emit("s1/__closed", closedPayload(500, "boom"));

    expect(stream.readyState).toBe(2);
    expect(errored).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("/api/todos/session/stream"), "boom");

    await flush();
    expect(posts()).toHaveLength(1); // no retry
  });

  it("marks every sub CONNECTING with an error on a real connection drop, then re-subscribes all of them on the next hello", async () => {
    const open = createEventHub();
    const first = open("/api/prs/stream");
    const second = open("/api/proc/status/stream");
    const real = FakeRealEventSource.instances[0];
    real.emit("__hello", helloPayload("conn-1"));
    await flush();
    expect(first.readyState).toBe(1);
    expect(second.readyState).toBe(1);

    const firstError = vi.fn();
    const secondError = vi.fn();
    first.onerror = firstError;
    second.onerror = secondError;
    real.fail();

    expect(first.readyState).toBe(0);
    expect(second.readyState).toBe(0);
    expect(firstError).toHaveBeenCalledTimes(1);
    expect(secondError).toHaveBeenCalledTimes(1);

    const firstOpen = vi.fn();
    const secondOpen = vi.fn();
    first.onopen = firstOpen;
    second.onopen = secondOpen;
    real.emit("__hello", helloPayload("conn-2"));
    await flush();

    expect(posts().map((call) => call.url)).toEqual([
      "/api/events/conn-1/subs",
      "/api/events/conn-1/subs",
      "/api/events/conn-2/subs",
      "/api/events/conn-2/subs",
    ]);
    expect(first.readyState).toBe(1);
    expect(second.readyState).toBe(1);
    expect(firstOpen).toHaveBeenCalledTimes(1);
    expect(secondOpen).toHaveBeenCalledTimes(1);
  });

  it("keeps a failed sub CLOSED across a real connection drop and the next hello", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const open = createEventHub();
    const stream = open("/api/todos/session/stream");
    const real = FakeRealEventSource.instances[0];
    real.emit("__hello", helloPayload("conn-1"));
    await flush();
    real.emit("s1/__closed", closedPayload(500, "boom"));

    const errored = vi.fn();
    stream.onerror = errored;
    real.fail();
    real.emit("__hello", helloPayload("conn-2"));
    await flush();

    expect({ readyState: stream.readyState, errors: errored.mock.calls.length, posts: posts().length }).toEqual({
      readyState: 2,
      errors: 0,
      posts: 1,
    });
  });

  it("ignores a subscribe response that lands after the connection it was sent on dropped", async () => {
    const open = createEventHub();
    const stream = open("/api/prs/stream");
    const real = FakeRealEventSource.instances[0];
    const opened = vi.fn();
    stream.onopen = opened;

    real.emit("__hello", helloPayload("conn-1"));
    real.fail();
    await flush();

    expect({ readyState: stream.readyState, opens: opened.mock.calls.length }).toEqual({ readyState: 0, opens: 0 });
  });

  it("recreates the real connection after a terminal error and rebinds every active sub", async () => {
    vi.useFakeTimers();
    const open = createEventHub();
    const stream = open("/api/prs/stream");
    const message = vi.fn();
    stream.addEventListener("pr", message);
    const first = FakeRealEventSource.instances[0];
    first.emit("__hello", helloPayload("conn-1"));
    await vi.advanceTimersByTimeAsync(0);

    first.fail({ terminal: true });
    expect(stream.readyState).toBe(0);
    const subRoutes = [...first.listeners].filter(([type, set]) => type.startsWith("s1/") && set.size > 0);
    expect(subRoutes).toEqual([]);
    await vi.advanceTimersByTimeAsync(1000);

    expect(FakeRealEventSource.instances).toHaveLength(2);
    const second = FakeRealEventSource.instances[1];
    second.emit("__hello", helloPayload("conn-2"));
    await vi.advanceTimersByTimeAsync(0);
    second.emit("s1/pr", "updated");

    expect(stream.readyState).toBe(1);
    expect(posts().map((call) => call.url)).toEqual(["/api/events/conn-1/subs", "/api/events/conn-2/subs"]);
    expect(message.mock.calls.map(([event]) => (event as MessageEvent).data)).toEqual(["updated"]);
  });

  it("tears down the real connection only after every sub has been closed for the grace period", async () => {
    vi.useFakeTimers();
    const open = createEventHub();
    const first: EventSourceLike = open("/api/prs/stream");
    const second = open("/api/proc/status/stream");
    const real = FakeRealEventSource.instances[0];
    real.emit("__hello", helloPayload("conn-1"));
    await vi.advanceTimersByTimeAsync(0);

    first.close();
    await vi.advanceTimersByTimeAsync(1000);
    expect(real.close).not.toHaveBeenCalled(); // second sub still open

    second.close();
    await vi.advanceTimersByTimeAsync(999);
    expect(real.close).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(real.close).toHaveBeenCalledTimes(1);

    // A subscribe after full teardown opens a brand-new real connection.
    open("/api/tests/stream");
    expect(FakeRealEventSource.instances).toHaveLength(2);
  });

  it("re-opens within the grace window without tearing down the real connection", async () => {
    vi.useFakeTimers();
    const open = createEventHub();
    const first = open("/api/prs/stream");
    const real = FakeRealEventSource.instances[0];
    real.emit("__hello", helloPayload("conn-1"));
    await vi.advanceTimersByTimeAsync(0);

    first.close();
    open("/api/prs/stream"); // React StrictMode-style immediate re-open
    await vi.advanceTimersByTimeAsync(1000);

    expect(real.close).not.toHaveBeenCalled();
    expect(FakeRealEventSource.instances).toHaveLength(1);
  });
});

describe("createEventHub build-mismatch reload", () => {
  it("reloads once when the hello build differs from the page build", async () => {
    const onBuildMismatch = vi.fn();
    const open = createEventHub({ buildId: "build-a", onBuildMismatch });
    open("/api/prs/stream");
    const real = FakeRealEventSource.instances[0];

    real.emit("__hello", helloPayload("conn-1", "build-b"));
    await flush();
    expect(onBuildMismatch).toHaveBeenCalledTimes(1);

    // A second hello (e.g. the reconnect after a drop, racing the reload)
    // must not trigger a second reload within the same page load.
    real.emit("__hello", helloPayload("conn-2", "build-b"));
    await flush();
    expect(onBuildMismatch).toHaveBeenCalledTimes(1);
  });

  it("reloads the window by default on a mismatch", async () => {
    const originalLocation = Object.getOwnPropertyDescriptor(window, "location")!;
    const reload = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, reload },
      writable: true,
      configurable: true,
    });
    try {
      const open = createEventHub({ buildId: "build-a" });
      open("/api/prs/stream");
      FakeRealEventSource.instances[0].emit("__hello", helloPayload("conn-1", "build-b"));
      await flush();
      expect(reload).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(window, "location", originalLocation);
    }
  });

  it("does not reload when the hello build matches the page build", async () => {
    const onBuildMismatch = vi.fn();
    const open = createEventHub({ buildId: "build-a", onBuildMismatch });
    open("/api/prs/stream");
    FakeRealEventSource.instances[0].emit("__hello", helloPayload("conn-1", "build-a"));
    await flush();

    expect(onBuildMismatch).not.toHaveBeenCalled();
  });

  it.each([
    ["is omitted", undefined],
    ["is null", null],
  ])("does not reload when the page buildId %s", async (_label, buildId) => {
    const onBuildMismatch = vi.fn();
    const open = createEventHub({ buildId, onBuildMismatch });
    open("/api/prs/stream");
    FakeRealEventSource.instances[0].emit("__hello", helloPayload("conn-1", "build-b"));
    await flush();

    expect(onBuildMismatch).not.toHaveBeenCalled();
  });

  it("does not reload when the hello omits a build field", async () => {
    const onBuildMismatch = vi.fn();
    const open = createEventHub({ buildId: "build-a", onBuildMismatch });
    open("/api/prs/stream");
    FakeRealEventSource.instances[0].emit("__hello", helloPayload("conn-1"));
    await flush();

    expect(onBuildMismatch).not.toHaveBeenCalled();
  });

  it("guards the reload per hub, not globally", async () => {
    const mismatchA = vi.fn();
    const mismatchB = vi.fn();
    createEventHub({ buildId: "build-a", onBuildMismatch: mismatchA })("/api/a");
    createEventHub({ buildId: "build-a", onBuildMismatch: mismatchB })("/api/b");
    for (const real of FakeRealEventSource.instances) {
      real.emit("__hello", helloPayload("conn-1", "build-b"));
    }
    await flush();

    expect(mismatchA).toHaveBeenCalledTimes(1);
    expect(mismatchB).toHaveBeenCalledTimes(1);
  });
});
