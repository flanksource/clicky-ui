import {
  SegmentedControl,
  type SegmentedOption,
} from "../../../components/SegmentedControl";
import { cn } from "../../../lib/utils";
import type { SpecRuntimeFamily } from "../../runtime/runtime-mode";
import type { RuntimePreset, RuntimeProfile } from "../runtime-profile";
import type {
  SpecRuntimeSandboxCatalog,
  SpecRuntimeSecretSelectorConfig,
} from "../SpecRuntimeEditor/types";
import {
  authoredRuntimeSpec,
  duplicateRecord,
  newPresetRecord,
  newProfileRecord,
  referencedBy,
  selectionAfterDelete,
} from "./model";
import { PresetWorkspace } from "./PresetWorkspace";
import { ProfileWorkspace } from "./ProfileWorkspace";
import { RuntimePersistenceBar } from "./RuntimePersistenceBar";
import { RuntimeStatusNotice } from "./RuntimeStatusNotice";
import type {
  RuntimeProfilesClient,
  RuntimeProfilesPersistence,
  RuntimeProfilesStore,
  RuntimeProfilesView,
  RuntimeRecordMeta,
} from "./types";
import { useRuntimePermissionCatalog } from "./use-permission-catalog";
import { useRuntimeProfileResolution } from "./use-resolution";

const VIEW_OPTIONS: SegmentedOption<RuntimeProfilesView>[] = [
  { id: "profiles", label: "Profiles" },
  { id: "presets", label: "Presets" },
];

export type RuntimeProfilesWorkspaceProps = {
  presets: RuntimePreset[];
  profiles: RuntimeProfile[];
  view: RuntimeProfilesView;
  onViewChange: (view: RuntimeProfilesView) => void;
  selectedPresetId: string | undefined;
  selectedProfileId: string | undefined;
  onSelectPreset: (id: string | undefined) => void;
  onSelectProfile: (id: string | undefined) => void;
  store: RuntimeProfilesStore;
  client: RuntimeProfilesClient;
  families: SpecRuntimeFamily[];
  sandboxCatalog?: SpecRuntimeSandboxCatalog | undefined;
  secretSelector?: SpecRuntimeSecretSelectorConfig | undefined;
  persistence?: RuntimeProfilesPersistence | undefined;
  recordMeta?: ((id: string) => RuntimeRecordMeta) | undefined;
  newId?: (() => string) | undefined;
  className?: string | undefined;
};

export function RuntimeProfilesWorkspace({
  presets,
  profiles,
  view,
  onViewChange,
  selectedPresetId,
  selectedProfileId,
  onSelectPreset,
  onSelectProfile,
  store,
  client,
  families,
  sandboxCatalog,
  secretSelector,
  persistence,
  recordMeta,
  newId = () => crypto.randomUUID(),
  className,
}: RuntimeProfilesWorkspaceProps) {
  const selectedProfile = profiles.find(
    (profile) => profile.id === selectedProfileId,
  );
  const resolution = useRuntimeProfileResolution(
    client,
    selectedProfile,
    presets,
  );
  const effectiveRuntime =
    resolution.result?.resolved.spec ??
    authoredRuntimeSpec(selectedProfile, presets);
  const permissionCatalog = useRuntimePermissionCatalog(
    client,
    effectiveRuntime,
    families,
  );

  const addProfile = (profile: RuntimeProfile) => {
    store.createProfile(profile);
    onSelectProfile(profile.id);
  };
  const addPreset = (preset: RuntimePreset) => {
    store.createPreset(preset);
    onSelectPreset(preset.id);
  };
  const deletePreset = (id: string) => {
    const preset = presets.find((item) => item.id === id);
    const references = preset ? referencedBy(preset, profiles) : [];
    if (references.length > 0) {
      throw new Error(
        `cannot delete preset used by ${references.join(", ")}`,
      );
    }
    store.deletePreset(id);
    onSelectPreset(selectionAfterDelete(presets, id, selectedPresetId));
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-density-3">
        <SegmentedControl
          aria-label="Runtime library view"
          value={view}
          options={VIEW_OPTIONS}
          onChange={onViewChange}
        />
        {persistence && (
          <RuntimePersistenceBar
            persistence={persistence}
            className="ml-auto"
          />
        )}
      </div>
      <RuntimeStatusNotice
        status={permissionCatalog.status}
        loadingText="Loading Tool, MCP, Plugin, and Skill permissions from Captain…"
        error={permissionCatalog.error}
        onRetry={permissionCatalog.retry}
        retryLabel="Retry permissions"
      />
      {view === "profiles" ? (
        <ProfileWorkspace
          presets={presets}
          profiles={profiles}
          selectedId={selectedProfileId}
          resolution={resolution}
          effectiveRuntime={effectiveRuntime}
          permissionCatalog={permissionCatalog.catalog}
          families={families}
          sandboxCatalog={sandboxCatalog}
          secretSelector={secretSelector}
          recordMeta={recordMeta}
          onSelect={onSelectProfile}
          onCreate={() => addProfile(newProfileRecord(profiles, newId()))}
          onDuplicate={(id) =>
            addProfile(duplicateRecord(profiles, id, newId()))
          }
          onDelete={(id) => {
            store.deleteProfile(id);
            onSelectProfile(
              selectionAfterDelete(profiles, id, selectedProfileId),
            );
          }}
          onChange={store.updateProfile}
        />
      ) : (
        <PresetWorkspace
          presets={presets}
          profiles={profiles}
          selectedId={selectedPresetId}
          tools={resolution.result?.tools ?? []}
          effectivePermissions={resolution.result?.permissions ?? {}}
          families={families}
          sandboxCatalog={sandboxCatalog}
          secretSelector={secretSelector}
          recordMeta={recordMeta}
          onSelect={onSelectPreset}
          onCreate={() => addPreset(newPresetRecord(presets, newId()))}
          onDuplicate={(id) => addPreset(duplicateRecord(presets, id, newId()))}
          onDelete={deletePreset}
          onChange={store.updatePreset}
        />
      )}
    </div>
  );
}
