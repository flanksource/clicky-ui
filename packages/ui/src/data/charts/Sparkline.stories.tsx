import type { Meta, StoryObj } from "@storybook/react-vite";
import { chartColor } from "./chart-palette";
import { Sparkline } from "./Sparkline";

const meta = {
  title: "Charts/Sparkline",
  component: Sparkline,
  args: { values: [42, 38, 45, 51, 47, 63, 58, 71, 68, 82], width: 160, height: 40 },
  parameters: {
    docs: {
      description: {
        component:
          "A trend line with no axes and one marker on the latest point. Static SVG at an explicit size; the range is in the SVG `<title>`.",
      },
    },
  },
} satisfies Meta<typeof Sparkline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Coloured: Story = { args: { color: chartColor(2) } };

export const Compact: Story = { args: { width: 80, height: 20 } };

export const SingleValue: Story = { args: { values: [7] } };

export const Empty: Story = { args: { values: [] } };
