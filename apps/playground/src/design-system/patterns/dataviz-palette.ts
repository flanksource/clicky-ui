/**
 * The Flanksource chart palette — validated, not chosen by eye.
 *
 * ## Why this file exists
 *
 * clicky-ui's chart components already reference `--chart-1` … `--chart-4`
 * (`data/TimeseriesPanel.model.ts:61`, `data/ProgressBar.test.tsx`,
 * `lib/color.ts`), and **nothing defines them**. There is no `--chart-*` in
 * `styles/tokens.css`, `styles/fs-tokens.css` or `tailwind-preset.ts`, so every
 * TimeseriesPanel in production silently falls back to the hardcoded hexes in
 * the `var(--chart-N, #......)` defaults. A themed chart palette does not exist
 * to borrow — `_recon/spark.tsx` says so in its own header and works around it
 * with `currentColor`.
 *
 * So this is not a new colour scheme layered over a working one. It is the
 * missing definition, and the numbers below say why it is worth adopting.
 *
 * ## Provenance
 *
 * Validated with the data-viz skill's `scripts/validate_palette.js` against
 * both Flanksource surfaces — `--fs-bg-canvas` is `#ffffff` light and `#030712`
 * dark:
 *
 *   light  ALL PASS — worst adjacent CVD ΔE 9.4 (deutan), normal-vision 16.6,
 *                     all seven ≥ 3:1 on white
 *   dark   ALL PASS — same seven hexes, all inside the dark L band 0.48–0.67,
 *                     all ≥ 3:1 on #030712
 *
 * The four hexes shipping today (`#3b82f6, #ef4444, #10b981, #f59e0b`) pass the
 * hard gates but carry two sub-3:1 contrast WARNs on white (emerald 2.54, amber
 * 2.15) and sit at CVD ΔE 8.1, barely over the 8 target. The seven below clear
 * both with room, and need no separate dark set.
 *
 * ## Order is load-bearing
 *
 * Hues are assigned in this fixed order and **never cycled** — an eighth series
 * folds into "Other", small multiples, or a facet. Two adjacencies are the
 * reason the order looks arbitrary and is not:
 *
 *   - emerald next to rose scores CVD ΔE 5.8 — a hard FAIL, the classic
 *     red/green confusion. They are three slots apart here.
 *   - amber next to emerald scores 7.9, inside the 6–8 band that is legal only
 *     with secondary encoding. Also separated.
 *
 * `dataviz-palette.test.ts` asserts both, so a future re-order cannot quietly
 * reintroduce either.
 *
 * ## Relationship to _shared/hues.ts
 *
 * These are the same seven hue *names* that `_shared/hues.ts` already uses to
 * classify a kind of thing, minus `slate` — which fails the chroma floor
 * (OKLCH C 0.041, reads as grey) and is therefore the one hue that must never
 * be a series. That is a feature: slate stays available for "unclassified"
 * everywhere, precisely because no chart will ever spend it.
 */

export type ChartSlot = {
  /** 1-based, matching the `--chart-N` custom property. */
  index: number;
  hue: string;
  hex: string;
  /** Why this slot sits where it does, where the position is load-bearing. */
  note?: string;
};

/**
 * The categorical theme. One set of hexes for both modes — unusual, and only
 * possible because these steps land inside the light band (0.43–0.77) and the
 * dark band (0.48–0.67) at once.
 */
export const CATEGORICAL: readonly ChartSlot[] = [
  { index: 1, hue: "sky", hex: "#0284c7", note: "First series. Nearest the brand blue without being it." },
  { index: 2, hue: "amber", hex: "#d97706" },
  { index: 3, hue: "rose", hex: "#e11d48", note: "Adjacent to amber at CVD ΔE 9.4 — the worst adjacency in the set, and still clear of the 8 target." },
  { index: 4, hue: "violet", hex: "#7c3aed" },
  { index: 5, hue: "emerald", hex: "#059669", note: "Kept three slots from rose: adjacent, that pair scores 5.8 and fails outright." },
  { index: 6, hue: "indigo", hex: "#6366f1" },
  { index: 7, hue: "teal", hex: "#0d9488" },
];

/** Pairs that must never become adjacent, with the score that disqualifies them. */
export const FORBIDDEN_ADJACENCIES: readonly { a: string; b: string; deltaE: number; verdict: string }[] = [
  { a: "emerald", b: "rose", deltaE: 5.8, verdict: "FAIL — below the 6 floor for deuteranopia" },
  { a: "amber", b: "emerald", deltaE: 7.9, verdict: "WARN — inside the 6–8 band, legal only with secondary encoding" },
];

/**
 * Sequential ramp: one hue, light to dark, for magnitude.
 *
 * Never a rainbow. Lightness is monotonic, which is the only check a sequential
 * ramp has to pass — the categorical checks would fail it by design, because it
 * deliberately spans the lightness band.
 */
export const SEQUENTIAL: readonly string[] = [
  "#e0f2fe",
  "#bae6fd",
  "#7dd3fc",
  "#38bdf8",
  "#0ea5e9",
  "#0284c7",
  "#0369a1",
  "#075985",
];

/**
 * Diverging ramp: two hues around a NEUTRAL GREY midpoint, for polarity.
 *
 * Rose and sky rather than red and green — a red/green diverging scale is
 * unreadable for the most common colour-vision deficiency, and polarity is
 * exactly the case where being unable to tell the poles apart is fatal.
 */
export const DIVERGING: readonly string[] = [
  "#be123c",
  "#f43f5e",
  "#fda4af",
  "#e5e7eb",
  "#7dd3fc",
  "#0ea5e9",
  "#0369a1",
];

export type StatusLevel = "good" | "warning" | "serious" | "critical";

/**
 * Status colours, aliased to the Flanksource semantic tokens rather than
 * reinvented.
 *
 * These overlap the categorical theme on purpose — both draw from the same
 * ramps, and inventing a second emerald so the two never collide would give the
 * design system two greens that mean different things, which is worse. The rule
 * that makes the overlap safe is absolute: **a status mark always ships with an
 * icon and a label, never colour alone.** A red carrying a siren and the word
 * "critical" is not confusable with a red that is simply series 3.
 */
export const STATUS: Record<StatusLevel, { hex: string; token: string; meaning: string }> = {
  good: { hex: "#059669", token: "--fs-success", meaning: "Observed healthy." },
  warning: { hex: "#d97706", token: "--fs-warning", meaning: "Attention without failure." },
  serious: { hex: "#ea580c", token: "—", meaning: "Degraded. The one level with no fs token yet." },
  critical: { hex: "#e11d48", token: "--fs-error", meaning: "Failing now." },
};

/** The chart surfaces the palette was validated against. */
export const SURFACES = {
  light: { hex: "#ffffff", token: "--fs-bg-canvas" },
  dark: { hex: "#030712", token: "--fs-bg-canvas" },
} as const;

/** What ships today, kept so the comparison on the page stays checkable. */
export const INCUMBENT: readonly string[] = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];

export function chartVar(index: number): string {
  return `var(--chart-${index})`;
}
