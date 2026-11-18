import { useEffect, useSyncExternalStore } from "react";
import { request } from "../comments/useComments";
import { EXTERNAL_PAGES_ROUTE, type ExternalPage } from "./model";
import { FEEDBACK_UPDATED_EVENT, NAVIGATION_REFRESH_EVENT } from "../navigation/refresh";

const CATALOG_EVENTS = ["focus", FEEDBACK_UPDATED_EVENT, NAVIGATION_REFRESH_EVENT] as const;

let snapshot: { pages: ExternalPage[]; error: string | null; loaded: boolean } =
  {
    pages: [],
    error: null,
    loaded: false,
  };
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const getSnapshot = () => snapshot;

export async function refreshExternalCatalog() {
  try {
    const { pages } = await request<{ pages: ExternalPage[] }>(
      EXTERNAL_PAGES_ROUTE,
    );
    snapshot = { pages, error: null, loaded: true };
  } catch (error) {
    snapshot = {
      ...snapshot,
      error: error instanceof Error ? error.message : String(error),
      loaded: true,
    };
  }
  for (const listener of listeners) listener();
}

export function externalPage(id: string) {
  return snapshot.pages.find((page) => page.id === id);
}

export function useExternalCatalog() {
  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useEffect(() => {
    void refreshExternalCatalog();
    // A capture happens in another tab, so coming back to this one (focus) or any feedback
    // change is when the catalog can have moved; the sidebar tree reads externals from the
    // navigation route and needs no polling of its own.
    const update = () => void refreshExternalCatalog();
    for (const event of CATALOG_EVENTS) window.addEventListener(event, update);
    return () => {
      for (const event of CATALOG_EVENTS) window.removeEventListener(event, update);
    };
  }, []);
  return value;
}
