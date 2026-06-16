import type { Meta, StoryObj } from "@storybook/react-vite";
import { AvatarBadge } from "./AvatarBadge";
import { UiCheckFilled, UiWarningTriangle } from "../icons";

const meta = {
  title: "Data/AvatarBadge",
  component: AvatarBadge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A pill that pairs an `Avatar` with a label and an optional trailing status `Icon`, with an optional multi-line comment beneath. Used for assignee/owner chips and review rows.",
      },
    },
  },
  argTypes: {
    alt: { control: "text" },
    label: { control: "text" },
    initials: { control: "text" },
    avatarKind: { control: "inline-radio", options: ["user", "bot", "service"] },
    avatarVariant: { control: "inline-radio", options: ["duotone", "filled", "outline"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    comment: { control: "text" },
  },
  args: {
    alt: "Ada Lovelace",
    label: "Ada Lovelace",
    avatarKind: "user",
    size: "lg",
  },
} satisfies Meta<typeof AvatarBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithStatus: Story = {
  args: {
    statusIcon: UiCheckFilled,
    statusTone: "emerald",
    statusTitle: "Approved",
  },
};

export const WithComment: Story = {
  args: {
    statusIcon: UiWarningTriangle,
    statusTone: "amber",
    comment: "Requested changes on the migration step before this can merge.",
  },
};

export const Initials: Story = {
  args: { alt: "Grace Hopper", label: "Grace Hopper", initials: "GH" },
};
