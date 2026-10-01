import { useResolvedTheme } from "../hooks/use-theme";
import { cn } from "../lib/utils";
import type { DebugGlyphPair } from "./json-schema-form-debug-glyph-map";

// DebugGlyph draws a palette glyph in the variant for the resolved theme. It
// names the component it drew in `data-glyph`.
export function DebugGlyph({ glyph, className }: { glyph: DebugGlyphPair | undefined; className?: string }) {
  const theme = useResolvedTheme();
  if (!glyph) return <span aria-hidden className={cn("inline-block size-3.5 shrink-0", className)} />;
  const Glyph = theme === "dark" && glyph.dark ? glyph.dark : glyph.light;
  return <Glyph data-glyph={Glyph.displayName} className={cn("size-3.5 shrink-0", className)} />;
}
