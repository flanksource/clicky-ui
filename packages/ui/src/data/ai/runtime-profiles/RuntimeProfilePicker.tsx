import { useId } from "react";
import { Button } from "../../../components/button";
import { Combobox } from "../../../components/Combobox";
import { Field } from "../../../components/Field";
import { InputField } from "../../../components/InputField";
import {
  SegmentedControl,
  type SegmentedOption,
} from "../../../components/SegmentedControl";
import { UiFilePlus, UiGitMerge, UiLayers, UiSave } from "../../../icons";
import { Icon } from "../../Icon";
import type { RuntimePreset, RuntimeProfile } from "../runtime-profile";
import { presetsOf, uniqueName } from "../../../lib/runtime-profile-model";
import { ProfilePresetChips } from "./ProfilePresetChips";
import type { RuntimeProfileLayer } from "./RuntimeProfilePicker.model";
import type { RuntimeProfilePickerController } from "./use-runtime-profile-picker";

const NONE = "__clicky_runtime_profile_none__";

export type RuntimeProfilePickerProps = {
  controller: RuntimeProfilePickerController;
  profiles: RuntimeProfile[];
  presets: RuntimePreset[];
};

// Compact profile row that sits beside the runtime bar: profile, its ordered
// presets, which layer the spec editor writes to, and save actions once the
// profile draft diverges from the saved profile.
export function RuntimeProfilePicker({
  controller,
  profiles,
  presets,
}: RuntimeProfilePickerProps) {
  const { state } = controller;
  const { draft } = state;
  const nameId = useId();
  const pendingProfile = profiles.find(
    (profile) => profile.id === state.draft?.id,
  );
  const layers: SegmentedOption<RuntimeProfileLayer>[] = [
    { id: "run", label: "This run" },
    { id: "profile", label: `Profile «${draft?.name ?? ""}»` },
  ];
  const nameTaken = draft ? !uniqueName(draft.name, draft.id, profiles) : false;
  const included = draft ? presetsOf(draft, presets) : { found: [], missing: [] };

  return (
    <section aria-label="Runtime profile" className="grid gap-density-2">
      <div className="flex flex-wrap items-center gap-density-2">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Icon icon={UiLayers} className="size-3.5" />
          Profile
        </span>
        <Combobox
          ariaLabel="Runtime profile"
          value={state.draft?.id ?? NONE}
          options={[
            { value: NONE, label: "None" },
            ...profiles.map((profile) => ({
              value: profile.id,
              label: profile.name,
              ...(profile.description
                ? { description: profile.description }
                : {}),
            })),
          ]}
          onChange={(next) =>
            controller.select(next === NONE ? undefined : next)
          }
          allowCustomValue={false}
          required
          className="w-52"
        />
        {draft && (
          <SegmentedControl
            aria-label="Editing layer"
            size="sm"
            value={state.layer}
            options={layers}
            onChange={controller.setLayer}
          />
        )}
        {draft && controller.dirty && (
          <>
            <Button
              size="sm"
              disabled={!controller.canSave || nameTaken || Boolean(controller.busy)}
              onClick={() => void controller.save()}
            >
              <Icon icon={UiSave} className="size-3.5" />
              Save profile
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!controller.canCreate || Boolean(controller.busy)}
              onClick={() => void controller.saveAsNew()}
            >
              <Icon icon={UiFilePlus} className="size-3.5" />
              Save as new
            </Button>
          </>
        )}
        {draft && (
          <Button
            size="sm"
            variant="ghost"
            disabled={Boolean(controller.busy)}
            onClick={() => void controller.detach()}
          >
            <Icon icon={UiGitMerge} className="size-3.5" />
            Detach
          </Button>
        )}
        {controller.busy && (
          <span role="status" className="text-xs text-muted-foreground">
            {controller.busy === "detach" ? "Resolving…" : "Saving…"}
          </span>
        )}
      </div>
      {draft && presets.length > 0 && (
        <ProfilePresetChips
          included={included.found}
          presets={presets}
          onChange={(presetIds) =>
            controller.editDraft({ ...draft, presets: [...presetIds, ...included.missing] })
          }
        />
      )}
      {included.missing.length > 0 && (
        <p role="alert" className="text-xs text-destructive">
          Missing presets: {included.missing.join(", ")}
        </p>
      )}
      {controller.pending && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-density-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-density-3 py-density-2 text-xs"
        >
          <span className="flex-1">
            Discard changes to «{pendingProfile?.name ?? draft?.name}»?
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={controller.cancelPending}
          >
            Keep editing
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={controller.confirmPending}
          >
            Discard
          </Button>
        </div>
      )}
      {draft && state.layer === "profile" && (
        <Field
          label="Profile name"
          htmlFor={nameId}
          labelClassName="text-xs"
          error={nameTaken ? "A unique profile name is required." : undefined}
        >
          <InputField
            id={nameId}
            value={draft.name}
            invalid={nameTaken}
            onChange={(name) => controller.editDraft({ ...draft, name })}
            className="max-w-sm"
          />
        </Field>
      )}
      {controller.error && (
        <p role="alert" className="text-xs text-destructive">
          {controller.error}
        </p>
      )}
      {controller.notice && (
        <p role="status" className="text-xs text-muted-foreground">
          {controller.notice}
        </p>
      )}
    </section>
  );
}
