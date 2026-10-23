// Lets a detail body switch the panel's tab (e.g. "View outputs" jumping to the
// Outputs tab) without owning tab state: TestDetailPanel provides its own
// setter, controlled or not. Null outside a panel, so callers can degrade.

import { createContext, useContext } from "react";

const Context = createContext<((tabId: string) => void) | null>(null);

export const DetailTabSelectProvider = Context.Provider;

/** Selects a detail tab by id, or null when rendered outside a TestDetailPanel. */
export function useSelectDetailTab(): ((tabId: string) => void) | null {
  return useContext(Context);
}
