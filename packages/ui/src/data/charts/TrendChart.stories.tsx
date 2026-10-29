import type { Meta, StoryObj } from "@storybook/react-vite";
import { TrendChart } from "./TrendChart";

const DAYS = Array.from({ length: 21 }, (_, i) => `2026-08-${String(i + 3).padStart(2, "0")}`);

const meta = {
  title: "Charts/TrendChart",
  component: TrendChart,
  args: {
    x: DAYS,
    series: [
      { label: "p95 latency", values: DAYS.map((_, i) => 180 + ((i * 47) % 90) + i * 4) },
      { label: "p50 latency", values: DAYS.map((_, i) => 70 + ((i * 23) % 30)) },
    ],
    width: 520,
    height: 220,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["line", "area"] },
    legend: { control: "boolean" },
    yFormat: { table: { disable: true } },
    xFormat: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Static trend: series over evenly spaced x positions (ISO dates are shown as \"Aug 16\"), on a y axis of nice ticks from 0. Every x position carries an SVG `<title>` with all series values, so hover works with no JavaScript.",
      },
    },
  },
} satisfies Meta<typeof TrendChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const milliseconds = (n: number) => `${n} ms`;

export const Line: Story = { args: { yFormat: milliseconds } };

export const Area: Story = { args: { variant: "area", yFormat: milliseconds } };

export const SingleSeries: Story = {
  args: {
    series: [{ label: "findings", values: [318, 344, 361, 402, 388, 421, 447, 468] }],
    x: ["wk 1", "wk 2", "wk 3", "wk 4", "wk 5", "wk 6", "wk 7", "wk 8"],
    variant: "area",
  },
};

export const Empty: Story = { args: { x: [], series: [] } };
