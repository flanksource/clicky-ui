import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { RuntimeBar } from "../../runtime/RuntimeBar";
import { SPEC_RUNTIME_FAMILIES } from "../../runtime/runtime-mode";
import { runtimeSpecFields } from "../runtime-spec-fields";
import type { RuntimePreset } from "../runtime-profile";
import type { RuntimePresetMenuValue } from "./model";
import { useRuntimePresetMenu } from "./use-runtime-preset-menu";

function PresetMenuExample({
  variant = "segmented",
}: {
  variant?: "segmented" | "combo";
}) {
  const [value, setValue] = useState<RuntimePresetMenuValue>({
    spec: {
      mode: "cli",
      effort: "medium",
      budget: { timeout: "30m", cost: 2 },
    },
    presets: [],
  });
  const [catalog, setCatalog] = useState<RuntimePreset[]>([
    {
      id: "careful",
      name: "Careful review",
      scope: "surface",
      spec: { effort: "high", permissions: { mode: "plan" } },
    },
    {
      id: "quick",
      name: "Quick iteration",
      scope: "surface",
      spec: { effort: "low" },
    },
  ]);
  const { menu, dialogs } = useRuntimePresetMenu({
    value,
    onChange: setValue,
    presets: catalog,
    onCreatePreset: async (preset) => {
      setCatalog((current) => [...current, preset]);
      return preset;
    },
  });
  return (
    <div className="grid w-full max-w-5xl gap-density-4 p-density-4">
      <RuntimeBar
        value={value.spec}
        variant={variant}
        showTimeout
        showCost
        onChange={(spec) => setValue({ ...value, spec })}
        actions={{
          menu,
          fields: runtimeSpecFields({
            value: value.spec,
            onChange: (spec) => setValue({ ...value, spec }),
            families: SPEC_RUNTIME_FAMILIES,
          }),
        }}
      />
      {dialogs}
      <pre className="overflow-auto text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

const meta = {
  title: "Data/AI/Runtime preset menu",
  component: PresetMenuExample,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof PresetMenuExample>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Segmented: Story = {};
export const Combo: Story = { args: { variant: "combo" } };
