import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Message } from "./Message";
import { SAMPLE_TOOL_MESSAGES } from "./Chat.fixtures";
import type { UIMessage } from "./types";

const USER: UIMessage = SAMPLE_TOOL_MESSAGES[0] as UIMessage;
const ASSISTANT: UIMessage = SAMPLE_TOOL_MESSAGES[1] as UIMessage;

const meta = {
  title: "Chat/Message",
  component: Message,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate).",
      },
    },
  },
  argTypes: { message: { control: false }, onRegenerate: { control: false }, onApprove: { control: false } },
  args: { onRegenerate: fn(), onApprove: fn() },
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UserMessage: Story = {
  args: { message: USER },
  render: (args) => (
    <div className="max-w-2xl">
      <Message {...args} />
    </div>
  ),
};

export const AssistantWithToolCall: Story = {
  args: { message: ASSISTANT },
  render: (args) => (
    <div className="max-w-2xl">
      <Message {...args} />
    </div>
  ),
};
