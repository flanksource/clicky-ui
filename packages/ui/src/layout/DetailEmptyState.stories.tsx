import type { Meta, StoryObj } from "@storybook/react-vite";
import { DetailEmptyState } from "./Section";
import { UiInbox } from "../icons";

const meta: Meta<typeof DetailEmptyState> = {
  title: "Layout/DetailEmptyState",
  component: DetailEmptyState,
  args: {
    icon: UiInbox,
    label: "Nothing selected",
    description: "Pick an item from the tree to see its details.",
  },
  argTypes: {
    icon: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Centered empty-state block for detail panels. It accepts an optional icon, primary label, secondary description, and root class override.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DetailEmptyState>;

export const Default: Story = {};

export const WithoutIcon: Story = {
  args: {
    icon: undefined,
    label: "No details available",
    description: "The selected item does not expose additional metadata.",
  },
};
