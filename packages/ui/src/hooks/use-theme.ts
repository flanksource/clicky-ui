import { createContext, useContext, useEffect, useState } from "react";

import { mediaMatches, onMediaChange } from "./use-media-query";

export const PREFERS_DARK_QUERY = "(prefers-color-scheme: dark)";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (next: Theme) => void;
};

export const THEME_STORAGE_KEY = "clicky-ui-theme";
const DATA_ATTR = "data-theme";

export const ThemeContext = createContext<ThemeContextValue | null>(null);

function prefersDark(): boolean {
  return mediaMatches(PREFERS_DARK_QUERY);
}

export function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
  return raw === "light" || raw === "dark" || raw === "system" ? raw : "system";
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") return prefersDark() ? "dark" : "light";
  return theme;
}

export function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute(DATA_ATTR, resolved);
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

export function useOptionalTheme(): ThemeContextValue | null {
  return useContext(ThemeContext);
}

export function useResolvedTheme(override?: Theme): ResolvedTheme {
  const ctx = useOptionalTheme();
  const [systemResolved, setSystemResolved] = useState<ResolvedTheme>(() =>
    prefersDark() ? "dark" : "light",
  );

  useEffect(
    () =>
      onMediaChange(PREFERS_DARK_QUERY, (dark) =>
        setSystemResolved(dark ? "dark" : "light"),
      ),
    [],
  );

  if (override && override !== "system") return override;
  if (override === "system") return systemResolved;
  if (ctx) return ctx.resolvedTheme;
  return systemResolved;
}
