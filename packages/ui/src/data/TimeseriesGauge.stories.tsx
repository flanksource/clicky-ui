import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, type ComponentProps } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UiChip, UiMemoryStick } from "../icons";
import { TimeseriesGauge } from "./TimeseriesGauge";
import type { TimeseriesResponse } from "./TimeseriesPanel";

const BASE_TIME = Date.parse("2026-06-02T12:00:00Z");
type TimeseriesGaugeStoryArgs = ComponentProps<typeof TimeseriesGauge> & {
  latestValue: number;
  maxLatestValue?: number;
};

/** Fetcher with no network: the latest value of each metric is matched by URL. */
function makeFetcher(latestByMatch: { match: string; latest: number }[]) {
  return async (url: string): Promise<TimeseriesResponse> => {
    const entry =
      latestByMatch.find((e) => url.includes(e.match)) ?? latestByMatch[0];
    const points = Array.from({ length: 12 }, (_, i) => ({
      at: new Date(BASE_TIME + i * 30_000).toISOString(),
      value: entry.latest * (0.7 + (i / 11) * 0.3),
    }));
    return { id: url, points };
  };
}

function makeStoryFetcher(args: TimeseriesGaugeStoryArgs) {
  const maxSeries = typeof args.max === "object" ? args.max : undefined;
  return makeFetcher([
    { match: args.value.id, latest: args.latestValue },
    ...(maxSeries
      ? [
          {
            match: maxSeries.id,
            latest: args.maxLatestValue ?? args.latestValue,
          },
        ]
      : []),
  ]);
}

function GaugeShowcase(args: TimeseriesGaugeStoryArgs) {
  const { latestValue, maxLatestValue, fetcher, ...gaugeArgs } = args;
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      }),
    [latestValue, maxLatestValue],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-40">
        <TimeseriesGauge
          {...gaugeArgs}
          fetcher={fetcher ?? makeStoryFetcher(args)}
        />
      </div>
    </QueryClientProvider>
  );
}

function GaugeCellVariants() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      }),
    [],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <div className="grid w-[24rem] grid-cols-2 overflow-hidden rounded-md border border-border bg-background text-sm">
        <div className="border-b border-r border-border px-2 py-1.5">
          <TimeseriesGauge
            variant="cell"
            title="CPU"
            icon={UiChip}
            unit="percent"
            centerDisplay="percent"
            value={{ id: "cpu.cell.usage" }}
            max={100}
            refreshMs={0}
            expandable={false}
            fetcher={makeFetcher([{ match: "cpu.cell", latest: 42 }])}
          />
        </div>
        <div className="border-b border-border px-2 py-1.5">
          <TimeseriesGauge
            variant="cell"
            showLabel={false}
            title="CPU"
            icon={UiChip}
            unit="percent"
            centerDisplay="percent"
            value={{ id: "cpu.icon.usage" }}
            max={100}
            refreshMs={0}
            expandable={false}
            fetcher={makeFetcher([{ match: "cpu.icon", latest: 42 }])}
          />
        </div>
        <div className="border-r border-border px-2 py-1.5">
          <TimeseriesGauge
            variant="cell"
            title="Memory"
            icon={UiMemoryStick}
            unit="bytes"
            value={{ id: "mem.cell.usage" }}
            max={{ id: "mem.cell.limit" }}
            refreshMs={0}
            expandable={false}
            fetcher={makeFetcher([
              { match: "usage", latest: 3_200_000_000 },
              { match: "limit", latest: 8_000_000_000 },
            ])}
          />
        </div>
        <div className="px-2 py-1.5">
          <TimeseriesGauge
            variant="cell"
            showLabel={false}
            title="Memory"
            icon={UiMemoryStick}
            unit="bytes"
            value={{ id: "mem.icon.usage" }}
            max={{ id: "mem.icon.limit" }}
            refreshMs={0}
            expandable={false}
            fetcher={makeFetcher([
              { match: "usage", latest: 3_200_000_000 },
              { match: "limit", latest: 8_000_000_000 },
            ])}
          />
        </div>
      </div>
    </QueryClientProvider>
  );
}

const meta = {
  title: "Charts/TimeseriesGauge",
  component: TimeseriesGauge,
  parameters: {
    docs: {
      description: {
        component:
          "Half (180°) radial gauge whose fill is a metric's latest value over its maximum (a `.limit`-style metric or a fixed number), both read live from the timeseries store. The arc crosses warning/danger thresholds; an expand button opens the full value/max chart in a modal. Stories pass a synthetic `fetcher` and `refreshMs={0}`.",
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    unit: { control: "select", options: ["percent", "bytes", "short", "ms"] },
    range: { control: "text" },
    refreshMs: { control: { type: "number", min: 0, step: 1000 } },
    latestValue: {
      name: "value",
      control: { type: "number", min: 0, step: 1 },
    },
    maxLatestValue: {
      name: "max value",
      control: { type: "number", min: 0, step: 1 },
    },
    centerDisplay: { control: "inline-radio", options: ["value", "percent"] },
    variant: { control: "inline-radio", options: ["default", "cell"] },
    showLabel: { control: "boolean" },
    expandable: { control: "boolean" },
    baseUrl: { control: "text" },
    thresholds: { table: { disable: true } },
    icon: { table: { disable: true } },
    fetcher: { table: { disable: true } },
    value: { table: { disable: true } },
    max: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  render: (args) => <GaugeShowcase {...args} />,
} satisfies Meta<TimeseriesGaugeStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Healthy: Story = {
  args: {
    title: "CPU",
    icon: UiChip,
    unit: "percent",
    centerDisplay: "percent",
    value: { id: "cpu.usage" },
    max: 100,
    latestValue: 42,
    maxLatestValue: 100,
    refreshMs: 0,
  },
};

export const Warning: Story = {
  args: {
    ...Healthy.args,
    latestValue: 82,
  },
};

export const Danger: Story = {
  args: {
    ...Healthy.args,
    latestValue: 95,
  },
};

export const Memory: Story = {
  args: {
    title: "Memory",
    icon: UiMemoryStick,
    unit: "bytes",
    centerDisplay: "value",
    value: { id: "mem.usage" },
    max: { id: "mem.limit" },
    latestValue: 3_200_000_000,
    maxLatestValue: 8_000_000_000,
    refreshMs: 0,
  },
};

export const MetricMax: Story = {
  args: {
    ...Memory.args,
  },
};

export const CellVariants: Story = {
  args: {
    ...Healthy.args,
  },
  render: () => <GaugeCellVariants />,
};
