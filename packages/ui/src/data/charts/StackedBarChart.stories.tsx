import type { Meta, StoryObj } from "@storybook/react-vite";
import { StackedBarChart } from "./StackedBarChart";

const DAYS = ["2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22", "2026-08-23"];
const RESULTS = [
  { label: "passed", values: [182, 190, 176, 201, 199, 120, 118] },
  { label: "failed", values: [12, 9, 21, 6, 4, 2, 3] },
  { label: "skipped", values: [6, 6, 8, 7, 7, 4, 4] },
];

const MONTH = Array.from({ length: 30 }, (_, i) => `2026-08-${String(i + 1).padStart(2, "0")}`);

const meta = {
  title: "Charts/StackedBarChart",
  component: StackedBarChart,
  args: { categories: DAYS, series: RESULTS, width: 480, height: 200 },
  argTypes: {
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
    legend: { control: "boolean" },
    format: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Static stacked bars: one stack per category, one segment per series (`values[i]` aligns with `categories[i]`). Segments are split by a 2px surface-coloured gap; only the outermost segment is rounded. Crowded axis labels are thinned rather than overlapped.",
      },
    },
  },
} satisfies Meta<typeof StackedBarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {};

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    categories: ["Group Life", "Credit Life", "Preservation", "Annuity"],
    series: [
      { label: "active", values: [1204, 860, 412, 77] },
      { label: "pending", values: [96, 140, 33, 12] },
      { label: "lapsed", values: [41, 12, 9, 3] },
    ],
    height: 140,
  },
};

export const ThinnedLabels: Story = {
  args: {
    categories: MONTH,
    series: [
      { label: "runs", values: MONTH.map((_, i) => 40 + ((i * 37) % 25)) },
      { label: "retries", values: MONTH.map((_, i) => (i * 13) % 9) },
    ],
    width: 420,
  },
};

export const Empty: Story = { args: { categories: [], series: [] } };
