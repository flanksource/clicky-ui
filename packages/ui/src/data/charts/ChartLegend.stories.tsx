import type { Meta, StoryObj } from "@storybook/react-vite";
import { CHART_PALETTE, chartColor } from "./chart-palette";
import { ChartLegend } from "./ChartLegend";

const meta = {
  title: "Charts/ChartLegend",
  component: ChartLegend,
  args: {
    items: CHART_PALETTE.map((slot, index) => ({ label: slot.hue, color: chartColor(index) })),
  },
  parameters: {
    docs: {
      description: {
        component:
          "The series key: colour on the swatch, label in text ink. Inline-styled so it lays out in a static report rendered without the clicky-ui stylesheet.",
      },
    },
  },
} satisfies Meta<typeof ChartLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Palette: Story = {};

export const TwoSeries: Story = {
  args: {
    items: [
      { label: "passed", color: chartColor(0) },
      { label: "failed", color: chartColor(2) },
    ],
  },
};
