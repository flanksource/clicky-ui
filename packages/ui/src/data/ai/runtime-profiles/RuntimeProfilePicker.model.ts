import type {
  AIPromptRunSpec,
  AIPromptRunValue,
} from "../PromptRunEditor/model";
import type {
  ResolvedRuntimeSpec,
  RuntimePreset,
  RuntimeProfile,
} from "../runtime-profile";
import type { AISpecRuntimeSpec } from "../SpecRuntimeEditor.model";
import {
  authoredRuntimeSpec,
  duplicateName,
  mergeRuntimeSpec,
} from "../../../lib/runtime-profile-model";

export type RuntimeProfileLayer = "run" | "profile";

export type RuntimeProfilePickerState = {
  selectedRef: string | undefined;
  draft: RuntimeProfile | undefined;
  layer: RuntimeProfileLayer;
};

export function profileForRef(
  ref: string | undefined,
  profiles: RuntimeProfile[],
): RuntimeProfile | undefined {
  if (!ref) return undefined;
  const name = ref.trim().toLowerCase();
  return (
    profiles.find((profile) => profile.id === ref) ??
    profiles.find((profile) => profile.name.trim().toLowerCase() === name)
  );
}

export function pickerStateFor(
  value: AIPromptRunValue,
  profiles: RuntimeProfile[],
): RuntimeProfilePickerState {
  const profile = profileForRef(value.runtimeProfile, profiles);
  return {
    selectedRef: value.runtimeProfile,
    draft: profile ? structuredClone(profile) : undefined,
    layer: "run",
  };
}

export function selectProfile(
  value: AIPromptRunValue,
  profile: RuntimeProfile | undefined,
): AIPromptRunValue {
  const next = { ...value };
  if (profile) next.runtimeProfile = profile.id;
  else delete next.runtimeProfile;
  return next;
}

export function editDraft(
  state: RuntimeProfilePickerState,
  draft: RuntimeProfile,
): RuntimeProfilePickerState {
  return { ...state, draft };
}

export function isDraftDirty(
  state: RuntimeProfilePickerState,
  profiles: RuntimeProfile[],
): boolean {
  if (!state.draft) return false;
  const saved = profiles.find((profile) => profile.id === state.draft?.id);
  if (!saved) return true;
  return stableJson(saved) !== stableJson(state.draft);
}

export function afterSave(
  value: AIPromptRunValue,
  state: RuntimeProfilePickerState,
  saved: RuntimeProfile,
): { value: AIPromptRunValue; state: RuntimeProfilePickerState } {
  const ref = value.runtimeProfile;
  const stillReferenced =
    ref === saved.id ||
    ref?.trim().toLowerCase() === saved.name.trim().toLowerCase();
  const nextValue = stillReferenced ? value : selectProfile(value, saved);
  return {
    value: nextValue,
    state: {
      ...state,
      selectedRef: nextValue.runtimeProfile,
      draft: structuredClone(saved),
    },
  };
}

export function detachedValue(
  value: AIPromptRunValue,
  resolved: AISpecRuntimeSpec,
): AIPromptRunValue {
  const overlay: AIPromptRunSpec = value.spec ?? {};
  const next = { ...value, spec: mergeRuntimeSpec(resolved, overlay) };
  delete next.runtimeProfile;
  return next;
}

export function inheritedRuntime({
  draft,
  presets,
  resolution,
}: {
  draft: RuntimeProfile | undefined;
  presets: RuntimePreset[];
  resolution?: ResolvedRuntimeSpec | undefined;
}): Pick<AISpecRuntimeSpec, "model" | "mode"> {
  const authored = authoredRuntimeSpec(draft, presets);
  const runtime: Pick<AISpecRuntimeSpec, "model" | "mode"> = {};
  const model = resolution?.spec.model?.trim()
    ? resolution.spec.model
    : authored.model;
  const mode = resolution?.spec.mode?.trim()
    ? resolution.spec.mode
    : authored.mode;
  if (model) runtime.model = model;
  if (mode) runtime.mode = mode;
  return runtime;
}

export function saveAsNewDraft(
  draft: RuntimeProfile,
  profiles: RuntimeProfile[],
  id: string,
): RuntimeProfile {
  return {
    ...structuredClone(draft),
    id,
    name: duplicateName(
      draft.name,
      profiles.map((profile) => profile.name),
    ),
  };
}

function stableJson(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(
          Object.entries(item as Record<string, unknown>).sort(([a], [b]) =>
            a.localeCompare(b),
          ),
        )
      : item,
  );
}
