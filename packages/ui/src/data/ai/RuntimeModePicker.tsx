import { SegmentedControl } from "../../components/SegmentedControl";
import { DEFAULT_REASONING_EFFORTS } from "../chat/effort-icons";
import { providerIcon } from "../chat/provider-icons";
import type { ChatModel } from "../chat/types";
import { applyRuntimeBackend } from "../runtime/RuntimeBar.model";
import type { AISpecRuntimeValue } from "./SpecRuntimeEditor.model";
import { SpecField } from "./SpecRuntimeEditor/fields";
import {
  SPEC_RUNTIME_FAMILIES,
  type SpecRuntimeFamily,
  familyById,
  firstMode,
  selectionForBackend,
} from "../runtime/runtime-mode";

export type RuntimeModePickerProps = {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  families?: SpecRuntimeFamily[] | undefined;
  /** Model catalog used to decide whether the current model survives a family switch. */
  models?: ChatModel[] | undefined;
};

// The two-axis Family → Mode picker writes one coherent catalog runtime. A
// switch preserves the model only through the target backend's own row, so its
// canonical identity and capabilities replace those of the previous runtime.
export function RuntimeModePicker({
  value,
  onChange,
  families = SPEC_RUNTIME_FAMILIES,
  models = [],
}: RuntimeModePickerProps) {
  const selection = selectionForBackend(families, value.backend);
  const family = familyById(families, selection.family);

  const applyBackend = (familyId: string, modeId: string) => {
    const next = applyRuntimeBackend(
      value,
      models,
      families,
      familyId,
      modeId,
      DEFAULT_REASONING_EFFORTS,
    );
    if (next !== value) onChange(next);
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
