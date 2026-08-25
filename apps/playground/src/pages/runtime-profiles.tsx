import { useState } from "react";
import { UiSliders } from "@flanksource/clicky-ui/icons";
import type {
  RuntimePreset,
  RuntimeProfileRecord,
} from "./_runtime-profiles/contract";
import {
  INITIAL_RUNTIME_PRESETS,
  INITIAL_RUNTIME_PROFILES,
} from "./_runtime-profiles/fixtures";
import { duplicateName, referencedBy } from "./_runtime-profiles/model";
import { PresetWorkspace } from "./_runtime-profiles/PresetWorkspace";
import { ProfileWorkspace } from "./_runtime-profiles/ProfileWorkspace";
import { useRuntimeProfileResolution } from "./_runtime-profiles/use-resolution";
import { useRuntimeFamilies } from "./_runtime-profiles/use-runtime-families";

export const meta = {
  title: "Runtime profiles",
  description:
    "Compose ordered Captain runtime presets and inspect server-resolved settings and permissions",
  group: "AI",
  icon: UiSliders,
};

export default function RuntimeProfilesPlayground() {
  const [view, setView] = useState<"profiles" | "presets">("profiles");
  const [presets, setPresets] = useState(INITIAL_RUNTIME_PRESETS);
  const [profiles, setProfiles] = useState(INITIAL_RUNTIME_PROFILES);
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(
    presets[0]?.id,
  );
  const [selectedProfileId, setSelectedProfileId] = useState<
    string | undefined
  >(profiles[0]?.id);
  const selectedProfile = profiles.find(
    (profile) => profile.id === selectedProfileId,
  );
  const resolution = useRuntimeProfileResolution(selectedProfile, presets);
  const runtimeFamilies = useRuntimeFamilies();

  const updatePreset = (next: RuntimePreset) =>
    setPresets((current) =>
      current.map((preset) => (preset.id === next.id ? next : preset)),
    );
  const updateProfile = (next: RuntimeProfileRecord) =>
    setProfiles((current) =>
      current.map((profile) => (profile.id === next.id ? next : profile)),
    );

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Runtime presets and profiles
            </h1>
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Gavel operations · mock resolver
            </span>
          </div>
          <p className="mt-1 max-w-4xl text-sm text-muted-foreground">
            Profiles compose ordered reusable presets, then apply one full
            task-specific override spec. Captain resolves global, context, and
            surface presets, applies the profile spec, then enforces user
            guardrails. Runtime availability is configured globally from Whoami,
            outside presets and profiles. Tool metadata comes from Gavel&apos;s
            live Clicky OpenAPI catalog; the browser renders only the
            resolver&apos;s final settings and permissions.
          </p>
        </div>
        <div className="flex rounded-lg border border-border bg-card p-1">
          {(["profiles", "presets"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={view === item}
              onClick={() => setView(item)}
              className={
                view === item
                  ? "rounded-md bg-accent px-4 py-2 text-sm font-medium capitalize"
                  : "rounded-md px-4 py-2 text-sm capitalize text-muted-foreground hover:bg-accent/50"
              }
            >
              {item}
            </button>
          ))}
        </div>
      </header>

      {runtimeFamilies.status === "loading" && (
        <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Loading permission capabilities from Captain…
        </p>
      )}
      {runtimeFamilies.status === "error" && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
        >
          <span>{runtimeFamilies.error}</span>
          <button
            type="button"
            onClick={runtimeFamilies.retry}
            className="rounded-md border border-destructive/30 bg-background px-2 py-1 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {view === "profiles" ? (
        <ProfileWorkspace
          presets={presets}
          profiles={profiles}
          selectedId={selectedProfileId}
          resolution={resolution}
          families={runtimeFamilies.families}
          onSelect={setSelectedProfileId}
          onCreate={() => {
            const profile: RuntimeProfileRecord = {
              id: crypto.randomUUID(),
              name: nextNewName(
                "New profile",
                profiles.map((item) => item.name),
              ),
              spec: {},
              presets: [],
            };
            setProfiles((current) => [...current, profile]);
            setSelectedProfileId(profile.id);
          }}
          onDuplicate={(id) => {
            const source = profiles.find((profile) => profile.id === id);
            if (!source)
              throw new Error(`cannot duplicate missing profile "${id}"`);
            const copy = {
              ...structuredClone(source),
              id: crypto.randomUUID(),
              name: duplicateName(
                source.name,
                profiles.map((item) => item.name),
              ),
            };
            setProfiles((current) => [...current, copy]);
            setSelectedProfileId(copy.id);
          }}
          onDelete={(id) => {
            setProfiles((current) =>
              current.filter((profile) => profile.id !== id),
            );
            if (selectedProfileId === id) {
              setSelectedProfileId(
                profiles.find((profile) => profile.id !== id)?.id,
              );
            }
          }}
          onChange={updateProfile}
        />
      ) : (
        <PresetWorkspace
          presets={presets}
          profiles={profiles}
          selectedId={selectedPresetId}
          tools={resolution.result?.tools ?? []}
          effectivePermissions={resolution.result?.permissions ?? {}}
          families={runtimeFamilies.families}
          onSelect={setSelectedPresetId}
          onCreate={() => {
            const preset: RuntimePreset = {
              id: crypto.randomUUID(),
              name: nextNewName(
                "New preset",
                presets.map((item) => item.name),
              ),
              scope: "surface",
              spec: {},
            };
            setPresets((current) => [...current, preset]);
            setSelectedPresetId(preset.id);
          }}
          onDuplicate={(id) => {
            const source = presets.find((preset) => preset.id === id);
            if (!source)
              throw new Error(`cannot duplicate missing preset "${id}"`);
            const copy = {
              ...structuredClone(source),
              id: crypto.randomUUID(),
              name: duplicateName(
                source.name,
                presets.map((item) => item.name),
              ),
            };
            setPresets((current) => [...current, copy]);
            setSelectedPresetId(copy.id);
          }}
          onDelete={(id) => {
            const references = referencedBy(id, profiles);
            if (references.length > 0) {
              throw new Error(
                `cannot delete preset used by ${references.join(", ")}`,
              );
            }
            setPresets((current) =>
              current.filter((preset) => preset.id !== id),
            );
            if (selectedPresetId === id) {
              setSelectedPresetId(
                presets.find((preset) => preset.id !== id)?.id,
              );
            }
          }}
          onChange={updatePreset}
        />
      )}
    </div>
  );
}

function nextNewName(base: string, existing: string[]): string {
  const occupied = new Set(existing.map((name) => name.toLowerCase()));
  if (!occupied.has(base.toLowerCase())) return base;
  let index = 2;
  while (occupied.has(`${base} ${index}`.toLowerCase())) index += 1;
  return `${base} ${index}`;
}
