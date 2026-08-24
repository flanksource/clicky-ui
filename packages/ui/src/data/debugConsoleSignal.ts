/**
 * The one thing a result table and the debug console have to agree on: "show me
 * this".
 *
 * It is a bare emitter with no dependencies, and it lives here rather than in
 * `devtools/` on purpose. Tables ship in the `data` entry point and the console
 * ships in `devtools`; if the table imported the console to reveal it, every app
 * with a table would carry the console's tables, HAR panel and SSE client
 * whether or not it ever opens one. The dependency runs the other way instead:
 * the console imports this and registers itself.
 */

export type DebugConsoleRequest = {
  /** The capture to open, when the caller knows which one it produced. */
  recordId?: string | undefined;
  /** The tab to land on, e.g. "queries" or "network". */
  tab?: string | undefined;
  /**
   * Closes an already-open console instead of re-opening it.
   *
   * Only the console's own trigger sets this. A "Debug" action that toggled
   * would close the console for someone who clicked it while it was already
   * open — the opposite of what asking to see a query means.
   */
  toggle?: boolean | undefined;
};

type Listener = (request: DebugConsoleRequest) => void;

const listeners = new Set<Listener>();
const watchers = new Set<() => void>();

/**
 * Registers a console. The returned function unregisters it, so a dock that
 * unmounts stops claiming a console exists.
 */
export function registerDebugConsole(listener: Listener): () => void {
  listeners.add(listener);
  notify();
  return () => {
    listeners.delete(listener);
    notify();
  };
}

/**
 * Watches whether a console is mounted, so a menu built before the dock renders
 * gains its "Debug" item when the dock arrives rather than staying stale.
 */
export function subscribeToDebugConsole(onChange: () => void): () => void {
  watchers.add(onChange);
  return () => {
    watchers.delete(onChange);
  };
}

function notify(): void {
  for (const watcher of watchers) watcher();
}

/**
 * Whether a console is mounted to reveal.
 *
 * Callers use this to decide whether to offer the action at all: a "Debug" menu
 * item that does nothing is worse than no menu item, because it reads as broken
 * rather than as absent.
 */
export function debugConsoleAvailable(): boolean {
  return listeners.size > 0;
}

let consoleOpen = false;

/**
 * Published by the mounted console as it opens and closes.
 *
 * Its trigger lives in the app's navbar, outside the console's own tree, so
 * "am I showing an open console" is not state either side can read from the
 * other without this.
 */
export function setDebugConsoleOpen(open: boolean): void {
  if (consoleOpen === open) return;
  consoleOpen = open;
  notify();
}

/** Whether the mounted console is currently showing. */
export function debugConsoleOpen(): boolean {
  return consoleOpen && listeners.size > 0;
}

/** Asks the mounted console to open, optionally focused on one capture. */
export function revealDebugConsole(request: DebugConsoleRequest = {}): void {
  for (const listener of listeners) listener(request);
}

/** The headers a request arms the server with. Named once, here. */
export const DEBUG_CAPTURE_HEADER = "X-Debug-Level";
export const DEBUG_REFRESH_INSPECTION_HEADER = "X-Debug-Refresh-Inspection";

let captureLevel = "off";
let refreshInspection = false;

/**
 * Published by the mounted console whenever its level picker changes.
 *
 * It lives beside the reveal signal for the same reason: a component that makes
 * a bare `fetch` — the profile builder's sample call, say — has to arm it, and
 * importing the console to read one string would drag the whole console into
 * that bundle.
 */
export function setDebugCaptureLevel(level: string): void {
  captureLevel = level;
}

/**
 * Published by the console alongside the level: whether requests should also
 * rebuild every metadata lookup instead of reading the cache.
 */
export function setDebugRefreshInspection(refresh: boolean): void {
  refreshInspection = refresh;
}

/**
 * Headers that arm a request at whatever the console is currently set to, and
 * nothing at all when no console is open.
 *
 * Spread into a bare `fetch`. Requests that go through a wrapped client are
 * armed by the wrapper instead and need not call this.
 */
export function debugCaptureHeaders(): Record<string, string> {
  if (captureLevel === "off" || listeners.size === 0) return {};
  const headers: Record<string, string> = { [DEBUG_CAPTURE_HEADER]: captureLevel };
  // Only present when on: a header carrying "false" would make every request
  // look like it had opted out of something.
  if (refreshInspection) headers[DEBUG_REFRESH_INSPECTION_HEADER] = "true";
  return headers;
}
