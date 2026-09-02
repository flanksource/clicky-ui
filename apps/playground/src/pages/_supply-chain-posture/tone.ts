/**
 * What colour a posture value earns.
 *
 * Every hue comes from `_supply-chain-threat-icons/palette.ts` — the same
 * `CATEGORY_STYLES` the icon catalogue publishes — so a chip on this page means
 * what the legend there says it means. No new colours are defined here; only the
 * mapping from a posture value to a category is new.
 *
 * The rule that matters: grey is the colour of *nothing observed*, and it is never
 * used for "fine". A control the register never recorded, and a check the tool
 * could not conclude, are both grey; a control observed off is red.
 */

import type { ThreatCategory } from "../_supply-chain-threat-icons/catalog";
import { CATEGORY_STYLES } from "../_supply-chain-threat-icons/palette";
import type { ControlState, FindingSeverity } from "./fixture";

/** Severity keeps the icon set's own ramp, so a High here is the High everywhere. */
export const SEVERITY_CATEGORY: Record<FindingSeverity, ThreatCategory> = {
  critical: "threat",
  high: "high",
  medium: "medium",
  low: "audit",
};

export const STATE_CATEGORY: Record<ControlState, ThreatCategory> = {
  enabled: "control",
  reporting: "control",
  disabled: "threat",
  not_recorded: "neutral",
};

export const STATE_LABEL: Record<ControlState, string> = {
  enabled: "Enabled",
  reporting: "Reporting",
  disabled: "Disabled",
  not_recorded: "Not assessed",
};

/**
 * A score's band. An inconclusive check is `neutral`, not a failure: Scorecard
 * recording "no releases found" is an absence of subject, and painting it red
 * would report a control failure nobody observed.
 */
export function scoreCategory(
  score: number | null,
  max: number,
): ThreatCategory {
  if (score === null) return "neutral";
  const share = max === 0 ? 0 : score / max;
  if (share >= 0.8) return "control";
  if (share >= 0.5) return "medium";
  if (share >= 0.25) return "high";
  return "threat";
}

/** Chip classes — background, text and ring — for a category. */
export function chipClass(category: ThreatCategory): string {
  return CATEGORY_STYLES[category].soft;
}

export function severityChip(severity: FindingSeverity): string {
  return chipClass(SEVERITY_CATEGORY[severity]);
}
