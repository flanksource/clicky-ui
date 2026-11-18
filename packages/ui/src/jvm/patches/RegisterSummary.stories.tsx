import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { RegisterSummary } from "./RegisterSummary";

const meta = {
  title: "JVM/RegisterSummary",
  component: RegisterSummary,
  args: { summary: { patched: 3, stale: 2, unleased: 1 } },
} satisfies Meta<typeof RegisterSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NeedsAttention: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("1 without a lease")).toBeInTheDocument();
  },
};

export const Clean: Story = {
  args: { summary: { patched: 1, stale: 0, unleased: 0 } },
};
