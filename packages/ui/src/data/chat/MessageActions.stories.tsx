import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { MessageActions } from "./MessageActions";

const meta = {
  title: "Chat/MessageActions",
  component: MessageActions,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Hover action row for an assistant message: copy its text (with a copied-confirmation) and, when `onRegenerate` is provided, re-generate it.",
      },
    },
  },
  args: { text: "Found 2 pods in default: api-7c9 and worker-1f2.", onRegenerate: fn() },
} satisfies Meta<typeof MessageActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CopyOnly: Story = {
  args: { onRegenerate: undefined },
};
