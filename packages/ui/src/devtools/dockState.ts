import { DEBUG_TABS, DEFAULT_DEBUG_LEVEL, type DebugLevel, type DebugTab } from "./types";

/**
 * Open/closed, the active tab and the capture level live in the URL.
 *
 * A broken state is worth sharing: "open this profile with the console on
 * Network at trace2" is the whole message, and a link is how it gets sent.
 * Height stays in localStorage — it is a preference about this screen, not a
 * fact about what is being debugged.
 *
 * The `__` prefix follows the app's own reserved-parameter convention, so these
 * are never mistaken for filter params, and they are written with
 * `history.replaceState` so opening a tab does not fill the back button.
 */

export const DOCK_PARAM = "__debug_open";
export const TAB_PARAM = "__debug_tab";
export const LEVEL_PARAM = "__debug_level";

export type DockState = {
  open: boolean;
  tab: DebugTab;
  level: DebugLevel;
};

export const DEFAULT_DOCK_STATE: DockState = {
  open: false,
  tab: "queries",
  level: DEFAULT_DEBUG_LEVEL,
};

export function readDockState(search = currentSearch()): DockState {
  const params = new URLSearchParams(search);
  const tab = params.get(TAB_PARAM);
  const level = params.get(LEVEL_PARAM);
  return {
    open: params.get(DOCK_PARAM) === "1",
    tab: isTab(tab) ? tab : DEFAULT_DOCK_STATE.tab,
    level: (level as DebugLevel | null) ?? DEFAULT_DOCK_STATE.level,
  };
}

/**
 * Writes the dock's state back to the URL, dropping the defaults.
 *
 * A closed console leaves no trace in the address bar — the ordinary case must
 * not make every link the user copies carry debug parameters.
 */
export function writeDockState(state: DockState): void {
  if (typeof window === "undefined" || !window.history?.replaceState) return;
  const url = new URL(window.location.href);
  setOrDelete(url.searchParams, DOCK_PARAM, state.open ? "1" : null);
  setOrDelete(url.searchParams, TAB_PARAM, state.open && state.tab !== "queries" ? state.tab : null);
  setOrDelete(
    url.searchParams,
    LEVEL_PARAM,
    state.open && state.level !== DEFAULT_DEBUG_LEVEL ? state.level : null,
  );
  window.history.replaceState(window.history.state, "", url.toString());
}

function setOrDelete(params: URLSearchParams, key: string, value: string | null): void {
  if (value === null) params.delete(key);
  else params.set(key, value);
}

function isTab(value: string | null): value is DebugTab {
  return value !== null && (DEBUG_TABS as readonly string[]).includes(value);
}

function currentSearch(): string {
  return typeof window === "undefined" ? "" : window.location.search;
}
