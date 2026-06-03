import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, type ComponentProps } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UiChip } from "../icons";
import { TimeseriesPanel, type TimeseriesResponse } from "./TimeseriesPanel";

/** Anchor so generated timestamps are stable across renders (no Date.now()). */
const BASE_TIME = Date.parse("2026-06-02T12:00:00Z");
const STEP_MS = 30_000;
const POINTS = 60;

/** Deterministic 0..1 pseudo-noise from a string + index — keeps stories stable. */
function seededNoise(seed: string, i: number): number {
  let h = 2166136261;
  for (const ch of seed) h = (h ^ ch.charCodeAt(0)) * 16777619;
  h = (h ^ i) >>> 0;
  return ((h % 1000) / 1000 - 0.5) * 2;
}

/** Builds a smooth wave for a metric id: sine trend + seeded jitter, scaled. */
function buildPoints(id: string, scale: number, offset = 0): TimeseriesResponse["points"] {
  return Array.from({ length: POINTS }, (_, i) => {
    const wave = Math.sin(i / 6 + id.length) * 0.5 + 0.5;
    const value = offset + scale * (wave + seededNoise(id, i) * 0.15);
    return { at: new Date(BASE_TIME + i * STEP_MS).toISOString(), value: Math.max(0, value) };
  });
}

/** Fetcher that derives a series' shape from its URL — no network. */
function makeFetcher(scaleByMatch: { match: string; scale: number; offset?: number }[]) {
  return async (url: string): Promise<TimeseriesResponse> => {
    const entry = scaleByMatch.find((e) => url.includes(e.match)) ?? scaleByMatch[0];
    return { id: url, points: buildPoints(url, entry.scale, entry.offset ?? 0) };
  };
}

const loadingForever = () => new Promise<TimeseriesResponse>(() => {});
const alwaysErrors = async (): Promise<TimeseriesResponse> => {
  throw new Error("metrics request failed: 503");
};
const emptyResponse = async (url: string): Promise<TimeseriesResponse> => ({ id: url, points: [] });

function PanelShowcase(args: ComponentProps<typeof TimeseriesPanel>) {
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
    [],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-[420px]">
        <TimeseriesPanel {...args} />
      </div>
    </QueryClientProvider>
  );
}

const meta: Meta<typeof TimeseriesPanel> = {
  title: "Data/TimeseriesPanel",
  component: TimeseriesPanel,
  parameters: {
    docs: {
      description: {
        component:
          "Polling time-series chart backed by TanStack Query. Stories pass a synthetic `fetcher` (no network) and `refreshMs={0}` to disable polling. Supports single- or multi-series, area/line/stacked variants, mirrored series, Grafana-style units, and an expand-to-modal action.",
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: ["area", "line", "stacked", "breakdown"] },
    height: { control: { type: "range", min: 80, max: 360, step: 20 } },
    expandable: { control: "boolean" },
    fetcher: { table: { disable: true } },
    series: { table: { disable: true } },
  },
  render: (args) => <PanelShowcase {...args} />,
};

export default meta;
type Story = StoryObj<typeof TimeseriesPanel>;

export const Area: Story = {
  args: {
    title: "CPU",
    url: "/api/v1/metrics/sqlserver.cpu",
    unit: "percent",
    refreshMs: 0,
    fetcher: makeFetcher([{ match: "cpu", scale: 80, offset: 5 }]),
  },
};

export const Line: Story = {
  args: { ...Area.args, variant: "line" },
};

export const WithIcon: Story = {
  args: { ...Area.args, icon: UiChip },
};

export const Bytes: Story = {
  args: {
    title: "Memory",
    url: "/api/v1/metrics/sqlserver.memory",
    unit: "bytes",
    refreshMs: 0,
    fetcher: makeFetcher([{ match: "memory", scale: 6_000_000_000, offset: 1_000_000_000 }]),
  },
};

export const MultiSeries: Story = {
  args: {
    title: "Connections",
    baseUrl: "/api/v1/metrics/",
    unit: "short",
    refreshMs: 0,
    series: [
      { id: "conn.active", label: "active" },
      { id: "conn.idle", label: "idle" },
    ],
    fetcher: makeFetcher([
      { match: "active", scale: 400, offset: 50 },
      { match: "idle", scale: 150, offset: 20 },
    ]),
  },
};

export const Stacked: Story = {
  args: { ...MultiSeries.args, variant: "stacked" },
};

/**
 * Series with different units: CPU (percent) drives the left axis, working-set
 * memory (bytes) the right. The legend wraps below the chart with each series'
 * color, label, and latest value so the header never overlaps the title/icon.
 */
export const MixedUnits: Story = {
  args: {
    title: "Pod resources",
    icon: UiChip,
    baseUrl: "/api/v1/metrics/",
    refreshMs: 0,
    series: [
      { id: "pod.cpu", label: "CPU", unit: "percent" },
      { id: "pod.memory", label: "Working set", unit: "bytes" },
    ],
    fetcher: makeFetcher([
      { match: "cpu", scale: 70, offset: 10 },
      { match: "memory", scale: 5_000_000_000, offset: 800_000_000 },
    ]),
  },
};

export const MirroredReadWrite: Story = {
  args: {
    title: "IOPS",
    baseUrl: "/api/v1/metrics/",
    unit: "short",
    refreshMs: 0,
    series: [
      { id: "iops.read", label: "reads" },
      { id: "iops.write", label: "writes", transform: (v) => -v },
    ],
    fetcher: makeFetcher([
      { match: "read", scale: 1200, offset: 100 },
      { match: "write", scale: 800, offset: 80 },
    ]),
  },
};

/**
 * Instantaneous stacked bar + legend (e.g. a JVM heap memory breakdown). The
 * bar segments and legend reflect each series' `current` value; the expand
 * button opens the polled time-series history as an area chart.
 */
export const Breakdown: Story = {
  args: {
    title: "Heap",
    baseUrl: "/api/v1/metrics/",
    unit: "bytes",
    refreshMs: 0,
    variant: "breakdown",
    total: 8_000_000_000,
    series: [
      { id: "heap.eden", label: "Eden Space", color: "bg-emerald-500", current: 2_400_000_000 },
      { id: "heap.survivor", label: "Survivor Space", color: "bg-amber-500", current: 300_000_000 },
      { id: "heap.old", label: "Old Gen", color: "bg-rose-500", current: 3_100_000_000 },
    ],
    fetcher: makeFetcher([
      { match: "eden", scale: 2_400_000_000, offset: 500_000_000 },
      { match: "survivor", scale: 300_000_000, offset: 50_000_000 },
      { match: "old", scale: 3_100_000_000, offset: 1_000_000_000 },
    ]),
  },
};

/**
 * Same breakdown, but series colors are given as CSS values (hex / `var()`)
 * instead of Tailwind classes. Both the inline bar/legend and the expand chart
 * pick up the color identically — series `color` accepts either form.
 */
export const BreakdownCssColors: Story = {
  args: {
    ...Breakdown.args,
    series: [
      { id: "heap.eden", label: "Eden Space", color: "#10b981", current: 2_400_000_000 },
      { id: "heap.survivor", label: "Survivor Space", color: "#f59e0b", current: 300_000_000 },
      { id: "heap.old", label: "Old Gen", color: "var(--chart-2, #ef4444)", current: 3_100_000_000 },
    ],
  },
};

/**
 * Disk usage breakdown with many Tailwind-colored segments filling most of the
 * bar — exercises a near-full breakdown and a longer legend list.
 */
export const BreakdownDiskUsage: Story = {
  args: {
    title: "Disk",
    baseUrl: "/api/v1/metrics/",
    unit: "bytes",
    refreshMs: 0,
    variant: "breakdown",
    total: 512_000_000_000,
    series: [
      { id: "disk.system", label: "System", color: "bg-sky-500", current: 64_000_000_000 },
      { id: "disk.apps", label: "Applications", color: "bg-violet-500", current: 96_000_000_000 },
      { id: "disk.data", label: "Data", color: "bg-emerald-500", current: 180_000_000_000 },
      { id: "disk.logs", label: "Logs", color: "bg-amber-500", current: 48_000_000_000 },
      { id: "disk.cache", label: "Cache", color: "bg-rose-500", current: 72_000_000_000 },
    ],
    fetcher: makeFetcher([
      { match: "system", scale: 64_000_000_000, offset: 10_000_000_000 },
      { match: "apps", scale: 96_000_000_000, offset: 20_000_000_000 },
      { match: "data", scale: 180_000_000_000, offset: 40_000_000_000 },
      { match: "logs", scale: 48_000_000_000, offset: 8_000_000_000 },
      { match: "cache", scale: 72_000_000_000, offset: 12_000_000_000 },
    ]),
  },
};

/**
 * Request-status breakdown (short counts) with the canonical green/amber/red
 * Tailwind status palette and no explicit `total` — the denominator defaults to
 * the sum of the segment values, so the bar is fully filled.
 */
export const BreakdownRequestStatus: Story = {
  args: {
    title: "Requests",
    baseUrl: "/api/v1/metrics/",
    unit: "short",
    refreshMs: 0,
    variant: "breakdown",
    series: [
      { id: "http.2xx", label: "2xx Success", color: "bg-green-500", current: 8420 },
      { id: "http.3xx", label: "3xx Redirect", color: "bg-blue-500", current: 640 },
      { id: "http.4xx", label: "4xx Client", color: "bg-amber-500", current: 310 },
      { id: "http.5xx", label: "5xx Server", color: "bg-red-500", current: 47 },
    ],
    fetcher: makeFetcher([
      { match: "2xx", scale: 8420, offset: 4000 },
      { match: "3xx", scale: 640, offset: 200 },
      { match: "4xx", scale: 310, offset: 80 },
      { match: "5xx", scale: 47, offset: 5 },
    ]),
  },
};

export const Loading: Story = {
  args: { title: "CPU", url: "/api/v1/metrics/cpu", refreshMs: 0, fetcher: loadingForever },
};

export const ErrorState: Story = {
  args: { title: "CPU", url: "/api/v1/metrics/cpu", refreshMs: 0, fetcher: alwaysErrors },
};

export const CollectingData: Story = {
  args: { title: "CPU", url: "/api/v1/metrics/cpu", refreshMs: 0, fetcher: emptyResponse },
};
