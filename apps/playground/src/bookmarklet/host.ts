import { startPageAgent, validateHostMessage } from "@flanksource/page-runtime/frame";
import type { AgentFrameMessage, AgentSelection } from "@flanksource/page-runtime/schema";
import { captureScreenshot, releaseScreenshotCapture } from "../comments/screenshot";
import { bridgeMessage, envelope, externalTitle, type HostMessage, type HostState } from "./model";
import { mountHost } from "./host-dom";
import { sidebarWidth } from "./host-resize";
import { bookmarkletParentOrigin } from "./origin";

declare global {
  interface Window { __PLAYGROUND_GRABBER__?: { focus: () => void; close: () => void } }
}

export function installBookmarklet(scriptUrl: string) {
  if (window.__PLAYGROUND_GRABBER__) { window.__PLAYGROUND_GRABBER__.focus(); return; }
  if (!["http:", "https:", "file:"].includes(location.protocol)) throw new Error("The shared page agent requires an HTTP(S) or file document");
  const origin = new URL(scriptUrl).origin;
  const session = crypto.randomUUID();
  const frameUrl = new URL("/", origin);
  frameUrl.search = new URLSearchParams({ bookmarklet: "1", parentOrigin: bookmarkletParentOrigin(location.href), session }).toString();
  let ready = false;
  let closed = false;
  let screenshotRequested = false;
  let version = 0;
  let state: HostState = { url: location.href, title: externalTitle({ url: location.href, title: document.title }) };
  const send = (message: HostMessage) => ui.frame.contentWindow?.postMessage(envelope(session, message), origin);
  const error = (cause: unknown) => { ui.resume(); send({ type: "error", error: cause instanceof Error ? cause.message : String(cause) }); };
  const ui = mountHost(frameUrl.href, anchor => send({ type: "focus", anchor }), width => send({ type: "sidebar-width", width }), floating => send({ type: "presentation", floating }));

  async function select(selection: AgentSelection) {
    const revision = ++version;
    const url = location.href;
    const screenshot = screenshotRequested;
    screenshotRequested = false;
    try {
      const image = screenshot ? await captureScreenshot({ rect: { x: selection.rect.left, y: selection.rect.top, width: selection.rect.width, height: selection.rect.height }, isLive: () => !closed && version === revision && location.href === url }) : undefined;
      if (closed || version !== revision || location.href !== url) return;
      state = { url, title: externalTitle({ url, title: document.title }), selection: { anchor: selection.anchor, label: selection.label, element: { source: selection.element.source, componentName: selection.element.componentName, html: selection.element.html, locators: selection.element.locators, pageUrl: url, ...(image ? { screenshot: image } : {}) } } };
      send({ type: "state", state });
    } catch (cause) { error(cause); }
    finally { if (!closed && version === revision) ui.resume(); }
  }

  function receive(message: AgentFrameMessage) {
    if (message.type === "selection") void select(message.selection);
    else if (message.type === "focus") { ui.showRail(); send(message); }
    else if (message.type === "anchors") send({ type: "anchors", anchors: message.anchors.map(anchor => ({ anchor: anchor.anchor, available: anchor.state !== "orphaned", label: anchor.state === "moved" ? `${anchor.label} (moved)` : anchor.label, ...(anchor.rect ? { top: anchor.rect.top } : {}) })) });
    else if (message.type === "keys" && message.key === "c") { ui.frame.hidden = true; agent.receive({ type: "pick" }); }
    else if (message.type === "keys" && message.key === "Escape") ui.resume();
  }
  const start = () => startPageAgent({ root: document.body, page: location.href, sourceContext: { mode: "external-document", url: location.href }, send: receive, error, ...(window.__REACT_GRAB__ ? { picker: window.__REACT_GRAB__ } : {}) });
  let agent: ReturnType<typeof startPageAgent>;
  try { agent = start(); } catch (cause) { ui.close(); throw cause; }

  function onMessage(event: MessageEvent) {
    if (event.origin !== origin || event.source !== ui.frame.contentWindow) return;
    const message = bridgeMessage(event.data, session);
    if (!message) return;
    try {
      switch (message["type"]) {
        case "ready": ui.layout(sidebarWidth(message["width"]), false); ready = true; ui.root.shadowRoot?.querySelector(".error")?.remove(); send({ type: "state", state }); break;
        case "sidebar-layout":
          if (typeof message["maximized"] !== "boolean") throw new Error("Invalid detail mode");
          ui.layout(sidebarWidth(message["width"]), message["maximized"]); break;
        case "minimize": agent.receive({ type: "mode", mode: "off" }); ui.minimize(); break;
        case "draft":
          if (typeof message["active"] !== "boolean" || (message["active"] && typeof message["anchor"] !== "string")) throw new Error("Invalid floating comment presentation");
          ui.draft(message["active"], typeof message["anchor"] === "string" ? message["anchor"] : undefined, message["posted"] === true); break;
        case "draft-size":
          if (typeof message["height"] !== "number" || !Number.isFinite(message["height"]) || message["height"] <= 0) throw new Error("Invalid floating comment height");
          ui.draftSize(message["height"]); break;
        case "pick": screenshotRequested = message["screenshot"] === true; ui.frame.hidden = true; agent.receive({ type: "mode", mode: "comment" }); break;
        case "page": ui.showRail(); agent.receive({ type: "page" }); break;
        case "pins": {
          const command = validateHostMessage(message);
          if (command.type !== "pins") throw new Error("Unexpected bookmarklet pins command");
          agent.receive(command); break;
        }
        case "highlight": case "scroll": {
          const command = validateHostMessage(message);
          if (command.type !== "highlight" && command.type !== "scroll") throw new Error("Unexpected bookmarklet command");
          agent.receive(command); break;
        }
        case "close": close(); break;
        default: throw new Error(`Unknown bookmarklet command ${String(message["type"])}`);
      }
    } catch (cause) { error(cause); }
  }
  window.addEventListener("message", onMessage);
  const startup = setTimeout(() => { if (!ready) ui.error("Playground comments could not load. Check that the playground is running and this page permits its scripts and frames."); }, 15000);
  const navigation = setInterval(() => {
    if (state.url === location.href) return;
    version++; agent.dispose();
    try { agent = start(); } catch (cause) { error(cause); return; }
    state = { url: location.href, title: externalTitle({ url: location.href, title: document.title }) }; ui.pageChanged(); send({ type: "state", state });
  }, 250);
  function close() {
    closed = true; version++; clearTimeout(startup); clearInterval(navigation); window.removeEventListener("message", onMessage); releaseScreenshotCapture(); agent.dispose(); ui.close(); delete window.__PLAYGROUND_GRABBER__;
  }
  window.__PLAYGROUND_GRABBER__ = { focus() { agent.receive({ type: "mode", mode: "off" }); ui.restore(); ui.frame.focus(); }, close };
}

const currentScript = document.currentScript as HTMLScriptElement | null;
if (currentScript?.src) {
  try { installBookmarklet(currentScript.src); } catch (error) { window.alert(`Playground grabber: ${error instanceof Error ? error.message : String(error)}`); }
}
