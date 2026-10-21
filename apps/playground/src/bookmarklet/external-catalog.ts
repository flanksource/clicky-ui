import { useEffect, useSyncExternalStore } from "react";
import { request } from "../comments/useComments";
import { EXTERNAL_PAGES_ROUTE, type ExternalPage } from "./model";

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
    const update = () => {
      if (document.visibilityState === "visible") void refreshExternalCatalog();
    };
    const timer = window.setInterval(update, 5000);
    window.addEventListener("focus", update);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", update);
    };
  }, []);
  return value;
}
