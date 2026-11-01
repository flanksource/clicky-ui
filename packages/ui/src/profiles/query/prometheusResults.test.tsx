import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EventSourceProvider } from "../../hooks/event-source-provider";
import { TimeseriesStreamProvider } from "../../data/timeseries-stream-provider";
import { createFakeEventSourceFactory } from "../../data/timeseries-stream.fixtures";
import { PrometheusResults } from "./prometheusResults";

function renderResults(rows: Record<string, unknown>[], fake = createFakeEventSourceFactory()) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(
    <QueryClientProvider client={client}>
      <EventSourceProvider value={fake.factory}>
        <TimeseriesStreamProvider debounceMs={0}>
          <PrometheusResults result={{ rows }} fallback={<p>table</p>} />
        </TimeseriesStreamProvider>
      </EventSourceProvider>
    </QueryClientProvider>,
  );
  return fake;
}

const T0 = "2026-06-02T12:00:00Z";
const T1 = "2026-06-02T12:01:00Z";

describe("PrometheusResults", () => {
  it.each([
    ["time", "time"],
    ["timestamp", "timestamp"],
  ])("charts rows whose time column is %s, one series per label set", async (_name, column) => {
    renderResults([
      { [column]: T0, value: 1, pod: "api" },
      { [column]: T1, value: 2, pod: "api" },
      { [column]: T0, value: 3, pod: "web" },
      { [column]: T1, value: 4, pod: "web" },
    ]);

    const legend = await screen.findAllByRole("listitem");
    expect(legend.map((li) => li.textContent)).toEqual(["pod=api2", "pod=web4"]);
  });

  it("prefers time over timestamp and keeps neither as a label", async () => {
    // An unparseable timestamp would throw if it were read as the point time.
    renderResults([
      { time: T0, timestamp: "not a time", value: 1, pod: "api" },
      { time: T1, timestamp: "not a time", value: 2, pod: "api" },
      { time: T0, timestamp: "not a time", value: 3, pod: "web" },
      { time: T1, timestamp: "not a time", value: 4, pod: "web" },
    ]);

    const legend = await screen.findAllByRole("listitem");
    expect(legend.map((li) => li.textContent)).toEqual(["pod=api2", "pod=web4"]);
  });

  it("renders only the fallback without at least two timed rows", () => {
    renderResults([{ value: 1 }]);
    expect(screen.queryByText("Prometheus query")).not.toBeInTheDocument();
    expect(screen.getByText("table")).toBeInTheDocument();
  });

  it("never opens a metrics stream for its static rows", async () => {
    const fake = renderResults([
      { time: T0, value: 1 },
      { time: T1, value: 2 },
    ]);
    expect(await screen.findByText("2")).toBeInTheDocument();
    expect(fake.opened).toHaveLength(0);
  });
});
