import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { ChatModel } from "../chat/types";
import { PromptRunEditor } from "./PromptRunEditor";
import type { AIPromptRunValue } from "./PromptRunEditor/model";

const MODELS: ChatModel[] = [
  {
    id: "anthropic/claude-sonnet-4-6",
    provider: "anthropic",
    label: "Claude Sonnet 4.6",
    reasoning: true,
    configured: true,
    runtime: {
      model: "claude-sonnet-4-6",
      id: "anthropic/claude-sonnet-4-6",
      backend: "anthropic",
    },
  },
  {
    id: "openai/gpt-5.5",
    provider: "openai",
    label: "GPT-5.5",
    reasoning: true,
    configured: true,
    runtime: {
      model: "gpt-5.5",
      id: "openai/gpt-5.5",
      backend: "openai",
    },
  },
];

function CanonicalRequestStory() {
  const [value, setValue] = useState<AIPromptRunValue>({
    variables: { company: "Acme" },
    spec: {
      model: "claude-sonnet-4-6",
      id: "anthropic/claude-sonnet-4-6",
      backend: "anthropic",
      prompt: { user: "Review {{company}}" },
    },
    chat: true,
  });
  return (
    <div className="max-w-3xl p-density-4">
      <PromptRunEditor value={value} onChange={setValue} models={MODELS} />
    </div>
  );
}

const meta = {
  title: "AI/PromptRunEditor",
  component: PromptRunEditor,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PromptRunEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CanonicalRequest: Story = {
  render: () => <CanonicalRequestStory />,
};
