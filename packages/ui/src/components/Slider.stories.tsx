import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Slider, type SliderProps } from "./Slider";

function SliderControlled({ value: initial, ...args }: SliderProps) {
  const [value, setValue] = useState(initial);
  return (
    <div className="w-80 space-y-3">
      <Slider {...args} value={value} onChange={setValue} />
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        {value}
      </div>
    </div>
  );
}

const meta = {
  title: "Components/Slider",
  component: Slider,
  tags: ["autodocs"],
  render: (args) => <SliderControlled {...args} />,
  parameters: {
    docs: {
      description: {
        component:
          'Single-value slider built from a native `<input type="range">`, sharing track and thumb styling with `RangeSlider`. With `editable` an exact number field sits on the same row as the track; typed values snap to the step grid and clamp to the bounds. Fully controlled.',
      },
    },
  },
  argTypes: {
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    editable: { control: "boolean" },
    value: { control: false },
    onChange: { control: false },
  },
  args: {
    min: 0,
    max: 100,
    step: 1,
    value: 40,
    ariaLabel: "Threshold",
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Editable: Story = {
  args: { editable: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByLabelText("Edit threshold") as HTMLInputElement;
    await userEvent.clear(field);
    await userEvent.type(field, "250");
    await expect(field.value).toBe("250");
    await expect((canvas.getByLabelText("Threshold") as HTMLInputElement).value).toBe("100");
    await userEvent.tab();
    await expect(field.value).toBe("100");
  },
};

export const SteppedEditable: Story = {
  args: { editable: true, min: 0, max: 1000, step: 50, value: 200 },
};
