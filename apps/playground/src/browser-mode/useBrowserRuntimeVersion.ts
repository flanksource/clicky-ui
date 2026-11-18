import { useSyncExternalStore } from "react";
import { APPROVALS_KEY, BROWSER_PROFILE_KEY, BROWSER_RUNTIME_CHANGED, BROWSER_WORKSPACE_KEY, browserPageKey } from "./dependency-defaults";

function subscribe(listener: () => void) {
  window.addEventListener(BROWSER_RUNTIME_CHANGED, listener); window.addEventListener("storage", listener);
  return () => { window.removeEventListener(BROWSER_RUNTIME_CHANGED, listener); window.removeEventListener("storage", listener); };
}

/** A snapshot key that changes whenever any browser layer for `slug` changes; use it as an effect dependency. */
export function useBrowserRuntimeVersion(slug: string): string {
  return useSyncExternalStore(subscribe, () => [BROWSER_PROFILE_KEY, BROWSER_WORKSPACE_KEY, browserPageKey(slug), APPROVALS_KEY].map(key => localStorage.getItem(key) ?? "").join("\u0000"), () => "");
}
