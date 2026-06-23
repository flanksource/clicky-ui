import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { FormatOptionsDropdown, type FormatOptionsDropdownProps } from "./FormatOptionsDropdown";

const meta = {
  title: "Components/FormatOptionsDropdown",
  component: FormatOptionsDropdown,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Split button for choosing a Clicky output format. The primary button shows the active format; the chevron lists the alternatives with descriptions.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: { control: "select", options: ["default", "sm", "lg"] },
  },
  args: { value: "clicky", onChange: fn() },
  render: (args: FormatOptionsDropdownProps) => {
    const [value, setValue] = useState(args.value);
    return (
      <FormatOptionsDropdown
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next);
          args.onChange(next);
        }}
      />
    );
  },
} satisfies Meta<typeof FormatOptionsDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Outline: Story = { args: { variant: "outline" } };

export const SelectInteraction: Story = {
  play: async ({ args, canvasElement, step }) => {
    // Query the whole document, not just the story canvas: the menu renders in a
    // FloatingPortal at document.body, outside canvasElement.
    const canvas = within(canvasElement.ownerDocument.body);

    await step("opening the menu and selecting YAML updates the format", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Choose format" }));
      await userEvent.click(canvas.getByRole("menuitem", { name: /YAML/ }));
      await expect(args.onChange).toHaveBeenCalledWith("yaml");
      await expect(canvas.getByRole("button", { name: /YAML/ })).toBeInTheDocument();
    });
  },
};
