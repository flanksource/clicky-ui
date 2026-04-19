import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProgressBar } from "./ProgressBar";

const meta: Meta<typeof ProgressBar> = {
  title: "Data/ProgressBar",
  component: ProgressBar,
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const TestRun: Story = {
  args: {
    total: 120,
    segments: [
      { count: 90, color: "bg-green-500", label: "passed" },
      { count: 12, color: "bg-red-500", label: "failed" },
      { count: 8, color: "bg-yellow-400", label: "skipped" },
      { count: 10, color: "bg-blue-400", label: "pending" },
    ],
  },
};

export const PullRequests: Story = {
  args: {
    total: 50,
    segments: [
      { count: 30, color: "bg-emerald-500", label: "merged" },
      { count: 14, color: "bg-sky-500", label: "open" },
      { count: 6, color: "bg-gray-400", label: "closed" },
    ],
  },
};

export const EmptyReturnsNull: Story = {
  args: { total: 0, segments: [] },
};
