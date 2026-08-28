import type { StaticIconComponent } from "../Icon";
import { UiCloud, UiColumns, UiRobotAi, UiTerminal } from "../../icons";
import type { JsonSchemaProperty } from "../../components/json-schema-form-types";
import type { ChatModel, RuntimeAvailability } from "../chat/types";
import {
  availabilityText,
  isSelectableModel,
  isUnavailable,
  unsupportedAvailability,
} from "./availability";

// A runtime has two independent axes: the model selects a provider family and
// `spec.backend` selects api | agent | cli | cmux. The backend never contains a
// provider name or a composite adapter id.

export const SPEC_RUNTIME_BACKENDS = ["api", "agent", "cli", "cmux"] as const;
export type SpecRuntimeBackend = (typeof SPEC_RUNTIME_BACKENDS)[number];

export function isSpecRuntimeBackend(
  value: string | undefined,
): value is SpecRuntimeBackend {
  return SPEC_RUNTIME_BACKENDS.some((backend) => backend === value);
}

export function runtimeBackendFromModel(
  model: string | undefined,
): SpecRuntimeBackend | undefined {
  const [prefix] = (model ?? "").trim().toLowerCase().split(":");
  return isSpecRuntimeBackend(prefix) ? prefix : undefined;
}

export function runtimeModelError(
  model: string | undefined,
): string | undefined {
  for (const raw of (model ?? "").split(",")) {
    const compact = raw.trim();
    if (!compact || !compact.includes(":")) continue;
    const parts = compact.split(":").map((part) => part.trim());
    const [backend, name, effort] = parts;
    if (!isSpecRuntimeBackend(backend)) {
      return `Invalid model configuration: backend ${JSON.stringify(backend)} in model ${JSON.stringify(compact)}. Expected api, agent, cli, or cmux.`;
    }
    if (!name || parts.length > 3) {
      return `Invalid model configuration: model ${JSON.stringify(compact)}. Expected backend:model[:effort].`;
    }
    if (
      effort !== undefined &&
      !["low", "medium", "high", "xhigh", "max", "ultra"].includes(effort)
    ) {
      return `Invalid model configuration: effort ${JSON.stringify(effort)} in model ${JSON.stringify(compact)}.`;
    }
  }
  return undefined;
}

export function runtimeBackendError(
  families: SpecRuntimeFamily[],
  backend: string | undefined,
  familyId?: string | undefined,
): string | undefined {
  if (!backend) return undefined;
  if (!isSpecRuntimeBackend(backend)) {
    return `Invalid model configuration: backend ${JSON.stringify(backend)}. Expected api, agent, cli, or cmux.`;
  }
  const family = familyId
    ? families.find((entry) => entry.id === familyId)
    : undefined;
  if (family && !family.modes.some((mode) => mode.backend === backend)) {
    return `Invalid model configuration: backend ${JSON.stringify(backend)} is not available for ${family.label}.`;
  }
  if (
    !families.some((entry) =>
      entry.modes.some((mode) => mode.backend === backend),
    )
  ) {
    return `Invalid model configuration: backend ${JSON.stringify(backend)} is missing from the runtime catalog.`;
  }
  return undefined;
}

export type SpecRuntimeModeOption = {
  /** UI mode id within a family (e.g. "agent", "cli", "cmux", "api"). */
  id: string;
  label: string;
  /** The canonical `spec.backend`: api | agent | cli | cmux. */
  backend: string;
  icon?: StaticIconComponent | undefined;
  title?: string | undefined;
  provider?: string | undefined;
  defaultModel?: string | undefined;
  availability?: RuntimeAvailability | undefined;
  permissions?: RuntimePermissionCapabilities | undefined;
  schema?: RuntimeSpecSchema | undefined;
};

export type RuntimeArgumentImplementation = "mapped" | "managed";

export type RuntimeArgumentMapping = {
  name: string;
  implementation: RuntimeArgumentImplementation;
  description?: string | undefined;
};

export type RuntimeSpecSchema = JsonSchemaProperty & {
  "x-clicky-arguments"?: RuntimeArgumentMapping[] | undefined;
  "x-clicky-managed-arguments"?: RuntimeArgumentMapping[] | undefined;
};

export type RuntimePermissionSupportKind =
  | "native"
  | "approximated"
  | "requires-broker"
  | "unsupported";

export type RuntimePermissionSupport = {
  kind: RuntimePermissionSupportKind;
  effects?:
    | {
        flag?: string | undefined;
        sandbox?: string | undefined;
        approval?: string | undefined;
        note?: string | undefined;
      }
    | undefined;
};

export type RuntimePermissionCapabilities = {
  modes: Record<string, RuntimePermissionSupport>;
  toolPolicies: Record<string, Record<string, RuntimePermissionSupport>>;
  resources: Record<string, Record<string, RuntimePermissionSupport>>;
  tools?: string[] | undefined;
};

export type SpecRuntimeFamily = {
  id: string;
  label: string;
  /** The model-catalog provider (`ChatModel.provider`) whose models this family runs. */
  provider: string;
  modes: SpecRuntimeModeOption[];
};

// Offline catalog for stories and tests. Live hosts should pass Captain's
// registry projection; both use the same provider + backend structure.
export const SPEC_RUNTIME_FAMILIES: SpecRuntimeFamily[] = [
  {
    id: "claude",
    label: "Claude",
    provider: "anthropic",
    modes: [
      {
        id: "api",
        label: "API",
        backend: "api",
        icon: UiCloud,
        title: "Anthropic API",
        provider: "anthropic",
      },
      {
        id: "agent",
        label: "Agent",
        backend: "agent",
        icon: UiRobotAi,
        title: "Claude Agent SDK",
        provider: "anthropic",
      },
      {
        id: "cli",
        label: "CLI",
        backend: "cli",
        icon: UiTerminal,
        title: "Claude Code CLI",
        provider: "anthropic",
      },
      {
        id: "cmux",
        label: "cmux",
        backend: "cmux",
        icon: UiColumns,
        title: "Claude multiplexer",
        provider: "anthropic",
      },
    ],
  },
  {
    id: "codex",
    label: "Codex",
    provider: "openai",
    modes: [
      {
        id: "api",
        label: "API",
        backend: "api",
        icon: UiCloud,
        title: "OpenAI API",
        provider: "openai",
      },
      {
        id: "agent",
        label: "Agent",
        backend: "agent",
        icon: UiRobotAi,
        title: "Codex agent",
        provider: "openai",
      },
      {
        id: "cli",
        label: "CLI",
        backend: "cli",
        icon: UiTerminal,
        title: "Codex CLI",
        provider: "openai",
      },
      {
        id: "cmux",
        label: "cmux",
        backend: "cmux",
        icon: UiColumns,
        title: "Codex multiplexer",
        provider: "openai",
      },
    ],
  },
  {
    id: "gemini",
    label: "Gemini",
    provider: "googleai",
    modes: [
      {
        id: "api",
        label: "API",
        backend: "api",
        icon: UiCloud,
        title: "Gemini API",
      },
      {
        id: "cli",
        label: "CLI",
        backend: "cli",
        icon: UiTerminal,
        title: "Gemini CLI",
      },
    ],
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    provider: "deepseek",
    modes: [
      {
        id: "api",
        label: "API",
        backend: "api",
        icon: UiCloud,
        title: "DeepSeek API",
      },
    ],
  },
];

// One provider×mode cell as captain serves it (`/whoami`.runtimes and the prompt
// schema document's `runtimes`), projected from its model registry. It carries
// ids, not display text: `claude`/`api` are enough to render both, and a served
// label would be a second place for presentation to drift.
export type RuntimeCatalogMode = {
  /** The canonical `spec.backend`: api | agent | cli | cmux. */
  backend: SpecRuntimeBackend;
  /** "api" (remote, in-process) or "cli" (supervised local binary). */
  kind?: string | undefined;
  /** Rides the local CLI's own login; never consults an API key. */
  keyless?: boolean | undefined;
  /** The model id a picker should seed this mode with. */
  defaultModel?: string | undefined;
  /** The user switched this off in `~/.captain.yaml`. */
  disabled?: boolean | undefined;
  disabledReason?: string | undefined;
  /** Model-catalog provider used by this exact mode. */
  catalogProvider?: string | undefined;
  availability?: RuntimeAvailability | undefined;
  permissions?: RuntimePermissionCapabilities | undefined;
  /** Supported Spec fields, annotated with native CLI and protocol bindings. */
  schema: RuntimeSpecSchema;
};

export type RuntimeCatalogFamily = {
  /** The coding-agent name: claude | codex | gemini | deepseek. */
  family: string;
  /** The canonical provider key: anthropic | openai | google | deepseek. */
  provider: string;
  /** The namespace this provider's model ids carry (`ChatModel.provider`). */
  catalogPrefix: string;
  modes: RuntimeCatalogMode[];
};

const MODE_ICONS: Record<string, StaticIconComponent> = {
  api: UiCloud,
  agent: UiRobotAi,
  cli: UiTerminal,
  cmux: UiColumns,
};

// Mode ids are lowercase tokens; only the acronyms and the lowercase brand
// "cmux" need spelling out. `agent` falls through to plain title case.
const MODE_LABELS: Record<string, string> = {
  api: "API",
  cli: "CLI",
  cmux: "cmux",
};

// Tooltip text, so "Claude cmux" reads as "Claude multiplexer".
const MODE_TITLES: Record<string, string> = {
  api: "API",
  agent: "Agent SDK",
  cli: "CLI",
  cmux: "multiplexer",
};

// The one brand whose title case is not just an initial capital.
const FAMILY_LABELS: Record<string, string> = { deepseek: "DeepSeek" };

function titleCase(token: string): string {
  return token ? token.charAt(0).toUpperCase() + token.slice(1) : token;
}

// Turns the served catalog into the shared family list. Unavailable entries
// stay present for Provider Status while runtime controls filter them out.
//
// The registry has one provider per family, so Claude's API mode sits beside its
// Agent/CLI/cmux modes here rather than in a separate "Anthropic" family the way
// SPEC_RUNTIME_FAMILIES splits them.
export function familiesFromRuntimeCatalog(
  catalog: RuntimeCatalogFamily[] | undefined,
): SpecRuntimeFamily[] {
  if (!catalog?.length) return SPEC_RUNTIME_FAMILIES;
  const families: SpecRuntimeFamily[] = [];
  for (const entry of catalog) {
    const label = FAMILY_LABELS[entry.family] ?? titleCase(entry.family);
    const modes = entry.modes.map((mode) => ({
      id: mode.backend,
      label: MODE_LABELS[mode.backend] ?? titleCase(mode.backend),
      backend: mode.backend,
      icon: MODE_ICONS[mode.backend],
      title: `${label} ${MODE_TITLES[mode.backend] ?? titleCase(mode.backend)}`,
      provider: mode.catalogProvider ?? entry.catalogPrefix,
      ...(mode.defaultModel ? { defaultModel: mode.defaultModel } : {}),
      ...(mode.permissions ? { permissions: mode.permissions } : {}),
      ...(mode.schema ? { schema: mode.schema } : {}),
      ...(mode.availability
        ? { availability: mode.availability }
        : mode.disabled
          ? {
              availability: {
                state: "disabled" as const,
                reason: `Disabled by ${
                  mode.disabledReason ?? mode.backend
                } in Captain configuration.`,
                remediation: `Enable ${
                  mode.disabledReason ?? mode.backend
                } on the Whoami page, then refresh.`,
              },
            }
          : {}),
    }));
    families.push({
      id: entry.family,
      label,
      provider: entry.catalogPrefix,
      modes,
    });
  }
  return families.length ? families : SPEC_RUNTIME_FAMILIES;
}

export function familyById(
  families: SpecRuntimeFamily[],
  id: string,
): SpecRuntimeFamily {
  const match = families.find((family) => family.id === id);
  if (match) return match;
  const first = families[0];
  if (!first) throw new Error("SpecRuntimeFamily catalog must not be empty");
  return first;
}

export function firstMode(family: SpecRuntimeFamily): SpecRuntimeModeOption {
  const mode =
    family.modes.find((candidate) => !isUnavailable(candidate.availability)) ??
    family.modes[0];
  if (!mode) {
    throw new Error(
      `SpecRuntimeFamily "${family.id}" must have at least one mode`,
    );
  }
  return mode;
}

// Every mode id in the catalog, first-seen order. The returned `backend` belongs
// to the family that declared the mode first — resolve the real one with
// `backendForFamilyMode`.
export function runtimeModeOptions(
  families: SpecRuntimeFamily[],
): SpecRuntimeModeOption[] {
  const modes = new Map<string, SpecRuntimeModeOption>();
  for (const family of families) {
    for (const mode of family.modes) {
      if (!modes.has(mode.id)) modes.set(mode.id, mode);
    }
  }
  return [...modes.values()];
}

// One phrasing for "this family does not offer that mode", shared by every
// runtime presentation so the same state never reads two ways.
export function unsupportedModeTitle(family: SpecRuntimeFamily): string {
  return availabilityText(
    unsupportedAvailability(
      family.label,
      "this",
      family.modes
        .filter((mode) => !isUnavailable(mode.availability))
        .map((mode) => mode.label),
    ),
  )!;
}

export function unsupportedModeAvailability(
  family: SpecRuntimeFamily,
  mode: SpecRuntimeModeOption,
): RuntimeAvailability {
  return unsupportedAvailability(
    family.label,
    mode.label,
    family.modes
      .filter((candidate) => !isUnavailable(candidate.availability))
      .map((candidate) => candidate.label),
  );
}

export function backendForFamilyMode(
  families: SpecRuntimeFamily[],
  familyId: string,
  modeId: string,
): string {
  const family = familyById(families, familyId);
  const requested = family.modes.find((candidate) => candidate.id === modeId);
  const mode =
    requested && !isUnavailable(requested.availability)
      ? requested
      : firstMode(family);
  if (isUnavailable(mode.availability)) {
    throw new Error(
      `SpecRuntimeFamily "${family.id}" has no available runtime modes`,
    );
  }
  return mode.backend;
}

export function selectionForBackend(
  families: SpecRuntimeFamily[],
  backend: string | undefined,
  preferredFamily?: string | undefined,
): { family: string; mode: string } {
  const target = (backend ?? "").toLowerCase();
  const preferred = families.find((family) => family.id === preferredFamily);
  const preferredMode = preferred?.modes.find(
    (mode) => mode.backend.toLowerCase() === target,
  );
  if (preferred && preferredMode) {
    return { family: preferred.id, mode: preferredMode.id };
  }
  for (const family of families) {
    for (const mode of family.modes) {
      if (mode.backend.toLowerCase() === target) {
        return { family: family.id, mode: mode.id };
      }
    }
  }
  const first = familyById(families, "");
  return { family: first.id, mode: firstMode(first).id };
}

export function familyForModel(
  families: SpecRuntimeFamily[],
  models: ChatModel[],
  modelId: string | undefined,
): SpecRuntimeFamily | undefined {
  if (!modelId) return undefined;
  const selected = models.find(
    (model) =>
      model.id === modelId ||
      model.runtime?.model === modelId ||
      model.runtime?.id === modelId,
  );
  if (!selected) return undefined;
  return families.find(
    (family) =>
      family.provider === selected.provider ||
      family.modes.some((mode) => mode.provider === selected.provider),
  );
}

export function selectionForRuntime(
  families: SpecRuntimeFamily[],
  backend: string | undefined,
  modelId: string | undefined,
  models: ChatModel[],
  preferredFamily?: string | undefined,
): { family: string; mode: string } {
  return selectionForBackend(
    families,
    backend,
    familyForModel(families, models, modelId)?.id ?? preferredFamily,
  );
}

export function familyForBackend(
  families: SpecRuntimeFamily[],
  backend: string | undefined,
  preferredFamily?: string | undefined,
): SpecRuntimeFamily | undefined {
  if (preferredFamily) {
    const family = families.find((entry) => entry.id === preferredFamily);
    if (family?.modes.some((mode) => mode.backend === backend)) return family;
  }
  const target = (backend ?? "").toLowerCase();
  return families.find((family) =>
    family.modes.some((mode) => mode.backend.toLowerCase() === target),
  );
}

// The mode a backend id names, or undefined when the catalog does not declare
// it. Unlike `selectionForBackend` this does not fall back to the first family,
// so a summary can stay silent about a runtime it cannot identify.
export function modeForBackend(
  families: SpecRuntimeFamily[],
  backend: string | undefined,
  preferredFamily?: string | undefined,
): SpecRuntimeModeOption | undefined {
  const target = (backend ?? "").toLowerCase();
  if (!target) return undefined;
  const ordered = preferredFamily
    ? [
        ...families.filter((family) => family.id === preferredFamily),
        ...families.filter((family) => family.id !== preferredFamily),
      ]
    : families;
  for (const family of ordered) {
    const mode = family.modes.find(
      (entry) => entry.backend.toLowerCase() === target,
    );
    if (mode) return mode;
  }
  return undefined;
}

// `backend` is provider-independent, so a family is needed for a full label.
export function labelForBackend(
  backend: string | undefined,
  families: SpecRuntimeFamily[] = SPEC_RUNTIME_FAMILIES,
): string {
  const target = (backend ?? "").toLowerCase();
  for (const family of families) {
    for (const mode of family.modes) {
      if (mode.backend.toLowerCase() === target) {
        return `${family.label} ${mode.label}`;
      }
    }
  }
  return "Prompt default";
}

/** Lists selectable models by provider and declared backend support. */
export function modelsForFamily(
  models: ChatModel[],
  family: SpecRuntimeFamily | undefined,
  backend?: string | undefined,
): ChatModel[] {
  if (!family) return models.filter(isSelectableModel);
  const provider =
    family.modes.find((mode) => mode.backend === backend)?.provider ??
    family.provider;
  return models.filter(
    (model) =>
      isSelectableModel(model) &&
      model.provider === provider &&
      modelMatchesBackend(model, backend),
  );
}

/** Reports whether the first matching catalog identity belongs to the target family. */
export function modelBelongsToFamily(
  modelId: string | undefined,
  models: ChatModel[],
  family: SpecRuntimeFamily | undefined,
  backend?: string | undefined,
): boolean {
  if (!modelId) return true;
  const selected = models.find(
    (model) =>
      isSelectableModel(model) &&
      (model.id === modelId ||
        model.runtime?.model === modelId ||
        model.runtime?.id === modelId),
  );
  if (!selected) return false;
  const provider =
    family?.modes.find((mode) => mode.backend === backend)?.provider ??
    family?.provider;
  const providerMatches = !provider || selected.provider === provider;
  return providerMatches && modelMatchesBackend(selected, backend);
}

/** Resolves a target backend row, using a sole shared row as fallback. */
export function modelForFamily(
  modelId: string | undefined,
  models: ChatModel[],
  family: SpecRuntimeFamily | undefined,
  backend?: string | undefined
): ChatModel | undefined {
  if (!modelId) return undefined;
  const matches = modelsForFamily(models, family, backend).filter(
    (model) =>
      model.id === modelId ||
      model.runtime?.model === modelId ||
      model.runtime?.id === modelId
  );
  return (
    matches.find(
      (model) =>
        !backend ||
        !model.runtime?.backend ||
        model.runtime.backend === backend
    ) ?? (matches.length === 1 ? matches[0] : undefined)
  );
}

/** Checks a model row's declared runtime backends when the catalog scopes it. */
export function modelMatchesBackend(
  model: ChatModel,
  backend: string | undefined,
): boolean {
  if (!backend) return true;
  const backends = model.backends?.filter(Boolean);
  if (!backends || backends.length === 0) return true;
  return backends.includes(backend);
}
