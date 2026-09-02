/**
 * WCAG 2.1 contrast, so a palette is disqualified by a number rather than by
 * taste.
 *
 * A cyber-noc palette is the easiest kind to get wrong: near-black canvases
 * flatter every accent, and a cyan that looks electric on #06090F can still be
 * illegible as body text. Judging the candidates by eye alone reliably picks
 * the one with the most contrast *between hues* and the least contrast against
 * the canvas. The ratios here are what stop that.
 *
 * Formula is the spec's own — relative luminance with the sRGB transfer curve,
 * then `(lighter + 0.05) / (darker + 0.05)`.
 */

export type WcagGrade = "AAA" | "AA" | "AA-large" | "fail";

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Parses `#rgb` or `#rrggbb` to three 0-255 channels.
 *
 * Throws rather than defaulting: a typo in a palette table would otherwise
 * silently score as black and make a broken candidate look like the highest
 * contrast one on the page.
 */
function channels(hex: string): [number, number, number] {
  if (!HEX.test(hex)) {
    throw new Error(`contrast: "${hex}" is not a #rgb or #rrggbb colour`);
  }
  const body = hex.slice(1);
  const full =
    body.length === 3
      ? body
          .split("")
          .map((digit) => digit + digit)
          .join("")
      : body;
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
}

function linearize(value: number): number {
  const srgb = value / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = channels(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** Contrast ratio between two colours, 1 (identical) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * The grade a ratio earns for normal-weight body text.
 *
 * `AA-large` is called out separately rather than folded into `fail` because it
 * is the correct bar for a chip label or a 24px heading — a token scoring 3.4
 * is usable in some roles and not others, and collapsing that to "fail" would
 * reject a workable accent.
 */
export function wcagGrade(ratio: number): WcagGrade {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA-large";
  return "fail";
}
