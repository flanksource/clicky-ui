import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { METRICS } from "../fixtures/classes";
import { PoolMetricsTable } from "./PoolMetricsTable";

const meta = {
  title: "JVM/PoolMetricsTable",
  component: PoolMetricsTable,
  args: { label: "Server connectors", pools: METRICS.connectors },
} satisfies Meta<typeof PoolMetricsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Connectors: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("37")).toBeInTheDocument();
  },
};

export const DataSources: Story = {
  args: { label: "Data sources", pools: METRICS.dataSources },
};
