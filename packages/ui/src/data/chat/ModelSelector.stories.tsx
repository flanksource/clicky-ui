import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { ChatBudgetConfig } from "./types";
import { BudgetSelector, EffortSelector, ModelSelector, ProviderSelector } from "./ModelSelector";
import { MOCK_MODELS } from "./Chat.fixtures";
import { UiRobotAi, UiSparkles } from "../../icons";

function ModelSelectorControlled() {
  const [value, setValue] = useState(MOCK_MODELS[0]?.id);
  return (
    <div className="w-72 space-y-3">
      <ModelSelector models={MOCK_MODELS} value={value} onChange={setValue} />
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        model={value}
      </div>
    </div>
  );
}

function EffortSelectorControlled() {
  const [value, setValue] = useState("");
  return (
    <div className="w-56 space-y-3">
      <EffortSelector efforts={["", "low", "medium", "high"]} value={value} onChange={setValue} />
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        effort={value || "(none)"}
      </div>
    </div>
  );
}

function ProviderSelectorControlled() {
  const [value, setValue] = useState<"anthropic" | "openai">("anthropic");
  return (
    <div className="w-72 space-y-3">
      <ProviderSelector
        value={value}
        onChange={setValue}
        providers={[
          { id: "anthropic", label: "Claude", provider: "anthropic", icon: UiSparkles },
          { id: "openai", label: "OpenAI", provider: "openai", icon: UiRobotAi },
        ]}
      />
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        provider={value}
      </div>
    </div>
  );
}

function BudgetSelectorControlled() {
  const [budget, setBudget] = useState<ChatBudgetConfig>({ cost: 2.5, maxTokens: 8_000 });
  return (
    <div className="w-96 space-y-3">
      <BudgetSelector budget={budget} onBudgetChange={setBudget} />
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        {JSON.stringify(budget)}
      </div>
    </div>
  );
}

const meta = {
  title: "Chat/ModelSelector",
  component: ModelSelector,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Searchable model picker driven by the backend model menu, showing each provider's brand icon. Models whose provider is not configured are disabled (not hidden), so the menu shows what would be available with the right API key. `ProviderSelector`, `EffortSelector`, and `BudgetSelector` are companion controls for AI configuration surfaces.",
      },
    },
  },
  render: () => <ModelSelectorControlled />,
} satisfies Meta<typeof ModelSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Effort: Story = {
  render: () => <EffortSelectorControlled />,
};

export const Provider: Story = {
  render: () => <ProviderSelectorControlled />,
};

export const Budget: Story = {
  render: () => <BudgetSelectorControlled />,
};
