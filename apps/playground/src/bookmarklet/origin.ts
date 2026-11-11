import type { AgentSessionGrouping, AgentSessionRuntime } from "../../plugins/agent-session-store";

export function bookmarkletParentOrigin(url: string): string {
  const parsed = new URL(url);
  return parsed.protocol === "file:" ? "null" : parsed.origin;
}

/** The extension page a host frames: its bundled gavel panel, configured by the settings it was activated with. */
export type GavelPanelFrame = {
  url: string;
  /** The extension page that frames the dashboard's new-todo form for the host, so a page whose CSP blocks the dashboard can still open it. */
  todoRelay: string;
  server: string;
  project: string;
  /** The runtime new agent sessions start with; absent means gavel's default. JSON-encoded in the frame URL. */
  runtime?: AgentSessionRuntime;
  grouping?: AgentSessionGrouping;
  /** The Captain session this site's comments go to; distinct from the bridge session. */
  agentSession?: string;
};

function extensionPage(input: string, what: string): { url: URL; origin: string } {
  const url = new URL(input);
  if (url.protocol !== "chrome-extension:") throw new Error(`Grabber ${what} must be a chrome-extension page, got ${url.href}`);
  // URL.origin is "null" for chrome-extension: outside Chrome itself.
  return { url, origin: `${url.protocol}//${url.host}` };
}

/**
 * The panel URL a host frames, and the origin it exchanges messages with.
 * - `playground`: the playground's panel, framed directly for bookmarklets. With
 *   a `relay` (the Chrome extension's web-accessible relay page) the host frames
 *   the relay, which in turn frames the panel: extension frames are exempt from
 *   the page's `frame-src`, so the panel loads on pages that would refuse it.
 * - `panel`: the extension's own bundled gavel panel, framed directly. `session`
 *   is always the bridge session shared with the host.
 */
export function bookmarkletFrame(
  options: { documentUrl: string; session: string } & (
    | { playground: string; relay?: string }
    | { panel: GavelPanelFrame }
  ),
): { src: string; origin: string } {
  const parentOrigin = bookmarkletParentOrigin(options.documentUrl);
  if ("panel" in options) {
    const { url, origin } = extensionPage(options.panel.url, "panel");
    url.search = new URLSearchParams({
      server: options.panel.server,
      project: options.panel.project,
      ...(options.panel.runtime ? { runtime: JSON.stringify(options.panel.runtime) } : {}),
      ...(options.panel.grouping ? { grouping: options.panel.grouping } : {}),
      ...(options.panel.agentSession ? { session: options.panel.agentSession } : {}),
      parentOrigin,
      bridgeSession: options.session,
    }).toString();
    return { src: url.href, origin };
  }
  const relay = options.relay ? extensionPage(options.relay, "relay") : undefined;
  const panel = new URL("/", options.playground);
  panel.search = new URLSearchParams({ bookmarklet: "1", parentOrigin, session: options.session, ...(relay ? { relayOrigin: relay.origin } : {}) }).toString();
  if (!relay) return { src: panel.href, origin: panel.origin };
  relay.url.search = new URLSearchParams({ target: panel.href }).toString();
  return { src: relay.url.href, origin: relay.origin };
}

/** The window origin the panel exchanges messages with: the relay when present, else the page. */
export function bookmarkletPeerOrigin(options: { parentOrigin: string; relayOrigin: string | null }): string {
  if (options.relayOrigin === null) return options.parentOrigin;
  if (!/^chrome-extension:\/\/[a-p]{32}$/.test(options.relayOrigin)) throw new Error(`Invalid grabber relay origin ${options.relayOrigin}`);
  return options.relayOrigin;
}

export function matchesBookmarkletParent(options: { expected: string; received: string }): boolean {
  // Chromium with file access serializes file message origins as file://.
  return options.expected === "null" ? options.received === "null" || options.received === "file://" : options.received === options.expected;
}
