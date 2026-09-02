/**
 * The severity vocabulary these pages share — one owner.
 *
 * Recon has **six** severities. clicky-ui's `BadgeStatus` has four
 * (`success | error | warning | info`), so `DataTable`'s built-in
 * `kind: "status"` column cannot render this scale without folding `critical`
 * and `high` into one indistinguishable dot. Every severity column here
 * therefore supplies its own `render` and `sortValue`. That is a real gap in
 * the library rather than a quirk of this fixture, and the pages say so.
 *
 * The ramp is recon's own, carried over from `app/src/scanColumns.tsx` so a
 * finding that is amber in the shipped UI is not indigo in the mockups.
 *
 * Class strings are written out in full and never composed: Tailwind's scanner
 * only emits what it can read literally. `dark:` is bound to
 * `[data-theme="dark"]` by the clicky-ui preset, so these follow the theme
 * switcher rather than the OS.
 */

export const SEVERITIES = ["critical", "high", "medium", "low", "info", "unknown"] as const;

export type Severity = (typeof SEVERITIES)[number];

/** Display and sort order. Lower is worse. */
export const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
  unknown: 5,
};

export type SeverityClasses = {
  /** Filled pill: background, text and ring. */
  chip: string;
  /** Left edge accent for a row or card. */
  edge: string;
  /** Bare status dot. */
  dot: string;
  /** Solid fill for a proportional bar segment. */
  bar: string;
  /** Text colour for a leading glyph on the page background. */
  glyph: string;
};

export const SEVERITY_CLASSES: Record<Severity, SeverityClasses> = {
  critical: {
    chip: "bg-red-100 text-red-700 ring-red-300/60 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-400/25",
    edge: "border-l-red-600",
    dot: "bg-red-600",
    bar: "bg-red-600",
    glyph: "text-red-600 dark:text-red-400",
  },
  high: {
    chip: "bg-orange-100 text-orange-700 ring-orange-300/60 dark:bg-orange-500/15 dark:text-orange-300 dark:ring-orange-400/25",
    edge: "border-l-orange-500",
    dot: "bg-orange-500",
    bar: "bg-orange-500",
    glyph: "text-orange-600 dark:text-orange-400",
  },
  medium: {
    chip: "bg-amber-100 text-amber-700 ring-amber-300/60 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/25",
    edge: "border-l-amber-500",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    glyph: "text-amber-600 dark:text-amber-400",
  },
  low: {
    chip: "bg-sky-100 text-sky-700 ring-sky-300/60 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-400/25",
    edge: "border-l-sky-500",
    dot: "bg-sky-500",
    bar: "bg-sky-500",
    glyph: "text-sky-600 dark:text-sky-400",
  },
  info: {
    chip: "bg-neutral-100 text-neutral-600 ring-neutral-300/60 dark:bg-neutral-400/15 dark:text-neutral-300 dark:ring-neutral-400/25",
    edge: "border-l-neutral-400",
    dot: "bg-neutral-400",
    bar: "bg-neutral-400",
    glyph: "text-neutral-500 dark:text-neutral-400",
  },
  unknown: {
    chip: "bg-neutral-100 text-neutral-500 ring-neutral-200/60 dark:bg-neutral-500/10 dark:text-neutral-400 dark:ring-neutral-500/20",
    edge: "border-l-neutral-300",
    dot: "bg-neutral-300",
    bar: "bg-neutral-300",
    glyph: "text-neutral-400 dark:text-neutral-500",
  },
};

export type SeverityCounts = Record<Severity, number>;

export function emptyCounts(): SeverityCounts {
  return { critical: 0, high: 0, medium: 0, low: 0, info: 0, unknown: 0 };
}

export function severityRank(value: string): number {
  return SEVERITY_RANK[value as Severity] ?? SEVERITY_RANK.unknown;
}

export function isSeverity(value: string): value is Severity {
  return value in SEVERITY_RANK;
}

/**
 * The worst severity in a list, or `unknown` for an empty one.
 *
 * `unknown` is deliberately its own level rather than an alias for `info`: a
 * check whose severity recon could not parse is not a check it decided was
 * harmless, and a rollup that quietly downgrades one to the other hides the
 * parse failure behind a reassuring colour.
 */
export function worstSeverity(values: readonly { severity: Severity }[]): Severity {
  return values.reduce<Severity>(
    (worst, item) => (severityRank(item.severity) < severityRank(worst) ? item.severity : worst),
    "unknown",
  );
}
