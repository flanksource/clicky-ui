import { useRef, useState, type ReactNode } from "react";
import { UiLayers, UiSave } from "../../../icons";
import {
  newPresetRecord,
  presetForRef,
} from "../../../lib/runtime-profile-model";
import { Modal } from "../../../overlay/Modal";
import type { DropdownMenuItem } from "../../../overlay/DropdownMenu";
import {
  assertRuntimePresetSpec,
  type RuntimePreset,
} from "../runtime-profile";
import { presetsField } from "../PromptRunEditor/runtimeActions";
import { OrderedPresetSelect } from "../runtime-profiles/OrderedPresetSelect";
import {
  runtimeBarPresetSpec,
  withRuntimePresetSelection,
  type RuntimePresetMenuValue,
} from "./model";
import { SavePresetDialog } from "./SavePresetDialog";

export type RuntimePresetMenuOptions = {
  value: RuntimePresetMenuValue;
  onChange: (next: RuntimePresetMenuValue) => void;
  presets: RuntimePreset[];
  onCreatePreset?:
    | ((draft: RuntimePreset) => Promise<RuntimePreset>)
    | undefined;
};

export function useRuntimePresetMenu(options: RuntimePresetMenuOptions): {
  menu: DropdownMenuItem[];
  dialogs: ReactNode;
} {
  const [ordering, setOrdering] = useState(false);
  const [draft, setDraft] = useState<RuntimePreset>();
  const [created, setCreated] = useState<RuntimePreset[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const pending = useRef(false);
  const latest = useRef(options);
  latest.current = options;
  const catalog = [
    ...options.presets,
    ...created.filter(
      (preset) => !options.presets.some((entry) => entry.id === preset.id),
    ),
  ];
  const select = (selected: string[]) =>
    options.onChange(
      withRuntimePresetSelection({
        value: options.value,
        selected,
        catalog,
      }),
    );
  const field = presetsField({
    presets: catalog,
    value: options.value.presets,
    onChange: select,
    onReorder: () => setOrdering(true),
  });
  const save = async (next: RuntimePreset) => {
    if (pending.current) return;
    pending.current = true;
    setSaving(true);
    setError(undefined);
    try {
      if (!options.onCreatePreset)
        throw new Error("Saving presets is unavailable");
      const saved = await options.onCreatePreset(next);
      if (!saved.id.trim() || !saved.name.trim())
        throw new Error("Saved preset must have an id and name");
      assertRuntimePresetSpec(saved.spec, "saved preset spec");
      setCreated((records) => [
        ...records.filter((preset) => preset.id !== saved.id),
        saved,
      ]);
      const current = latest.current.value;
      const alreadySelected = current.presets.some(
        (ref) =>
          ref === saved.id ||
          presetForRef(ref, [...catalog, saved])?.id === saved.id,
      );
      latest.current.onChange({
        ...current,
        presets: alreadySelected
          ? current.presets
          : [...current.presets, saved.id],
      });
      setDraft(undefined);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };
  const menu: DropdownMenuItem[] = [
    {
      label: "Presets",
      icon: UiLayers,
      iconClassName: "text-muted-foreground",
      children:
        field.items.length > 0
          ? field.items
          : [
              {
                label: "No presets yet",
                disabled: true,
                onSelect: () => {},
              },
            ],
      onSelect: () => {},
    },
  ];
  if (options.onCreatePreset)
    menu.push({
      label: "Save as preset…",
      icon: UiSave,
      iconClassName: "text-muted-foreground",
      onSelect: () => {
        setError(undefined);
        setDraft({
          ...newPresetRecord(catalog, crypto.randomUUID()),
          spec: runtimeBarPresetSpec(options.value.spec),
        });
      },
    });
  return {
    menu,
    dialogs: (
      <>
        <Modal
          open={ordering}
          onClose={() => setOrdering(false)}
          title="Presets"
          size="lg"
          closeOnEsc
        >
          <OrderedPresetSelect
            presets={catalog}
            value={options.value.presets}
            onChange={select}
          />
        </Modal>
        {draft && (
          <SavePresetDialog
            draft={draft}
            catalog={catalog}
            saving={saving}
            error={error}
            onChange={(next) => {
              setDraft(next);
              setError(undefined);
            }}
            onSave={(next) => void save(next)}
            onClose={() => {
              if (!pending.current) setDraft(undefined);
            }}
          />
        )}
      </>
    ),
  };
}
