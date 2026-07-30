import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import type { ChatModel } from "../chat/types";
import { RuntimeBar } from "./RuntimeBar";
import type { AISpecRuntimeValue } from "./SpecRuntimeEditor.model";

// A catalog wide enough for every segment to have somewhere to go: agent/CLI
// families that carry their own models, plus a hosted-API family that does not.
const MODELS: ChatModel[] = [
  {
    id: "claude-agent/claude-sonnet-4-6",
    provider: "claude-agent",
    label: "Claude Sonnet 4.6",
    reasoning: true,
    configured: true,
    contextWindow: 200_000,
  },
  {
    id: "claude-agent/claude-opus-4-1",
    provider: "claude-agent",
    label: "Claude Opus 4.1",
    reasoning: true,
    configured: true,
    contextWindow: 200_000,
  },
  {
    id: "codex-cli/gpt-5-codex",
    provider: "codex-cli",
    label: "GPT-5 Codex",
    reasoning: true,
    configured: true,
    contextWindow: 400_000,
  },
  {
    id: "codex-cli/gpt-5-mini",
    provider: "codex-cli",
    label: "GPT-5 mini",
    reasoning: true,
    configured: false,
    contextWindow: 400_000,
  },
];

function RuntimeBarStory({ initial }: { initial: AISpecRuntimeValue }) {
  const [value, setValue] = useState<AISpecRuntimeValue>(initial);
  return (
    <div className="grid max-w-3xl gap-4 p-6">
      <RuntimeBar value={value} onChange={setValue} models={MODELS} />
      <pre className="rounded-md border border-border bg-muted/30 p-3 font-mono text-xs text-muted-foreground">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

const meta = {
  title: "AI/RuntimeBar",
  component: RuntimeBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The runtime as one self-describing row. Family, mode, model and reasoning effort each open their own menu; every segment shows its current value, so the bar needs no field labels above it. Switching family keeps the current mode when the new family has it and drops a model the new provider cannot run. Unsupported modes and efforts stay listed but disabled, with the reason as a hint. The Model segment is always present: it lists the selected family's catalog models and carries a free-text entry for a family the catalog does not describe, so the model never leaves the bar.",
      },
    },
  },
  render: () => <RuntimeBarStory initial={{ backend: "claude-agent" }} />,
} satisfies Meta<typeof RuntimeBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithModelAndEffort: Story = {
  render: () => (
    <RuntimeBarStory
      initial={{
        backend: "codex-cli",
        model: "codex-cli/gpt-5-codex",
        effort: "high",
      }}
    />
  ),
};

/** A hosted-API family the catalog does not describe keeps the Model segment;
 *  its menu offers the free-text entry alone. */
export const NoModelsForFamily: Story = {
  render: () => <RuntimeBarStory initial={{ backend: "gemini" }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTitle("Model — prompt default"));
    await userEvent.type(
      await within(document.body).findByLabelText("Model id"),
      "gemini-3-pro",
    );

    await expect(canvas.getByTitle("Model — gemini-3-pro")).toBeInTheDocument();
  },
};

export const SwitchingFamilyKeepsTheMode: Story = {
  render: () => (
    <RuntimeBarStory
      initial={{ backend: "claude-cli", model: "claude-agent/claude-opus-4-1" }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(canvas.getByTitle("Family — Claude"));
    await userEvent.click(
      await body.findByRole("menuitem", { name: /^Codex/ }),
    );

    // CLI survives the family switch; the Claude-only model does not.
    await expect(canvas.getByTitle("Codex CLI")).toHaveTextContent("CLI");
    await expect(
      canvas.getByTitle("Model — prompt default"),
    ).toBeInTheDocument();
  },
};

export const UnsupportedModesAreDisabled: Story = {
  render: () => <RuntimeBarStory initial={{ backend: "claude-agent" }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(canvas.getByTitle("Claude Agent SDK"));
    await expect(
      await body.findByRole("menuitem", { name: /^API not on Claude/ }),
    ).toBeDisabled();
  },
};
