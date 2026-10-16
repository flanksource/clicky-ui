import type { ElementType } from "react";
import { Database, IconMap } from "@flanksource/icons/mi";
import type { FallbackIconProps } from "../data/icon-fallback";

// FlanksourceIcon resolves a runtime icon name against @flanksource/icons' name
// map and renders the matching glyph. A host registers it as the fallback icon
// provider (`setFallbackIconProvider(clickyIconProvider(FlanksourceIcon))`) so
// name-based icons — e.g. the connection-type picker grid (x-enum-icons) —
// render. An unknown name renders nothing, so the grid falls back to the
// option's text label.
const icons = IconMap as unknown as Record<string, ElementType>;

export function FlanksourceIcon({ name, className, size }: FallbackIconProps) {
  const Glyph = name ? icons[name] : undefined;
  if (!Glyph) return null;
  return <Glyph className={className} {...(size != null ? { width: size, height: size } : {})} />;
}

export function ConnectionTypeIcon({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  const Glyph = icons[type] ?? Database;
  return <Glyph className={className} width={16} height={16} />;
}
