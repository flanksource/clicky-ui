import type { SpecRuntimeFamily } from "../../runtime/runtime-mode";
import {
  projectRuntimePresetSpec,
  type RuntimePresetSpec,
} from "../runtime-profile";
import { SpecRuntimeEditor } from "../SpecRuntimeEditor";
import type {
  SpecRuntimeSandboxCatalog,
  SpecRuntimeSecretSelectorConfig,
} from "../SpecRuntimeEditor/types";

export function PresetSpecEditor({
  value,
  families,
  sandboxCatalog,
  secretSelector,
  onChange,
}: {
  value: RuntimePresetSpec;
  families: SpecRuntimeFamily[];
  sandboxCatalog?: SpecRuntimeSandboxCatalog | undefined;
  secretSelector?: SpecRuntimeSecretSelectorConfig | undefined;
  onChange: (value: RuntimePresetSpec) => void;
}) {
  return (
    <SpecRuntimeEditor
      value={value}
      onChange={(spec) => onChange(projectRuntimePresetSpec(spec))}
      families={families}
      {...(sandboxCatalog ? { sandboxCatalog } : {})}
      {...(secretSelector ? { secretSelector } : {})}
      variant="preset"
      showHeader={false}
    />
  );
}
