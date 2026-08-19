import type { ReactNode } from "react";
import {
  UiInfo,
  UiLightbulb,
  UiSpeaker,
  UiStop,
  UiWarningTriangle,
} from "../icons";
import { cn } from "../lib/utils";
import {
  assertCalloutValue,
  CALLOUT_TONES,
  CALLOUT_VARIANT_LABELS,
  CALLOUT_VARIANTS,
  calloutVariantStyles,
  type CalloutTone,
  type CalloutVariant,
} from "./callout-tones";

export interface CalloutProps {
  /** Content to display inside the callout. */
  children?: ReactNode | undefined;
  /**
   * Visual variant. The five named tones are the same set `> [!NOTE]` markdown
   * produces, and render identically to it.
   */
  variant?: CalloutVariant | undefined;
  /** Inline label in the header row. Defaults to the variant's own name. */
  label?: string | undefined;
  /**
   * Glyph to draw, named independently of `variant`. Defaults to the variant's
   * own icon. Set it when the colour and the symbol need to say different
   * things — an amber "TODO" that reads as a question, say — or to give an
   * untinted `default` callout an icon it would otherwise not draw.
   */
  icon?: CalloutTone | undefined;
  /** Leading identifier chip, e.g. an annotation number or a control ref. */
  badge?: string | undefined;
  /** Muted trailing attribution, e.g. a reviewer or source name. */
  source?: string | undefined;
  /**
   * Heavier full-border treatment, for callouts that block rather than inform.
   * Accepts the string forms `rehype-raw` produces when a callout is authored
   * as raw JSX in markdown (`""`, `"true"`, `"false"`).
   */
  emphasis?: boolean | string | undefined;
  /** Optional block title above the body. */
  title?: string | undefined;
  /** Optional CSS class name. */
  className?: string | undefined;
}

const TONE_ICONS = {
  note: UiInfo,
  tip: UiLightbulb,
  important: UiSpeaker,
  warning: UiWarningTriangle,
  caution: UiStop,
} as const satisfies Record<CalloutTone, unknown>;

/**
 * An emphasised aside. The five named tones mirror GitHub's alert types, so a
 * document can use `<CalloutBox variant="caution">` in MDX and `> [!CAUTION]`
 * in plain markdown and get the same box either way.
 *
 * @example
 * ```tsx
 * <Callout variant="note" title="Retention">
 *   Logs are held for 90 days.
 * </Callout>
 *
 * // Annotation style: identifier, tone label and attribution on one row
 * <Callout variant="caution" badge="N14" label="Correction" source="Reviewer">
 *   The two enforcement checks cannot be implemented as written.
 * </Callout>
 *
 * // Label and glyph chosen independently of the tone
 * <Callout variant="warning" label="TODO" icon="important">
 *   Run the first tabletop exercise and retain the record.
 * </Callout>
 * ```
 */
export function Callout({
  children,
  variant = "default",
  label,
  badge,
  source,
  icon,
  emphasis = false,
  title,
  className,
}: CalloutProps) {
  const tone = assertCalloutValue(CALLOUT_VARIANTS, variant, "variant");
  const glyphName = icon === undefined ? undefined : assertCalloutValue(CALLOUT_TONES, icon, "icon");
  const styles = calloutVariantStyles(tone);
  const heavy = emphasis !== false && emphasis !== "false";

  // An unlabelled `default` callout has nothing to put on the header row, so it
  // stays a plain aside rather than growing an empty bar above its text.
  const labelText = label ?? CALLOUT_VARIANT_LABELS[tone];
  // `default` draws no glyph of its own, but an explicit `icon` still earns one.
  const glyph = glyphName ?? (tone === "default" ? undefined : tone);
  const Glyph = glyph && TONE_ICONS[glyph];

  return (
    <div className={cn("not-prose my-4 p-density-3", heavy ? styles.emphasis : styles.accent, className)}>
      {Boolean(badge || labelText || source || Glyph) && (
        <div className="mb-1 flex items-baseline gap-2">
          {badge && (
            <span className={cn("rounded px-1.5 py-0.5 text-xs font-bold", styles.badge)}>{badge}</span>
          )}
          {Glyph && (
            <span className={cn("self-center", styles.icon)}>
              <Glyph className={styles.icon} size="1em" />
            </span>
          )}
          {labelText && (
            <span className={cn("text-xs font-semibold uppercase tracking-wide", styles.label)}>
              {labelText}
            </span>
          )}
          {source && <span className={cn("text-xs", styles.source)}>{source}</span>}
        </div>
      )}
      {title && <h3 className={cn("mb-2 text-sm font-bold", styles.title)}>{title}</h3>}
      <div className={cn("text-sm leading-snug", styles.content)}>{children}</div>
    </div>
  );
}
