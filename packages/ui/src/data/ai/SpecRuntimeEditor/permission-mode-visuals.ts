import type { AgentActionMeta } from "../agent-action-icons";
import { PERMISSION_MODE_ICONS } from "../agent-action-icons";
import {
  SPEC_PERMISSION_MODES,
  type SpecPermissionMode,
} from "../SpecRuntimeEditor.model";
import type { RuntimePermissionSupport } from "../../runtime/runtime-mode";
import {
  UiHandPalm,
  UiLock,
  UiLockOpen,
  UiPauseCircle,
  UiPencilSimpleLine,
  UiShieldSlash,
} from "../../../icons";

type PermissionModeVisuals = Record<SpecPermissionMode, AgentActionMeta>;
type AliasPair = readonly [SpecPermissionMode, SpecPermissionMode];

const CODEX_PERMISSION_MODES: PermissionModeVisuals = {
  default: { icon: UiLock, tone: "slate", label: "Read only" },
  acceptEdits: {
    icon: UiHandPalm,
    tone: "sky",
    label: "Ask for approval",
  },
  auto: { icon: UiHandPalm, tone: "sky", label: "Ask for approval" },
  bypassPermissions: {
    icon: UiLockOpen,
    tone: "rose",
    label: "Full access",
  },
  dontAsk: { icon: UiShieldSlash, tone: "rose", label: "Don't ask" },
  plan: { icon: UiPauseCircle, tone: "teal", label: "Plan" },
};

const GEMINI_PERMISSION_MODES: PermissionModeVisuals = {
  default: { icon: UiHandPalm, tone: "indigo", label: "Manual" },
  acceptEdits: {
    icon: UiPencilSimpleLine,
    tone: "amber",
    label: "Auto edit",
  },
  auto: { icon: UiPencilSimpleLine, tone: "amber", label: "Auto edit" },
  bypassPermissions: { icon: UiShieldSlash, tone: "rose", label: "YOLO" },
  dontAsk: { icon: UiShieldSlash, tone: "rose", label: "YOLO" },
  plan: { icon: UiPauseCircle, tone: "emerald", label: "Plan" },
};

const PROVIDER_VISUALS: Partial<Record<string, PermissionModeVisuals>> = {
  claude: PERMISSION_MODE_ICONS,
  codex: CODEX_PERMISSION_MODES,
  gemini: GEMINI_PERMISSION_MODES,
};

const PROVIDER_ALIASES: Partial<Record<string, AliasPair[]>> = {
  codex: [["acceptEdits", "auto"]],
  gemini: [
    ["acceptEdits", "auto"],
    ["bypassPermissions", "dontAsk"],
  ],
};

export function permissionModeVisual(
  family: string | undefined,
  mode: SpecPermissionMode,
): AgentActionMeta {
  return PROVIDER_VISUALS[family ?? ""]?.[mode] ?? PERMISSION_MODE_ICONS[mode];
}

export function collapsePermissionModeAliases(
  family: string | undefined,
  available: SpecPermissionMode[],
  current: SpecPermissionMode | undefined,
  support: Record<string, RuntimePermissionSupport>,
): SpecPermissionMode[] {
  const hidden = new Set<SpecPermissionMode>();
  for (const pair of PROVIDER_ALIASES[family ?? ""] ?? []) {
    if (!pair.every((mode) => available.includes(mode))) continue;
    if (!equivalentEnforcement(support[pair[0]], support[pair[1]])) continue;
    const keep = aliasRepresentative(pair, current, support);
    hidden.add(pair[0] === keep ? pair[1] : pair[0]);
  }
  return SPEC_PERMISSION_MODES.filter(
    (mode) => available.includes(mode) && !hidden.has(mode),
  );
}

function aliasRepresentative(
  pair: AliasPair,
  current: SpecPermissionMode | undefined,
  support: Record<string, RuntimePermissionSupport>,
): SpecPermissionMode {
  if (current && pair.includes(current)) return current;
  const [left, right] = pair;
  if (support[right]?.kind === "native" && support[left]?.kind !== "native") {
    return right;
  }
  return left;
}

const ENFORCEMENT_EFFECT_KEYS = ["flag", "sandbox", "approval"] as const;

function equivalentEnforcement(
  left: RuntimePermissionSupport | undefined,
  right: RuntimePermissionSupport | undefined,
): boolean {
  const publishesEnforcement = ENFORCEMENT_EFFECT_KEYS.some(
    (key) =>
      left?.effects?.[key] !== undefined || right?.effects?.[key] !== undefined,
  );
  return (
    publishesEnforcement &&
    ENFORCEMENT_EFFECT_KEYS.every(
      (key) => left?.effects?.[key] === right?.effects?.[key],
    )
  );
}
