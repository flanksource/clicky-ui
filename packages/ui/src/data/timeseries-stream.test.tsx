import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import { useState, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEventHub } from "../hooks/event-hub";
import type { EventSourceFactory } from "../hooks/event-source";
import { EventSourceProvider } from "../hooks/event-source-provider";
import { TimeseriesCoreBars } from "./TimeseriesCoreBars";
import { TimeseriesGauge } from "./TimeseriesGauge";
import { TimeseriesPanel } from "./TimeseriesPanel";
import type { TimeseriesServerSeries } from "./TimeseriesPanel.model";
import {
  createTimeseriesStream,
  timeseriesStreamAddress,
  timeseriesStreamGroupKey,
  timeseriesStreamInterval,
  useTimeseriesStream,
  type TimeseriesStream,
  type TimeseriesStreamGroupState,
} from "./timeseries-stream";
import { TimeseriesStreamProvider } from "./timeseries-stream-provider";
import { createFakeEventSourceFactory } from "./timeseries-stream.fixtures";

const BASE_URL = "/api/v1/metrics/";
const RANGE = "15m";
const REFRESH_MS = 5000;
const DEBOUNCE_MS = 10;

function Harness({ factory, children }: { factory: EventSourceFactory; children: ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
  );
  return (
    <QueryClientProvider client={client}>
      <EventSourceProvider value={factory}>
        <TimeseriesStreamProvider debounceMs={DEBOUNCE_MS}>{children}</TimeseriesStreamProvider>
      </EventSourceProvider>
    </QueryClientProvider>
  );
}

/** Points a minute apart ending a minute ago, inside any panel window. */
function recentPoints(values: number[]): { at: string; value: number }[] {
  const end = Date.now() - 60_000;
  return values.map((value, i) => ({
    at: new Date(end - (values.length - 1 - i) * 60_000).toISOString(),
    value,
  }));
}

function plain(id: string, values: number[]): TimeseriesServerSeries {
  return { id, source: id, points: recentPoints(values) };
}

const neverFetch = vi.fn(async (url: string) => {
  throw new Error(`unexpected GET ${url}`);
});

function threeWidgets(withCoreBars: boolean) {
  return (
    <>
      <TimeseriesPanel
        title="Disk"
        baseUrl={BASE_URL}
        series={[{ id: "disk.reads" }, { id: "disk.writes" }]}
        range={RANGE}
        refreshMs={REFRESH_MS}
        fetcher={neverFetch}
      />
      <TimeseriesGauge
        title="CPU"
        baseUrl={BASE_URL}
        value={{ id: "cpu.usage" }}
        max={{ id: "cpu.limit" }}
        range={RANGE}
        refreshMs={REFRESH_MS}
        fetcher={neverFetch}
      />
      {withCoreBars ? (
        <TimeseriesCoreBars
          title="Cores"
          baseUrl={BASE_URL}
          value={{ id: "cores.usage" }}
          range={RANGE}
          refreshMs={REFRESH_MS}
          fetcher={neverFetch}
        />
      ) : null}
    </>
  );
}

describe("TimeseriesStreamProvider subscriptions", () => {
  it("serves three widgets and five ids with exactly one subscription", async () => {
    const fake = createFakeEventSourceFactory();
    render(<Harness factory={fake.factory}>{threeWidgets(true)}</Harness>);

    await waitFor(() => expect(fake.opened).toHaveLength(1));
    const source = fake.latest();
    expect({
      path: new URL(source.url, "http://x.test").pathname,
      ids: source.ids,
      since: source.param("since"),
      interval: source.param("interval"),
    }).toEqual({
      path: "/api/v1/metrics/stream",
      ids: ["cores.usage", "cpu.limit", "cpu.usage", "disk.reads", "disk.writes"],
      since: RANGE,
      interval: "5s",
    });
    expect(neverFetch).not.toHaveBeenCalled();
  });

  it("re-subscribes once with the remaining ids when one widget unmounts", async () => {
    const fake = createFakeEventSourceFactory();
    const { rerender } = render(<Harness factory={fake.factory}>{threeWidgets(true)}</Harness>);
    await waitFor(() => expect(fake.opened).toHaveLength(1));

    rerender(<Harness factory={fake.factory}>{threeWidgets(false)}</Harness>);

    await waitFor(() => expect(fake.opened).toHaveLength(2));
    await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_MS * 5));
    expect(fake.opened.map((s) => ({ ids: s.ids, closed: s.closed }))).toEqual([
      { ids: ["cores.usage", "cpu.limit", "cpu.usage", "disk.reads", "disk.writes"], closed: true },
      { ids: ["cpu.limit", "cpu.usage", "disk.reads", "disk.writes"], closed: false },
    ]);
  });

  it("closes the group's subscription when its last widget unmounts", async () => {
    const fake = createFakeEventSourceFactory();
    const { unmount } = render(<Harness factory={fake.factory}>{threeWidgets(true)}</Harness>);
    await waitFor(() => expect(fake.opened).toHaveLength(1));
    unmount();
    expect(fake.latest().closed).toBe(true);
  });
});

describe("createTimeseriesStream frames", () => {
  const group = { baseUrl: BASE_URL, range: RANGE, interval: "5s" };
  const at = (hhmmss: string) => `2026-06-02T${hhmmss}Z`;

  function bySourcePoints(state: TimeseriesStreamGroupState) {
    return Object.fromEntries(
      [...state.bySource].map(([source, series]) => [source, series.map((s) => s.points)]),
    );
  }

  it("merges appends by timestamp, trims to the window as it slides, and drops removed series", async () => {
    const fake = createFakeEventSourceFactory();
    let now = Date.parse(at("12:15:00"));
    const stream = createTimeseriesStream({ factory: fake.factory, debounceMs: 0, now: () => now });
    stream.register({ ...group, id: "cpu" });
    stream.register({ ...group, id: "mem" });
    await vi.waitFor(() => expect(fake.opened).toHaveLength(1));

    fake.latest().emit("snapshot", {
      series: [
        { id: "cpu", source: "cpu", points: [{ at: at("12:00:30"), value: 1 }, { at: at("12:01:00"), value: 2 }] },
        { id: "mem", source: "mem", points: [{ at: at("12:01:00"), value: 5 }] },
      ],
    });
    now = Date.parse(at("12:16:00"));
    fake.latest().emit("append", {
      series: [{ id: "cpu", source: "cpu", points: [{ at: at("12:01:00"), value: 3 }, { at: at("12:02:00"), value: 4 }] }],
      removed: ["mem"],
    });

    const state = stream.getGroup(timeseriesStreamGroupKey(group));
    expect({ points: bySourcePoints(state), answered: [...state.answered].sort(), error: state.error }).toEqual({
      // 12:00:30 fell out of the 15m window ending 12:16; 12:01 took the appended value.
      points: { cpu: [[{ at: at("12:01:00"), value: 3 }, { at: at("12:02:00"), value: 4 }]] },
      answered: ["cpu", "mem"],
      error: null,
    });
    stream.close();
  });

  it("adds a series first seen in an append in full", async () => {
    const fake = createFakeEventSourceFactory();
    const now = Date.parse(at("12:15:00"));
    const stream = createTimeseriesStream({ factory: fake.factory, debounceMs: 0, now: () => now });
    stream.register({ ...group, id: "profile:pod-cpu" });
    await vi.waitFor(() => expect(fake.opened).toHaveLength(1));

    fake.latest().emit("snapshot", { series: [] });
    fake.latest().emit("append", {
      series: [
        { id: "profile:pod-cpu#pod=a", source: "profile:pod-cpu", points: [{ at: at("12:10:00"), value: 7 }] },
      ],
    });

    expect(bySourcePoints(stream.getGroup(timeseriesStreamGroupKey(group)))).toEqual({
      "profile:pod-cpu": [[{ at: at("12:10:00"), value: 7 }]],
    });
    stream.close();
  });

  it.each([
    ["a baseUrl is used as given", "/api/v1/metrics/", "cpu", { baseUrl: "/api/v1/metrics/", id: "cpu" }],
    ["a url splits at its last path slash", "", "/api/v1/metrics/sqlserver.cpu", { baseUrl: "/api/v1/metrics/", id: "sqlserver.cpu" }],
    ["a slash in the query stays in the id", "", "/m/profile:pods?ns=a/b", { baseUrl: "/m/", id: "profile:pods?ns=a/b" }],
    ["a bare id has no stream endpoint", "", "cpu", null],
    ["a url ending in a slash names no id", "", "/api/v1/metrics/", null],
  ])("timeseriesStreamAddress: %s", (_name, baseUrl, id, expected) => {
    expect(timeseriesStreamAddress(baseUrl, id)).toEqual(expected);
  });

  it.each([
    [0, null],
    [400, "1s"],
    [1000, "1s"],
    [1500, "2s"],
    [5000, "5s"],
  ])("derives the stream interval from refreshMs %d as %s", (refreshMs, expected) => {
    expect(timeseriesStreamInterval(refreshMs)).toBe(expected);
  });
});

describe("TimeseriesPanel under a stream", () => {
  it("renders every series one requested profile id expands into, labelled and unit-formatted from the server", async () => {
    const fake = createFakeEventSourceFactory();
    render(
      <Harness factory={fake.factory}>
        <TimeseriesPanel
          title="Pod CPU"
          baseUrl={BASE_URL}
          series={[{ id: "profile:pod-cpu" }]}
          range={RANGE}
          refreshMs={REFRESH_MS}
          fetcher={neverFetch}
        />
      </Harness>,
    );
    await waitFor(() => expect(fake.opened).toHaveLength(1));

    act(() =>
      fake.latest().emit("snapshot", {
        series: [
          { id: "profile:pod-cpu#pod=api", source: "profile:pod-cpu", labels: { pod: "api" }, unit: "percent", points: recentPoints([10, 20]) },
          { id: "profile:pod-cpu#pod=worker", source: "profile:pod-cpu", labels: { pod: "worker" }, unit: "percent", points: recentPoints([30, 40]) },
          { id: "profile:pod-cpu#pod=web", source: "profile:pod-cpu", label: "web tier", labels: { pod: "web" }, unit: "percent", points: recentPoints([50, 60]) },
        ],
      }),
    );

    const legend = await screen.findAllByRole("listitem");
    expect(legend.map((li) => li.textContent)).toEqual(["api20%", "worker40%", "web tier60%"]);
  });

  it("plots plain ids under their own labels", async () => {
    const fake = createFakeEventSourceFactory();
    render(
      <Harness factory={fake.factory}>
        <TimeseriesPanel
          title="Disk"
          baseUrl={BASE_URL}
          series={[{ id: "disk.reads", label: "reads" }, { id: "disk.writes", label: "writes" }]}
          unit="short"
          range={RANGE}
          refreshMs={REFRESH_MS}
          fetcher={neverFetch}
        />
      </Harness>,
    );
    await waitFor(() => expect(fake.opened).toHaveLength(1));

    act(() => fake.latest().emit("snapshot", { series: [plain("disk.reads", [1, 2]), plain("disk.writes", [3, 4])] }));

    const legend = await screen.findAllByRole("listitem");
    expect(legend.map((li) => li.textContent)).toEqual(["reads2", "writes4"]);
  });

  it("streams single-url panels from their url's prefix in one subscription", async () => {
    const fake = createFakeEventSourceFactory();
    render(
      <Harness factory={fake.factory}>
        <TimeseriesPanel title="SQL CPU" url="/api/v1/metrics/sqlserver.cpu" unit="percent" range={RANGE} refreshMs={REFRESH_MS} fetcher={neverFetch} />
        <TimeseriesPanel title="SQL memory" url="/api/v1/metrics/sqlserver.memory" unit="percent" range={RANGE} refreshMs={REFRESH_MS} fetcher={neverFetch} />
      </Harness>,
    );
    await waitFor(() => expect(fake.opened).toHaveLength(1));
    expect(fake.latest().url).toBe(
      "/api/v1/metrics/stream?id=sqlserver.cpu&id=sqlserver.memory&since=15m&interval=5s",
    );

    act(() =>
      fake.latest().emit("snapshot", { series: [plain("sqlserver.cpu", [10, 42]), plain("sqlserver.memory", [70, 77])] }),
    );

    expect(await screen.findByText("42%")).toBeInTheDocument();
    expect(screen.getByText("77%")).toBeInTheDocument();
  });

  it("shows a stream error event in the panel", async () => {
    const fake = createFakeEventSourceFactory();
    render(
      <Harness factory={fake.factory}>
        <TimeseriesPanel
          title="Pod CPU"
          baseUrl={BASE_URL}
          series={[{ id: "profile:pod-cpu" }]}
          range={RANGE}
          refreshMs={REFRESH_MS}
          fetcher={neverFetch}
        />
      </Harness>,
    );
    await waitFor(() => expect(fake.opened).toHaveLength(1));

    act(() => fake.latest().emit("error", { error: "query \"profile\" series [profile:pod-cpu]: prometheus unavailable" }));

    expect(
      await screen.findByText('query "profile" series [profile:pod-cpu]: prometheus unavailable'),
    ).toBeInTheDocument();
  });

  it("shows a subscription that failed to open in the panel", async () => {
    const fake = createFakeEventSourceFactory();
    render(
      <Harness factory={fake.factory}>
        <TimeseriesPanel
          title="CPU"
          baseUrl={BASE_URL}
          series={[{ id: "cpu.usage" }]}
          range={RANGE}
          refreshMs={REFRESH_MS}
          fetcher={neverFetch}
        />
      </Harness>,
    );
    await waitFor(() => expect(fake.opened).toHaveLength(1));

    act(() => fake.latest().fail());

    expect(await screen.findByText(/^metrics stream closed: /)).toBeInTheDocument();
  });
});

// HubConnection stands in for the native EventSource the event hub opens: it
// hands each registered listener the frames a test emits on the wire.
class HubConnection {
  static instances: HubConnection[] = [];
  readonly listeners = new Map<string, Set<(ev: Event) => void>>();
  onerror: ((ev: Event) => void) | null = null;
  readyState = 1;
  close = vi.fn();

  constructor(readonly url: string) {
    HubConnection.instances.push(this);
  }

  addEventListener(type: string, listener: (ev: Event) => void) {
    const set = this.listeners.get(type) ?? new Set();
    set.add(listener);
    this.listeners.set(type, set);
  }

  removeEventListener(type: string, listener: (ev: Event) => void) {
    this.listeners.get(type)?.delete(listener);
  }

  emit(type: string, data: unknown) {
    for (const listener of this.listeners.get(type) ?? []) {
      listener(new MessageEvent(type, { data: JSON.stringify(data) }));
    }
  }
}

describe("a stream group under the event hub", () => {
  beforeEach(() => {
    HubConnection.instances = [];
    vi.stubGlobal("EventSource", HubConnection);
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 204 })));
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("surfaces the exact message of a sub the server closed with an error to the group and its panels", async () => {
    // clicky metrics.RegisterStreamRoutes answers an unknown id with
    // http.Error(400), which the hub relays as the sub's __closed error.
    const serverError = 'unknown series "disk.reads"';
    let stream: TimeseriesStream | null = null;
    function CaptureStream() {
      stream = useTimeseriesStream();
      return null;
    }
    render(
      <Harness factory={createEventHub()}>
        <CaptureStream />
        {threeWidgets(false)}
      </Harness>,
    );
    await waitFor(() => expect(HubConnection.instances).toHaveLength(1));
    const connection = HubConnection.instances[0] as HubConnection;
    connection.emit("__hello", { conn: "conn-1" });
    await waitFor(() => expect(connection.listeners.has("s1/__closed")).toBe(true));

    act(() => connection.emit("s1/__closed", { status: 400, error: `${serverError}\n` }));

    const group = { baseUrl: BASE_URL, range: RANGE, interval: "5s" };
    await waitFor(() =>
      expect(stream?.getGroup(timeseriesStreamGroupKey(group)).error?.message).toBe(serverError),
    );
    expect(screen.getByText(serverError)).toBeInTheDocument();
    expect(screen.getByLabelText(`CPU: ${serverError}`)).toBeInTheDocument();
  });
});

describe("gauges under a stream", () => {
  it("TimeseriesGauge reads value and max from the stream", async () => {
    const fake = createFakeEventSourceFactory();
    render(
      <Harness factory={fake.factory}>
        <TimeseriesGauge
          title="CPU"
          baseUrl={BASE_URL}
          value={{ id: "cpu.usage" }}
          max={{ id: "cpu.limit" }}
          centerDisplay="percent"
          range={RANGE}
          refreshMs={REFRESH_MS}
          expandable={false}
          fetcher={neverFetch}
        />
      </Harness>,
    );
    await waitFor(() => expect(fake.opened).toHaveLength(1));

    act(() => fake.latest().emit("snapshot", { series: [plain("cpu.usage", [10, 25]), plain("cpu.limit", [100, 100])] }));

    expect(await screen.findByText("25%")).toBeInTheDocument();
  });

  it("TimeseriesCoreBars reads its value from the stream", async () => {
    const fake = createFakeEventSourceFactory();
    render(
      <Harness factory={fake.factory}>
        <TimeseriesCoreBars
          title="Cores"
          baseUrl={BASE_URL}
          value={{ id: "cores.usage" }}
          max={4000}
          range={RANGE}
          refreshMs={REFRESH_MS}
          fetcher={neverFetch}
        />
      </Harness>,
    );
    await waitFor(() => expect(fake.opened).toHaveLength(1));

    act(() => fake.latest().emit("snapshot", { series: [plain("cores.usage", [1000, 2000])] }));

    expect(await screen.findByText("2 cores")).toBeInTheDocument();
  });

  it("TimeseriesCoreBars shows a stream error event", async () => {
    const fake = createFakeEventSourceFactory();
    render(
      <Harness factory={fake.factory}>
        <TimeseriesCoreBars
          title="Cores"
          baseUrl={BASE_URL}
          value={{ id: "cores.usage" }}
          max={4000}
          range={RANGE}
          refreshMs={REFRESH_MS}
          fetcher={neverFetch}
        />
      </Harness>,
    );
    await waitFor(() => expect(fake.opened).toHaveLength(1));

    act(() => fake.latest().emit("error", { error: "store unavailable" }));

    expect(await screen.findByLabelText("Cores: store unavailable")).toHaveTextContent("store unavailable");
  });

  it("fetches once instead of streaming a widget with refreshMs 0", async () => {
    const fake = createFakeEventSourceFactory();
    const fetcher = vi.fn(async (_url: string) => ({ id: "cores.usage", points: recentPoints([1000, 2000]) }));
    render(
      <Harness factory={fake.factory}>
        <TimeseriesCoreBars
          title="Cores"
          baseUrl={BASE_URL}
          value={{ id: "cores.usage" }}
          max={4000}
          range={RANGE}
          refreshMs={0}
          fetcher={fetcher}
        />
      </Harness>,
    );

    expect(await screen.findByText("2 cores")).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_MS * 5));
    expect({ fetched: fetcher.mock.calls.map(([url]) => url), streams: fake.opened.length }).toEqual({
      fetched: ["/api/v1/metrics/cores.usage?since=15m"],
      streams: 0,
    });
  });

  it("keeps a loader-backed series on its loader under a stream", async () => {
    const fake = createFakeEventSourceFactory();
    const load = vi.fn(async () => ({ id: "w.cpu", points: recentPoints([500, 3000]) }));
    render(
      <Harness factory={fake.factory}>
        <TimeseriesCoreBars title="Cores" value={{ id: "w.cpu", load }} max={4000} refreshMs={REFRESH_MS} />
      </Harness>,
    );

    expect(await screen.findByText("3 cores")).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_MS * 5));
    expect(fake.opened).toHaveLength(0);
  });
});
