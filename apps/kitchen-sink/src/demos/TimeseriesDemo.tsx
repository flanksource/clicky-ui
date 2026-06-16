import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  TimeseriesCoreBars,
  TimeseriesGauge,
  TimeseriesPanel,
  UiChip,
  type TimeseriesResponse,
} from "@flanksource/clicky-ui";
import { DemoSection, DemoRow } from "./Section";

const BASE_TIME = Date.parse("2026-06-02T12:00:00Z");

function wave(scale: number, offset: number, points = 48): TimeseriesResponse["points"] {
  return Array.from({ length: points }, (_, i) => ({
    at: new Date(BASE_TIME + i * 30_000).toISOString(),
    value: Math.max(0, offset + scale * (Math.sin(i / 6) * 0.5 + 0.5)),
  }));
}

function panelFetcher(scale: number, offset: number) {
  return async (url: string): Promise<TimeseriesResponse> => ({ id: url, points: wave(scale, offset) });
}

function latestFetcher(latestByMatch: { match: string; latest: number }[]) {
  return async (url: string): Promise<TimeseriesResponse> => {
    const latest =
      latestByMatch.find((e) => url.includes(e.match))?.latest ?? latestByMatch[0]?.latest ?? 0;
    return { id: url, points: [{ at: new Date(BASE_TIME).toISOString(), value: latest }] };
  };
}

export function TimeseriesDemo() {
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <DemoSection
        id="timeseries"
        title="Timeseries"
        description="Live metric widgets backed by TanStack Query: a polling chart (TimeseriesPanel), a radial gauge (TimeseriesGauge) and per-core CPU bars (TimeseriesCoreBars). This demo uses synthetic fetchers with polling disabled."
      >
        <div className="max-w-md">
          <TimeseriesPanel
            title="CPU"
            icon={UiChip}
            url="/api/v1/metrics/cpu"
            unit="percent"
            refreshMs={0}
            fetcher={panelFetcher(80, 5)}
          />
        </div>

        <DemoRow label="Gauges">
          <TimeseriesGauge
            title="CPU"
            unit="percent"
            centerDisplay="percent"
            value={{ id: "cpu.usage" }}
            max={100}
            refreshMs={0}
            expandable={false}
            fetcher={latestFetcher([{ match: "cpu", latest: 42 }])}
          />
          <TimeseriesGauge
            title="Memory"
            unit="bytes"
            value={{ id: "mem.usage" }}
            max={{ id: "mem.limit" }}
            refreshMs={0}
            expandable={false}
            fetcher={latestFetcher([
              { match: "usage", latest: 6_400_000_000 },
              { match: "limit", latest: 8_000_000_000 },
            ])}
          />
        </DemoRow>

        <DemoRow label="Core bars">
          <TimeseriesCoreBars
            title="4-core"
            value={{ id: "cpu.usage" }}
            max={4000}
            refreshMs={0}
            fetcher={latestFetcher([{ match: "cpu", latest: 2300 }])}
          />
          <TimeseriesCoreBars
            title="8-core"
            value={{ id: "cpu.usage" }}
            max={8000}
            refreshMs={0}
            fetcher={latestFetcher([{ match: "cpu", latest: 7600 }])}
          />
        </DemoRow>
      </DemoSection>
    </QueryClientProvider>
  );
}
