import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { TimeseriesCoreBars } from "./TimeseriesCoreBars";
import { TimeseriesGauge } from "./TimeseriesGauge";
import { TimeseriesPanel } from "./TimeseriesPanel";
import type { SeriesLoadContext, TimeseriesResponse } from "./TimeseriesPanel.model";
import { timeseriesQueryOptions } from "./timeseries-query";

function newQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
}

function renderWith(client: QueryClient, ui: ReactElement) {
  const utils = render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
  return {
    ...utils,
    rerender: (next: ReactElement) =>
      utils.rerender(<QueryClientProvider client={client}>{next}</QueryClientProvider>),
  };
}

function response(value: number): TimeseriesResponse {
  return {
    id: "series",
    points: [
      { at: "2026-06-02T12:00:00Z", value: value * 0.5 },
      { at: "2026-06-02T12:01:00Z", value },
    ],
  };
}

function queryKeys(client: QueryClient): unknown[] {
  return client
    .getQueryCache()
    .getAll()
    .map((q) => q.queryKey);
}

describe("timeseriesQueryOptions", () => {
  const fetcher = async () => response(1);

  it("keys loader-backed series on id and range", () => {
    const load = async () => response(1);
    const opts = timeseriesQueryOptions(
      { id: "w1.cpu", load },
      { baseUrl: "/api/", range: "6h", refreshMs: 0, fetcher },
    );
    expect(opts.queryKey).toEqual(["timeseries", "load", "w1.cpu", "6h"]);
    expect(opts.refetchInterval).toBe(false);
  });

  it("keys URL-backed series on the request URL, as before", () => {
    const opts = timeseriesQueryOptions(
      { id: "cpu.usage" },
      { baseUrl: "/api/v1/metrics/", range: "1h", refreshMs: 5000, fetcher },
    );
    expect(opts.queryKey).toEqual(["timeseries", "/api/v1/metrics/cpu.usage?since=1h"]);
    expect(opts.refetchInterval).toBe(5000);
  });
});

describe("function-backed series", () => {
  it("fetches two widgets independently when their loaders differ, even for the same URL id", async () => {
    const client = newQueryClient();
    const fetcher = vi.fn(async () => response(0));
    const loadA = vi.fn(async () => response(1000));
    const loadB = vi.fn(async () => response(3000));

    renderWith(
      client,
      <>
        {/* Both would request "/api/cpu.usage" through `fetcher`; the loaders win. */}
        <TimeseriesCoreBars
          title="A"
          baseUrl="/api/"
          value={{ id: "workload-a.cpu.usage", load: loadA }}
          max={4000}
          refreshMs={0}
          fetcher={fetcher}
        />
        <TimeseriesCoreBars
          title="B"
          baseUrl="/api/"
          value={{ id: "workload-b.cpu.usage", load: loadB }}
          max={4000}
          refreshMs={0}
          fetcher={fetcher}
        />
      </>,
    );

    expect(await screen.findByText("1 cores")).toBeInTheDocument();
    expect(await screen.findByText("3 cores")).toBeInTheDocument();
    expect(loadA).toHaveBeenCalledTimes(1);
    expect(loadB).toHaveBeenCalledTimes(1);
    expect(fetcher).not.toHaveBeenCalled();
    expect(queryKeys(client)).toEqual(
      expect.arrayContaining([
        ["timeseries", "load", "workload-a.cpu.usage", "1h"],
        ["timeseries", "load", "workload-b.cpu.usage", "1h"],
      ]),
    );
  });

  it("refetches when the range changes", async () => {
    const client = newQueryClient();
    const load = vi.fn(async (_ctx: SeriesLoadContext) => response(42));
    const gauge = (range: string) => (
      <TimeseriesGauge
        title="CPU"
        value={{ id: "cpu.usage", load }}
        max={100}
        centerDisplay="percent"
        range={range}
        refreshMs={0}
        expandable={false}
      />
    );

    const { rerender } = renderWith(client, gauge("1h"));
    expect(await screen.findByText("42%")).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(1);
    expect(load.mock.calls[0]?.[0].range).toBe("1h");

    rerender(gauge("6h"));
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    expect(load.mock.calls[1]?.[0].range).toBe("6h");
  });

  it("aborts the loader's signal when the widget unmounts", async () => {
    const client = newQueryClient();
    let signal: AbortSignal | undefined;
    const load = vi.fn(
      (ctx: SeriesLoadContext) =>
        new Promise<TimeseriesResponse>(() => {
          signal = ctx.signal;
        }),
    );

    const { unmount } = renderWith(
      client,
      <TimeseriesGauge
        title="CPU"
        value={{ id: "cpu.usage", load }}
        refreshMs={0}
        expandable={false}
      />,
    );

    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
    expect(signal?.aborted).toBe(false);
    unmount();
    await waitFor(() => expect(signal?.aborted).toBe(true));
  });

  it("loads TimeseriesPanel series from their loaders", async () => {
    const client = newQueryClient();
    const fetcher = vi.fn(async () => response(0));
    const reads = vi.fn(async () => response(10));
    const writes = vi.fn(async () => response(20));

    renderWith(
      client,
      <TimeseriesPanel
        title="IOPS"
        series={[
          { id: "disk.reads", label: "reads", load: reads },
          { id: "disk.writes", label: "writes", load: writes },
        ]}
        refreshMs={0}
        fetcher={fetcher}
      />,
    );

    expect(await screen.findByText("reads")).toBeInTheDocument();
    expect(screen.getByText("writes")).toBeInTheDocument();
    expect(reads).toHaveBeenCalledWith(expect.objectContaining({ range: "1h" }));
    expect(writes).toHaveBeenCalledTimes(1);
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe("URL-backed series (legacy baseUrl + fetcher)", () => {
  const legacyUrls = ["/api/v1/metrics/cpu.usage?since=1h", "/api/v1/metrics/cpu.limit?since=1h"];

  it.each([
    [
      "TimeseriesCoreBars",
      (fetcher: (url: string) => Promise<TimeseriesResponse>) => (
        <TimeseriesCoreBars
          title="CPU"
          baseUrl="/api/v1/metrics/"
          value={{ id: "cpu.usage" }}
          max={{ id: "cpu.limit" }}
          refreshMs={0}
          fetcher={fetcher}
        />
      ),
    ],
    [
      "TimeseriesGauge",
      (fetcher: (url: string) => Promise<TimeseriesResponse>) => (
        <TimeseriesGauge
          title="CPU"
          baseUrl="/api/v1/metrics/"
          value={{ id: "cpu.usage" }}
          max={{ id: "cpu.limit" }}
          refreshMs={0}
          fetcher={fetcher}
        />
      ),
    ],
    [
      "TimeseriesPanel",
      (fetcher: (url: string) => Promise<TimeseriesResponse>) => (
        <TimeseriesPanel
          title="CPU"
          baseUrl="/api/v1/metrics/"
          series={[{ id: "cpu.usage" }, { id: "cpu.limit" }]}
          refreshMs={0}
          fetcher={fetcher}
        />
      ),
    ],
  ])("%s keeps its request URLs and query keys", async (_name, build) => {
    const client = newQueryClient();
    const fetcher = vi.fn(async (_url: string) => response(1));

    renderWith(client, build(fetcher));

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual(legacyUrls);
    expect(queryKeys(client)).toEqual(legacyUrls.map((url) => ["timeseries", url]));
  });
});
