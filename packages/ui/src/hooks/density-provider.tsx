import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DENSITY_STORAGE_KEY,
  DensityContext,
  applyDensity,
  readStoredDensity,
  type Density,
  type DensityContextValue,
} from "./use-density";

export type DensityProviderProps = {
  children: ReactNode;
  defaultDensity?: Density;
  storageKey?: string;
};

export function DensityProvider({
  children,
  defaultDensity = "comfortable",
  storageKey = DENSITY_STORAGE_KEY,
}: DensityProviderProps) {
  const [density, setDensityState] = useState<Density>(() => {
    if (typeof window === "undefined") return defaultDensity;
    return readStoredDensity() ?? defaultDensity;
  });

  useEffect(() => {
    applyDensity(density);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, density);
    }
  }, [density, storageKey]);

  const setDensity = useCallback((next: Density) => setDensityState(next), []);

  const value = useMemo<DensityContextValue>(
    () => ({ density, setDensity }),
    [density, setDensity],
  );

  return <DensityContext.Provider value={value}>{children}</DensityContext.Provider>;
}

/**
 * Provide a density value to descendants without owning the storage / setter.
 * Useful when a component (e.g. DataTable) already manages density via its
 * own state and just needs leaf cells like TagList to read the active value
 * via {@link useDensityValue}. Calls to `setDensity` from descendants are
 * ignored — the host component controls density externally.
 */
export function DensityValueProvider({
  density,
  children,
}: {
  density: Density;
  children: ReactNode;
}) {
  const value = useMemo<DensityContextValue>(() => ({ density, setDensity: () => {} }), [density]);
  return <DensityContext.Provider value={value}>{children}</DensityContext.Provider>;
}
