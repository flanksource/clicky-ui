import type { Meta, StoryObj } from "@storybook/react-vite";
import { InlineError } from "./InlineError";

const httpError = Object.assign(new Error("request failed: 500 Internal Server Error"), {
  method: "POST",
  url: "/api/v1/widgets",
  status: 500,
  responseBody: '{"error":"database connection refused","trace":"a1b2c3"}',
});

const meta = {
  title: "Clicky-RPC/InlineError",
  component: InlineError,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Inline error card for a failed operation: a title + message, and an expandable 'More details' section that surfaces the request method/url/status and response body when the error object carries them (as the rpc api client's errors do).",
      },
    },
  },
  argTypes: { error: { control: false } },
  args: { title: "Failed to load widgets", error: httpError },
} satisfies Meta<typeof InlineError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithRequestDetails: Story = {
  render: (args) => (
    <div className="max-w-lg">
      <InlineError {...args} />
    </div>
  ),
};

export const MessageOnly: Story = {
  args: { title: "Something went wrong", error: new Error("network timeout after 30s") },
  render: (args) => (
    <div className="max-w-lg">
      <InlineError {...args} />
    </div>
  ),
};
