// FieldTone is the closed colour vocabulary a schema may name via `x-enum-tones`
// to give an enum value its own hue (e.g. a parameter's type). It extends the
// `IconTone` union in ../data/Icon with the two extra hues a six-value enum needs,
// so the two vocabularies read as one system.
//
// The class strings below are written out IN FULL and never composed. Tailwind
// scans source text, so `bg-${tone}-100` would emit nothing — and a tone name
// arriving from a consumer's JSON schema is data the scanner never sees at all.
// Every entry carries a `dark:` variant; the clicky-ui preset binds `dark:` to
// [data-theme="dark"], so tones track the theme switcher rather than the OS.
export type FieldTone =
  | "neutral"
  | "slate"
  | "violet"
  | "amber"
  | "sky"
  | "teal"
  | "indigo"
  | "emerald"
  | "rose";

const TONES: readonly FieldTone[] = [
  "neutral",
  "slate",
  "violet",
  "amber",
  "sky",
  "teal",
  "indigo",
  "emerald",
  "rose",
];

// Soft filled tile + inset ring — the accordion's leading glyph and enum chip.
export const TONE_GLYPH_CLASS: Record<FieldTone, string> = {
  neutral: "bg-muted text-muted-foreground ring-border",
  slate:
    "bg-slate-100 text-slate-700 ring-slate-300/60 dark:bg-slate-400/10 dark:text-slate-300 dark:ring-slate-400/25",
  violet:
    "bg-violet-100 text-violet-700 ring-violet-300/60 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/25",
  amber:
    "bg-amber-100 text-amber-800 ring-amber-300/60 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25",
  sky: "bg-sky-100 text-sky-700 ring-sky-300/60 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/25",
  teal: "bg-teal-100 text-teal-700 ring-teal-300/60 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/25",
  indigo:
    "bg-indigo-100 text-indigo-700 ring-indigo-300/60 dark:bg-indigo-400/10 dark:text-indigo-300 dark:ring-indigo-400/25",
  emerald:
    "bg-emerald-100 text-emerald-700 ring-emerald-300/60 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25",
  rose: "bg-rose-100 text-rose-700 ring-rose-300/60 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/25",
};

// Left border accent — a stack of items is scannable by hue before you read it.
export const TONE_EDGE_CLASS: Record<FieldTone, string> = {
  neutral: "border-l-border dark:border-l-border",
  slate: "border-l-slate-400 dark:border-l-slate-500",
  violet: "border-l-violet-400 dark:border-l-violet-500",
  amber: "border-l-amber-400 dark:border-l-amber-500",
  sky: "border-l-sky-400 dark:border-l-sky-500",
  teal: "border-l-teal-400 dark:border-l-teal-500",
  indigo: "border-l-indigo-400 dark:border-l-indigo-500",
  emerald: "border-l-emerald-400 dark:border-l-emerald-500",
  rose: "border-l-rose-400 dark:border-l-rose-500",
};

// Solid dot — the compact legend/rail marker.
export const TONE_DOT_CLASS: Record<FieldTone, string> = {
  neutral: "bg-muted-foreground dark:bg-muted-foreground",
  slate: "bg-slate-400 dark:bg-slate-500",
  violet: "bg-violet-400 dark:bg-violet-500",
  amber: "bg-amber-400 dark:bg-amber-500",
  sky: "bg-sky-400 dark:bg-sky-500",
  teal: "bg-teal-400 dark:bg-teal-500",
  indigo: "bg-indigo-400 dark:bg-indigo-500",
  emerald: "bg-emerald-400 dark:bg-emerald-500",
  rose: "bg-rose-400 dark:bg-rose-500",
};

export function isFieldTone(value: unknown): value is FieldTone {
  return typeof value === "string" && (TONES as readonly string[]).includes(value);
}

// normalizeTone coerces an unvalidated schema value to a known tone. A tone is
// pure decoration, so an unrecognised one falls back to neutral rather than
// failing the render.
export function normalizeTone(value: unknown): FieldTone {
  return isFieldTone(value) ? value : "neutral";
}

export function fieldToneNames(): readonly FieldTone[] {
  return TONES;
}
