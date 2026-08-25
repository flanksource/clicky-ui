import {
  SpecRuntimeEditor,
  type AISpecRuntimeSpec,
} from "@flanksource/clicky-ui/ai";
import type { ToolMeta } from "@flanksource/clicky-ui/ai";
import type { SpecRuntimeFamily } from "@flanksource/clicky-ui/ai";
import type { RuntimePreset } from "./contract";
import { OrderedPresetSelect } from "./OrderedPresetSelect";
import {
  PLAYGROUND_SANDBOX_CATALOG,
  PLAYGROUND_SECRET_SELECTOR,
} from "./runtime-settings-fixtures";

export type RuntimeSettingsValue = {
  spec: AISpecRuntimeSpec;
};

export function RuntimeSettingsEditor({
  value,
  presets,
  selectedPresetIds,
  tools,
  families,
  effectiveBackend,
  onChange,
  onPresetsChange,
}: {
  value: RuntimeSettingsValue;
  presets: RuntimePreset[];
  selectedPresetIds: string[];
  tools: ToolMeta[];
  families: SpecRuntimeFamily[];
  effectiveBackend?: string | undefined;
  onChange: (value: RuntimeSettingsValue) => void;
  onPresetsChange: (value: string[]) => void;
}) {
  return (
    <div className="space-y-density-3">
      <OrderedPresetSelect
        presets={presets}
        value={selectedPresetIds}
        onChange={onPresetsChange}
      />
      <SpecRuntimeEditor
        value={value.spec}
        onChange={(spec) => onChange({ ...value, spec })}
        tools={tools}
        families={families}
        effectiveBackend={effectiveBackend}
        sandboxCatalog={PLAYGROUND_SANDBOX_CATALOG}
        secretSelector={PLAYGROUND_SECRET_SELECTOR}
        sections={[
          "model",
          "prompt",
          "workspace",
          "sandbox",
          "permissions",
          "environment",
          "verify",
          "commit",
        ]}
        defaultCollapsedSections={[
          "model",
          "prompt",
          "workspace",
          "sandbox",
          "permissions",
          "environment",
          "verify",
          "commit",
        ]}
        showHeader={false}
      />
    </div>
  );
}
