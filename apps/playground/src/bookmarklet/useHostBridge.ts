import { useEffect, useState } from "react";
import {
  bridgeMessage,
  envelope,
  externalUrl,
  type AnchorState,
  type HostState,
  type PanelMessage,
  type Selection,
} from "./model";

const params = new URLSearchParams(location.search);
const parentOrigin = params.get("parentOrigin");
const session = params.get("session");

export function sendToHost(message: PanelMessage) {
  if (!parentOrigin || !session || window.parent === window)
    throw new Error("Bookmarklet bridge is not attached to a parent document");
  // File documents have opaque origins and require a wildcard target. Incoming
  // messages are still restricted to the parent window and this session.
  window.parent.postMessage(
    envelope(session, message),
    parentOrigin === "null" ? "*" : parentOrigin,
  );
}

function parseSelection(input: unknown): Selection | undefined {
  if (input === undefined) return undefined;
  if (!input || typeof input !== "object")
    throw new Error("Invalid element selection");
  const selection = input as Record<string, unknown>;
  const element = selection["element"];
  if (
    typeof selection["anchor"] !== "string" ||
    typeof selection["label"] !== "string" ||
    !element ||
    typeof element !== "object"
  )
    throw new Error("Invalid selection fields");
  const context = element as Record<string, unknown>;
  if (
    typeof context["source"] !== "string" ||
    typeof context["html"] !== "string" ||
    typeof context["pageUrl"] !== "string"
  ) {
    throw new Error("Selection requires document URL, source and HTML");
  }
  externalUrl(context["pageUrl"]);
  return input as Selection;
}

export function useHostBridge() {
  const [state, setState] = useState<HostState>();
  const [anchors, setAnchors] = useState<AnchorState[]>([]);
  const [focus, setFocus] = useState<string>();
  const [error, setError] = useState("");
  useEffect(() => {
    if (!parentOrigin || !session || window.parent === window) {
      setError("Open the grabber by activating its bookmarklet on a page.");
      return;
    }
    if (
      parentOrigin !== "null" &&
      (new URL(parentOrigin).origin !== parentOrigin ||
        !/^https?:/.test(parentOrigin))
    ) {
      setError("Invalid parent origin");
      return;
    }
    const receive = (event: MessageEvent) => {
      if (event.origin !== parentOrigin || event.source !== window.parent)
        return;
      const message = bridgeMessage(event.data, session);
      if (!message) return;
      try {
        if (message["type"] === "state") {
          const input = message["state"] as Record<string, unknown> | undefined;
          if (
            !input ||
            typeof input["url"] !== "string" ||
            typeof input["title"] !== "string"
          )
            throw new Error("Invalid document state");
          const documentUrl = new URL(externalUrl(input["url"]).url);
          if (
            parentOrigin === "null"
              ? documentUrl.protocol !== "file:"
              : documentUrl.origin !== parentOrigin
          )
            throw new Error("Document origin does not match the parent");
          const selection = parseSelection(input["selection"]);
          if (
            selection?.element.pageUrl !== undefined &&
            selection.element.pageUrl !== input["url"]
          )
            throw new Error("Selection belongs to another URL");
          setState({
            url: input["url"],
            title: input["title"],
            ...(selection ? { selection } : {}),
          });
          setAnchors([]);
          setFocus(undefined);
          setError("");
        } else if (message["type"] === "anchors") {
          const values = message["anchors"];
          if (
            !Array.isArray(values) ||
            !values.every((value: unknown) => {
              if (!value || typeof value !== "object") return false;
              const anchor = value as Record<string, unknown>;
              return (
                typeof anchor["anchor"] === "string" &&
                typeof anchor["label"] === "string" &&
                typeof anchor["available"] === "boolean" &&
                (anchor["available"] === false ||
                  (typeof anchor["top"] === "number" &&
                    Number.isFinite(anchor["top"])))
              );
            })
          )
            throw new Error("Invalid anchor state");
          setAnchors(values as AnchorState[]);
        } else if (
          message["type"] === "focus" &&
          typeof message["anchor"] === "string"
        )
          setFocus(message["anchor"]);
        else if (
          message["type"] === "error" &&
          typeof message["error"] === "string"
        )
          setError(message["error"]);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : String(cause));
      }
    };
    window.addEventListener("message", receive);
    sendToHost({ type: "ready" });
    return () => window.removeEventListener("message", receive);
  }, []);
  return { state, anchors, focus, error };
}
