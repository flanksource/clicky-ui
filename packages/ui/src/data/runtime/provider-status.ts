import type {
  ChatModel,
  RuntimeAvailability,
  RuntimeAvailabilityState,
} from "../chat/types";
import { isSelectableModel, isUnavailable } from "./availability";
import type { SpecRuntimeFamily } from "./runtime-mode";

export type ProviderReadiness =
  | "ready"
  | "attention"
  | "disabled"
  | "unavailable";

export type ProviderStatusIssue = {
  id: string;
  kind: "mode" | "model";
  label: string;
  availability: RuntimeAvailability;
};

export type ProviderStatusGroup = {
  id: string;
  label: string;
  iconProvider: string;
  readiness: ProviderReadiness;
  availableModes: number;
  totalModes: number;
  availableModels: number;
  totalModels: number;
  issues: ProviderStatusIssue[];
};

export function providerStatusGroups(
  models: ChatModel[],
  families: SpecRuntimeFamily[]
): ProviderStatusGroup[] {
  const unmatched = new Set(models);
  const groups = families.map((family) => {
    const providers = new Set([
      family.provider,
      ...family.modes.map((mode) => mode.provider).filter(isString),
    ]);
    const familyModels = models.filter((model) =>
      providers.has(model.provider)
    );
    for (const model of familyModels) unmatched.delete(model);
    return buildProviderGroup(
      family.id,
      family.label,
      family.id,
      family.modes.map((mode) => ({
        id: mode.id,
        label: mode.label,
        availability: mode.availability ?? AVAILABLE,
      })),
      familyModels
    );
  });

  const modelsByProvider = new Map<string, ChatModel[]>();
  for (const model of unmatched) {
    const providerModels = modelsByProvider.get(model.provider) ?? [];
    providerModels.push(model);
    modelsByProvider.set(model.provider, providerModels);
  }
  for (const [provider, providerModels] of modelsByProvider) {
    groups.push(
      buildProviderGroup(
        provider,
        providerLabel(provider),
        provider,
        [],
        providerModels
      )
    );
  }
  return groups;
}

export function modelAvailability(model: ChatModel): RuntimeAvailability {
  if (model.availability) return model.availability;
  if (model.configured === false) {
    return {
      state: "missing_credentials",
      reason: "This model's provider is not configured.",
      remediation: "Configure provider credentials, then refresh.",
    };
  }
  return AVAILABLE;
}

type ModeStatus = {
  id: string;
  label: string;
  availability: RuntimeAvailability;
};

const AVAILABLE: RuntimeAvailability = { state: "available" };

function buildProviderGroup(
  id: string,
  label: string,
  iconProvider: string,
  modes: ModeStatus[],
  models: ChatModel[]
): ProviderStatusGroup {
  const modeIssues = modes
    .filter((mode) => isUnavailable(mode.availability))
    .map((mode) => ({
      id: `${id}:mode:${mode.id}`,
      kind: "mode" as const,
      label: `${mode.label} mode`,
      availability: mode.availability,
    }));
  const modelIssues = models
    .filter((model) => !isSelectableModel(model))
    .map((model) => ({
      id: `${id}:model:${model.id}`,
      kind: "model" as const,
      label: model.label,
      availability: modelAvailability(model),
    }));
  const issues = [...modeIssues, ...modelIssues];
  return {
    id,
    label,
    iconProvider,
    readiness: providerReadiness(issues, modes, models),
    availableModes: modes.length - modeIssues.length,
    totalModes: modes.length,
    availableModels: models.filter(isSelectableModel).length,
    totalModels: models.length,
    issues,
  };
}

function providerReadiness(
  issues: ProviderStatusIssue[],
  modes: ModeStatus[],
  models: ChatModel[]
): ProviderReadiness {
  if (issues.length === 0) return "ready";
  const states = issues.map((issue) => issue.availability.state);
  if (states.every((state) => state === "disabled")) return "disabled";
  const hasAvailableMode = modes.some(
    (mode) => !isUnavailable(mode.availability)
  );
  const hasAvailableModel = models.some(isSelectableModel);
  return hasAvailableMode || hasAvailableModel ? "attention" : "unavailable";
}

function providerLabel(provider: string): string {
  return provider
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isString(value: string | undefined): value is string {
  return Boolean(value);
}

export function availabilityStateLabel(
  state: RuntimeAvailabilityState
): string {
  return state.replaceAll("_", " ");
}
