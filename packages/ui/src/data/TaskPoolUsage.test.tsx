import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import { useState, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { EventSourceProvider } from "../hooks/event-source-provider";
import type { EventSourceFactory } from "../hooks/event-source";
import { TimeseriesStreamProvider } from "./timeseries-stream-provider";
import { createFakeEventSourceFactory } from "./timeseries-stream.fixtures";
import { TaskPoolUsage, TaskRunConcurrency } from "./TaskPoolUsage";

const BASE_PATH = "/api/v1";
const RUN_ID = "run-7";

function Harness({ factory, children }: { factory: EventSourceFactory; children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }));
  return (
    <QueryClientProvider client={client}>
      <EventSourceProvider value={factory}>
        <TimeseriesStreamProvider debounceMs={5}>{children}</TimeseriesStreamProvider>
      </EventSourceProvider>
    </QueryClientProvider>
  );
}

function series(id: string, value: number) {
  return { id, source: id, points: [{ at: new Date(Date.now() - 1000).toISOString(), value }] };
}

describe("TaskPoolUsage", () => {
  it("streams every pool gauge over one task-metrics subscription and shows the latest readings", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const fake = createFakeEventSourceFactory();
    render(<Harness factory={fake.factory}><TaskPoolUsage basePath={BASE_PATH} /></Harness>);

    await waitFor(() => expect(fake.opened).toHaveLength(1));
    const source = fake.latest();
    expect({ path: new URL(source.url, "http://x.test").pathname, ids: source.ids }).toEqual({
      path: "/api/v1/tasks/metrics/stream",
      ids: [
        "pool:queued",
        "pool:slots-capacity",
        "pool:slots-used",
        "pool:supervisors",
        "pool:workers-busy",
        "pool:workers-limit",
      ],
    });

    act(() => source.emit("snapshot", {
      series: [
        series("pool:workers-busy", 3),
        series("pool:workers-limit", 4),
        series("pool:slots-used", 3),
        series("pool:slots-capacity", 4),
        series("pool:queued", 5),
        series("pool:supervisors", 1),
      ],
    }));

    for (const label of ["Workers busy: 3", "Slots used: 3", "Queued: 5", "Supervisors: 1"]) {
      expect(await screen.findByLabelText(label)).toBeInTheDocument();
    }
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

describe("TaskRunConcurrency", () => {
  it.each([
    ["a run with a concurrency limit shows its permits and waiters", true],
    ["a run without a limit renders nothing", false],
  ])("%s", async (_name, limited) => {
    const fake = createFakeEventSourceFactory();
    render(<Harness factory={fake.factory}><TaskRunConcurrency basePath={BASE_PATH} runId={RUN_ID} /></Harness>);

    await waitFor(() => expect(fake.opened).toHaveLength(1));
    act(() => fake.latest().emit("snapshot", {
      series: limited ? [series(`${RUN_ID}:concurrency-limit`, 2)] : [],
    }));

    if (!limited) {
      await waitFor(() => expect(fake.latest().ids).toEqual([`${RUN_ID}:concurrency-limit`]));
      expect(screen.queryByRole("region", { name: "Run concurrency" })).toBeNull();
      return;
    }
    await waitFor(() => expect(fake.latest().ids).toEqual([
      `${RUN_ID}:concurrency-limit`,
      `${RUN_ID}:concurrency-running`,
      `${RUN_ID}:concurrency-waiting`,
    ]));
    act(() => fake.latest().emit("snapshot", {
      series: [
        series(`${RUN_ID}:concurrency-limit`, 2),
        series(`${RUN_ID}:concurrency-running`, 2),
        series(`${RUN_ID}:concurrency-waiting`, 6),
      ],
    }));
    expect(await screen.findByLabelText("Concurrency: 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Waiting for a permit: 6")).toBeInTheDocument();
  });

  it("reports a failed metrics stream instead of hiding the run's concurrency", async () => {
    const fake = createFakeEventSourceFactory();
    render(<Harness factory={fake.factory}><TaskRunConcurrency basePath={BASE_PATH} runId={RUN_ID} /></Harness>);
    await waitFor(() => expect(fake.opened).toHaveLength(1));

    act(() => fake.latest().emit("error", { error: "metric store unavailable" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Run concurrency unavailable: metric store unavailable");
  });
});
