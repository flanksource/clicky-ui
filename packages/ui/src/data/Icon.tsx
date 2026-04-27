import type { CSSProperties, ComponentType } from "react";
import { Icon as IconifyReactIcon, iconLoaded } from "@iconify/react";
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

/**
 * Optional secondary icon provider. Consumers can plug in a component
 * (e.g. `Icon` from `@flanksource/icons/icon`) to supply glyphs that the
 * iconify registry doesn't know about (brand logos, k8s resource icons,
 * etc.). Clicky-ui never imports the package directly so consumers that
 * don't need it avoid the dependency entirely.
 */
export type FallbackIconProps = {
  name?: string;
  className?: string;
  size?: string | number;
  alt?: string;
};

type FallbackIconComponent = ComponentType<FallbackIconProps>;

let fallbackIcon: FallbackIconComponent | null = null;

/**
 * Register a secondary glyph provider. Pass the flanksource Icon (or any
 * compatible component) to resolve names that `@iconify/react` hasn't
 * loaded. Call this once at app bootstrap.
 */
export function setFallbackIconProvider(component: FallbackIconComponent | null): void {
  fallbackIcon = component;
}

function renderGlyph(
  name: string,
  glyphWidth: number | string | undefined,
  glyphHeight: number | string | undefined,
  rotate: string | number | undefined,
  flip: string | undefined,
  inline: boolean | undefined,
  glyphClassName: string | undefined,
  title: string | undefined,
): JSX.Element {
  // 1. @iconify/react — build-time lookup via consumer-registered collections.
  //    Only used when the icon is already in the registry so we never trigger
  //    a network fetch during SSR.
  if (iconLoaded(name)) {
    return (
      <IconifyReactIcon
        icon={name}
        className={glyphClassName}
        width={glyphWidth}
        height={glyphHeight}
        rotate={rotate}
        flip={flip}
        inline={inline}
        title={title}
      />
    );
  }

  // 2. Consumer-supplied fallback (e.g. @flanksource/icons/icon) — for
  //    brand/platform glyphs not carried by iconify collections.
  if (fallbackIcon) {
    const Fallback = fallbackIcon;
    const glyphSize = typeof glyphWidth === "number" ? glyphWidth : glyphHeight;
    return <Fallback name={name} className={glyphClassName} size={glyphSize} alt={title} />;
  }

  // 3. <iconify-icon> web component — runtime fallback. Requires the script
  //    to be loaded on the host page.
  const iconifyProps: Record<string, unknown> = {
    icon: name,
    className: glyphClassName,
    "aria-hidden": title ? undefined : true,
  };
  if (glyphWidth != null) iconifyProps.width = glyphWidth;
  if (glyphHeight != null) iconifyProps.height = glyphHeight;
  if (rotate != null) iconifyProps.rotate = rotate;
  if (flip != null) iconifyProps.flip = flip;
  if (inline != null) iconifyProps.inline = inline;
  if (title != null) iconifyProps.title = title;
  return <iconify-icon {...iconifyProps} />;
}

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

  const glyphClassName = cn("shrink-0", style === "plain" ? className : undefined);
  const glyphTitle = style === "plain" ? title : undefined;

  const icon = renderGlyph(
    name,
    resolvedWidth,
    resolvedHeight,
    rotate,
    flip,
    inline,
    glyphClassName,
    glyphTitle,
  );

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
