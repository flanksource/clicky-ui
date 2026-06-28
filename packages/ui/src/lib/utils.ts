import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The design system exposes density-aware utilities backed by CSS variables
// (h-control-h, px-control-px, gap-density-2, text-density-base, …). Plain
// tailwind-merge doesn't know these belong to the height/width/spacing/font-size
// scales, so it can't tell that a consumer's `h-auto`/`px-3`/etc. is meant to
// override a component's base `h-control-h`/`px-control-px` — it keeps both and
// the base wins. Registering the tokens with their class groups lets overrides
// win as intended. Keep this list in sync with the tokens in tailwind-preset.ts.
const DENSITY = ["density-1", "density-2", "density-3", "density-4"];
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      h: [{ h: ["control-h", ...DENSITY] }],
      w: [{ w: ["control-h"] }],
      p: [{ p: DENSITY }],
      px: [{ px: ["control-px", ...DENSITY] }],
      py: [{ py: DENSITY }],
      m: [{ m: DENSITY }],
      mt: [{ mt: DENSITY }],
      mb: [{ mb: DENSITY }],
      gap: [{ gap: DENSITY }],
      "font-size": [{ text: ["density-base"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
