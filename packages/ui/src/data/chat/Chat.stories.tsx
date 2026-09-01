import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Chat } from "./Chat";
import {
  mockChatTransport,
  mockApprovalTransport,
  mockReasoningTransport,
  MOCK_MODELS,
  SAMPLE_TOOL_MESSAGES,
} from "./Chat.fixtures";

const meta: Meta<typeof Chat> = {
  title: "Data/Chat",
  component: Chat,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Chat>;

// Each story builds a fresh transport so the call counter (text turn, then tool
// turn) restarts per story instance.
// The empty state is the one story without a seeded tool panel — it
// deliberately shows the first-run experience (empty state + suggestions).
export const Empty: Story = {
  render: () => (
    <div className="h-[600px] border border-border">
      <Chat
        transport={mockChatTransport()}
        suggestions={["List all pods", "Show failing checks", { label: "Restart api", prompt: "Restart the api service" }]}
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
      <Chat
        transport={mockChatTransport(200)}
        initialMessages={SAMPLE_TOOL_MESSAGES}
        placeholder="Try: list pods"
      />
    </div>
  ),
};

export const WithRuntimeBar: Story = {
  render: () => (
    <div className="h-[600px] border border-border">
      <Chat
        transport={mockChatTransport()}
        models={MOCK_MODELS}
        modelsApi={null}
        defaultModel="anthropic/claude-sonnet-4-5"
        enableAttachments
        initialMessages={SAMPLE_TOOL_MESSAGES}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const runtime = canvas.getByRole("button", {
      name: "Runtime: Claude, API, Claude Sonnet 4.5, effort Medium",
    });
    const meter = canvas.getByLabelText("Context 0% used");
    await userEvent.hover(meter);
    const body = within(document.body);
    await waitFor(() => expect(body.getByRole("tooltip")).toBeInTheDocument());
    await expect(
      within(body.getByRole("tooltip")).queryByText("Claude Sonnet 4.5"),
    ).not.toBeInTheDocument();
    await userEvent.click(runtime);
    await expect(body.getByRole("menu")).toHaveAttribute(
      "aria-label",
      "Runtime controls",
    );
    await expect(
      body.getByRole("radiogroup", { name: "Runtime mode" }),
    ).toBeInTheDocument();
  },
};

export const Reasoning: Story = {
  render: () => (
    <div className="h-[600px] border border-border">
      <Chat
        transport={mockReasoningTransport()}
        initialMessages={SAMPLE_TOOL_MESSAGES}
        placeholder="Ask anything"
      />
    </div>
  ),
};

export const ToolApproval: Story = {
  render: () => (
    <div className="h-[600px] border border-border">
      <Chat
        transport={mockApprovalTransport()}
        initialMessages={SAMPLE_TOOL_MESSAGES}
        placeholder="Try: restart the api service"
      />
    </div>
  ),
};
