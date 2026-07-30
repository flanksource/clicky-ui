import type { StaticIconComponent } from "../Icon";
import {
  EFFORT_LEVEL_ICONS,
  effortLevelLabel,
  type EffortLevel,
} from "../chat/effort-icons";
import type { SessionTone } from "./SessionViewer.model";
import type { SpecPermissionMode } from "./SpecRuntimeEditor.model";
import {
  UiArrowFatUp,
  UiBraces,
  UiBox,
  UiChatDots,
  UiCircleX,
  UiFastForwardCircle,
  UiHandPalm,
  UiPass,
  UiPauseCircle,
  UiPlayCircle,
  UiQuestion,
  UiSealCheck,
  UiShieldSlash,
  UiStrategy,
  UiTerminal,
} from "../../icons";

// Implements the semantic groups of the Flanksource "Agent Action Icons" design
// beyond the per-tool ACTIONS map (which lives in SessionViewer.model.ts). Each
// entry pairs a generated Ui* glyph with a SessionTone so the disc/text color
// (DISC_TONE in SessionViewer.rows.tsx) encodes the action's category. Blue
// reasons, green executes, teal confirms; the effort ramp climbs slate → sky →
// amber → orange → rose → fuchsia; approval clears green / blocks red.

export interface AgentActionMeta {
  icon: StaticIconComponent;
  tone: SessionTone;
  label: string;
}

// ── Agent workflow: plan → run → verify ─────────────────────────────────────
export type WorkflowPhase = "plan" | "run" | "verify";

export const WORKFLOW_PHASES: Record<WorkflowPhase, AgentActionMeta> = {
  plan: { icon: UiStrategy, tone: "sky", label: "Plan" },
  run: { icon: UiPlayCircle, tone: "emerald", label: "Run" },
  verify: { icon: UiSealCheck, tone: "teal", label: "Verify" },
};

// ── Effort levels: reasoning / token budget on the severity hue ramp ─────────
// The battery glyphs are the chat layer's source of truth (EFFORT_LEVEL_ICONS);
// here we add the semantic tone + label so an effort chip reads at a glance.
export type { EffortLevel } from "../chat/effort-icons";

const EFFORT_TONES: Record<EffortLevel, SessionTone> = {
  minimal: "slate",
  low: "sky",
  medium: "amber",
  high: "orange",
  xhigh: "orange",
  max: "rose",
  ultra: "fuchsia",
  adaptive: "indigo",
};

export const EFFORT_ICONS: Record<EffortLevel, AgentActionMeta> = Object.fromEntries(
  (Object.keys(EFFORT_LEVEL_ICONS) as EffortLevel[]).map((level) => [
    level,
    {
      icon: EFFORT_LEVEL_ICONS[level],
      tone: EFFORT_TONES[level],
      label: effortLevelLabel(level),
    },
  ]),
) as Record<EffortLevel, AgentActionMeta>;

/** Resolve the effort glyph for a known value. */
export function effortIcon(value: string): AgentActionMeta | undefined {
  const key = value.trim().toLowerCase();
  if (key in EFFORT_ICONS) return EFFORT_ICONS[key as EffortLevel];
  return undefined;
}

// ── Permission modes: colors matched to Claude Code ──────────────────────────
export const PERMISSION_MODE_ICONS: Record<
  SpecPermissionMode,
  AgentActionMeta
> = {
  default: { icon: UiHandPalm, tone: "slate", label: "Ask" },
  plan: { icon: UiPauseCircle, tone: "sky", label: "Plan" },
  acceptEdits: { icon: UiFastForwardCircle, tone: "emerald", label: "Auto" },
  auto: { icon: UiFastForwardCircle, tone: "emerald", label: "Auto" },
  dontAsk: { icon: UiFastForwardCircle, tone: "emerald", label: "Don't ask" },
  bypassPermissions: { icon: UiShieldSlash, tone: "rose", label: "Off" },
};

// ── Approval states: where a proposed action sits in the HITL flow ───────────
export type ApprovalState =
  | "question"
  | "pending"
  | "approved"
  | "denied"
  | "escalate";

export const APPROVAL_ICONS: Record<ApprovalState, AgentActionMeta> = {
  question: { icon: UiQuestion, tone: "sky", label: "Question" },
  pending: { icon: UiChatDots, tone: "amber", label: "Awaiting input" },
  approved: { icon: UiPass, tone: "emerald", label: "Approved" },
  denied: { icon: UiCircleX, tone: "rose", label: "Denied" },
  escalate: { icon: UiArrowFatUp, tone: "orange", label: "Escalate" },
};

// ── Agent runtimes: where an agent executes ──────────────────────────────────
export type AgentRuntime = "sdk" | "terminal" | "api";

export const AGENT_RUNTIME_ICONS: Record<AgentRuntime, AgentActionMeta> = {
  sdk: { icon: UiBox, tone: "indigo", label: "SDK agent" },
  terminal: { icon: UiTerminal, tone: "slate", label: "Terminal agent" },
  api: { icon: UiBraces, tone: "sky", label: "API agent" },
};
