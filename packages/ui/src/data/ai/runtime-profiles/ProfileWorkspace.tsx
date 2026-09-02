import { useId } from "react";
import { Field } from "../../../components/Field";
import { InputField } from "../../../components/InputField";
import type { SpecRuntimeFamily } from "../../runtime/runtime-mode";
import type { RuntimePreset, RuntimeProfile } from "../runtime-profile";
import type {
  SpecRuntimeSandboxCatalog,
  SpecRuntimeSecretSelectorConfig,
} from "../SpecRuntimeEditor/types";
import type {
  AISpecRuntimePermissionCatalog,
  AISpecRuntimeSpec,
} from "../SpecRuntimeEditor.model";
import { uniqueName } from "./model";
import { ProfileSpecEditor } from "./ProfileSpecEditor";
import { ResolutionInspector } from "./ResolutionInspector";
import { RuntimeLibraryList } from "./RuntimeLibraryList";
import type {
  RuntimeProfileResolutionState,
  RuntimeRecordMeta,
} from "./types";

const EMPTY_PROFILE: RuntimeProfile = {
  id: "empty",
  name: "Empty profile",
  spec: {},
  presets: [],
};

export function ProfileWorkspace({
  presets,
  profiles,
  selectedId,
  resolution,
  effectiveRuntime,
  permissionCatalog,
  families,
  sandboxCatalog,
  secretSelector,
  recordMeta,
  onSelect,
  onCreate,
  onDuplicate,
  onDelete,
  onChange,
}: {
  presets: RuntimePreset[];
  profiles: RuntimeProfile[];
  selectedId: string | undefined;
  resolution: RuntimeProfileResolutionState;
  effectiveRuntime: Pick<AISpecRuntimeSpec, "model" | "mode">;
  permissionCatalog?: AISpecRuntimePermissionCatalog | undefined;
  families: SpecRuntimeFamily[];
  sandboxCatalog?: SpecRuntimeSandboxCatalog | undefined;
  secretSelector?: SpecRuntimeSecretSelectorConfig | undefined;
  recordMeta?: ((id: string) => RuntimeRecordMeta) | undefined;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onChange: (profile: RuntimeProfile) => void;
}) {
  const profile = profiles.find((item) => item.id === selectedId);

  return (
    <div className="grid min-h-0 items-start gap-4 xl:grid-cols-[14rem_minmax(30rem,0.9fr)_minmax(36rem,1.1fr)]">
      <RuntimeLibraryList
        title="Profiles"
        items={profiles.map((item) => ({
          ...item,
          ...(recordMeta ? { meta: recordMeta(item.id) } : {}),
        }))}
        selectedId={selectedId}
        onSelect={onSelect}
        onCreate={onCreate}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
      {profile ? (
        <section className="min-w-0 rounded-lg border border-border bg-card">
          <ProfileHeader
            profile={profile}
            profiles={profiles}
            onChange={onChange}
          />
          <div className="p-4">
            <div className="mb-4 rounded-md border border-violet-500/30 bg-violet-500/5 p-3 text-xs text-muted-foreground">
              Presets contribute reusable global behavior and permissions. This
              profile spec applies after its selected surface presets and owns
              task prompt, checkout location, environment, verification, and
              commit behavior.
            </div>
            <ProfileSpecEditor
              value={profile.spec}
              presets={presets}
              selectedPresetIds={profile.presets}
              permissionCatalog={permissionCatalog}
              families={families}
              effectiveMode={effectiveRuntime.mode}
              effectiveModel={effectiveRuntime.model}
              sandboxCatalog={sandboxCatalog}
              secretSelector={secretSelector}
              onPresetsChange={(next) =>
                onChange({ ...profile, presets: next })
              }
              onChange={(spec) => onChange({ ...profile, spec })}
            />
          </div>
        </section>
      ) : (
        <p className="rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">
          Create a profile to begin.
        </p>
      )}
      <ResolutionInspector
        request={{ profile: profile ?? EMPTY_PROFILE, presets }}
        state={resolution}
      />
    </div>
  );
}

function ProfileHeader({
  profile,
  profiles,
  onChange,
}: {
  profile: RuntimeProfile;
  profiles: RuntimeProfile[];
  onChange: (profile: RuntimeProfile) => void;
}) {
  const nameId = useId();
  const descriptionId = useId();
  const nameTaken = !uniqueName(profile.name, profile.id, profiles);
  return (
    <div className="space-y-3 border-b border-border p-4">
      <Field
        label="Profile name"
        htmlFor={nameId}
        labelClassName="text-xs"
        error={nameTaken ? "A unique profile name is required." : undefined}
      >
        <InputField
          id={nameId}
          value={profile.name}
          invalid={nameTaken}
          onChange={(name) => onChange({ ...profile, name })}
        />
      </Field>
      <Field label="Description" htmlFor={descriptionId} labelClassName="text-xs">
        <InputField
          id={descriptionId}
          value={profile.description ?? ""}
          onChange={(description) => onChange({ ...profile, description })}
        />
      </Field>
    </div>
  );
}
