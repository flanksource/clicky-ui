import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { METRICS } from "../fixtures/classes";
import { GcSummary } from "./GcSummary";

const meta = {
  title: "JVM/GcSummary",
  component: GcSummary,
  args: { collectors: METRICS.garbageCollectors },
} satisfies Meta<typeof GcSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collectors: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("1842 · 21.3 s")).toBeInTheDocument();
  },
};

export const None: Story = { args: { collectors: [] } };
