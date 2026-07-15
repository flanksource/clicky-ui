import { SegmentedControl } from "../../components/SegmentedControl";
import { providerIcon } from "../chat/provider-icons";
import type { ChatModel } from "../chat/types";
import type { AISpecRuntimeValue } from "./SpecRuntimeEditor.model";
import { SpecField } from "./SpecRuntimeEditor/fields";
import { withOptionalRoot, withRoot } from "./SpecRuntimeEditor/update";
import {
  SPEC_RUNTIME_FAMILIES,
  type SpecRuntimeFamily,
  backendForFamilyMode,
  familyById,
  firstMode,
  modelBelongsToFamily,
  selectionForBackend,
} from "./runtime-mode";

export type RuntimeModePickerProps = {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  families?: SpecRuntimeFamily[] | undefined;
  /** Model catalog used to decide whether the current model survives a family switch. */
  models?: ChatModel[] | undefined;
};

// The two-axis Family → Mode picker. Both segmented controls drive the single
// `value.backend`; switching family drops a model that no longer belongs to the
// new provider so the model picker never shows a stale cross-provider choice.
export function RuntimeModePicker({
  value,
  onChange,
  families = SPEC_RUNTIME_FAMILIES,
  models = [],
}: RuntimeModePickerProps) {
  const selection = selectionForBackend(families, value.backend);
  const family = familyById(families, selection.family);

  const applyBackend = (familyId: string, modeId: string) => {
    const backend = backendForFamilyMode(families, familyId, modeId);
    if (backend === (value.backend ?? "")) return;
    const nextFamily = familyById(families, familyId);
    // A backend switch invalidates the previous backend's cmux CLI-arg values.
    let next = withOptionalRoot(withRoot(value, { backend }), "cliArgs", undefined);
    if (!modelBelongsToFamily(value.model, models, nextFamily, backend)) {
      next = withOptionalRoot(next, "model", undefined);
    }
    onChange(next);
  };

  return (
    <div className="grid gap-density-2">
      <SpecField label="Family">
        <SegmentedControl
          aria-label="Provider family"
          size="sm"
          wrap
          value={family.id}
          options={families.map((entry) => {
            const icon = providerIcon(entry.id);
            return { id: entry.id, label: entry.label, ...(icon ? { icon } : {}) };
          })}
          onChange={(familyId) => applyBackend(familyId, firstMode(familyById(families, familyId)).id)}
        />
      </SpecField>
      <SpecField label="Mode" hint="runtime">
        <SegmentedControl
          aria-label="Runtime mode"
          size="sm"
          wrap
          value={selection.mode}
          options={family.modes.map((mode) => ({
            id: mode.id,
            label: mode.label,
            ...(mode.icon ? { icon: mode.icon } : {}),
            ...(mode.title ? { title: mode.title } : {}),
          }))}
          onChange={(modeId) => applyBackend(family.id, modeId)}
        />
      </SpecField>
    </div>
  );
}
