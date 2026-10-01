import type { AISpecRuntimeValue } from "../SpecRuntimeEditor.model";
import type { RuntimePreset } from "../runtime-profile";
import {
  mergeRuntimeSpec,
  presetForRef,
} from "../../../lib/runtime-profile-model";

export type RuntimePresetMenuValue = {
  spec: AISpecRuntimeValue;
  presets: string[];
};

export function runtimeBarPresetSpec(
  spec: AISpecRuntimeValue,
): AISpecRuntimeValue {
  const captured: AISpecRuntimeValue = {};
  for (const key of ["mode", "model", "id", "effort"] as const) {
    if (spec[key]?.trim()) captured[key] = spec[key];
  }
  const budget = {
    ...(spec.budget?.cost !== undefined ? { cost: spec.budget.cost } : {}),
    ...(spec.budget?.timeout ? { timeout: spec.budget.timeout } : {}),
  };
  if (Object.keys(budget).length > 0) captured.budget = budget;
  if (spec.permissions?.mode)
    captured.permissions = { mode: spec.permissions.mode };
  const source = spec.setup?.checkout?.worktree;
  if (source?.mode) {
    captured.setup = {
      checkout: {
        worktree: {
          mode: source.mode,
          ...(source.mode !== "none" && source.path
            ? { path: source.path }
            : {}),
        },
      },
    };
  }
  if (spec.workflow?.commits !== undefined) {
    captured.workflow = { commits: structuredClone(spec.workflow.commits) };
  }
  return captured;
}

export function withRuntimePresetSelection({
  value,
  selected,
  catalog,
}: {
  value: RuntimePresetMenuValue;
  selected: string[];
  catalog: RuntimePreset[];
}): RuntimePresetMenuValue {
  const previous = new Set(
    value.presets.map((ref) => presetForRef(ref, catalog)?.id ?? ref),
  );
  const presets = [
    ...new Set(selected.map((ref) => presetForRef(ref, catalog)?.id ?? ref)),
  ];
  let spec = value.spec;
  for (const ref of presets) {
    if (previous.has(ref)) continue;
    const preset = presetForRef(ref, catalog);
    if (!preset)
      throw new Error(`Preset ${JSON.stringify(ref)} is not in the catalog`);
    const overlay = runtimeBarPresetSpec(preset.spec);
    spec = { ...spec };
    if (overlay.model !== undefined || overlay.id !== undefined) {
      delete spec.model;
      delete spec.id;
    }
    if (
      overlay.setup?.checkout?.worktree?.mode === "none" &&
      spec.setup?.checkout?.worktree
    ) {
      spec = structuredClone(spec);
      delete spec.setup!.checkout!.worktree!.path;
    }
    spec = mergeRuntimeSpec(spec, overlay);
  }
  return { spec, presets };
}
