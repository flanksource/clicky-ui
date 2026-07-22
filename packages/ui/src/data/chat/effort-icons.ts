import type { StaticIconComponent } from "../Icon";
import {
  UiBatteryChargingVertical,
  UiBatteryVerticalEmpty,
  UiBatteryVerticalFull,
  UiBatteryVerticalHigh,
  UiBatteryVerticalLow,
  UiBatteryVerticalMedium,
} from "../../icons";

// Reasoning / token-budget levels drawn as a filling vertical battery — the
// glyph reads as "budget filled", adaptive charges up or down per step. The
// icon map is the source of truth (chat layer); the AI session layer composes
// semantic tone + label on top in agent-action-icons.ts.

export type EffortLevel =
  | "minimal"
  | "low"
  | "medium"
  | "high"
  | "max"
  | "adaptive";

export const EFFORT_LEVEL_ICONS: Record<EffortLevel, StaticIconComponent> = {
  minimal: UiBatteryVerticalEmpty,
  low: UiBatteryVerticalLow,
  medium: UiBatteryVerticalMedium,
  high: UiBatteryVerticalHigh,
  max: UiBatteryVerticalFull,
  adaptive: UiBatteryChargingVertical,
};

// Text-color class per level, climbing the issue-severity ramp (slate → sky →
// amber → orange → red) with adaptive on indigo. Mirrors the tones the AI layer
// assigns in agent-action-icons.ts; kept as literal classes so Tailwind scans
// them and dark mode keys off the `data-theme` attribute (not `dark:`).
export const EFFORT_LEVEL_COLOR: Record<EffortLevel, string> = {
  minimal: "text-slate-500 [[data-theme=dark]_&]:text-slate-400",
  low: "text-sky-700 [[data-theme=dark]_&]:text-sky-400",
  medium: "text-amber-700 [[data-theme=dark]_&]:text-amber-400",
  high: "text-orange-700 [[data-theme=dark]_&]:text-orange-400",
  max: "text-red-700 [[data-theme=dark]_&]:text-red-400",
  adaptive: "text-indigo-700 [[data-theme=dark]_&]:text-indigo-400",
};

function effortKey(value: string): EffortLevel | undefined {
  const key = value.trim().toLowerCase();
  if (key in EFFORT_LEVEL_ICONS) return key as EffortLevel;
  if (key === "xhigh") return "high";
  return undefined;
}

/** Battery glyph for an effort value, tolerating aliases (`xhigh` → high).
 *  Returns undefined when the value isn't a known effort level. */
export function effortLevelIcon(value: string): StaticIconComponent | undefined {
  const key = effortKey(value);
  return key ? EFFORT_LEVEL_ICONS[key] : undefined;
}

/** Tone text-color class for an effort value, or undefined when unknown. */
export function effortLevelColor(value: string): string | undefined {
  const key = effortKey(value);
  return key ? EFFORT_LEVEL_COLOR[key] : undefined;
}
