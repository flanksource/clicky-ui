import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { METRICS } from "../fixtures/classes";
import { MemoryPools } from "./MemoryPools";

const meta = {
  title: "JVM/MemoryPools",
  component: MemoryPools,
  parameters: { layout: "padded" },
  args: { memory: METRICS.memory },
} satisfies Meta<typeof MemoryPools>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pools: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("182 MB / 256 MB committed · no max")).toBeInTheDocument();
  },
};

export const NearlyFull: Story = {
  args: { memory: { heap: [{ name: "G1 Old Gen", type: "HEAP", used: 980 * 1024 * 1024, committed: 1024 * 1024 * 1024, max: 1024 * 1024 * 1024 }], nonHeap: [], buffer: [] } },
};
