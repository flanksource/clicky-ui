import { UiCloud, UiRobotAi, UiTerminal } from "../../icons";
import type { StaticIconComponent } from "../Icon";
import { SPEC_RUNTIME_FAMILIES } from "../runtime/runtime-mode";

export interface RuntimeDescriptor {
  family: string;
  mode: string;
  title: string;
  icon: StaticIconComponent;
}

export type TurnPalette =
  | "sky"
  | "violet"
  | "emerald"
  | "orange"
  | "rose"
  | "indigo"
  | "teal"
  | "fuchsia";

const TURN_PALETTE: TurnPalette[] = [
  "sky",
  "violet",
  "emerald",
  "orange",
  "rose",
  "indigo",
  "teal",
  "fuchsia",
];

const RUNTIME_ALIASES: Record<string, RuntimeDescriptor> = {
  claude: {
    family: "Claude",
    mode: "CLI",
    title: "Claude CLI",
    icon: UiTerminal,
  },
  codex: { family: "Codex", mode: "CLI", title: "Codex CLI", icon: UiTerminal },
  "claude-sdk": {
    family: "Claude",
    mode: "SDK",
    title: "Claude Agent SDK",
    icon: UiRobotAi,
  },
  "codex-sdk": {
    family: "Codex",
    mode: "SDK",
    title: "Codex SDK",
    icon: UiRobotAi,
  },
  "claude-headless": {
    family: "Claude",
    mode: "CLI",
    title: "Claude headless CLI",
    icon: UiTerminal,
  },
  "codex-headless": {
    family: "Codex",
    mode: "CLI",
    title: "Codex headless CLI",
    icon: UiTerminal,
  },
  "claude-api": {
    family: "Claude",
    mode: "API",
    title: "Anthropic API",
    icon: UiCloud,
  },
  "codex-api": {
    family: "Codex",
    mode: "API",
    title: "OpenAI API",
    icon: UiCloud,
  },
};

export function runtimeDescriptor(
  runtimeMode?: string,
): RuntimeDescriptor | undefined {
  const target = runtimeMode?.toLowerCase();
  if (!target) return undefined;
  for (const family of SPEC_RUNTIME_FAMILIES) {
    const mode = family.modes.find(
      (candidate) => candidate.id.toLowerCase() === target,
    );
    if (mode) {
      return {
        family: family.label,
        mode: mode.label,
        title: mode.title || `${family.label} ${mode.label}`,
        icon: mode.icon ?? UiRobotAi,
      };
    }
  }
  return RUNTIME_ALIASES[target];
}

export function durationLabel(start?: string, end?: string) {
  if (!start) return "";
  const startedAt = new Date(start).getTime();
  const endedAt = end ? new Date(end).getTime() : Date.now();
  if (Number.isNaN(startedAt) || Number.isNaN(endedAt) || endedAt < startedAt)
    return "";
  const seconds = Math.round((endedAt - startedAt) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes < 60)
    return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function createTurnPalette(
  sessionId: string | undefined,
  turnIds: string[],
) {
  const palette: Record<string, TurnPalette> = {};
  const offset = stableHash(sessionId ?? "session") % TURN_PALETTE.length;
  turnIds.forEach((id, index) => {
    palette[id] = TURN_PALETTE[(offset + index) % TURN_PALETTE.length] ?? "sky";
  });
  return palette;
}

export function shortSessionId(id: string) {
  const tail = id.split("-").at(-1) ?? id;
  if (tail.length >= 4) return tail.slice(0, 6);
  return id.length > 8 ? id.slice(-6) : id;
}

function stableHash(value: string) {
  let hash = 0;
  for (const character of value)
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return hash;
}
