import { cn } from "../../../lib/utils";
import type { SpecRuntimeFamily } from "../../runtime/runtime-mode";
import type { RuntimePreset, RuntimeProfile } from "../runtime-profile";
import type {
  SpecRuntimeSandboxCatalog,
  SpecRuntimeSecretSelectorConfig,
} from "../SpecRuntimeEditor/types";
import {
  duplicateRecord,
  newPresetRecord,
  referencedBy,
  selectionAfterDelete,
} from "../../../lib/runtime-profile-model";
import { PresetWorkspace } from "./PresetWorkspace";
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
import { useRuntimePresetResolution } from "./use-resolution";

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
  selectedPresetId,
  onSelectPreset,
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
  const selectedPreset = presets.find(
    (preset) => preset.id === selectedPresetId,
  );
  const resolution = useRuntimePresetResolution(
    client,
    selectedPreset,
    presets,
  );
  const effectiveRuntime =
    resolution.result?.resolved.spec ?? selectedPreset?.spec ?? {};
  const permissionCatalog = useRuntimePermissionCatalog(
    client,
    effectiveRuntime,
    families,
  );

  const addPreset = (preset: RuntimePreset) => {
    store.createPreset(preset);
    onSelectPreset(preset.id);
  };
  const deletePreset = (id: string) => {
    const preset = presets.find((item) => item.id === id);
    const references = preset ? referencedBy(preset, profiles) : [];
    if (references.length > 0) {
      throw new Error(`cannot delete preset used by ${references.join(", ")}`);
    }
    store.deletePreset(id);
    onSelectPreset(selectionAfterDelete(presets, id, selectedPresetId));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {persistence && (
        <div className="flex justify-end">
          <RuntimePersistenceBar persistence={persistence} />
        </div>
      )}
      <RuntimeStatusNotice
        status={permissionCatalog.status}
        loadingText="Loading Tool, MCP, Plugin, and Skill permissions from Captain…"
        error={permissionCatalog.error}
        onRetry={permissionCatalog.retry}
        retryLabel="Retry permissions"
      />
      <PresetWorkspace
        presets={presets}
        profiles={profiles}
        selectedId={selectedPresetId}
        resolution={resolution}
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
    </div>
  );
}
