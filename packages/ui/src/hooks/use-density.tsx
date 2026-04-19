import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Density = "compact" | "comfortable" | "spacious";

type DensityContextValue = {
  density: Density;
  setDensity: (next: Density) => void;
};

const STORAGE_KEY = "clicky-ui-density";
const DATA_ATTR = "data-density";

const DensityContext = createContext<DensityContextValue | null>(null);

function readStored(): Density | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "compact" || raw === "comfortable" || raw === "spacious" ? raw : null;
}

function apply(density: Density): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute(DATA_ATTR, density);
}

export type DensityProviderProps = {
  children: ReactNode;
  defaultDensity?: Density;
  storageKey?: string;
};

export function DensityProvider({
  children,
  defaultDensity = "comfortable",
  storageKey = STORAGE_KEY,
}: DensityProviderProps) {
  const [density, setDensityState] = useState<Density>(() => {
    if (typeof window === "undefined") return defaultDensity;
    return readStored() ?? defaultDensity;
  });

  useEffect(() => {
    apply(density);
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

export function useDensity(): DensityContextValue {
  const ctx = useContext(DensityContext);
  if (!ctx) throw new Error("useDensity must be used inside <DensityProvider>");
  return ctx;
}
