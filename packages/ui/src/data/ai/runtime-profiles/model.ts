import { isPlainObject, moveItem } from "../../../lib/collections";
import {
  familyForModel,
  modeOptionFor,
  runtimeModeFromModel,
  type SpecRuntimeFamily,
} from "../../runtime/runtime-mode";
import type { RuntimePreset, RuntimeProfile } from "../runtime-profile";
import type { AISpecRuntimeSpec } from "../SpecRuntimeEditor.model";
import type { RuntimePermissionTarget } from "./types";

export function reorderProfilePresets(
  profile: RuntimeProfile,
  from: number,
  to: number,
): RuntimeProfile {
  if (!profile.presets[from] || !profile.presets[to]) {
    throw new Error(`cannot reorder preset from ${from} to ${to}`);
  }
  return { ...profile, presets: moveItem(profile.presets, from, to) };
}

export function presetForRef(
  ref: string,
  presets: RuntimePreset[],
): RuntimePreset | undefined {
  const name = ref.trim().toLowerCase();
  return (
    presets.find((preset) => preset.id === ref) ??
    presets.find((preset) => preset.name.trim().toLowerCase() === name)
  );
}

export function presetsOf(
  profile: Pick<RuntimeProfile, "presets">,
  presets: RuntimePreset[],
): { found: RuntimePreset[]; missing: string[] } {
  const found: RuntimePreset[] = [];
  const missing: string[] = [];
  for (const ref of profile.presets) {
    const preset = presetForRef(ref, presets);
    if (preset) found.push(preset);
    else missing.push(ref);
  }
  return { found, missing };
}

export function authoredRuntimeSpec(
  profile: RuntimeProfile | undefined,
  presets: RuntimePreset[],
): Pick<AISpecRuntimeSpec, "model" | "mode"> {
  if (!profile) return {};
  const runtime: Pick<AISpecRuntimeSpec, "model" | "mode"> = {};
  for (const preset of presetsOf(profile, presets).found) {
    if (preset.spec.model?.trim()) runtime.model = preset.spec.model;
    if (preset.spec.mode?.trim()) runtime.mode = preset.spec.mode;
  }
  if (profile.spec.model?.trim()) runtime.model = profile.spec.model;
  if (profile.spec.mode?.trim()) runtime.mode = profile.spec.mode;
  return runtime;
}

export function referencedBy(
  preset: Pick<RuntimePreset, "id" | "name">,
  profiles: RuntimeProfile[],
): string[] {
  const name = preset.name.trim().toLowerCase();
  return profiles
    .filter((profile) =>
      profile.presets.some(
        (ref) => ref === preset.id || ref.trim().toLowerCase() === name,
      ),
    )
    .map((profile) => profile.name);
}

export function duplicateName(name: string, existing: string[]): string {
  return nextNewName(`${name.trim()} copy`, existing);
}

export function nextNewName(base: string, existing: string[]): string {
  const occupied = new Set(existing.map((item) => item.trim().toLowerCase()));
  if (!occupied.has(base.toLowerCase())) return base;
  let index = 2;
  while (occupied.has(`${base} ${index}`.toLowerCase())) index += 1;
  return `${base} ${index}`;
}

export function uniqueName(
  name: string,
  id: string,
  records: Array<{ id: string; name: string }>,
) {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return false;
  return !records.some(
    (record) =>
      record.id !== id && record.name.trim().toLowerCase() === normalized,
  );
}

export function permissionTarget(
  spec: AISpecRuntimeSpec | undefined,
  families: SpecRuntimeFamily[],
): RuntimePermissionTarget | undefined {
  const model = spec?.model;
  const mode = runtimeModeFromModel(model) || spec?.mode?.trim();
  const family = familyForModel(families, [], model);
  if (!family || !mode || !modeOptionFor(families, mode, family.id)) {
    return undefined;
  }
  return { provider: family.provider, mode };
}

export function newProfileRecord(
  profiles: RuntimeProfile[],
  id: string,
): RuntimeProfile {
  const name = nextNewName("New profile", profiles.map((item) => item.name));
  return { id, name, spec: {}, presets: [] };
}

export function newPresetRecord(
  presets: RuntimePreset[],
  id: string,
): RuntimePreset {
  const name = nextNewName("New preset", presets.map((item) => item.name));
  return { id, name, scope: "surface", spec: {} };
}

export function duplicateRecord<T extends { id: string; name: string }>(
  records: T[],
  sourceId: string,
  id: string,
): T {
  const source = records.find((record) => record.id === sourceId);
  if (!source) throw new Error(`cannot duplicate missing record "${sourceId}"`);
  return {
    ...structuredClone(source),
    id,
    name: duplicateName(source.name, records.map((record) => record.name)),
  };
}

export function selectionAfterDelete(
  records: Array<{ id: string }>,
  deletedId: string,
  selectedId: string | undefined,
): string | undefined {
  if (selectedId !== deletedId) return selectedId;
  return records.find((record) => record.id !== deletedId)?.id;
}

export function mergeRuntimeSpec<T extends AISpecRuntimeSpec>(
  base: AISpecRuntimeSpec,
  overlay: T,
): T {
  return mergeRecords(base, overlay) as T;
}

function mergeRecords(
  base: Record<string, unknown>,
  overlay: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = structuredClone(base);
  for (const [key, value] of Object.entries(overlay)) {
    if (value === undefined) continue;
    const current = merged[key];
    merged[key] =
      isPlainObject(current) && isPlainObject(value)
        ? mergeRecords(current, value)
        : structuredClone(value);
  }
  return merged;
}
