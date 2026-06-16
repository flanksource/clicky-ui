import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { PromptInput } from "./PromptInput";

const meta = {
  title: "Chat/PromptInput",
  component: PromptInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The chat composer: an auto-growing textarea with a submit/stop button driven by `status`, optional attachment button + chips (`enableAttachments`), and a footer `toolbar` slot for model/effort selectors. Calls `onSubmit(text, files)` on send.",
      },
    },
  },
  argTypes: {
    status: { control: "inline-radio", options: ["ready", "submitted", "streaming", "error"] },
    enableAttachments: { control: "boolean" },
    placeholder: { control: "text" },
    toolbar: { control: false },
  },
  args: {
    onSubmit: fn(),
    onStop: fn(),
    status: "ready",
    enableAttachments: true,
    placeholder: "Ask anything…",
  },
} satisfies Meta<typeof PromptInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {
  render: (args) => (
    <div className="max-w-2xl">
      <PromptInput {...args} />
    </div>
  ),
};

export const Streaming: Story = {
  args: { status: "streaming" },
  render: (args) => (
    <div className="max-w-2xl">
      <PromptInput {...args} />
    </div>
  ),
};
