import type { Meta, StoryObj } from "@storybook/react-vite";
import { UiChip } from "../icons";
import { ProgressBars } from "./ProgressBars";

const ONE_CORE = 1000;
const GiB = 1024 ** 3;

const meta: Meta<typeof ProgressBars> = {
  title: "Charts/ProgressBars",
  component: ProgressBars,
  parameters: {
    docs: {
      description: {
        component:
          "Quantised utilisation as a row of bars — one per unit of capacity (ceil of the limit) — filled by the usage, so the bar straddling the boundary is partially filled and trailing bars show headroom. Purely presentational: pass plain `usage`/`max` numbers (no data fetching). Defaults to CPU cores; pass `unit` (e.g. `{ perBar: 1 GiB, label: 'GB' }`) to render memory or any other capacity. `showValue` controls the caption, `orientation` switches the bars between vertical columns and horizontal rows, and an optional `stats` prop drives the hover card's min/max/avg rows. The pure `deriveProgressBars(usage, limit, perBar)` helper computes the model. (`TimeseriesCoreBars` wraps this with a live timeseries fetcher.)",
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    usage: { control: { type: "number", min: 0, step: 100 } },
    max: { control: { type: "number", min: 0, step: 100 } },
    variant: { control: "inline-radio", options: ["default", "cell"] },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    showLabel: { control: "boolean" },
    showValue: { control: "boolean" },
    showCapacity: { control: "boolean" },
    thresholds: { table: { disable: true } },
    icon: { table: { disable: true } },
    unit: { table: { disable: true } },
    stats: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  render: (args) => (
    <div className="w-48">
      <ProgressBars {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof ProgressBars>;

/** 2.3 cores used of a 4-core limit. */
export const FourCores: Story = {
  args: {
    title: "CPU",
    icon: UiChip,
    usage: 2.3 * ONE_CORE,
    max: 4 * ONE_CORE,
    showValue: true,
    orientation: "vertical",
  },
};

export const Horizontal: Story = {
  args: {
    ...FourCores.args,
    orientation: "horizontal",
  },
};

export const ValueHidden: Story = {
  args: {
    ...FourCores.args,
    showValue: false,
  },
};

/** Near-capacity: 7.6 of 8 cores → danger tone. */
export const NearCapacity: Story = {
  args: {
    ...FourCores.args,
    max: 8 * ONE_CORE,
    usage: 7.6 * ONE_CORE,
  },
};

/** Summary stats drive the hover card's Min/Max/Avg rows. */
export const WithStatsHover: Story = {
  args: {
    ...FourCores.args,
    stats: { min: 1000, max: 3000, avg: 2075 },
    hoverFooter: "over last 1h",
  },
};

export const CellVariants: Story = {
  render: () => (
    <div className="grid w-[24rem] grid-cols-2 overflow-hidden rounded-md border border-border bg-background text-sm">
      <div className="border-b border-r border-border px-2 py-1.5">
        <ProgressBars
          variant="cell"
          title="CPU"
          icon={UiChip}
          usage={2.3 * ONE_CORE}
          max={4 * ONE_CORE}
        />
      </div>
      <div className="border-b border-border px-2 py-1.5">
        <ProgressBars
          variant="cell"
          showLabel={false}
          title="CPU"
          icon={UiChip}
          usage={2.3 * ONE_CORE}
          max={4 * ONE_CORE}
        />
      </div>
      <div className="border-r border-border px-2 py-1.5">
        <ProgressBars
          variant="cell"
          orientation="horizontal"
          title="Near limit"
          icon={UiChip}
          usage={7.6 * ONE_CORE}
          max={8 * ONE_CORE}
        />
      </div>
      <div className="px-2 py-1.5">
        <ProgressBars
          variant="cell"
          orientation="horizontal"
          showLabel={false}
          showValue={false}
          title="Near limit"
          icon={UiChip}
          usage={7.6 * ONE_CORE}
          max={8 * ONE_CORE}
        />
      </div>
    </div>
  ),
};

/** Memory as one bar per GB via the `unit` prop: 2.5 GB used of 4 GB. */
export const MemoryGigabytes: Story = {
  args: {
    title: "Mem",
    usage: 2.5 * GiB,
    max: 4 * GiB,
    unit: { perBar: GiB, label: "GB", barLabel: "GB" },
  },
};
