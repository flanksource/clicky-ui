import type { Density } from "../hooks/use-density";

export type SizeToken = "xs" | "sm" | "md" | "lg" | "xl";

export const SIZE_TOKENS: SizeToken[] = ["xs", "sm", "md", "lg", "xl"];

const SIZE_SCALE: Record<Density, Record<SizeToken, number>> = {
  compact: { xs: 14, sm: 18, md: 24, lg: 36, xl: 48 },
  comfortable: { xs: 16, sm: 20, md: 28, lg: 40, xl: 56 },
  spacious: { xs: 20, sm: 24, md: 32, lg: 48, xl: 64 },
};

export function resolveSize(size: SizeToken, density: Density = "comfortable"): number {
  return SIZE_SCALE[density][size];
}

export function readDensityFromDom(): Density {
  if (typeof document === "undefined") return "comfortable";
  const raw = document.documentElement.getAttribute("data-density");
  return raw === "compact" || raw === "spacious" ? raw : "comfortable";
}
