import type { Meta, StoryObj } from "@storybook/react-vite";
import { Chat } from "./Chat";
import { mockChatTransport } from "./Chat.fixtures";

const meta: Meta<typeof Chat> = {
  title: "Data/Chat",
  component: Chat,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The backend owns model selection + tool execution; these stories drive a mock transport.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Chat>;

// Each story builds a fresh transport so the call counter (text turn, then tool
// turn) restarts per story instance.
export const Empty: Story = {
  render: () => (
    <div className="h-[600px] border border-border">
      <Chat
        transport={mockChatTransport()}
        emptyState={
          <div className="space-y-1">
            <h3 className="font-medium text-sm">Ask about your app</h3>
            <p className="text-muted-foreground text-sm">
              Type a question — the assistant can call your app&apos;s operations.
            </p>
          </div>
        }
      />
    </div>
  ),
};

export const Streaming: Story = {
  render: () => (
    <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport(200)} placeholder="Try: list pods" />
    </div>
  ),
};
