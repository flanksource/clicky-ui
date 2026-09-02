type RuntimeModelIdentity = {
  id: string;
  provider: string;
  runtime?: { id?: string; model?: string } | undefined;
};

type RuntimeFamilyIdentity = {
  id: string;
  provider: string;
  catalogPrefix?: string | undefined;
  modes: Array<{ id: string; provider?: string | undefined }>;
};

export const SPEC_RUNTIME_MODES = ["api", "agent", "cli", "cmux"] as const;
export type SpecRuntimeMode = (typeof SPEC_RUNTIME_MODES)[number];
const RUNTIME_MODES = new Set<string>(SPEC_RUNTIME_MODES);

export function isSpecRuntimeMode(
  value: string | undefined,
): value is SpecRuntimeMode {
  return RUNTIME_MODES.has(value ?? "");
}

export function runtimeModeFromModel(
  model: string | undefined,
): SpecRuntimeMode | undefined {
  const [prefix] = (model ?? "").trim().toLowerCase().split(":");
  return isSpecRuntimeMode(prefix) ? prefix : undefined;
}

export function familyForModel<T extends RuntimeFamilyIdentity>(
  families: T[],
  models: RuntimeModelIdentity[],
  modelId: string | undefined,
): T | undefined {
  if (!modelId) return undefined;
  const selected = models.find(
    (model) =>
      model.id === modelId ||
      model.runtime?.model === modelId ||
      model.runtime?.id === modelId,
  );
  const compact = modelId.split(",")[0]?.trim() ?? "";
  const [prefix, inlineModel] = compact.split(":");
  const canonicalModel =
    RUNTIME_MODES.has(prefix?.toLowerCase() ?? "") && inlineModel
      ? inlineModel
      : compact;
  const slash = canonicalModel.indexOf("/");
  const provider =
    selected?.provider ??
    (slash > 0 ? canonicalModel.slice(0, slash) : undefined);
  if (!provider) return undefined;
  return families.find(
    (family) =>
      family.provider === provider ||
      family.catalogPrefix === provider ||
      family.modes.some((mode) => mode.provider === provider),
  );
}

export function modeOptionFor<T extends RuntimeFamilyIdentity>(
  families: T[],
  mode: string | undefined,
  preferredFamily?: string | undefined,
): T["modes"][number] | undefined {
  const target = (mode ?? "").toLowerCase();
  if (!target) return undefined;
  const ordered = preferredFamily
    ? [
        ...families.filter((family) => family.id === preferredFamily),
        ...families.filter((family) => family.id !== preferredFamily),
      ]
    : families;
  for (const family of ordered) {
    const entry = family.modes.find(
      (candidate) => candidate.id.toLowerCase() === target,
    );
    if (entry) return entry;
  }
  return undefined;
}
