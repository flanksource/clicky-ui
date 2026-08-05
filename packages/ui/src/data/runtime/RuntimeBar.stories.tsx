import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import type { ChatModel } from "../chat/types";
import type { AISpecRuntimeValue } from "../ai/SpecRuntimeEditor.model";
import { RuntimeBar, type RuntimeBarProps } from "./RuntimeBar";

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

function RuntimeBarStory({
  initial,
  variant = "segmented",
}: {
  initial: AISpecRuntimeValue;
  variant?: RuntimeBarProps["variant"];
}) {
  const [value, setValue] = useState<AISpecRuntimeValue>(initial);
  return (
    <div className="grid max-w-3xl gap-4 p-6">
      <RuntimeBar
        value={value}
        onChange={setValue}
        models={MODELS}
        variant={variant}
      />
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
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["segmented", "combo"],
    },
  },
  args: {
    variant: "segmented",
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The runtime as one self-describing control. The default segmented variant gives family, mode, model and reasoning effort their own menu triggers. The combo variant condenses the same values into one summary trigger and exposes direct controls in a single dropdown. Switching family keeps the current mode when the new family has it and drops a model the new provider cannot run. Unsupported modes and efforts stay visible but disabled, and the model can always be entered directly when the catalog does not describe it.",
      },
    },
  },
  render: ({ variant }) => (
    <RuntimeBarStory initial={{ backend: "claude-agent" }} variant={variant} />
  ),
} satisfies Meta<typeof RuntimeBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithModelAndEffort: Story = {
  render: ({ variant }) => (
    <RuntimeBarStory
      variant={variant}
      initial={{
        backend: "codex-cli",
        model: "codex-cli/gpt-5-codex",
        effort: "high",
      }}
    />
  ),
};

export const Combo: Story = {
  args: {
    variant: "combo",
  },
  render: ({ variant }) => (
    <RuntimeBarStory
      variant={variant}
      initial={{
        backend: "codex-cli",
        model: "codex-cli/gpt-5-codex",
        effort: "high",
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole("button", {
      name: "Runtime: Codex, CLI, GPT-5 Codex, effort High",
    });

    await userEvent.click(trigger);

    const menu = await body.findByRole("menu");
    await expect(
      within(menu).getByRole("radiogroup", { name: "Family" }),
    ).toBeInTheDocument();
    await expect(
      within(menu).getByRole("radiogroup", { name: "Runtime mode" }),
    ).toBeInTheDocument();
    await expect(
      within(menu).getByRole("slider", { name: "Reasoning effort" }),
    ).toHaveAttribute("aria-valuetext", "High");
    await expect(
      within(menu).queryByLabelText("Model id"),
    ).not.toBeInTheDocument();
    const modelChoice = within(menu).getByRole("button", {
      name: "GPT-5 Codex",
    });
    await expect(modelChoice).toHaveAttribute("title", "codex-cli/gpt-5-codex");
    await expect(modelChoice).not.toHaveTextContent("codex-cli/gpt-5-codex");

    await userEvent.click(within(menu).getByRole("radio", { name: "Claude" }));
    await expect(
      canvas.getByRole("button", {
        name: "Runtime: Claude, CLI, Prompt default, effort High",
      }),
    ).toBeInTheDocument();
    await expect(body.getByRole("menu")).toBeInTheDocument();

    // Claude has no API mode: the segment stays visible but inert, worded the
    // same way the segmented variant words it.
    const api = within(menu).getByRole("radio", { name: "API" });
    await expect(api).toBeDisabled();
    await expect(api).toHaveAttribute("title", "not on Claude");

    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("menu")).not.toBeInTheDocument();
  },
};

/** A hosted-API family the catalog does not describe keeps the Model segment;
 *  its menu offers the free-text entry alone. */
export const NoModelsForFamily: Story = {
  // Pinned: the free-text model entry these interactions drive belongs to the
  // segmented variant; the combo variant renders no SpecInput.
  args: { variant: "segmented" },
  render: ({ variant }) => (
    <RuntimeBarStory initial={{ backend: "gemini" }} variant={variant} />
  ),
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
  // Pinned: the segment menus these interactions drive exist only in the
  // segmented variant; the combo variant exposes radios behind one trigger.
  args: { variant: "segmented" },
  render: ({ variant }) => (
    <RuntimeBarStory
      variant={variant}
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
  // Pinned: the disabled mode is a menuitem here and a radio in combo, which
  // the Combo story asserts instead.
  args: { variant: "segmented" },
  render: ({ variant }) => (
    <RuntimeBarStory initial={{ backend: "claude-agent" }} variant={variant} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(canvas.getByTitle("Claude Agent SDK"));
    await expect(
      await body.findByRole("menuitem", { name: /^API not on Claude/ }),
    ).toBeDisabled();
  },
};
