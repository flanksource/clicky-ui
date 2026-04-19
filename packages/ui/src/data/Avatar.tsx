import type { SyntheticEvent } from "react";
import { cn } from "../lib/utils";
import { paletteClass } from "../lib/palette";

export type AvatarProps = {
  src?: string;
  alt: string;
  size?: number;
  rounded?: "full" | "md";
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

export function Avatar({
  src,
  alt,
  size = 20,
  rounded = "full",
  title,
  href,
  colorKey,
  onError,
  className,
}: AvatarProps) {
  const shape = rounded === "full" ? "rounded-full" : "rounded";
  const key = colorKey ?? alt;
  const base = cn("inline-block shrink-0", shape);

  const content = src ? (
    <img
      src={src}
      alt={alt}
      title={title ?? alt}
      width={size}
      height={size}
      className={cn(base, "bg-muted", className)}
      loading="lazy"
      onError={onError}
    />
  ) : (
    <span
      className={cn(
        base,
        paletteClass(key),
        "inline-flex items-center justify-center font-semibold",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(9, Math.floor(size * 0.5)) }}
      title={title ?? alt}
    >
      {(alt.replace(/^@/, "").charAt(0) || "?").toUpperCase()}
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
