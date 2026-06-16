import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { RangeSlider, type RangeSliderProps, type RangeSliderValue } from "./RangeSlider";

function RangeSliderControlled({ value: initial, ...args }: RangeSliderProps) {
  const [value, setValue] = useState<RangeSliderValue>(initial);
  return (
    <div className="w-80 space-y-3">
      <RangeSlider {...args} value={value} onChange={setValue} />
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        [{value[0]}, {value[1]}]
      </div>
    </div>
  );
}

const meta = {
  title: "Components/RangeSlider",
  component: RangeSlider,
  tags: ["autodocs"],
  render: (args) => <RangeSliderControlled {...args} />,
  parameters: {
    docs: {
      description: {
        component:
          "Dual-thumb range slider built from two overlaid native `<input type=\"range\">` elements. The thumbs cannot cross; the filled segment between them reflects the selected `[lower, upper]` window. Fully controlled.",
      },
    },
  },
  argTypes: {
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    value: { control: false },
    onChange: { control: false },
  },
  args: {
    min: 0,
    max: 100,
    step: 1,
    value: [20, 70],
  },
} satisfies Meta<typeof RangeSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Stepped: Story = {
  args: { min: 0, max: 1000, step: 50, value: [200, 600] },
};
