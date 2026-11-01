import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { expect, within } from "storybook/test";
import type { EventSourceFactory } from "../hooks/event-source";
import { EventSourceProvider } from "../hooks/event-source-provider";
import { TimeseriesCoreBars } from "./TimeseriesCoreBars";
import { TimeseriesGauge } from "./TimeseriesGauge";
import { TimeseriesPanel } from "./TimeseriesPanel";
import type { TimeseriesServerSeries } from "./TimeseriesPanel.model";
import { TimeseriesStreamProvider } from "./timeseries-stream-provider";
import { FakeEventSource } from "./timeseries-stream.fixtures";

const BASE_URL = "/api/v1/metrics/";
const RANGE = "15m";
const REFRESH_MS = 2000;
const HISTORY = 30;
const PODS = ["api", "worker", "web"] as const;

/** Deterministic wave per series name; `tick` advances it so appends move. */
function sample(name: string, tick: number, scale: number): number {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return Math.round(scale * (0.5 + 0.4 * Math.sin(tick / 4 + (h % 17))));
}

const SCALE: Record<string, number> = {
  "disk.reads": 400,
  "disk.writes": 250,
  "cpu.usage": 3200,
  "cpu.limit": 4000,
  "cores.usage": 2600,
};

/** The server series one requested id answers with: a profile id fans out per pod. */
function seriesFor(id: string, ticks: number[], stepMs: number): TimeseriesServerSeries[] {
  const points = (name: string, scale: number) =>
    ticks.map((tick) => ({ at: new Date(tick * stepMs).toISOString(), value: sample(name, tick, scale) }));
  if (id.startsWith("profile:")) {
    return PODS.map((pod) => ({
      id: `${id}#pod=${pod}`,
      source: id,
      labels: { pod },
      unit: "percent",
      points: points(`${id}${pod}`, 90),
    }));
  }
  const scale = SCALE[id];
  if (scale === undefined) throw new Error(`story has no fake metric ${id}`);
  return [{ id, source: id, points: id === "cpu.limit" ? ticks.map((tick) => ({ at: new Date(tick * stepMs).toISOString(), value: scale })) : points(id, scale) }];
}

/**
 * Stands in for createEventHub(): each subscription is a FakeEventSource that
 * sends a snapshot of the window, then one append per `interval`, the way
 * clicky's `{baseUrl}stream` does. `onOpen` reports every subscription URL.
 */
function fakeMetricsHub(onOpen: (url: string) => void): EventSourceFactory {
  return (url) => {
    const source = new FakeEventSource(url);
    onOpen(url);
    const ids = source.ids;
    const stepMs = Number.parseInt(source.param("interval") ?? "5s", 10) * 1000;
    let tick = Math.floor(Date.now() / stepMs);
    const history = Array.from({ length: HISTORY }, (_, i) => tick - HISTORY + 1 + i);
    const snapshot = setTimeout(() => {
      source.emit("snapshot", { series: ids.flatMap((id) => seriesFor(id, history, stepMs)) });
    }, 150);
    const appends = setInterval(() => {
      tick += 1;
      source.emit("append", { series: ids.flatMap((id) => seriesFor(id, [tick], stepMs)) });
    }, stepMs);
    source.onClose = () => {
      clearTimeout(snapshot);
      clearInterval(appends);
    };
    return source;
  };
}

function StreamedDashboard() {
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const factory = useMemo(() => fakeMetricsHub((url) => setSubscriptions((prev) => [...prev, url])), []);
  const queryClient = useMemo(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }), []);
  const [showCores, setShowCores] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <EventSourceProvider value={factory}>
        <TimeseriesStreamProvider>
          <div className="flex w-[880px] flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <TimeseriesPanel
                title="Pod CPU (one profile id)"
                baseUrl={BASE_URL}
                series={[{ id: "profile:pod-cpu" }]}
                variant="line"
                range={RANGE}
                refreshMs={REFRESH_MS}
              />
              <TimeseriesPanel
                title="Disk IOPS"
                baseUrl={BASE_URL}
                series={[
                  { id: "disk.reads", label: "reads" },
                  { id: "disk.writes", label: "writes", transform: (v) => -v },
                ]}
                unit="short"
                range={RANGE}
                refreshMs={REFRESH_MS}
              />
            </div>
            <div className="flex items-center gap-6 rounded-lg border border-border bg-card p-3">
              <TimeseriesGauge
                title="CPU"
                baseUrl={BASE_URL}
                value={{ id: "cpu.usage" }}
                max={{ id: "cpu.limit" }}
                centerDisplay="percent"
                range={RANGE}
                refreshMs={REFRESH_MS}
              />
              {showCores ? (
                <TimeseriesCoreBars
                  title="Cores"
                  baseUrl={BASE_URL}
                  value={{ id: "cores.usage" }}
                  max={4000}
                  range={RANGE}
                  refreshMs={REFRESH_MS}
                />
              ) : null}
              <button
                type="button"
                className="ml-auto rounded border border-border px-2 py-1 text-xs"
                onClick={() => setShowCores((v) => !v)}
              >
                {showCores ? "Unmount cores" : "Mount cores"}
              </button>
            </div>
            <div className="text-xs text-muted-foreground">
              <div data-testid="subscription-count">Subscriptions opened: {subscriptions.length}</div>
              <code className="break-all">{subscriptions[subscriptions.length - 1] ?? "—"}</code>
            </div>
          </div>
        </TimeseriesStreamProvider>
      </EventSourceProvider>
    </QueryClientProvider>
  );
}

const meta: Meta<typeof TimeseriesStreamProvider> = {
  title: "Charts/TimeseriesStreamProvider",
  component: TimeseriesStreamProvider,
  parameters: {
    docs: {
      description: {
        component:
          "Streams every URL-backed timeseries widget below it over one subscription per (baseUrl, range, interval) group: `GET {baseUrl}stream?id=…&since=…&interval=…` through the EventSourceProvider's factory (createEventHub in an app). The story's fake hub sends a snapshot, then an append per interval. The pod CPU panel requests one profile id that the server expands into three series. Unmounting the core bars re-subscribes the group with the remaining ids.",
      },
    },
  },
  render: () => <StreamedDashboard />,
};

export default meta;
type Story = StoryObj<typeof TimeseriesStreamProvider>;

export const OneSubscriptionPerGroup: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const pod of PODS) await expect(await canvas.findByText(pod)).toBeInTheDocument();
    await expect(canvas.getByTestId("subscription-count")).toHaveTextContent("Subscriptions opened: 1");
  },
};
