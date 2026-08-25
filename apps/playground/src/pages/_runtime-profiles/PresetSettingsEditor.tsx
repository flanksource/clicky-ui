import {
  SpecRuntimeEditor,
  type SpecRuntimeFamily,
} from "@flanksource/clicky-ui/ai";
import type { RuntimePresetSpec } from "./contract";
import { projectRuntimePresetSpec } from "./model";
import {
  PLAYGROUND_SANDBOX_CATALOG,
  PLAYGROUND_SECRET_SELECTOR,
} from "./runtime-settings-fixtures";

export type PresetSettingsValue = {
  spec: RuntimePresetSpec;
};

export function PresetSettingsEditor({
  value,
  families,
  onChange,
}: {
  value: PresetSettingsValue;
  families: SpecRuntimeFamily[];
  onChange: (value: PresetSettingsValue) => void;
}) {
  return (
    <SpecRuntimeEditor
      value={value.spec}
      onChange={(spec) =>
        onChange({ ...value, spec: projectRuntimePresetSpec(spec) })
      }
      families={families}
      sandboxCatalog={PLAYGROUND_SANDBOX_CATALOG}
      secretSelector={PLAYGROUND_SECRET_SELECTOR}
      sections={["model", "workspace", "sandbox", "environment"]}
      defaultCollapsedSections={[
        "model",
        "workspace",
        "sandbox",
        "environment",
      ]}
      variant="preset"
      showHeader={false}
    />
  );
}
