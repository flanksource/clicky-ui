import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Conversation } from "./Conversation";
import { SAMPLE_TOOL_MESSAGES } from "./Chat.fixtures";

const meta = {
  title: "Chat/Conversation",
  component: Conversation,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A scrollable message log that auto-sticks to the bottom as content streams in — unless the user has scrolled up, when a jump-to-bottom button appears. Renders each `UIMessage` via `Message`.",
      },
    },
  },
  argTypes: { messages: { control: false }, emptyState: { control: false } },
  args: { messages: SAMPLE_TOOL_MESSAGES, onRegenerate: fn(), onApprove: fn() },
} satisfies Meta<typeof Conversation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="h-[420px] max-w-2xl rounded-md border border-border">
      <Conversation {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    messages: [],
    emptyState: <p className="text-sm text-muted-foreground">Ask anything to get started.</p>,
  },
  render: (args) => (
    <div className="h-[280px] max-w-2xl rounded-md border border-border">
      <Conversation {...args} />
    </div>
  ),
};
