import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { UiGearSix } from "../../icons";
import { cn } from "../../lib/utils";
import type { ChatModel } from "../chat/types";
import type { AISpecRuntimeValue } from "../ai/SpecRuntimeEditor.model";
import { RuntimeBar, type RuntimeBarProps } from "./RuntimeBar";
import { runtimeSpecFields } from "../ai/runtime-spec-fields";
import { SPEC_RUNTIME_FAMILIES } from "./runtime-mode";

// A catalog wide enough for every segment to have somewhere to go: agent/CLI
// families that carry their own models, plus a hosted-API family that does not.
const MODELS: ChatModel[] = [
  {
    id: "anthropic/claude-sonnet-4-6",
    provider: "anthropic",
    label: "Claude Sonnet 4.6",
    reasoning: true,
    configured: true,
    contextWindow: 200_000,
  },
  {
    id: "anthropic/claude-opus-4-1",
    provider: "anthropic",
    label: "Claude Opus 4.1",
    reasoning: true,
    configured: true,
    contextWindow: 200_000,
  },
  {
    id: "openai/gpt-5-codex",
    provider: "openai",
    label: "GPT-5 Codex",
    reasoning: true,
    configured: true,
    contextWindow: 400_000,
  },
  {
    id: "openai/gpt-5-mini",
    provider: "openai",
    label: "GPT-5 mini",
    reasoning: true,
    configured: false,
    contextWindow: 400_000,
  },
];

function RuntimeBarStory({
  initial,
  variant = "segmented",
  families,
  showTimeout = false,
  showCost = false,
}: {
  initial: AISpecRuntimeValue;
  variant?: RuntimeBarProps["variant"];
  families?: RuntimeBarProps["families"];
  showTimeout?: boolean;
  showCost?: boolean;
}) {
  const [value, setValue] = useState<AISpecRuntimeValue>(initial);
  return (
    <div className="grid max-w-3xl gap-4 p-6">
      <RuntimeBar
        value={value}
        onChange={setValue}
        models={MODELS}
        families={families}
        variant={variant}
        showTimeout={showTimeout}
        showCost={showCost}
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
          "Mode comes first and filters the combined provider/model picker. Both layouts show supplied settings inline when space permits and move them into the three-dot menu on narrower containers. Unset settings are menu-only. Use showTimeout/showCost for run limits and actions.fields with runtimeSpecFields for permission mode, Source and Commit timing. Host fields provide isSet, caption and menu items; actions.menu adds entries such as Advanced. Custom model IDs and limits remain editable in their dropdowns.",
      },
    },
  },
  render: ({ variant }) => (
    <RuntimeBarStory initial={{ mode: "agent" }} variant={variant} />
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
        mode: "cli",
        model: "openai/gpt-5-codex",
        effort: "high",
      }}
    />
  ),
};

function NarrowRuntimeBarStory() {
  const [value, setValue] = useState<AISpecRuntimeValue>({
    mode: "cli",
    model: "anthropic/claude-sonnet-4-6",
    effort: "medium",
    budget: { timeout: "30m", cost: 2 },
  });
  return (
    <div className="w-80 max-w-full p-4">
      <RuntimeBar
        value={value}
        onChange={setValue}
        models={MODELS}
        showTimeout
        showCost
        ariaLabel="Narrow runtime"
      />
    </div>
  );
}

export const NarrowContainer: Story = {
  args: { variant: "segmented" },
  render: () => <NarrowRuntimeBarStory />,
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole("group", {
      name: "Narrow runtime",
    });
    const identity = bar.querySelector("[data-runtime-bar-section=identity]")!;
    const actions = bar.querySelector("[data-runtime-bar-section=actions]")!;
    await expect(actions.getBoundingClientRect().top).toBe(
      identity.getBoundingClientRect().top,
    );
    await expect(bar.scrollWidth).toBe(bar.clientWidth);
    await userEvent.click(within(bar).getByTitle("Runtime options"));
    await expect(
      within(document.body)
        .getAllByRole("menuitem")
        .map((item) => item.textContent),
    ).toEqual(["Effort", "Budget", "Timeout"]);
    await userEvent.keyboard("{Escape}");
  },
};

function HostActionsStory({ inline }: { inline: boolean }) {
  const [value, setValue] = useState<AISpecRuntimeValue>({
    mode: "cli",
    model: "anthropic/claude-sonnet-4-6",
    effort: "medium",
  });
  return (
    <div className={cn("p-4", inline ? "max-w-3xl" : "w-80 max-w-full")}>
      <RuntimeBar
        value={value}
        onChange={setValue}
        models={MODELS}
        ariaLabel={inline ? "Wide runtime" : "Narrow runtime"}
        actions={{
          fields: [
            {
              id: "presets",
              isSet: true,
              label: "Presets",
              title: "Presets — Guardrails",
              caption: <span className="text-xs">Presets 1</span>,
              items: [{ label: "Guardrails", onSelect: () => {} }],
            },
          ],
          menu: [{ label: "Advanced", icon: UiGearSix, onSelect: () => {} }],
        }}
      />
    </div>
  );
}

export const HostActions: Story = {
  args: { variant: "segmented" },
  render: () => (
    <div className="grid gap-4">
      <HostActionsStory inline />
      <HostActionsStory inline={false} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wide = canvas.getByRole("group", { name: "Wide runtime" });
    const narrow = canvas.getByRole("group", { name: "Narrow runtime" });

    await expect(
      within(wide).getByTitle("Presets — Guardrails"),
    ).toBeInTheDocument();
    await expect(
      within(narrow).queryByTitle("Presets — Guardrails"),
    ).not.toBeInTheDocument();

    await userEvent.click(within(narrow).getByTitle("Runtime options"));
    const menu = within(document.body).getAllByRole("menu")[0]!;
    await expect(
      within(menu)
        .getAllByRole("menuitem")
        .map((item) => item.textContent),
    ).toEqual(["Effort", "Presets", "Advanced"]);
    await userEvent.keyboard("{Escape}");
  },
};

export const Combo: Story = {
  args: {
    variant: "combo",
  },
  render: ({ variant }) => (
    <RuntimeBarStory
      variant={variant}
      initial={{
        mode: "cli",
        model: "openai/gpt-5-codex",
        effort: "high",
        budget: { timeout: "30m", cost: 2 },
      }}
      showTimeout
      showCost
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await expect(canvas.getByTitle("Runtime mode — CLI")).toBeInTheDocument();
    await userEvent.click(canvas.getByTitle("Model — openai/gpt-5-codex"));
    const listbox = await body.findByRole("listbox", { name: "Model" });
    await expect(body.getByLabelText("Search Model")).toBeInTheDocument();
    await userEvent.click(
      within(listbox).getByRole("option", { name: /^Claude Sonnet/ }),
    );
    await expect(canvas.getByTitle("Runtime mode — CLI")).toBeInTheDocument();
    await expect(
      canvas.getByTitle("Model — anthropic/claude-sonnet-4-6"),
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByTitle("Runtime options"));
    await userEvent.click(body.getByRole("menuitem", { name: "Budget" }));
    await expect(body.getByLabelText("Budget (USD)")).toHaveValue("2");
    await userEvent.keyboard("{Escape}");
    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("menu")).not.toBeInTheDocument();
  },
};

/** A hosted-API family the catalog does not describe keeps model entry available
 *  as free text even when there are no catalog rows. */
export const NoModelsForFamily: Story = {
  args: { variant: "segmented" },
  render: ({ variant }) => (
    <RuntimeBarStory
      initial={{ mode: "api" }}
      variant={variant}
      families={[
        {
          id: "gemini",
          label: "Gemini",
          provider: "googleai",
          modes: [{ id: "api", label: "API" }],
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const body = within(document.body);

    await userEvent.click(canvas.getByTitle("Model — unspecified"));
    await userEvent.type(
      await body.findByLabelText("Search Model"),
      "gemini-3-pro",
    );
    await userEvent.click(
      await body.findByRole("option", { name: "Use custom: gemini-3-pro" }),
    );

    await expect(canvas.getByTitle("Model — gemini-3-pro")).toBeInTheDocument();
  },
};

export const SwitchingFamilyKeepsTheMode: Story = {
  args: { variant: "segmented" },
  render: ({ variant }) => (
    <RuntimeBarStory
      variant={variant}
      initial={{ mode: "cli", model: "anthropic/claude-opus-4-1" }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(
      canvas.getByTitle("Model — anthropic/claude-opus-4-1"),
    );
    await userEvent.click(
      await body.findByRole("option", { name: /^GPT-5 Codex/ }),
    );

    await expect(canvas.getByTitle("Runtime mode — CLI")).toHaveTextContent(
      "CLI",
    );
    await expect(
      canvas.getByTitle("Model — openai/gpt-5-codex"),
    ).toBeInTheDocument();
  },
};

export const UnavailableModesAreOmitted: Story = {
  args: { variant: "segmented" },
  render: ({ variant }) => (
    <RuntimeBarStory
      initial={{ mode: "agent" }}
      variant={variant}
      families={[
        {
          id: "claude",
          label: "Claude",
          provider: "anthropic",
          modes: [
            {
              id: "agent",
              label: "Agent",
              mode: "agent",
              title: "Claude Agent SDK",
            },
            {
              id: "cli",
              label: "CLI",
              mode: "cli",
              title: "Claude Code CLI",
            },
          ],
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(canvas.getByTitle("Runtime mode — Agent"));
    await expect(
      body.queryByRole("menuitem", { name: /^API/ }),
    ).not.toBeInTheDocument();
  },
};

function SpecSettingsStory({ variant }: Pick<RuntimeBarProps, "variant">) {
  const [value, setValue] = useState<AISpecRuntimeValue>({
    mode: "cli",
    model: "anthropic/claude-sonnet-4-6",
    effort: "medium",
    budget: { timeout: "30m", cost: 2 },
    permissions: { mode: "plan" },
    setup: { checkout: { worktree: { mode: "none" } } },
    workflow: { commits: [{ on: "run" }] },
  });
  return (
    <div className="grid gap-4 p-6">
      <RuntimeBar
        variant={variant}
        value={value}
        onChange={setValue}
        models={MODELS}
        showTimeout
        showCost
        actions={{
          fields: runtimeSpecFields({
            value,
            onChange: setValue,
            models: MODELS,
            families: SPEC_RUNTIME_FAMILIES,
          }),
        }}
      />
      <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
}

export const WithSpecSettings: Story = {
  render: ({ variant }) => <SpecSettingsStory variant={variant} />,
};
