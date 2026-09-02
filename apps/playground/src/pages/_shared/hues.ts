/**
 * The colour vocabulary the artifacts share when they classify a *kind* of
 * thing — a param type, a column type, a filter control.
 *
 * One table rather than one per page: `fields-grid` and `field-pane` are
 * mockups of two halves of the same editor, and a `number` that is violet in
 * one and indigo in the other teaches the reader something false.
 *
 * Class strings are written out in full and never composed, because Tailwind's
 * scanner only emits what it can read literally. `dark:` is bound to
 * `[data-theme="dark"]` by the clicky-ui preset, so these track the theme
 * switcher rather than the OS.
 */

export type Hue = "slate" | "violet" | "amber" | "sky" | "teal" | "indigo" | "rose" | "emerald";

export type HueClasses = {
  /** Filled pill: background, text and ring. */
  chip: string;
  /** Left edge accent for a row or card. */
  edge: string;
  /** Bare status dot. */
  dot: string;
  /** Text colour for a leading glyph sitting on the page background. */
  glyph: string;
};

export const HUES: Record<Hue, HueClasses> = {
  slate: {
    chip: "bg-slate-100 text-slate-700 ring-slate-300/60 dark:bg-slate-400/10 dark:text-slate-300 dark:ring-slate-400/25",
    edge: "border-l-slate-400",
    dot: "bg-slate-400",
    glyph: "text-slate-500 dark:text-slate-400",
  },
  violet: {
    chip: "bg-violet-100 text-violet-700 ring-violet-300/60 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/25",
    edge: "border-l-violet-400",
    dot: "bg-violet-400",
    glyph: "text-violet-500 dark:text-violet-400",
  },
  amber: {
    chip: "bg-amber-100 text-amber-800 ring-amber-300/60 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25",
    edge: "border-l-amber-400",
    dot: "bg-amber-400",
    glyph: "text-amber-600 dark:text-amber-400",
  },
  sky: {
    chip: "bg-sky-100 text-sky-700 ring-sky-300/60 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/25",
    edge: "border-l-sky-400",
    dot: "bg-sky-400",
    glyph: "text-sky-500 dark:text-sky-400",
  },
  teal: {
    chip: "bg-teal-100 text-teal-700 ring-teal-300/60 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/25",
    edge: "border-l-teal-400",
    dot: "bg-teal-400",
    glyph: "text-teal-500 dark:text-teal-400",
  },
  indigo: {
    chip: "bg-indigo-100 text-indigo-700 ring-indigo-300/60 dark:bg-indigo-400/10 dark:text-indigo-300 dark:ring-indigo-400/25",
    edge: "border-l-indigo-400",
    dot: "bg-indigo-400",
    glyph: "text-indigo-500 dark:text-indigo-400",
  },
  rose: {
    chip: "bg-rose-100 text-rose-700 ring-rose-300/60 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/25",
    edge: "border-l-rose-400",
    dot: "bg-rose-400",
    glyph: "text-rose-500 dark:text-rose-400",
  },
  emerald: {
    chip: "bg-emerald-100 text-emerald-700 ring-emerald-300/60 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25",
    edge: "border-l-emerald-400",
    dot: "bg-emerald-400",
    glyph: "text-emerald-600 dark:text-emerald-400",
  },
};

/** What an unclassified thing gets: the theme's own muted tokens, so it reads
 *  as "no answer yet" rather than as a colour that means something. */
export const NEUTRAL_HUE: HueClasses = {
  chip: "bg-muted text-muted-foreground ring-border",
  edge: "border-l-border",
  dot: "bg-muted-foreground",
  glyph: "text-muted-foreground",
};
