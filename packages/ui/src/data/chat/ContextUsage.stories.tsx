import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContextUsage } from "./ContextUsage";

const meta = {
  title: "Chat/ContextUsage",
  component: ContextUsage,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A compact readout of context-window usage for the current conversation: tokens used of the model's window (with a fill bar), message count, model label, and optional running cost.",
      },
    },
  },
  argTypes: {
    usedTokens: { control: "number" },
    maxTokens: { control: "number" },
    messageCount: { control: "number" },
    cost: { control: "number" },
    modelIcon: { control: false },
  },
  args: {
    usedTokens: 48_200,
    maxTokens: 200_000,
    messageCount: 12,
    modelLabel: "Claude Sonnet 4.5",
    cost: 0.042,
  },
} satisfies Meta<typeof ContextUsage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NearlyFull: Story = {
  args: { usedTokens: 188_000, maxTokens: 200_000, messageCount: 64, cost: 0.31 },
};
