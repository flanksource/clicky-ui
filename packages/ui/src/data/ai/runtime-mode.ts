import type { StaticIconComponent } from "../Icon";
import { UiCloud, UiColumns, UiRobotAi, UiTerminal } from "../../icons";
import type { ChatModel } from "../chat/types";

// The runtime "mode" of a backend is factored into two UI axes — a provider
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
      { id: "agent", label: "Agent", backend: "claude-agent", icon: UiRobotAi, title: "Claude Agent SDK" },
      { id: "cli", label: "CLI", backend: "claude-cli", icon: UiTerminal, title: "Claude Code CLI" },
      { id: "cmux", label: "cmux", backend: "claude-cmux", icon: UiColumns, title: "Claude multiplexer" },
    ],
  },
  {
    id: "codex",
    label: "Codex",
    provider: "codex-cli",
    modes: [
      { id: "agent", label: "Agent", backend: "codex-agent", icon: UiRobotAi, title: "Codex agent" },
      { id: "cli", label: "CLI", backend: "codex-cli", icon: UiTerminal, title: "Codex CLI" },
      { id: "cmux", label: "cmux", backend: "codex-cmux", icon: UiColumns, title: "Codex multiplexer" },
    ],
  },
  {
    id: "openai",
    label: "OpenAI",
    provider: "openai",
    modes: [{ id: "api", label: "API", backend: "openai", icon: UiCloud, title: "OpenAI API" }],
  },
  {
    id: "anthropic",
    label: "Anthropic",
    provider: "anthropic",
    modes: [{ id: "api", label: "API", backend: "anthropic", icon: UiCloud, title: "Anthropic API" }],
  },
  {
    id: "gemini",
    label: "Gemini",
    provider: "googleai",
    modes: [
      { id: "api", label: "API", backend: "gemini", icon: UiCloud, title: "Gemini API" },
      { id: "cli", label: "CLI", backend: "gemini-cli", icon: UiTerminal, title: "Gemini CLI" },
    ],
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    provider: "deepseek",
    modes: [{ id: "api", label: "API", backend: "deepseek", icon: UiCloud, title: "DeepSeek API" }],
  },
];

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
  const mode = family.modes[0];
  if (!mode) {
    throw new Error(`SpecRuntimeFamily "${family.id}" must have at least one mode`);
  }
  return mode;
}

export function backendForFamilyMode(
  families: SpecRuntimeFamily[],
  familyId: string,
  modeId: string,
): string {
  const family = familyById(families, familyId);
  const mode = family.modes.find((candidate) => candidate.id === modeId) ?? firstMode(family);
  return mode.backend;
}

export function selectionForBackend(
  families: SpecRuntimeFamily[],
  backend: string | undefined,
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
  backend: string | undefined,
): SpecRuntimeFamily | undefined {
  const target = (backend ?? "").toLowerCase();
  return families.find((family) =>
    family.modes.some((mode) => mode.backend.toLowerCase() === target),
  );
}

// "claude-agent" -> "Claude Agent"; unknown/empty -> "Prompt default".
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

export function modelsForFamily(
  models: ChatModel[],
  family: SpecRuntimeFamily | undefined,
  backend?: string | undefined,
): ChatModel[] {
  if (!family) return models;
  return models.filter(
    (model) => model.provider === family.provider && modelMatchesBackend(model, backend),
  );
}

export function modelBelongsToFamily(
  modelId: string | undefined,
  models: ChatModel[],
  family: SpecRuntimeFamily | undefined,
  backend?: string | undefined,
): boolean {
  if (!modelId) return true;
  const selected = models.find((model) => model.id === modelId);
  if (!selected) return false;
  const providerMatches = !family || selected.provider === family.provider;
  return providerMatches && modelMatchesBackend(selected, backend);
}

function modelMatchesBackend(
  model: ChatModel,
  backend: string | undefined,
): boolean {
  if (!backend) return true;
  const backends = model.backends?.filter(Boolean);
  if (!backends || backends.length === 0) return true;
  return backends.includes(backend);
}
