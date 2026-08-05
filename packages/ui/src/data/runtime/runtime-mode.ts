import type { StaticIconComponent } from "../Icon";
import { UiCloud, UiColumns, UiRobotAi, UiTerminal } from "../../icons";
import type { ChatModel, RuntimeAvailability } from "../chat/types";
import {
  availabilityText,
  isSelectableModel,
  isUnavailable,
  unsupportedAvailability,
} from "./availability";

// A backend runtime is factored into two UI axes — a provider
// **family** (Claude, OpenAI, …) and a **mode** within it (Agent, CLI, cmux,
// API) — that together resolve to a single `spec.backend` string. This is the
// only place that mapping lives; both the inline PromptRunEditor and the modal
// SpecRuntimeEditor drive their Mode pickers from it.

export type SpecRuntimeModeOption = {
  /** UI mode id within a family (e.g. "agent", "cli", "cmux", "api"). */
  id: string;
  label: string;
  /** The concrete `spec.backend` this (family, mode) resolves to. */
  backend: string;
  icon?: StaticIconComponent | undefined;
  title?: string | undefined;
  provider?: string | undefined;
  availability?: RuntimeAvailability | undefined;
};

export type SpecRuntimeFamily = {
  id: string;
  label: string;
  /** The model-catalog provider (`ChatModel.provider`) whose models this family runs. */
  provider: string;
  modes: SpecRuntimeModeOption[];
};

// Default catalog covering the captain/gavel backend set. Hosts may pass their
// own via the `families` prop when their catalog differs.
export const SPEC_RUNTIME_FAMILIES: SpecRuntimeFamily[] = [
  {
    id: "claude",
    label: "Claude",
    provider: "claude-agent",
    modes: [
      {
        id: "agent",
        label: "Agent",
        backend: "claude-agent",
        icon: UiRobotAi,
        title: "Claude Agent SDK",
      },
      {
        id: "cli",
        label: "CLI",
        backend: "claude-cli",
        icon: UiTerminal,
        title: "Claude Code CLI",
      },
      {
        id: "cmux",
        label: "cmux",
        backend: "claude-cmux",
        icon: UiColumns,
        title: "Claude multiplexer",
      },
    ],
  },
  {
    id: "codex",
    label: "Codex",
    provider: "codex-cli",
    modes: [
      {
        id: "agent",
        label: "Agent",
        backend: "codex-agent",
        icon: UiRobotAi,
        title: "Codex agent",
      },
      {
        id: "cli",
        label: "CLI",
        backend: "codex-cli",
        icon: UiTerminal,
        title: "Codex CLI",
      },
      {
        id: "cmux",
        label: "cmux",
        backend: "codex-cmux",
        icon: UiColumns,
        title: "Codex multiplexer",
      },
    ],
  },
  {
    id: "openai",
    label: "OpenAI",
    provider: "openai",
    modes: [
      {
        id: "api",
        label: "API",
        backend: "openai",
        icon: UiCloud,
        title: "OpenAI API",
      },
    ],
  },
  {
    id: "anthropic",
    label: "Anthropic",
    provider: "anthropic",
    modes: [
      {
        id: "api",
        label: "API",
        backend: "anthropic",
        icon: UiCloud,
        title: "Anthropic API",
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
        backend: "gemini",
        icon: UiCloud,
        title: "Gemini API",
      },
      {
        id: "cli",
        label: "CLI",
        backend: "gemini-cli",
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
        backend: "deepseek",
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
  /** api | agent | cli | cmux */
  mode: string;
  /** The concrete `spec.backend`, e.g. "claude-cmux". */
  backend: string;
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
  catalog: RuntimeCatalogFamily[] | undefined
): SpecRuntimeFamily[] {
  if (!catalog?.length) return SPEC_RUNTIME_FAMILIES;
  const families: SpecRuntimeFamily[] = [];
  for (const entry of catalog) {
    const label = FAMILY_LABELS[entry.family] ?? titleCase(entry.family);
    const modes = entry.modes.map((mode) => ({
      id: mode.mode,
      label: MODE_LABELS[mode.mode] ?? titleCase(mode.mode),
      backend: mode.backend,
      icon: MODE_ICONS[mode.mode],
      title: `${label} ${MODE_TITLES[mode.mode] ?? titleCase(mode.mode)}`,
      provider: mode.catalogProvider ?? entry.catalogPrefix,
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
  id: string
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
      `SpecRuntimeFamily "${family.id}" must have at least one mode`
    );
  }
  return mode;
}

// Every mode id in the catalog, first-seen order. The returned `backend` belongs
// to the family that declared the mode first — resolve the real one with
// `backendForFamilyMode`.
export function runtimeModeOptions(
  families: SpecRuntimeFamily[]
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
        .map((mode) => mode.label)
    )
  )!;
}

export function unsupportedModeAvailability(
  family: SpecRuntimeFamily,
  mode: SpecRuntimeModeOption
): RuntimeAvailability {
  return unsupportedAvailability(
    family.label,
    mode.label,
    family.modes
      .filter((candidate) => !isUnavailable(candidate.availability))
      .map((candidate) => candidate.label)
  );
}

export function backendForFamilyMode(
  families: SpecRuntimeFamily[],
  familyId: string,
  modeId: string
): string {
  const family = familyById(families, familyId);
  const requested = family.modes.find((candidate) => candidate.id === modeId);
  const mode =
    requested && !isUnavailable(requested.availability)
      ? requested
      : firstMode(family);
  if (isUnavailable(mode.availability)) {
    throw new Error(
      `SpecRuntimeFamily "${family.id}" has no available runtime modes`
    );
  }
  return mode.backend;
}

export function selectionForBackend(
  families: SpecRuntimeFamily[],
  backend: string | undefined
): { family: string; mode: string } {
  const target = (backend ?? "").toLowerCase();
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

export function familyForBackend(
  families: SpecRuntimeFamily[],
  backend: string | undefined
): SpecRuntimeFamily | undefined {
  const target = (backend ?? "").toLowerCase();
  return families.find((family) =>
    family.modes.some((mode) => mode.backend.toLowerCase() === target)
  );
}

// The mode a backend id names, or undefined when the catalog does not declare
// it. Unlike `selectionForBackend` this does not fall back to the first family,
// so a summary can stay silent about a runtime it cannot identify.
export function modeForBackend(
  families: SpecRuntimeFamily[],
  backend: string | undefined
): SpecRuntimeModeOption | undefined {
  const target = (backend ?? "").toLowerCase();
  if (!target) return undefined;
  for (const family of families) {
    const mode = family.modes.find(
      (entry) => entry.backend.toLowerCase() === target
    );
    if (mode) return mode;
  }
  return undefined;
}

// "claude-agent" -> "Claude Agent"; unknown/empty -> "Prompt default".
export function labelForBackend(
  backend: string | undefined,
  families: SpecRuntimeFamily[] = SPEC_RUNTIME_FAMILIES
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

export function modelsForFamily(
  models: ChatModel[],
  family: SpecRuntimeFamily | undefined,
  backend?: string | undefined
): ChatModel[] {
  if (!family) return models.filter(isSelectableModel);
  const provider =
    family.modes.find((mode) => mode.backend === backend)?.provider ??
    family.provider;
  return models.filter(
    (model) =>
      isSelectableModel(model) &&
      model.provider === provider &&
      modelMatchesBackend(model, backend)
  );
}

export function modelBelongsToFamily(
  modelId: string | undefined,
  models: ChatModel[],
  family: SpecRuntimeFamily | undefined,
  backend?: string | undefined
): boolean {
  if (!modelId) return true;
  const selected = models.find(
    (model) =>
      isSelectableModel(model) &&
      (model.id === modelId ||
        model.runtime?.model === modelId ||
        model.runtime?.id === modelId)
  );
  if (!selected) return false;
  const provider =
    family?.modes.find((mode) => mode.backend === backend)?.provider ??
    family?.provider;
  const providerMatches = !provider || selected.provider === provider;
  return providerMatches && modelMatchesBackend(selected, backend);
}

function modelMatchesBackend(
  model: ChatModel,
  backend: string | undefined
): boolean {
  if (!backend) return true;
  const backends = model.backends?.filter(Boolean);
  if (!backends || backends.length === 0) return true;
  return backends.includes(backend);
}
