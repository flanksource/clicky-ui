import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { SplitButton } from "./SplitButton";

const meta = {
  title: "Components/SplitButton",
  component: SplitButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A primary action button joined to a chevron trigger that opens a dropdown of secondary actions. Composes `Button` and `DropdownMenu`.",
      },
    },
  },
  argTypes: {
    variant: {
      description: "Visual treatment forwarded to both halves.",
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      description: "Size preset forwarded to both halves.",
      control: "select",
      options: ["default", "sm", "lg"],
    },
    loading: { description: "Spinner on the primary half.", control: "boolean" },
    disabled: { description: "Disable both halves.", control: "boolean" },
  },
  args: {
    label: "Save",
    onClick: fn(),
    items: [
      { label: "Save and close", onSelect: fn() },
      { label: "Save as draft", onSelect: fn() },
      { label: "Discard", onSelect: fn() },
    ],
  },
} satisfies Meta<typeof SplitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Outline: Story = { args: { variant: "outline" } };

export const Loading: Story = { args: { loading: true } };

export const MenuInteraction: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("primary click fires the primary handler", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Save" }));
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });

    await step("chevron opens the menu and selection fires the item handler", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Open menu" }));
      await userEvent.click(canvas.getByRole("menuitem", { name: "Save and close" }));
      await expect(args.items[0].onSelect).toHaveBeenCalledTimes(1);
    });
  },
};
