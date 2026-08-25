import type { RuntimePreset, RuntimeProfileRecord } from "./contract";
import { RuntimeLibraryList } from "./LibraryList";
import { uniqueName } from "./model";
import { ResolutionInspector } from "./ResolutionInspector";
import { RuntimeSettingsEditor } from "./RuntimeSettingsEditor";
import type { RuntimeProfileResolutionState } from "./use-resolution";
import type { SpecRuntimeFamily } from "@flanksource/clicky-ui/ai";

export function ProfileWorkspace({
  presets,
  profiles,
  selectedId,
  resolution,
  families,
  onSelect,
  onCreate,
  onDuplicate,
  onDelete,
  onChange,
}: {
  presets: RuntimePreset[];
  profiles: RuntimeProfileRecord[];
  selectedId: string | undefined;
  resolution: RuntimeProfileResolutionState;
  families: SpecRuntimeFamily[];
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onChange: (profile: RuntimeProfileRecord) => void;
}) {
  const profile = profiles.find((item) => item.id === selectedId);

  return (
    <div className="grid min-h-0 items-start gap-4 xl:grid-cols-[14rem_minmax(30rem,0.9fr)_minmax(36rem,1.1fr)]">
      <RuntimeLibraryList
        title="Profiles"
        items={profiles}
        selectedId={selectedId}
        onSelect={onSelect}
        onCreate={onCreate}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
      {profile ? (
        <section className="min-w-0 rounded-lg border border-border bg-card">
          <div className="space-y-3 border-b border-border p-4">
            <label className="grid gap-1 text-xs font-medium">
              Profile name
              <input
                value={profile.name}
                aria-invalid={!uniqueName(profile.name, profile.id, profiles)}
                onChange={(event) =>
                  onChange({ ...profile, name: event.target.value })
                }
                className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              {!uniqueName(profile.name, profile.id, profiles) && (
                <span className="text-destructive">
                  A unique profile name is required.
                </span>
              )}
            </label>
            <label className="grid gap-1 text-xs font-medium">
              Description
              <input
                value={profile.description ?? ""}
                onChange={(event) =>
                  onChange({ ...profile, description: event.target.value })
                }
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
          </div>
          <div className="p-4">
            <div className="mb-4 rounded-md border border-violet-500/30 bg-violet-500/5 p-3 text-xs text-muted-foreground">
              Presets contribute reusable global behavior and permissions. This
              profile spec applies after its selected surface presets and owns
              task prompt, checkout location, environment, verification, and
              commit behavior.
            </div>
            <RuntimeSettingsEditor
              value={{ spec: profile.spec }}
              presets={presets}
              selectedPresetIds={profile.presets}
              tools={resolution.result?.tools ?? []}
              families={families}
              effectiveBackend={resolution.result?.resolved.spec.backend}
              onPresetsChange={(next) =>
                onChange({ ...profile, presets: next })
              }
              onChange={({ spec }) => onChange({ ...profile, spec })}
            />
          </div>
        </section>
      ) : (
        <p className="rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">
          Create a profile to begin.
        </p>
      )}
      <ResolutionInspector
        request={{
          profile: profile ?? {
            id: "empty",
            name: "Empty profile",
            spec: {},
            presets: [],
          },
          presets,
        }}
        state={resolution}
      />
    </div>
  );
}
