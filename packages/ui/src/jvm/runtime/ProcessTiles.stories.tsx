import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { METRICS } from "../fixtures/classes";
import { ProcessTiles } from "./ProcessTiles";

const meta = {
  title: "JVM/ProcessTiles",
  component: ProcessTiles,
  args: { metrics: METRICS },
} satisfies Meta<typeof ProcessTiles>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("37.5%")).toBeInTheDocument();
  },
};

export const Saturated: Story = {
  args: { metrics: { ...METRICS, processCpuPercent: 96, runtime: { ...METRICS.runtime, systemLoadAverage: 9 } } },
};

export const Unavailable: Story = {
  args: { metrics: { ...METRICS, processCpuPercent: null, runtime: { ...METRICS.runtime, systemLoadAverage: -1 } } },
};
