import type { SpecRuntimeFamily } from "../../runtime/runtime-mode";
import type { RuntimePreset } from "../runtime-profile";
import { SpecRuntimeEditor } from "../SpecRuntimeEditor";
import type {
  SpecRuntimeSandboxCatalog,
  SpecRuntimeSecretSelectorConfig,
  SpecSectionId,
} from "../SpecRuntimeEditor/types";
import type {
  AISpecRuntimePermissionCatalog,
  AISpecRuntimeSpec,
} from "../SpecRuntimeEditor.model";
import { OrderedPresetSelect } from "./OrderedPresetSelect";

const PROFILE_SECTIONS: readonly SpecSectionId[] = [
  "model",
  "prompt",
  "workspace",
  "sandbox",
  "permissions",
  "environment",
  "verify",
  "commit",
];

export function ProfileSpecEditor({
  value,
  presets,
  selectedPresetIds,
  permissionCatalog,
  families,
  effectiveMode,
  effectiveModel,
  sandboxCatalog,
  secretSelector,
  onChange,
  onPresetsChange,
}: {
  value: AISpecRuntimeSpec;
  presets: RuntimePreset[];
  selectedPresetIds: string[];
  permissionCatalog?: AISpecRuntimePermissionCatalog | undefined;
  families: SpecRuntimeFamily[];
  effectiveMode?: string | undefined;
  effectiveModel?: string | undefined;
  sandboxCatalog?: SpecRuntimeSandboxCatalog | undefined;
  secretSelector?: SpecRuntimeSecretSelectorConfig | undefined;
  onChange: (value: AISpecRuntimeSpec) => void;
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
        value={value}
        onChange={onChange}
        {...(permissionCatalog ? { permissionCatalog } : {})}
        families={families}
        effectiveMode={effectiveMode}
        effectiveModel={effectiveModel}
        {...(sandboxCatalog ? { sandboxCatalog } : {})}
        {...(secretSelector ? { secretSelector } : {})}
        sections={PROFILE_SECTIONS}
        defaultCollapsedSections={PROFILE_SECTIONS}
        showHeader={false}
      />
    </div>
  );
}
