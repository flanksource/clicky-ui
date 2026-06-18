import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, type ComponentProps } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UiChip } from "../icons";
import { TimeseriesCoreBars } from "./TimeseriesCoreBars";
import type { TimeseriesResponse } from "./TimeseriesPanel";

const BASE_TIME = Date.parse("2026-06-02T12:00:00Z");

/** Fetcher with no network: the latest value (millicores) is matched by URL. */
function makeFetcher(latestByMatch: { match: string; latest: number }[]) {
  return async (url: string): Promise<TimeseriesResponse> => {
    const entry =
      latestByMatch.find((e) => url.includes(e.match)) ?? latestByMatch[0];
    return {
      id: url,
      points: [{ at: new Date(BASE_TIME).toISOString(), value: entry.latest }],
    };
  };
}

function CoreBarsShowcase(args: ComponentProps<typeof TimeseriesCoreBars>) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      }),
    [],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-48">
        <TimeseriesCoreBars {...args} />
      </div>
    </QueryClientProvider>
  );
}

function CoreBarsCellVariants() {
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
          <TimeseriesCoreBars
            variant="cell"
            title="CPU"
            icon={UiChip}
            value={{ id: "cpu.cell.usage" }}
            max={4000}
            refreshMs={0}
            fetcher={makeFetcher([{ match: "cpu.cell", latest: 2300 }])}
          />
        </div>
        <div className="border-b border-border px-2 py-1.5">
          <TimeseriesCoreBars
            variant="cell"
            showLabel={false}
            title="CPU"
            icon={UiChip}
            value={{ id: "cpu.icon.usage" }}
            max={4000}
            refreshMs={0}
            fetcher={makeFetcher([{ match: "cpu.icon", latest: 2300 }])}
          />
        </div>
        <div className="border-r border-border px-2 py-1.5">
          <TimeseriesCoreBars
            variant="cell"
            title="Near limit"
            icon={UiChip}
            value={{ id: "cpu.warning.usage" }}
            max={8000}
            refreshMs={0}
            fetcher={makeFetcher([{ match: "warning", latest: 7600 }])}
          />
        </div>
        <div className="px-2 py-1.5">
          <TimeseriesCoreBars
            variant="cell"
            showLabel={false}
            title="Near limit"
            icon={UiChip}
            value={{ id: "cpu.danger.usage" }}
            max={8000}
            refreshMs={0}
            fetcher={makeFetcher([{ match: "danger", latest: 7600 }])}
          />
        </div>
      </div>
    </QueryClientProvider>
  );
}

const meta: Meta<typeof TimeseriesCoreBars> = {
  title: "Charts/TimeseriesCoreBars",
  component: TimeseriesCoreBars,
  parameters: {
    docs: {
      description: {
        component:
          "CPU utilisation as a row of vertical bars — one per core (ceil of the CPU limit) — filled left to right by the latest usage, so the bar straddling the boundary is partially filled and trailing bars show headroom. Usage and limit are read live from the timeseries store. The pure `deriveCoreBars(usageMilli, limitMilli)` helper computes the model. Stories pass a synthetic `fetcher` and `refreshMs={0}`.",
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    baseUrl: { control: "text" },
    range: { control: "text" },
    refreshMs: { control: { type: "number", min: 0, step: 1000 } },
    variant: { control: "inline-radio", options: ["default", "cell"] },
    showLabel: { control: "boolean" },
    thresholds: { table: { disable: true } },
    icon: { table: { disable: true } },
    fetcher: { table: { disable: true } },
    value: { table: { disable: true } },
    max: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  render: (args) => <CoreBarsShowcase {...args} />,
};

export default meta;
type Story = StoryObj<typeof TimeseriesCoreBars>;

/** 2.3 cores used of a 4-core limit. */
export const FourCores: Story = {
  args: {
    title: "CPU",
    icon: UiChip,
    value: { id: "cpu.usage" },
    max: 4000,
    refreshMs: 0,
    fetcher: makeFetcher([{ match: "cpu", latest: 2300 }]),
  },
};

/** Near-capacity: 7.6 of 8 cores → danger tone. */
export const NearCapacity: Story = {
  args: {
    ...FourCores.args,
    max: 8000,
    fetcher: makeFetcher([{ match: "cpu", latest: 7600 }]),
  },
};

/** Limit read from a `.limit` metric instead of a constant. */
export const MetricLimit: Story = {
  args: {
    title: "CPU",
    value: { id: "cpu.usage" },
    max: { id: "cpu.limit" },
    refreshMs: 0,
    fetcher: makeFetcher([
      { match: "usage", latest: 1500 },
      { match: "limit", latest: 2000 },
    ]),
  },
};

export const CellVariants: Story = {
  render: () => <CoreBarsCellVariants />,
};
