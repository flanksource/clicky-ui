import type { CSSProperties } from "react";
import type { HighlightedToken } from "./code-highlight";

// Shiki's `fontStyle` is a bitmask: 1=italic, 2=bold, 4=underline.
export function tokenStyle(token: HighlightedToken): CSSProperties {
  const style: CSSProperties = {};
  if (token.color) style.color = token.color;
  const fontStyle = token.fontStyle ?? 0;
  if (fontStyle & 1) style.fontStyle = "italic";
  if (fontStyle & 2) style.fontWeight = 700;
  if (fontStyle & 4) style.textDecorationLine = "underline";
  return style;
}
