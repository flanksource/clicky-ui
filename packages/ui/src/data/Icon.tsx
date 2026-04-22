import type { CSSProperties } from "react";
import { cn } from "../lib/utils";
import { resolveSize, type SizeToken } from "../lib/size";
import { useDensityValue } from "../hooks/use-density";
// Type augmentation (no runtime side-effects) — include via tsconfig.
// @see ./iconify-icon.d.ts

export type IconStyle = "plain" | "badge";

export type IconTone = "emerald" | "amber" | "rose" | "slate" | "sky" | "violet" | "neutral";

export type IconProps = {
  name: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  rotate?: string | number;
  flip?: string;
  inline?: boolean;
  title?: string;
  /**
   * Presentation style. `plain` (default) renders the icon inline.
   * `badge` wraps the icon in a circular chip (white background, ring, shadow)
   * sized by `size` — use in stage/approval cells so the chip scales with a
   * neighbouring avatar.
   */
  style?: IconStyle;
  /**
   * Named size token (xxs..xxl). Drives the badge diameter and glyph. The
   * glyph is always ~50% of the badge diameter so it scales consistently
   * across sizes. For `style="plain"` it sets width/height when neither is
   * provided.
   */
  size?: SizeToken;
  /** Semantic color for `style="badge"`. Ignored for plain icons. */
  tone?: IconTone;
};

const TONE_CLASSES: Record<IconTone, string> = {
  emerald: "text-emerald-700 ring-emerald-200/80",
  amber: "text-amber-700 ring-amber-200/80",
  rose: "text-rose-700 ring-rose-200/80",
  slate: "text-slate-700 ring-slate-200/80",
  sky: "text-sky-700 ring-sky-200/80",
  violet: "text-violet-700 ring-violet-200/80",
  neutral: "text-foreground ring-border",
};

export function Icon({
  name,
  className,
  width,
  height,
  rotate,
  flip,
  inline,
  title,
  style = "plain",
  size,
  tone = "neutral",
}: IconProps) {
  const density = useDensityValue();
  const pxSize = size != null ? resolveSize(size, density) : undefined;
  const glyphSize = pxSize != null ? Math.max(8, Math.round(pxSize * 0.5)) : undefined;
  const resolvedWidth = width ?? (style === "badge" ? glyphSize : pxSize);
  const resolvedHeight = height ?? (style === "badge" ? glyphSize : pxSize);

  const iconProps: Record<string, unknown> = {
    icon: name,
    className: cn("shrink-0", style === "plain" ? className : undefined),
    "aria-hidden": title && style === "plain" ? undefined : true,
  };
  if (resolvedWidth != null) iconProps.width = resolvedWidth;
  if (resolvedHeight != null) iconProps.height = resolvedHeight;
  if (rotate != null) iconProps.rotate = rotate;
  if (flip != null) iconProps.flip = flip;
  if (inline != null) iconProps.inline = inline;
  if (style === "plain" && title != null) iconProps.title = title;

  const icon = <iconify-icon {...iconProps} />;

  if (style === "plain") {
    return icon;
  }

  const badgeStyle: CSSProperties | undefined =
    pxSize != null ? { width: pxSize, height: pxSize } : undefined;

  return (
    <span
      title={title}
      aria-label={title}
      role={title ? "img" : undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-inset",
        TONE_CLASSES[tone],
        className,
      )}
      style={badgeStyle}
    >
      {icon}
    </span>
  );
}
