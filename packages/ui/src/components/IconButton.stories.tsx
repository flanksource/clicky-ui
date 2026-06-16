import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { IconButton } from "./IconButton";
import { UiDotsVertical, UiCalendar, UiFilter, UiClose } from "../icons";

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Borderless, background-free icon button: the hover effect lives on the glyph color, not a surrounding chip. Use for inline affordances (close, overflow menu, row actions). For a box-shaped control use `Button`.",
      },
    },
  },
  argTypes: {
    icon: { control: false, description: "Imported icon component to render." },
    label: { control: "text", description: "Accessible name; sets both aria-label and tooltip." },
    disabled: { control: "boolean" },
    iconClassName: { control: "text", description: "Extra glyph classes, e.g. size." },
  },
  args: {
    icon: UiDotsVertical,
    label: "More actions",
    onClick: fn(),
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton icon={UiDotsVertical} label="More actions" />
      <IconButton icon={UiCalendar} label="Pick date" />
      <IconButton icon={UiFilter} label="Filter" />
      <IconButton icon={UiClose} label="Dismiss" iconClassName="text-base" />
      <IconButton icon={UiDotsVertical} label="Disabled" disabled />
    </div>
  ),
};

export const Click: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "More actions" }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
