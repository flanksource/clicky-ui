import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, type ComponentProps } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UiChip } from "../icons";
import { TimeseriesGauge } from "./TimeseriesGauge";
import type { TimeseriesResponse } from "./TimeseriesPanel";

const BASE_TIME = Date.parse("2026-06-02T12:00:00Z");

/** Fetcher with no network: the latest value of each metric is matched by URL. */
function makeFetcher(latestByMatch: { match: string; latest: number }[]) {
  return async (url: string): Promise<TimeseriesResponse> => {
    const entry = latestByMatch.find((e) => url.includes(e.match)) ?? latestByMatch[0];
    const points = Array.from({ length: 12 }, (_, i) => ({
      at: new Date(BASE_TIME + i * 30_000).toISOString(),
      value: entry.latest * (0.7 + (i / 11) * 0.3),
    }));
    return { id: url, points };
  };
}

function GaugeShowcase(args: ComponentProps<typeof TimeseriesGauge>) {
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
    [],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-40">
        <TimeseriesGauge {...args} />
      </div>
    </QueryClientProvider>
  );
}

const meta: Meta<typeof TimeseriesGauge> = {
  title: "Data/TimeseriesGauge",
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
    centerDisplay: { control: "inline-radio", options: ["value", "percent"] },
    expandable: { control: "boolean" },
    fetcher: { table: { disable: true } },
    value: { table: { disable: true } },
    max: { table: { disable: true } },
  },
  render: (args) => <GaugeShowcase {...args} />,
};

export default meta;
type Story = StoryObj<typeof TimeseriesGauge>;

export const Healthy: Story = {
  args: {
    title: "CPU",
    icon: UiChip,
    unit: "percent",
    centerDisplay: "percent",
    value: { id: "cpu.usage" },
    max: 100,
    refreshMs: 0,
    fetcher: makeFetcher([{ match: "cpu", latest: 42 }]),
  },
};

export const Warning: Story = {
  args: {
    ...Healthy.args,
    fetcher: makeFetcher([{ match: "cpu", latest: 82 }]),
  },
};

export const Danger: Story = {
  args: {
    ...Healthy.args,
    fetcher: makeFetcher([{ match: "cpu", latest: 95 }]),
  },
};

export const MetricMax: Story = {
  args: {
    title: "Memory",
    unit: "bytes",
    centerDisplay: "value",
    value: { id: "mem.usage" },
    max: { id: "mem.limit" },
    refreshMs: 0,
    fetcher: makeFetcher([
      { match: "usage", latest: 3_200_000_000 },
      { match: "limit", latest: 8_000_000_000 },
    ]),
  },
};
