/**
 * What colour a reconctl value earns.
 *
 * Severity is **not** redefined here. `_recon/severity.ts` already owns that
 * ramp and every recon page draws from it, so this module imports it and adds
 * only the tones severity does not cover. A design system that restates a ramp
 * it does not own is a second opinion waiting to drift.
 *
 * The five additions exist because recon has axes severity cannot express:
 *
 *   action   cyan    — the thing is happening now, or you can click it
 *   chrome   violet  — structural identity: which entity, which engine, which kind
 *   healthy  emerald — an OBSERVED pass
 *   absent   dashed  — nothing was observed
 *   (unknown comes from the severity ramp: a value recon could not classify)
 *
 * ## The rule that matters
 *
 * **Emerald means observed, never inferred.** recon's Prowler integration drops
 * `PASS` records before they are written, so an account with no findings and an
 * account that was never scanned are the same absence (`_recon/resources.ts`
 * says this at length). Painting either one green reports a control nobody saw.
 * That is why `absent` is a dashed outline rather than a colour: it has to look
 * like a missing answer, not a good one.
 *
 * `unknown` and `absent` are deliberately different. `unknown` is filled grey —
 * there is a value and recon could not classify it. `absent` is a dashed
 * outline — there is no value at all. Collapsing the two hides parse failures
 * behind "nothing here".
 *
 * Class strings are written out in full and never composed: Tailwind's scanner
 * only emits what it can read literally. `dark:` is bound to
 * `[data-theme="dark"]` by the clicky-ui preset, so these follow the theme
 * switcher rather than the OS.
 */

import { SEVERITY_CLASSES, isSeverity, type Severity, type SeverityClasses } from "../_recon/severity";

/** The tones reconctl adds on top of the severity ramp. */
export type ExtraTone = "action" | "chrome" | "healthy" | "absent";

export type Tone = Severity | ExtraTone;

export const EXTRA_TONES: readonly ExtraTone[] = ["action", "chrome", "healthy", "absent"];

const EXTRA_CLASSES: Record<ExtraTone, SeverityClasses> = {
  action: {
    chip: "bg-cyan-100 text-cyan-700 ring-cyan-300/60 dark:bg-cyan-400/10 dark:text-cyan-300 dark:ring-cyan-400/25",
    edge: "border-l-cyan-500",
    dot: "bg-cyan-500",
    bar: "bg-cyan-500",
    glyph: "text-cyan-600 dark:text-cyan-400",
  },
  chrome: {
    chip: "bg-violet-100 text-violet-700 ring-violet-300/60 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/25",
    edge: "border-l-violet-500",
    dot: "bg-violet-500",
    bar: "bg-violet-500",
    glyph: "text-violet-600 dark:text-violet-400",
  },
  healthy: {
    chip: "bg-emerald-100 text-emerald-700 ring-emerald-300/60 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25",
    edge: "border-l-emerald-500",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    glyph: "text-emerald-600 dark:text-emerald-400",
  },
  // A dashed outline rather than a fill: an absence has to read as a missing
  // answer, not as a quiet one. `ring-transparent` neutralises the `ring-1
  // ring-inset` the chip component applies, leaving the dashed border alone.
  absent: {
    chip: "border border-dashed border-border bg-transparent text-muted-foreground ring-transparent",
    edge: "border-l-border",
    dot: "bg-transparent ring-1 ring-border",
    bar: "bg-muted",
    glyph: "text-muted-foreground",
  },
};

export function isExtraTone(value: string): value is ExtraTone {
  return value in EXTRA_CLASSES;
}

/**
 * The classes for a tone, delegating the severity levels to their owner.
 *
 * Throws on an unknown tone rather than falling back to neutral: a typo would
 * otherwise render as a plausible grey chip and quietly mean "nothing
 * observed", which is the one meaning this palette must never invent.
 */
export function toneClasses(tone: Tone): SeverityClasses {
  if (isSeverity(tone)) return SEVERITY_CLASSES[tone];
  if (isExtraTone(tone)) return EXTRA_CLASSES[tone];
  throw new Error(`reconctl: unknown tone "${tone}"`);
}

export function chipClass(tone: Tone): string {
  return toneClasses(tone).chip;
}

export function glyphClass(tone: Tone): string {
  return toneClasses(tone).glyph;
}

/** What each added tone signals, for the design-system legend. */
export const EXTRA_TONE_MEANING: Record<ExtraTone, string> = {
  action: "Happening now, or something you can click. The only interactive hue.",
  chrome: "Structural identity — which entity, engine or kind. Never a state.",
  healthy: "An observed pass. Never used for an absence of findings.",
  absent: "Nothing was observed. Distinct from unknown, which is an unclassifiable value.",
};
