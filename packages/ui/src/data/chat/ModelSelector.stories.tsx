import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ModelSelector, EffortSelector } from "./ModelSelector";
import { MOCK_MODELS } from "./Chat.fixtures";

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

const meta = {
  title: "Chat/ModelSelector",
  component: ModelSelector,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Searchable model picker driven by the backend model menu, showing each provider's brand icon. Models whose provider is not configured are disabled (not hidden), so the menu shows what would be available with the right API key. `EffortSelector` is the companion reasoning-effort picker shown for reasoning-capable models.",
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
