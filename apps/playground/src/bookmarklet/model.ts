import type { CommentElementCaptureContext } from "../../plugins/comments-model";

export const EXTERNAL_PAGES_ROUTE = "/__playground/external-pages";
export const BOOKMARKLET_ROUTE = "/__playground/bookmarklet.js";
export const BRIDGE = "playground-bookmarklet-v1";

export type ExternalPage = {
  id: string;
  title: string;
  base: string;
  urls: string[];
};

export function externalUrl(input: string): { url: string; base: string } {
  const url = new URL(input);
  if (
    !["http:", "https:", "file:"].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new Error(
      "External pages require an HTTP(S) or file URL without credentials",
    );
  }
  url.searchParams.sort();
  const origin = url.protocol === "file:" ? `file://${url.host}` : url.origin;
  return { url: url.href, base: `${origin}${url.pathname}${url.hash}` };
}

export type Selection = {
  anchor: string;
  label: string;
  element: CommentElementCaptureContext;
};

export type HostState = { url: string; title: string; selection?: Selection };
export type AnchorState = {
  anchor: string;
  label: string;
  available: boolean;
  top?: number;
};
export type HostMessage =
  | { type: "state"; state: HostState }
  | { type: "anchors"; anchors: AnchorState[] }
  | { type: "focus"; anchor: string }
  | { type: "error"; error: string };
export type PanelMessage =
  | { type: "ready" }
  | { type: "close" }
  | { type: "pick"; screenshot?: boolean }
  | { type: "page" }
  | {
      type: "scroll";
      anchor: string;
      behavior?: ScrollBehavior;
      block?: "start" | "center";
      offset?: number;
    }
  | { type: "highlight"; anchor: string | null }
  | { type: "pins"; anchors: string[] };

export function envelope(session: string, message: HostMessage | PanelMessage) {
  return { bridge: BRIDGE, session, message };
}

export function bridgeMessage(
  data: unknown,
  session: string,
): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;
  const value = data as Record<string, unknown>;
  if (value["bridge"] !== BRIDGE || value["session"] !== session) return null;
  const message = value["message"];
  return message && typeof message === "object" && !Array.isArray(message)
    ? (message as Record<string, unknown>)
    : null;
}
