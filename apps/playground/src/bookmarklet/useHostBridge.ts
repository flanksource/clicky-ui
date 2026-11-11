import { useEffect, useState } from "react";
import { useCommentRailWidth } from "@flanksource/clicky-ui/comments";
import { sidebarWidth } from "./host-resize";
import { bookmarkletPeerOrigin, matchesBookmarkletParent } from "./origin";
import { parseAnchors, parseFabPosition, parseHostState, parsePresentation, validateParentOrigin } from "./bridge-parse";
import { bridgeMessage, envelope, type AnchorState, type HostState, type PanelMessage, type Presentation } from "./model";

/**
 * How a panel reaches its host. `parentOrigin` names the document whose state
 * is accepted; `relayOrigin` is set when the Chrome extension frames the
 * playground panel through its relay page, which then is the window the panel
 * talks to.
 */
export type HostConnection = { parentOrigin: string | null; session: string | null; relayOrigin: string | null };

/** The playground panel's connection, from the bookmarklet's or relay's frame URL. */
export function playgroundConnection(search: string): HostConnection {
  const params = new URLSearchParams(search);
  return { parentOrigin: params.get("parentOrigin"), session: params.get("session"), relayOrigin: params.get("relayOrigin") };
}

let connection = playgroundConnection(location.search);

/** Panels with another frame URL contract (the extension's gavel panel) attach before they render. */
export function connectHostBridge(next: HostConnection) {
  connection = next;
}

export function sendToHost(message: PanelMessage) {
  const { parentOrigin, session, relayOrigin } = connection;
  if (!parentOrigin || !session || window.parent === window)
    throw new Error("Bookmarklet bridge is not attached to a parent document");
  const peer = bookmarkletPeerOrigin({ parentOrigin, relayOrigin });
  // File documents have opaque origins and require a wildcard target. Incoming
  // messages are still restricted to the parent window and this session.
  window.parent.postMessage(envelope(session, message), peer === "null" ? "*" : peer);
}

export function useHostBridge() {
  const [width, setWidth] = useCommentRailWidth(400, "playground.bookmarklet.width");
  const [state, setState] = useState<HostState>();
  const [anchors, setAnchors] = useState<AnchorState[]>([]);
  const [focus, setFocus] = useState<string>();
  const [error, setError] = useState("");
  const [presentation, setPresentation] = useState<Presentation>("compact");
  useEffect(() => {
    const { parentOrigin, session, relayOrigin } = connection;
    if (!parentOrigin || !session || window.parent === window) {
      setError("Open the grabber by activating its bookmarklet on a page.");
      return;
    }
    let peer: string;
    try {
      validateParentOrigin(parentOrigin);
      peer = bookmarkletPeerOrigin({ parentOrigin, relayOrigin });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      return;
    }
    const receive = (event: MessageEvent) => {
      if (!matchesBookmarkletParent({ expected: peer, received: event.origin }) || event.source !== window.parent)
        return;
      const message = bridgeMessage(event.data, session);
      if (!message) return;
      try {
        if (message["type"] === "presentation") {
          setPresentation(parsePresentation(message["mode"]));
        } else if (message["type"] === "fab-position") {
          localStorage.setItem("playground.bookmarklet.position", JSON.stringify(parseFabPosition(message)));
        } else if (message["type"] === "sidebar-width") {
          setWidth(sidebarWidth(message["width"]));
        } else if (message["type"] === "state") {
          setState(parseHostState(message["state"], parentOrigin));
          setAnchors([]);
          setFocus(undefined);
          setError("");
        } else if (message["type"] === "anchors") {
          setAnchors(parseAnchors(message["anchors"]));
        } else if (message["type"] === "focus" && typeof message["anchor"] === "string") {
          setFocus(message["anchor"]);
        } else if (message["type"] === "error" && typeof message["error"] === "string") {
          setError(message["error"]);
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : String(cause));
      }
    };
    window.addEventListener("message", receive);
    sendToHost({ type: "ready", width });
    try {
      const stored = localStorage.getItem("playground.bookmarklet.position");
      if (stored) sendToHost({ type: "fab-position", ...JSON.parse(stored) as { x: number; y: number } });
    } catch (cause) { setError(String(cause)); }
    return () => window.removeEventListener("message", receive);
  }, []);
  return { state, anchors, focus, error, floating: presentation === "draft", presentation };
}
