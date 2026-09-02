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
import {
  familyForModel,
  isSpecRuntimeMode,
  type SpecRuntimeMode,
} from "../../lib/runtime-family";
export {
  familyForModel,
  isSpecRuntimeMode,
  modeOptionFor,
  runtimeModeFromModel,
  SPEC_RUNTIME_MODES,
  type SpecRuntimeMode,
} from "../../lib/runtime-family";

// A runtime has two independent axes: the model selects a provider family and
// `spec.mode` selects api | agent | cli | cmux. The mode never contains a
// provider name. This file used to call that axis `backend`, which is also what
// captain called the composite adapter id it once served — so a value read from
// one and posted back as the other type-checked and ran the wrong runtime.

export function runtimeModelError(
  model: string | undefined,
): string | undefined {
  for (const raw of (model ?? "").split(",")) {
    const compact = raw.trim();
    if (!compact || !compact.includes(":")) continue;
    const parts = compact.split(":").map((part) => part.trim());
    const [mode, name, effort] = parts;
    if (!isSpecRuntimeMode(mode)) {
      return `Invalid model configuration: mode ${JSON.stringify(mode)} in model ${JSON.stringify(compact)}. Expected api, agent, cli, or cmux.`;
    }
    if (!name || parts.length > 3) {
      return `Invalid model configuration: model ${JSON.stringify(compact)}. Expected mode:model[:effort].`;
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

export function runtimeModeError(
  families: SpecRuntimeFamily[],
  mode: string | undefined,
  familyId?: string | undefined,
): string | undefined {
  if (!mode) return undefined;
  if (!isSpecRuntimeMode(mode)) {
    return `Invalid model configuration: mode ${JSON.stringify(mode)}. Expected api, agent, cli, or cmux.`;
  }
  const family = familyId
    ? families.find((entry) => entry.id === familyId)
    : undefined;
  if (family && !family.modes.some((entry) => entry.id === mode)) {
    return `Invalid model configuration: mode ${JSON.stringify(mode)} is not available for ${family.label}.`;
  }
  if (!families.some((entry) => entry.modes.some((m) => m.id === mode))) {
    return `Invalid model configuration: mode ${JSON.stringify(mode)} is missing from the runtime catalog.`;
  }
  return undefined;
}

export type SpecRuntimeModeOption = {
  /** The canonical `spec.mode`: api | agent | cli | cmux. */
  id: string;
  label: string;
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
  /** Namespace used by fully-qualified model ids when it differs from provider. */
  catalogPrefix?: string | undefined;
  modes: SpecRuntimeModeOption[];
};

// Offline catalog for stories and tests. Live hosts should pass Captain's
// registry projection; both use the same provider + mode structure.
export const SPEC_RUNTIME_FAMILIES: SpecRuntimeFamily[] = [
  {
    id: "claude",
    label: "Claude",
    provider: "anthropic",
    modes: [
      {
        id: "api",
        label: "API",
        icon: UiCloud,
        title: "Anthropic API",
        provider: "anthropic",
      },
      {
        id: "agent",
        label: "Agent",
        icon: UiRobotAi,
        title: "Claude Agent SDK",
        provider: "anthropic",
      },
      {
        id: "cli",
        label: "CLI",
        icon: UiTerminal,
        title: "Claude Code CLI",
        provider: "anthropic",
      },
      {
        id: "cmux",
        label: "cmux",
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
        icon: UiCloud,
        title: "OpenAI API",
        provider: "openai",
      },
      {
        id: "agent",
        label: "Agent",
        icon: UiRobotAi,
        title: "Codex agent",
        provider: "openai",
      },
      {
        id: "cli",
        label: "CLI",
        icon: UiTerminal,
        title: "Codex CLI",
        provider: "openai",
      },
      {
        id: "cmux",
        label: "cmux",
        icon: UiColumns,
        title: "Codex multiplexer",
        provider: "openai",
      },
    ],
  },
  {
    id: "gemini",
    label: "Gemini",
    provider: "google",
    catalogPrefix: "googleai",
    modes: [
      { id: "api", label: "API", icon: UiCloud, title: "Gemini API" },
      { id: "cli", label: "CLI", icon: UiTerminal, title: "Gemini CLI" },
    ],
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    provider: "deepseek",
    modes: [{ id: "api", label: "API", icon: UiCloud, title: "DeepSeek API" }],
  },
];

// One provider×mode cell as captain serves it (`/whoami`.runtimes and the prompt
// schema document's `runtimes`), projected from its model registry. It carries
// ids, not display text: `claude`/`api` are enough to render both, and a served
// label would be a second place for presentation to drift.
export type RuntimeCatalogMode = {
  /** The canonical `spec.mode`: api | agent | cli | cmux. */
  mode: SpecRuntimeMode;
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
  /** The namespace used in fully-qualified model ids. */
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
      id: mode.mode,
      label: MODE_LABELS[mode.mode] ?? titleCase(mode.mode),
      icon: MODE_ICONS[mode.mode],
      title: `${label} ${MODE_TITLES[mode.mode] ?? titleCase(mode.mode)}`,
      provider: mode.catalogProvider ?? entry.provider,
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
                  mode.disabledReason ?? mode.mode
                } in Captain configuration.`,
                remediation: `Enable ${
                  mode.disabledReason ?? mode.mode
                } on the Whoami page, then refresh.`,
              },
            }
          : {}),
    }));
    families.push({
      id: entry.family,
      label,
      provider: entry.provider,
      catalogPrefix: entry.catalogPrefix,
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

// Every mode id in the catalog, first-seen order. The entry returned for an id
// belongs to the family that declared it first, so its presentation fields may
// differ from another family's — the id itself is family-independent.
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

// The mode a family will actually run for a requested id, falling back to its
// first available one. The answer is a `spec.mode` value.
export function modeForFamily(
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
  return mode.id;
}

export function selectionForMode(
  families: SpecRuntimeFamily[],
  mode: string | undefined,
  preferredFamily?: string | undefined,
): { family: string; mode: string } {
  const target = (mode ?? "").toLowerCase();
  const preferred = families.find((family) => family.id === preferredFamily);
  const preferredMode = preferred?.modes.find(
    (entry) => entry.id.toLowerCase() === target,
  );
  if (preferred && preferredMode) {
    return { family: preferred.id, mode: preferredMode.id };
  }
  for (const family of families) {
    for (const entry of family.modes) {
      if (entry.id.toLowerCase() === target) {
        return { family: family.id, mode: entry.id };
      }
    }
  }
  const first = familyById(families, "");
  return { family: first.id, mode: firstMode(first).id };
}

export function selectionForRuntime(
  families: SpecRuntimeFamily[],
  mode: string | undefined,
  modelId: string | undefined,
  models: ChatModel[],
  preferredFamily?: string | undefined,
): { family: string; mode: string } {
  return selectionForMode(
    families,
    mode,
    familyForModel(families, models, modelId)?.id ?? preferredFamily,
  );
}

export function familyForMode(
  families: SpecRuntimeFamily[],
  mode: string | undefined,
  preferredFamily?: string | undefined,
): SpecRuntimeFamily | undefined {
  if (preferredFamily) {
    const family = families.find((entry) => entry.id === preferredFamily);
    if (family?.modes.some((entry) => entry.id === mode)) return family;
  }
  const target = (mode ?? "").toLowerCase();
  return families.find((family) =>
    family.modes.some((entry) => entry.id.toLowerCase() === target),
  );
}

// The mode option a `spec.mode` names, or undefined when the catalog does not
// declare it. Unlike `selectionForMode` this does not fall back to the first
// family, so a summary can stay silent about a runtime it cannot identify.
// `mode` is provider-independent, so a family is needed for a full label.
export function labelForMode(
  mode: string | undefined,
  families: SpecRuntimeFamily[] = SPEC_RUNTIME_FAMILIES,
): string {
  const target = (mode ?? "").toLowerCase();
  for (const family of families) {
    for (const entry of family.modes) {
      if (entry.id.toLowerCase() === target) {
        return `${family.label} ${entry.label}`;
      }
    }
  }
  return "Prompt default";
}

/** Lists selectable models for one provider family. */
export function modelsForFamily(
  models: ChatModel[],
  family: SpecRuntimeFamily | undefined,
  mode?: string | undefined,
): ChatModel[] {
  if (!family) return models.filter(isSelectableModel);
  const provider =
    family.modes.find((entry) => entry.id === mode)?.provider ??
    family.provider;
  return models.filter(
    (model) => isSelectableModel(model) && model.provider === provider,
  );
}

/** Reports whether the first matching catalog identity belongs to the target family. */
export function modelBelongsToFamily(
  modelId: string | undefined,
  models: ChatModel[],
  family: SpecRuntimeFamily | undefined,
  mode?: string | undefined,
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
    family?.modes.find((entry) => entry.id === mode)?.provider ??
    family?.provider;
  return (
    (!provider || selected.provider === provider) &&
    (!selected.runtime?.mode || selected.runtime.mode === mode)
  );
}

/** Resolves a target mode row, using a sole shared row as fallback. */
export function modelForFamily(
  modelId: string | undefined,
  models: ChatModel[],
  family: SpecRuntimeFamily | undefined,
  mode?: string | undefined,
): ChatModel | undefined {
  if (!modelId) return undefined;
  const matches = modelsForFamily(models, family, mode).filter(
    (model) =>
      model.id === modelId ||
      model.runtime?.model === modelId ||
      model.runtime?.id === modelId,
  );
  return (
    matches.find(
      (model) => !mode || !model.runtime?.mode || model.runtime.mode === mode,
    ) ?? (matches.length === 1 ? matches[0] : undefined)
  );
}
