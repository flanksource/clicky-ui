/** The five GitHub alert tones — the same set `> [!NOTE]` markdown produces. */
export const CALLOUT_TONES = ["note", "tip", "important", "warning", "caution"] as const;

/** The tones plus the untinted aside. */
export const CALLOUT_VARIANTS = [...CALLOUT_TONES, "default"] as const;

export type CalloutTone = (typeof CALLOUT_TONES)[number];
export type CalloutVariant = (typeof CALLOUT_VARIANTS)[number];

export interface CalloutVariantStyle {
  accent: string;
  emphasis: string;
  subtle: string;
  badge: string;
  label: string;
  source: string;
  icon: string;
  title: string;
  content: string;
}

/**
 * Tone styles.
 *
 * Every class is a literal string. Tailwind scans source text for class names,
 * so a built name like `bg-${tone}-50` is never generated and the callout
 * renders untinted while claiming a tone.
 *
 * `accent`, `emphasis` and `subtle` are alternatives, not layers: the left rule
 * is the default treatment, a full 2px border replaces it for blocking
 * callouts, and `subtle` is the hairline card other renderers draw.
 */
const VARIANT_STYLES: Record<CalloutVariant, CalloutVariantStyle> = {
  note: {
    accent: "border-l-[3px] border-l-blue-500 bg-blue-500/5 rounded-r",
    emphasis: "border-2 border-blue-500 bg-blue-500/10 rounded",
    subtle: "border-blue-500/30 bg-blue-500/5",
    badge: "bg-blue-600 text-white",
    label: "text-blue-700 dark:text-blue-300",
    source: "text-blue-600/70 dark:text-blue-300/70",
    icon: "text-blue-600 dark:text-blue-400",
    title: "text-blue-900 dark:text-blue-100",
    content: "text-blue-950/90 dark:text-blue-100/90",
  },
  tip: {
    accent: "border-l-[3px] border-l-emerald-500 bg-emerald-500/5 rounded-r",
    emphasis: "border-2 border-emerald-500 bg-emerald-500/10 rounded",
    subtle: "border-emerald-500/30 bg-emerald-500/5",
    badge: "bg-emerald-600 text-white",
    label: "text-emerald-700 dark:text-emerald-300",
    source: "text-emerald-600/70 dark:text-emerald-300/70",
    icon: "text-emerald-600 dark:text-emerald-400",
    title: "text-emerald-900 dark:text-emerald-100",
    content: "text-emerald-950/90 dark:text-emerald-100/90",
  },
  important: {
    accent: "border-l-[3px] border-l-purple-500 bg-purple-500/5 rounded-r",
    emphasis: "border-2 border-purple-500 bg-purple-500/10 rounded",
    subtle: "border-purple-500/30 bg-purple-500/5",
    badge: "bg-purple-600 text-white",
    label: "text-purple-700 dark:text-purple-300",
    source: "text-purple-600/70 dark:text-purple-300/70",
    icon: "text-purple-600 dark:text-purple-400",
    title: "text-purple-900 dark:text-purple-100",
    content: "text-purple-950/90 dark:text-purple-100/90",
  },
  warning: {
    accent: "border-l-[3px] border-l-amber-500 bg-amber-500/10 rounded-r",
    emphasis: "border-2 border-amber-500 bg-amber-500/15 rounded",
    subtle: "border-amber-500/40 bg-amber-500/10",
    badge: "bg-amber-600 text-white",
    label: "text-amber-700 dark:text-amber-300",
    source: "text-amber-600/70 dark:text-amber-300/70",
    icon: "text-amber-600 dark:text-amber-400",
    title: "text-amber-900 dark:text-amber-100",
    content: "text-amber-950/90 dark:text-amber-100/90",
  },
  caution: {
    accent: "border-l-[3px] border-l-red-500 bg-red-500/5 rounded-r",
    emphasis: "border-2 border-red-500 bg-red-500/10 rounded",
    subtle: "border-red-500/40 bg-red-500/10",
    badge: "bg-red-600 text-white",
    label: "text-red-700 dark:text-red-300",
    source: "text-red-600/70 dark:text-red-300/70",
    icon: "text-red-600 dark:text-red-400",
    title: "text-red-900 dark:text-red-100",
    content: "text-red-950/90 dark:text-red-100/90",
  },
  default: {
    accent: "border-l-[3px] border-l-border bg-muted/30 rounded-r",
    emphasis: "border-2 border-border bg-muted/50 rounded",
    subtle: "border-border bg-muted/30",
    badge: "bg-foreground text-background",
    label: "text-foreground",
    source: "text-muted-foreground",
    icon: "text-muted-foreground",
    title: "text-foreground",
    content: "text-muted-foreground",
  },
};

/** Header-row text matching what the markdown plugin writes for each tone. */
export const CALLOUT_VARIANT_LABELS: Record<CalloutVariant, string> = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution",
  default: "",
};

/**
 * The tone table, for other renderers that need to speak the same visual
 * language. `ClickyAdmonition` maps its severity vocabulary onto this rather
 * than carrying a second table.
 */
export function calloutVariantStyles(variant: CalloutVariant): CalloutVariantStyle {
  return VARIANT_STYLES[variant];
}

/**
 * A misspelled tone would otherwise fall through to the untinted default and
 * quietly downgrade a blocking gap into a grey aside. Callouts are authored in
 * committed source, so a typo is a defect to surface, not to absorb.
 */
export function assertCalloutValue<T extends string>(
  allowed: readonly T[],
  value: string,
  attribute: string,
): T {
  if (!(allowed as readonly string[]).includes(value)) {
    throw new Error(`Unknown Callout ${attribute} "${value}" — expected one of: ${allowed.join(", ")}`);
  }
  return value as T;
}
