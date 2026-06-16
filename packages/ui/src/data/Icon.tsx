import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "../lib/utils";
import { resolveSize, type SizeToken } from "../lib/size";
import { useDensityValue } from "../hooks/use-density";
import { getFallbackIconProvider } from "./icon-fallback";

// LabelIconSpec is the icon a label may carry: an iconify/runtime name (resolved
// via the fallback provider) or a fully-rendered node the caller supplies.
export type LabelIconSpec = string | ReactNode;

export type IconStyle = "plain" | "badge";

export type IconTone = "emerald" | "amber" | "rose" | "slate" | "sky" | "violet" | "neutral";

export type StaticIconComponent = ElementType;

type CommonIconProps = {
  /** Classes applied to the glyph or badge wrapper. */
  className?: string;
  /** Explicit glyph width. */
  width?: string | number;
  /** Explicit glyph height. */
  height?: string | number;
  /** CSS rotate value or degrees. */
  rotate?: string | number;
  /** Flip direction for imported glyphs. */
  flip?: string;
  /** Forward inline rendering semantics to imported glyphs. */
  inline?: boolean;
  /** Accessible title for the glyph. */
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

export type IconProps = CommonIconProps &
  (
    | {
        /** Imported static icon component. */
        icon: StaticIconComponent;
        name?: never;
      }
    | {
        /** Runtime icon name resolved by the fallback provider. */
        name: string;
        icon?: never;
      }
  );

const TONE_CLASSES: Record<IconTone, string> = {
  emerald: "text-emerald-700 ring-emerald-200/80 dark:text-emerald-400 dark:ring-emerald-500/30",
  amber: "text-amber-700 ring-amber-200/80 dark:text-amber-400 dark:ring-amber-500/30",
  rose: "text-rose-700 ring-rose-200/80 dark:text-rose-400 dark:ring-rose-500/30",
  slate: "text-slate-700 ring-slate-200/80 dark:text-slate-300 dark:ring-slate-500/30",
  sky: "text-sky-700 ring-sky-200/80 dark:text-sky-400 dark:ring-sky-500/30",
  violet: "text-violet-700 ring-violet-200/80 dark:text-violet-400 dark:ring-violet-500/30",
  neutral: "text-foreground ring-border",
};

const DEFAULT_PLAIN_ICON_SIZE = "1em";

function renderImportedGlyph(
  ImportedIcon: StaticIconComponent,
  glyphWidth: number | string | undefined,
  glyphHeight: number | string | undefined,
  rotate: string | number | undefined,
  flip: string | undefined,
  inline: boolean | undefined,
  glyphClassName: string | undefined,
  title: string | undefined,
): JSX.Element {
  const transform = [
    typeof rotate === "number" ? `rotate(${rotate}deg)` : typeof rotate === "string" ? rotate : "",
    flip === "horizontal" || flip === "both" ? "scaleX(-1)" : "",
    flip === "vertical" || flip === "both" ? "scaleY(-1)" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ImportedIcon
      {...(glyphClassName ? { className: glyphClassName } : {})}
      {...(glyphWidth != null ? { width: glyphWidth } : {})}
      {...(glyphHeight != null ? { height: glyphHeight } : {})}
      {...(inline != null ? { "aria-hidden": !title } : {})}
      {...(title ? { title, role: "img" } : { "aria-hidden": true })}
      {...(transform ? { style: { transform } } : {})}
    />
  );
}

function renderRuntimeGlyph(
  name: string,
  glyphWidth: number | string | undefined,
  glyphHeight: number | string | undefined,
  glyphClassName: string | undefined,
  title: string | undefined,
): JSX.Element {
  const fallbackIcon = getFallbackIconProvider();
  if (fallbackIcon) {
    const Fallback = fallbackIcon;
    const glyphSize = typeof glyphWidth === "number" ? glyphWidth : glyphHeight;
    return (
      <Fallback
        name={name}
        {...(glyphClassName ? { className: glyphClassName } : {})}
        {...(glyphSize != null ? { size: glyphSize } : {})}
        {...(title ? { alt: title } : {})}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-sm border border-dashed border-muted-foreground/50 text-[0.65em] leading-none text-muted-foreground",
        glyphClassName,
      )}
      title={title ?? name}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{
        width: glyphWidth,
        height: glyphHeight,
      }}
    >
      ?
    </span>
  );
}

export function Icon({
  icon: ImportedIcon,
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
  const defaultGlyphSize = style === "badge" ? glyphSize : (pxSize ?? DEFAULT_PLAIN_ICON_SIZE);
  const resolvedWidth = width ?? height ?? defaultGlyphSize;
  const resolvedHeight = height ?? resolvedWidth;

  const glyphClassName = cn(
    "inline-block shrink-0 align-[-0.125em]",
    style === "plain" ? className : undefined,
  );
  const glyphTitle = style === "plain" ? title : undefined;

  const renderedIcon = ImportedIcon
    ? renderImportedGlyph(
        ImportedIcon,
        resolvedWidth,
        resolvedHeight,
        rotate,
        flip,
        inline,
        glyphClassName,
        glyphTitle,
      )
    : renderRuntimeGlyph(name, resolvedWidth, resolvedHeight, glyphClassName, glyphTitle);

  if (style === "plain") {
    return renderedIcon;
  }

  const badgeStyle: CSSProperties | undefined =
    pxSize != null ? { width: pxSize, height: pxSize } : undefined;

  return (
    <span
      title={title}
      aria-label={title}
      role={title ? "img" : undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-inset",
        TONE_CLASSES[tone],
        className,
      )}
      style={badgeStyle}
    >
      {renderedIcon}
    </span>
  );
}

/**
 * LabelIcon renders a label's leading glyph from a {@link LabelIconSpec}: a
 * string is treated as a runtime icon name (resolved by the registered fallback
 * provider), any other ReactNode is rendered as-is. Returns null for an absent
 * or empty spec so callers can spread it unconditionally before a label.
 */
export function LabelIcon({
  icon,
  className,
}: {
  icon?: LabelIconSpec;
  className?: string;
}): JSX.Element | null {
  if (icon == null || icon === "" || icon === false) return null;
  if (typeof icon === "string") {
    return <Icon name={icon} className={cn("shrink-0", className)} />;
  }
  return <>{icon}</>;
}
