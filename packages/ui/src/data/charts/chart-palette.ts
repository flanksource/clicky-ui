/**
 * The Flanksource categorical chart palette, promoted from the playground's
 * design-system page (`apps/playground/src/design-system/patterns/dataviz-palette.ts`,
 * which holds the validator provenance: worst adjacent CVD ΔE 9.4, every slot
 * ≥ 3:1 on both #ffffff and #030712).
 *
 * The order is load-bearing: emerald and rose are kept three slots apart
 * because adjacent they fail deuteranopia (ΔE 5.8).
 */
export const CHART_PALETTE = [
  { index: 1, hue: "sky", hex: "#0284c7" },
  { index: 2, hue: "amber", hex: "#d97706" },
  { index: 3, hue: "rose", hex: "#e11d48" },
  { index: 4, hue: "violet", hex: "#7c3aed" },
  { index: 5, hue: "emerald", hex: "#059669" },
  { index: 6, hue: "indigo", hex: "#6366f1" },
  { index: 7, hue: "teal", hex: "#0d9488" },
] as const;

/**
 * The `--chart-N` token for a 0-based series index, with the validated hex as
 * the fallback so a render without the theme CSS (a PDF, an email) still has
 * colour. Cycles past the seventh slot.
 */
export function chartColor(index: number): string {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error(`chartColor: index must be a non-negative integer, got ${index}`);
  }
  const slot = CHART_PALETTE[index % CHART_PALETTE.length]!;
  return `var(--chart-${slot.index}, ${slot.hex})`;
}

/**
 * Non-data ink. Each reads the playground's chart token first, then the
 * clicky-ui theme token, then a literal, so it resolves with or without CSS.
 */
export const CHART_INK = {
  text: "var(--foreground, #111827)",
  axis: "var(--chart-axis, var(--muted-foreground, #6b7280))",
  grid: "var(--chart-grid, var(--border, #e5e7eb))",
  surface: "var(--background, #ffffff)",
  /** The folded "Other" bar: neutral, because it is not one of the series. */
  other: "var(--muted-foreground, #6b7280)",
} as const;

export const CHART_FONT_SIZE = 11;
