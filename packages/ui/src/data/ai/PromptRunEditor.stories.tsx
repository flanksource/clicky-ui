import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("group", { name: "Runtime 1" }),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole("group", { name: "Runtime 2" }),
    ).not.toBeInTheDocument();

    // A comparison row seeds from the first row's backend and becomes
    // removable, so both rows carry their own controls.
    await userEvent.click(canvas.getByRole("button", { name: "Add runtime" }));

    const second = await canvas.findByRole("group", { name: "Runtime 2" });
    await expect(
      within(second).getByRole("group", { name: "Runtime 2 controls" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Remove runtime 2" }),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole("button", { name: "Remove runtime 2" }),
    );
    await expect(
      canvas.queryByRole("group", { name: "Runtime 2" }),
    ).not.toBeInTheDocument();
  },
};
