import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { METRICS } from "../fixtures/classes";
import { RuntimeDashboard } from "./RuntimeDashboard";

const meta = {
  title: "JVM/RuntimeDashboard",
  component: RuntimeDashboard,
  parameters: { layout: "padded" },
  args: { metrics: METRICS, onRefresh: () => {} },
} satisfies Meta<typeof RuntimeDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Snapshot: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Process CPU")).toBeInTheDocument();
    await expect(canvas.getByText("G1 Old Gen")).toBeInTheDocument();
    await expect(canvas.getByRole("region", { name: "Data sources" })).toBeInTheDocument();
  },
};

export const Busy: Story = {
  args: { metrics: { ...METRICS, processCpuPercent: 94.2, runtime: { ...METRICS.runtime, systemLoadAverage: 7.9 } } },
};

export const CpuAndLoadUnavailable: Story = {
  args: { metrics: { ...METRICS, processCpuPercent: null, runtime: { ...METRICS.runtime, systemLoadAverage: -1 } } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByText("Unavailable").length).toBeGreaterThanOrEqual(2);
  },
};

export const NoPoolTables: Story = {
  args: { metrics: { ...METRICS, connectors: [], dataSources: [] } },
};
