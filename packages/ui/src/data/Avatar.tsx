import type { CSSProperties, SyntheticEvent } from "react";
import { cn } from "../lib/utils";
import { fnv1a32 } from "../lib/palette";
import { resolveSize, type SizeToken } from "../lib/size";
import { useDensityValue } from "../hooks/use-density";

export type AvatarVariant = "duotone" | "solid" | "stamp" | "mono";
export type AvatarKind = "user" | "group";

export type AvatarProps = {
  src?: string;
  alt: string;
  initials?: string;
  /**
   * Named size token (xs..xl). The rendered px is resolved through the active
   * density (`compact` shrinks, `spacious` grows). Size also drives typographic
   * adjustments: `xs` shows a single initial; `sm` uses a lighter weight so the
   * monogram stays quiet in dense list rows.
   */
  size?: SizeToken;
  rounded?: "full" | "md";
  kind?: AvatarKind;
  variant?: AvatarVariant;
  title?: string;
  href?: string;
  /**
   * Selects the palette color for the initial-fallback. Defaults to `alt` so
   * repeated rendering of the same identity stays consistent. Pass the full
   * "owner/name" for repo avatars so two repos named "cli" under different
   * orgs render with different colors.
   */
  colorKey?: string;
  onError?: (e: SyntheticEvent<HTMLImageElement>) => void;
  className?: string;
};

type AvatarTone = {
  background: string;
  borderColor: string;
  borderStyle?: CSSProperties["borderStyle"];
  color: string;
  shadow?: string;
};

function hueForKey(key: string): number {
  return fnv1a32(key) % 360;
}

function resolveInitials(alt: string, initials: string | undefined, maxLetters: number): string {
  if (initials?.trim()) {
    return initials.trim().slice(0, maxLetters).toUpperCase();
  }

  const cleaned = alt.replace(/^@/, "").trim();
  const lastSegment = cleaned.split(/[\\/]/).filter(Boolean).at(-1) ?? cleaned;
  const parts = lastSegment
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const letters = parts
    .map((part) => part.match(/[a-zA-Z0-9]/)?.[0] ?? "")
    .filter(Boolean)
    .slice(0, maxLetters)
    .join("");

  if (letters) {
    return letters.toUpperCase();
  }

  const compact = cleaned.replace(/[^a-zA-Z0-9]+/g, "");
  return (compact.slice(0, maxLetters) || "?").toUpperCase();
}

function fallbackTone(variant: AvatarVariant, kind: AvatarKind, hue: number): AvatarTone {
  if (kind === "group") {
    switch (variant) {
      case "solid":
        return {
          background: "#d8d4cc",
          borderColor: "#d8d4cc",
          color: "#5a574e",
        };
      case "stamp":
        return {
          background: "#fafaf7",
          borderColor: "#8d8778",
          color: "#5a574e",
          shadow: "2px 2px 0 rgba(90, 87, 78, 0.08)",
        };
      case "mono":
        return {
          background: "#f5f2eb",
          borderColor: "#8d8778",
          color: "#5a574e",
        };
      case "duotone":
      default:
        return {
          background: "#f0ede6",
          borderColor: "#b8b3a7",
          borderStyle: "dashed",
          color: "#5a574e",
        };
    }
  }

  switch (variant) {
    case "solid":
      return {
        background: `oklch(0.55 0.12 ${hue})`,
        borderColor: `oklch(0.55 0.12 ${hue})`,
        color: "#fff",
      };
    case "stamp":
      return {
        background: "#fafaf7",
        borderColor: `oklch(0.42 0.15 ${hue})`,
        color: `oklch(0.42 0.15 ${hue})`,
        shadow: "2px 2px 0 rgba(26, 26, 26, 0.08)",
      };
    case "mono":
      return {
        background: "#fff",
        borderColor: "#1a1a1a",
        color: "#1a1a1a",
      };
    case "duotone":
    default:
      return {
        background: `oklch(0.93 0.04 ${hue})`,
        borderColor: `oklch(0.55 0.14 ${hue} / 0.25)`,
        color: `oklch(0.35 0.14 ${hue})`,
      };
  }
}

function fontSizeFor(variant: AvatarVariant, size: number): number {
  const minimum = size <= 16 ? 7 : size <= 20 ? 8 : 9;

  switch (variant) {
    case "stamp":
      return Math.max(minimum, Math.round(size * 0.34));
    case "mono":
      return Math.max(minimum, Math.round(size * 0.36));
    case "solid":
    case "duotone":
    default:
      return Math.max(minimum, Math.round(size * 0.38));
  }
}

export function Avatar({
  src,
  alt,
  initials,
  size = "sm",
  rounded,
  kind = "user",
  variant = "duotone",
  title,
  href,
  colorKey,
  onError,
  className,
}: AvatarProps) {
  const density = useDensityValue();
  const px = resolveSize(size, density);
  const effectiveRounded = rounded ?? (kind === "group" ? "md" : "full");
  const shape = effectiveRounded === "full" ? "rounded-full" : "rounded-md";
  const key = colorKey ?? alt;
  const hue = hueForKey(key);
  const tone = fallbackTone(variant, kind, hue);
  const maxLetters = size === "xs" || size === "sm" ? 1 : 2;
  const text = resolveInitials(alt, initials, maxLetters);
  const base = cn(
    "inline-flex shrink-0 select-none items-center justify-center overflow-hidden border",
    shape,
  );
  const frameStyle: CSSProperties = {
    width: px,
    height: px,
    borderColor: tone.borderColor,
    borderStyle: tone.borderStyle ?? "solid",
  };

  if (variant === "stamp") {
    frameStyle.transform = "rotate(-4deg)";
    frameStyle.boxShadow = tone.shadow;
  }

  const weightFor = (v: AvatarVariant): number => {
    if (v === "stamp") return 700;
    if (size === "sm") return 500;
    return 600;
  };

  const content = src ? (
    <img
      src={src}
      alt={alt}
      title={title ?? alt}
      width={px}
      height={px}
      data-avatar-kind={kind}
      data-avatar-variant={variant}
      data-avatar-size={size}
      className={cn(base, "bg-muted object-cover", className)}
      style={frameStyle}
      loading="lazy"
      onError={onError}
    />
  ) : (
    <span
      role="img"
      aria-label={alt}
      data-avatar-kind={kind}
      data-avatar-variant={variant}
      data-avatar-size={size}
      className={cn(
        base,
        variant === "mono" || variant === "stamp" ? "font-mono" : undefined,
        variant === "mono" ? "tracking-[-0.05em]" : "tracking-[-0.02em]",
        className,
      )}
      style={{
        ...frameStyle,
        background: tone.background,
        color: tone.color,
        fontSize: fontSizeFor(variant, px),
        fontWeight: weightFor(variant),
      }}
      title={title ?? alt}
    >
      {text}
    </span>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </a>
    );
  }
  return content;
}
