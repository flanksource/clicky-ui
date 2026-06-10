import { createContext, useContext } from "react";

export type Density = "compact" | "comfortable" | "spacious";

export type DensityContextValue = {
  density: Density;
  setDensity: (next: Density) => void;
};

export const DENSITY_STORAGE_KEY = "clicky-ui-density";
const DATA_ATTR = "data-density";

export const DensityContext = createContext<DensityContextValue | null>(null);

export function readStoredDensity(): Density | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DENSITY_STORAGE_KEY);
  return raw === "compact" || raw === "comfortable" || raw === "spacious" ? raw : null;
}

export function applyDensity(density: Density): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute(DATA_ATTR, density);
}

export function useDensity(): DensityContextValue {
  const ctx = useContext(DensityContext);
  if (!ctx) throw new Error("useDensity must be used inside <DensityProvider>");
  return ctx;
}

/**
 * Non-throwing density read. Returns the context value if a `<DensityProvider>`
 * is mounted, otherwise reads the current `data-density` attribute on
 * `<html>`, falling back to `comfortable`. Use inside leaf components that
 * should respect density without requiring their host to mount a provider.
 */
export function useDensityValue(): Density {
  const ctx = useContext(DensityContext);
  if (ctx) return ctx.density;
  if (typeof document === "undefined") return "comfortable";
  const raw = document.documentElement.getAttribute("data-density");
  return raw === "compact" || raw === "spacious" ? raw : "comfortable";
}
