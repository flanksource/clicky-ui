import type { Meta, StoryObj } from "@storybook/react-vite";
import { StackedStatusBar, StatusRows, segment } from "./StatusBreakdown";

const SEGMENTS = [
  segment("healthy", "Healthy", 142, "bg-emerald-500"),
  segment("degraded", "Degraded", 18, "bg-amber-500"),
  segment("down", "Down", 6, "bg-rose-500"),
  segment("unknown", "Unknown", 0, "bg-slate-400"),
];

const meta = {
  title: "Data/StatusBreakdown",
  component: StatusRows,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A status-count breakdown rendered two ways from the same `StatusSegment[]` (build with `segment(key, label, count, className)`): `StackedStatusBar` packs the mix into one horizontal bar; `StatusRows` lists each status with a proportional bar, optional drill-down link, and per-row retry. Zero-count segments are dropped.",
      },
    },
  },
} satisfies Meta<typeof StatusRows>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rows: Story = {
  render: () => (
    <div className="w-96">
      <StatusRows segments={SEGMENTS} ariaLabel="Service health" />
    </div>
  ),
};

export const StackedBar: Story = {
  render: () => (
    <div className="w-96">
      <StackedStatusBar segments={SEGMENTS} ariaLabel="Service health" />
    </div>
  ),
};

export const WithLinksAndRetry: Story = {
  render: () => (
    <div className="w-96">
      <StatusRows
        segments={[
          { ...segment("down", "Down", 6, "bg-rose-500"), href: "/services?status=down" },
          { ...segment("degraded", "Degraded", 18, "bg-amber-500"), href: "/services?status=degraded" },
        ]}
        ariaLabel="Failing services"
        isRetryable={(s) => s.key === "down"}
        onRetry={() => {}}
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="w-96">
      <StatusRows segments={[segment("none", "None", 0, "bg-slate-400")]} />
    </div>
  ),
};
