import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ContextMeter } from "./ContextMeter";
import { providerIcon } from "./provider-icons";

const meta = {
  title: "Chat/ContextMeter",
  component: ContextMeter,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'The unified context-window meter. `mode="bar"` (SessionViewer header) and `mode="gauge"` (chat toolbar) share one hover popover: model, context-window breakdown, per-bucket token usage and cost + budget. Domain-agnostic — callers feed plain numbers.',
      },
    },
  },
  argTypes: {
    mode: { control: "inline-radio", options: ["bar", "gauge"] },
    usedPercent: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
  render: (args) => (
    <div className="flex min-h-56 items-start justify-center p-10">
      <ContextMeter {...args} />
    </div>
  ),
} satisfies Meta<typeof ContextMeter>;

export default meta;
type Story = StoryObj<typeof meta>;

const RICH = {
  usedPercent: 74,
  usedTokens: 148_000,
  windowTokens: 200_000,
  messageCount: 32,
  model: "claude-opus-4-8",
  modelIcon: providerIcon("anthropic"),
  effort: "high",
  tokens: {
    input: 120_000,
    output: 18_000,
    reasoning: 6_000,
    cacheRead: 40_000,
    cacheWrite: 4_000,
    total: 188_000,
  },
  cost: {
    input: 0.36,
    output: 0.54,
    reasoning: 0.18,
    cacheRead: 0.12,
    cacheWrite: 0.04,
    total: 1.24,
  },
  budget: { used: 1.24, total: 5, remaining: 3.76 },
} satisfies Partial<Story["args"]>;

export const Bar: Story = {
  args: { mode: "bar", ...RICH },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByLabelText("Context 74% used"));
    const body = within(document.body);
    await waitFor(() =>
      expect(body.getByText("claude-opus-4-8")).toBeInTheDocument(),
    );
    await expect(body.getByText("High effort")).toBeInTheDocument();
    // Tokens + Cost merged into one table: the Output bucket shows both cells.
    await expect(body.getByText("Output")).toBeInTheDocument();
    await expect(body.getByText("18k")).toBeInTheDocument();
    await expect(body.getByText("$0.54")).toBeInTheDocument();
    await expect(body.getByText("$1.24 / $5.00")).toBeInTheDocument();
  },
};

export const Gauge: Story = {
  args: { mode: "gauge", ...RICH },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByLabelText("Context 74% used"));
    const body = within(document.body);
    await waitFor(() => expect(body.getByText("Tokens")).toBeInTheDocument());
    await expect(body.getByText("Messages")).toBeInTheDocument();
  },
};

/** Chat only knows a single total cost — the popover shows just the total. */
export const ChatGaugeMinimal: Story = {
  args: {
    mode: "gauge",
    usedPercent: 42,
    usedTokens: 84_000,
    windowTokens: 200_000,
    messageCount: 12,
    model: "gpt-5-codex",
    modelIcon: providerIcon("openai"),
    cost: { total: 0.42 },
  },
};

export const Critical: Story = {
  args: { mode: "bar", ...RICH, usedPercent: 97 },
};
