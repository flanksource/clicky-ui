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
  | "xhigh"
  | "max"
  | "ultra"
  | "adaptive";

export const DEFAULT_REASONING_EFFORTS: string[] = [
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
  "ultra",
];

export const EFFORT_LEVEL_ICONS: Record<EffortLevel, StaticIconComponent> = {
  minimal: UiBatteryVerticalEmpty,
  low: UiBatteryVerticalLow,
  medium: UiBatteryVerticalMedium,
  high: UiBatteryVerticalHigh,
  xhigh: UiBatteryVerticalHigh,
  max: UiBatteryVerticalFull,
  ultra: UiBatteryVerticalFull,
  adaptive: UiBatteryChargingVertical,
};

export const EFFORT_LEVEL_LABELS: Record<EffortLevel, string> = {
  minimal: "Minimal",
  low: "Low",
  medium: "Medium",
  high: "High",
  xhigh: "XHigh",
  max: "Max",
  ultra: "Ultra",
  adaptive: "Adaptive",
};

// Text-color class per level, with adaptive and ultra distinct from the fixed
// effort ramp. Mirrors the tones the AI layer assigns in
// agent-action-icons.ts; kept as literal classes so Tailwind scans them and dark
// mode keys off the `data-theme` attribute (not `dark:`).
export const EFFORT_LEVEL_COLOR: Record<EffortLevel, string> = {
  minimal: "text-slate-500 [[data-theme=dark]_&]:text-slate-400",
  low: "text-sky-700 [[data-theme=dark]_&]:text-sky-400",
  medium: "text-amber-700 [[data-theme=dark]_&]:text-amber-400",
  high: "text-orange-700 [[data-theme=dark]_&]:text-orange-400",
  xhigh: "text-orange-700 [[data-theme=dark]_&]:text-orange-400",
  max: "text-red-700 [[data-theme=dark]_&]:text-red-400",
  ultra: "text-fuchsia-700 [[data-theme=dark]_&]:text-fuchsia-400",
  adaptive: "text-indigo-700 [[data-theme=dark]_&]:text-indigo-400",
};

function effortKey(value: string): EffortLevel | undefined {
  const key = value.trim().toLowerCase();
  if (key in EFFORT_LEVEL_ICONS) return key as EffortLevel;
  return undefined;
}

/** Battery glyph for a known effort value. */
export function effortLevelIcon(value: string): StaticIconComponent | undefined {
  const key = effortKey(value);
  return key ? EFFORT_LEVEL_ICONS[key] : undefined;
}

/** Tone text-color class for an effort value, or undefined when unknown. */
export function effortLevelColor(value: string): string | undefined {
  const key = effortKey(value);
  return key ? EFFORT_LEVEL_COLOR[key] : undefined;
}

/** Display label for known and future effort values. */
export function effortLevelLabel(value: string): string {
  const normalized = value.trim();
  const key = effortKey(normalized);
  if (key) return EFFORT_LEVEL_LABELS[key];
  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
}
