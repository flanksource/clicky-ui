import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import type { ChatModel } from "../chat/types";
import { PromptRunEditor } from "./PromptRunEditor";
import type { AIPromptRunValue } from "./PromptRunEditor/model";
import { SPEC_RUNTIME_TABS } from "./SpecRuntimeEditor/types";

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

function TabbedSpecStory() {
  const [value, setValue] = useState<AIPromptRunValue>({
    variables: { company: "Acme" },
    spec: {
      model: "claude-sonnet-4-6",
      id: "anthropic/claude-sonnet-4-6",
      prompt: { user: "Review {{company}}", system: "Be precise" },
      budget: { maxTokens: 8000 },
    },
  });
  return (
    <div className="max-w-3xl p-density-4">
      <PromptRunEditor
        value={value}
        onChange={setValue}
        models={MODELS}
        specTabs={SPEC_RUNTIME_TABS}
        recentRuntimes={[{ model: "gpt-5.5", id: "openai/gpt-5.5", mode: "agent", effort: "high" }]}
      />
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

    // Multi-model seeds a comparison row from the first row's mode; rows only
    // become removable past the two a comparison needs.
    await userEvent.click(canvas.getByRole("radio", { name: "Multi-model" }));

    const second = await canvas.findByRole("group", { name: "Runtime 2" });
    await expect(
      within(second).getByRole("group", { name: "Runtime 2 controls" }),
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Add runtime" }));
    await userEvent.click(
      await canvas.findByRole("button", { name: "Remove runtime 3" }),
    );
    await expect(
      canvas.queryByRole("group", { name: "Runtime 3" }),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("radio", { name: "Single model" }));
    await expect(
      canvas.queryByRole("group", { name: "Runtime 2" }),
    ).not.toBeInTheDocument();
  },
};

// Spec sections render inline behind tabs instead of the "Edit spec" modal,
// with recently used runtimes one click from reuse under the runtime bar.
export const TabbedSpec: Story = {
  render: () => <TabbedSpecStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByRole("button", { name: "Edit spec" }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      within(canvas.getByRole("list", { name: "Recently used runtimes" })).getByRole("button"),
    );
    await expect(
      within(canvas.getByRole("group", { name: "Runtime 1 controls" })).getByTitle(
        "Model — gpt-5.5",
      ),
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("tab", { name: "System Prompt" }));
    await expect(canvas.getByLabelText("System")).toHaveValue("Be precise");

    await userEvent.click(canvas.getByRole("tab", { name: "Model" }));
    await expect(
      canvas.getByRole("region", { name: "Model" }),
    ).toHaveTextContent("Max tokens");
  },
};
