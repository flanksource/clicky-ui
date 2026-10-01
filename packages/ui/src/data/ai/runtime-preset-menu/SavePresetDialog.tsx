import { Fragment, useId } from "react";
import { Button } from "../../../components/button";
import { Field } from "../../../components/Field";
import { InputField } from "../../../components/InputField";
import { uniqueName } from "../../../lib/runtime-profile-model";
import { Modal } from "../../../overlay/Modal";
import { effortLevelLabel } from "../../chat/effort-icons";
import { formatCost } from "../../runtime/RuntimeBar.limits";
import { permissionModeVisual } from "../SpecRuntimeEditor/permission-mode-visuals";
import { commitPhase } from "../SpecRuntimeEditor/update";
import type { RuntimePreset } from "../runtime-profile";

export function SavePresetDialog({
  draft,
  catalog,
  saving,
  error,
  onChange,
  onSave,
  onClose,
}: {
  draft: RuntimePreset;
  catalog: RuntimePreset[];
  saving: boolean;
  error: string | undefined;
  onChange: (draft: RuntimePreset) => void;
  onSave: (draft: RuntimePreset) => void;
  onClose: () => void;
}) {
  const nameId = useId();
  const valid = uniqueName(draft.name, draft.id, catalog);
  return (
    <Modal
      open
      onClose={onClose}
      title="Save as preset"
      size="md"
      closeOnEsc={!saving}
      hideClose={saving}
      closeOnBackdrop={!saving}
    >
      <form
        className="grid gap-density-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (valid && !saving) onSave({ ...draft, name: draft.name.trim() });
        }}
      >
        <Field
          label="Preset name"
          htmlFor={nameId}
          required
          error={!valid ? "A unique preset name is required." : undefined}
        >
          <InputField
            id={nameId}
            aria-label="Preset name"
            value={draft.name}
            required
            invalid={!valid}
            disabled={saving}
            onChange={(name) => onChange({ ...draft, name })}
          />
        </Field>
        <section aria-label="Preset settings" className="grid gap-density-2">
          <p className="text-xs text-muted-foreground">
            Save these bar settings as a reusable preset.
          </p>
          <PresetSettingsPreview preset={draft} />
        </section>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-density-2">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!valid || saving}>
            {saving ? "Saving…" : "Save preset"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function PresetSettingsPreview({ preset }: { preset: RuntimePreset }) {
  const { spec } = preset;
  const source = spec.setup?.checkout?.worktree;
  const phase = commitPhase(spec);
  const rows = [
    ["Mode", spec.mode],
    ["Model", spec.model ?? spec.id],
    ["Effort", spec.effort ? effortLevelLabel(spec.effort) : undefined],
    [
      "Permissions",
      spec.permissions?.mode
        ? permissionModeVisual(undefined, spec.permissions.mode).label
        : undefined,
    ],
    [
      "Source",
      source?.mode
        ? { new: "New worktree", existing: "Existing worktree", none: "HEAD" }[
            source.mode
          ]
        : undefined,
    ],
    ["Worktree path", source?.path],
    [
      "Commit",
      spec.workflow?.commits !== undefined
        ? {
            none: "Never",
            turn: "Every turn",
            agent: "After the loop",
            run: "End of run",
          }[phase]
        : undefined,
    ],
    ["Cost", formatCost(spec.budget?.cost)],
    ["Timeout", spec.budget?.timeout],
  ].filter((row) => row[1] !== undefined);
  return rows.length > 0 ? (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 rounded-md border border-border p-density-3 text-xs">
      {rows.map(([label, value]) => (
        <Fragment key={label}>
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="break-words font-medium">{value}</dd>
        </Fragment>
      ))}
    </dl>
  ) : (
    <p className="text-xs text-muted-foreground">No bar settings supplied.</p>
  );
}
