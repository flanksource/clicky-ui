import { useMemo, useState } from "react";
import {
  RuntimeProfilesWorkspace,
  RuntimeStatusNotice,
  useRuntimeFamilies,
  type RuntimeProfilesStore,
  type RuntimeProfilesView,
} from "@flanksource/clicky-ui/ai";
import { UiSliders } from "@flanksource/clicky-ui/icons";
import { PLAYGROUND_RUNTIME_PROFILES_CLIENT } from "../_runtime-profiles/client";
import {
  INITIAL_RUNTIME_PRESETS,
  INITIAL_RUNTIME_PROFILES,
} from "../_runtime-profiles/fixtures";
import {
  PLAYGROUND_SANDBOX_CATALOG,
  PLAYGROUND_SECRET_SELECTOR,
} from "../_runtime-profiles/runtime-settings-fixtures";

export const meta = {
  title: "Runtime profiles",
  description:
    "Compose ordered Captain runtime presets and inspect server-resolved settings and permissions",
  group: "AI",
  icon: UiSliders,
};

export default function RuntimeProfilesPlayground() {
  const [view, setView] = useState<RuntimeProfilesView>("profiles");
  const [presets, setPresets] = useState(INITIAL_RUNTIME_PRESETS);
  const [profiles, setProfiles] = useState(INITIAL_RUNTIME_PROFILES);
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(
    presets[0]?.id,
  );
  const [selectedProfileId, setSelectedProfileId] = useState<
    string | undefined
  >(profiles[0]?.id);
  const families = useRuntimeFamilies(PLAYGROUND_RUNTIME_PROFILES_CLIENT);
  const store = useMemo<RuntimeProfilesStore>(
    () => ({
      createPreset: (preset) =>
        setPresets((current) => [...current, preset]),
      updatePreset: (next) =>
        setPresets((current) =>
          current.map((preset) => (preset.id === next.id ? next : preset)),
        ),
      deletePreset: (id) =>
        setPresets((current) => current.filter((preset) => preset.id !== id)),
      createProfile: (profile) =>
        setProfiles((current) => [...current, profile]),
      updateProfile: (next) =>
        setProfiles((current) =>
          current.map((profile) => (profile.id === next.id ? next : profile)),
        ),
      deleteProfile: (id) =>
        setProfiles((current) =>
          current.filter((profile) => profile.id !== id),
        ),
    }),
    [],
  );

  return (
    <div className="space-y-4">
      <header className="max-w-4xl">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Runtime presets and profiles
          </h1>
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Captain live resolver
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Profiles compose ordered reusable presets, then apply one full
          task-specific override spec. Captain resolves global, context, and
          surface presets, applies the profile spec, then enforces user
          guardrails. Runtime availability is configured globally from Whoami,
          outside presets and profiles. Captain&apos;s live runtime and
          permission catalogs drive the editor, while the server validates the
          composed profile against Gavel&apos;s Clicky operation catalog.
        </p>
      </header>

      <RuntimeStatusNotice
        status={families.status}
        loadingText="Loading permission capabilities from Captain…"
        error={families.error}
        onRetry={families.retry}
      />

      <RuntimeProfilesWorkspace
        presets={presets}
        profiles={profiles}
        view={view}
        onViewChange={setView}
        selectedPresetId={selectedPresetId}
        selectedProfileId={selectedProfileId}
        onSelectPreset={setSelectedPresetId}
        onSelectProfile={setSelectedProfileId}
        store={store}
        client={PLAYGROUND_RUNTIME_PROFILES_CLIENT}
        families={families.families}
        sandboxCatalog={PLAYGROUND_SANDBOX_CATALOG}
        secretSelector={PLAYGROUND_SECRET_SELECTOR}
      />
    </div>
  );
}
