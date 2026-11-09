import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProgressBar } from "./ProgressBar";
import { formatBytes } from "../lib/format";

const meta: Meta<typeof ProgressBar> = {
  title: "Charts/ProgressBar",
  component: ProgressBar,
  args: {
    total: 120,
    height: "h-2",
    segments: [
      { count: 90, color: "bg-green-500", label: "passed" },
      { count: 12, color: "bg-red-500", label: "failed" },
      { count: 8, color: "bg-yellow-400", label: "skipped" },
      { count: 10, color: "bg-blue-400", label: "pending" },
    ],
  },
  argTypes: {
    total: { control: { type: "number", min: 0, step: 1 } },
    height: {
      control: "select",
      options: ["h-1", "h-1.5", "h-2", "h-3", "h-4"],
    },
    segments: { control: "object" },
    className: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Segmented progress bar for small summaries and table/detail metrics. Each segment contributes a count, color class, and tooltip label. Supply label for an accessible resource name and formatValue for byte sizes or durations in tooltips and the accessible summary.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {};
export const JvmHeap: Story = {
  args: {
    label: "JVM heap",
    height: "h-6",
    total: 2048 * 1024 ** 2,
    formatValue: formatBytes,
    segments: [
      { label: "Eden", count: 220 * 1024 ** 2, color: "var(--clicky-info-500)" },
      { label: "Survivor", count: 44 * 1024 ** 2, color: "var(--clicky-hint-500)" },
      {
        label: "Old Gen",
        count: 576 * 1024 ** 2,
        color: "var(--clicky-prereq-500)",
      },
    ],
  },
};

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
      { count: 6, color: "bg-muted-foreground/40", label: "closed" },
    ],
  },
};

export const EmptyReturnsNull: Story = {
  args: { total: 0, segments: [] },
};
