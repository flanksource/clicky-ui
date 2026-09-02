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
import type {
  ResolvedRuntimeSpec,
  RuntimePreset,
  RuntimeProfile,
} from "../runtime-profile";
import { Disclosure } from "../SpecRuntimeEditor/fields";
import type { AISpecRuntimeSpec } from "../SpecRuntimeEditor.model";
import { uniqueName } from "./model";
import { OrderedPresetSelect } from "./OrderedPresetSelect";
import { ResolutionTrace } from "./ResolutionTrace";
import type { RuntimeProfileLayer } from "./RuntimeProfilePicker.model";
import type { RuntimeProfilePickerController } from "./use-runtime-profile-picker";

const NONE = "__clicky_runtime_profile_none__";

export type RuntimeProfilePickerProps = {
  controller: RuntimeProfilePickerController;
  profiles: RuntimeProfile[];
  presets: RuntimePreset[];
  resolution?: ResolvedRuntimeSpec | undefined;
  effectiveRuntime: Pick<AISpecRuntimeSpec, "model" | "mode">;
};

export function RuntimeProfilePicker({
  controller,
  profiles,
  presets,
  resolution,
  effectiveRuntime,
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

  return (
    <section
      aria-label="Runtime profile"
      className="mb-density-3 space-y-density-2 rounded-lg border border-border bg-card p-density-3"
    >
      <div className="flex flex-wrap items-center gap-density-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Icon icon={UiLayers} className="size-3.5" />
          Runtime profile
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
          onChange={(next) => controller.select(next === NONE ? undefined : next)}
          allowCustomValue={false}
          required
          className="min-w-56 flex-1"
        />
      </div>
      {controller.pending && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-density-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-density-3 py-density-2 text-xs"
        >
          <span className="flex-1">
            Discard changes to «{pendingProfile?.name ?? draft?.name}»?
          </span>
          <Button size="sm" variant="outline" onClick={controller.cancelPending}>
            Keep editing
          </Button>
          <Button size="sm" variant="destructive" onClick={controller.confirmPending}>
            Discard
          </Button>
        </div>
      )}
      {draft && (
        <>
          <SegmentedControl
            aria-label="Editing layer"
            size="sm"
            value={state.layer}
            options={layers}
            onChange={controller.setLayer}
          />
          {state.layer === "profile" && (
            <div className="space-y-density-2">
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
                />
              </Field>
              <OrderedPresetSelect
                presets={presets}
                value={draft.presets}
                onChange={(next) =>
                  controller.editDraft({ ...draft, presets: next })
                }
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-density-2">
            <Button
              size="sm"
              disabled={!controller.canSave || !controller.dirty || nameTaken || Boolean(controller.busy)}
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
            <Button
              size="sm"
              variant="outline"
              disabled={Boolean(controller.busy)}
              onClick={() => void controller.detach()}
            >
              <Icon icon={UiGitMerge} className="size-3.5" />
              Detach
            </Button>
            {controller.busy && (
              <span role="status" className="text-xs text-muted-foreground">
                {controller.busy === "detach" ? "Resolving…" : "Saving…"}
              </span>
            )}
          </div>
        </>
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
      <Disclosure
        label="Resolution"
        hint={effectiveLabel(effectiveRuntime)}
      >
        <ResolutionTrace trace={resolution?.trace ?? []} />
      </Disclosure>
    </section>
  );
}

function effectiveLabel(runtime: Pick<AISpecRuntimeSpec, "model" | "mode">) {
  const parts = [runtime.model, runtime.mode].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "inherits prompt defaults";
}
