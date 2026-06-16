import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ToolCall } from "./ToolCall";
import { SAMPLE_TOOL_MESSAGES } from "./Chat.fixtures";
import type { AnyToolPart } from "./types";

// The completed dynamic-tool part from the seeded assistant turn (args → result).
const COMPLETED = SAMPLE_TOOL_MESSAGES[1]?.parts[0] as AnyToolPart;

const meta = {
  title: "Chat/ToolCall",
  component: ToolCall,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A collapsible panel for one assistant tool call (typed or dynamic): the tool name, a status chip, and the input args → output result. When the call is in `approval-requested` state, `onApprove` wires the approve/deny controls.",
      },
    },
  },
  argTypes: { part: { control: false }, defaultOpen: { control: "boolean" }, onApprove: { control: false } },
  args: { part: COMPLETED, defaultOpen: false, onApprove: fn() },
} satisfies Meta<typeof ToolCall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {
  render: (args) => (
    <div className="max-w-2xl">
      <ToolCall {...args} />
    </div>
  ),
};

export const Expanded: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <div className="max-w-2xl">
      <ToolCall {...args} />
    </div>
  ),
};
