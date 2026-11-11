import { startPageAgent, validateHostMessage } from "@flanksource/page-runtime/frame/agent";
import type { AgentFrameMessage, AgentSelection } from "@flanksource/page-runtime/schema";
import type { ContextMenuActionContext } from "@flanksource/react-grab";
import type { CommentScreenshotCapture } from "../../plugins/comments-model";
import { SIDEBAR_PLUGIN_NAME, grabberPlugin, registerGrabberPlugin, sidebarButtonPlugin } from "../comments/react-grab-actions";
import { captureScreenshot, releaseScreenshotCapture, screenshotCaptureSupported } from "../comments/screenshot";
import type { ScreenshotTarget } from "../comments/screenshot-viewport";
import { bridgeMessage, envelope, externalTitle, type HostMessage, type HostState } from "./model";
import { mountHost } from "./host-dom";
import { withOverlaysHidden } from "./host-capture";
import { commentPlugin } from "@flanksource/react-grab/core";
import { GAVEL_SVG, GAVEL_FILLED_SVG } from "./gavel-icon";
import { gavelTodoActions, type GavelTodoOptions } from "./host-gavel";
import { acquireGrab } from "./host-grab";
import { closeTodoModal, openTodoModal } from "./host-todo-modal";
import { sidebarWidth } from "./host-resize";
import { bookmarkletFrame, type GavelPanelFrame } from "./origin";
import { SITE_SETTINGS_KEY, withSiteSession } from "./site-settings";

declare global {
  interface Window { __PLAYGROUND_GRABBER__?: { focus: () => void; close: () => void } }
}

/**
 * `playground` is any URL on the playground origin (the bookmarklet passes its
 * own script URL). The Chrome extension also passes its `relay` page, or, for
 * the gavel backend, its bundled `gavel` panel, an `onClose` callback so it
 * can forget the grabber once the user closes it, and a `capture` that takes
 * screenshots without the browser's share picker (the bookmarklet has none and
 * uses screen sharing).
 */
type Capture = (target: Element | ScreenshotTarget) => Promise<CommentScreenshotCapture>;

export type HostOptions = {
  onClose?: () => void;
  capture?: Capture;
} & (
  | { playground: string; relay?: string }
  // Gavel todos always use the extension's own capture (never screen sharing) and upload (from the extension, not the page).
  | { gavel: GavelPanelFrame; capture: Capture; upload: GavelTodoOptions["upload"] }
);

export function installBookmarklet(options: HostOptions) {
  if (window.__PLAYGROUND_GRABBER__) { window.__PLAYGROUND_GRABBER__.focus(); return; }
  if (!["http:", "https:", "file:"].includes(location.protocol)) throw new Error("The shared page agent requires an HTTP(S) or file document");
  const session = crypto.randomUUID();
  const { src: frameSrc, origin } = bookmarkletFrame({ documentUrl: location.href, session, ...("gavel" in options ? { panel: options.gavel } : { playground: options.playground, ...(options.relay ? { relay: options.relay } : {}) }) });
  let ready = false;
  let closed = false;
  let screenshotRequested = false;
  let version = 0;
  let state: HostState = { url: location.href, title: externalTitle({ url: location.href, title: document.title }) };
  const send = (message: HostMessage) => ui.frame.contentWindow?.postMessage(envelope(session, message), origin);
  const error = (cause: unknown) => { ui.resume(); send({ type: "error", error: cause instanceof Error ? cause.message : String(cause) }); };
  // The toolbar's sidebar button is registered once the picker exists; until then there is nothing to refresh.
  let sidebarChanged = (_open: boolean) => {};
  const ui = mountHost(frameSrc,anchor => send({ type: "focus", anchor }), width => send({ type: "sidebar-width", width }), mode => send({ type: "presentation", mode }), position => send({ type: "fab-position", ...position }), open => sidebarChanged(open));

  // A supplied capture runs with the grabber's own UI hidden; screen sharing (the bookmarklet's) shows the browser's picker instead.
  const takeScreenshot = (target: Element | ScreenshotTarget) => options.capture
    ? withOverlaysHidden({ overlays: [ui.root], work: () => options.capture!(target) })
    : captureScreenshot(target);
  // The toolbar's Comment actions start the page agent's own selection, which arrives in receive() like a picked one.
  const commentFromToolbar = (context: ContextMenuActionContext, { screenshot }: { screenshot: boolean }) => {
    if (!context.enterPromptMode) throw new Error("React Grab offered no way to start a comment on the selected element");
    screenshotRequested = screenshot;
    context.hideContextMenu();
    context.cleanup();
    context.enterPromptMode();
  };

  async function select(selection: AgentSelection) {
    const revision = ++version;
    const url = location.href;
    const screenshot = screenshotRequested;
    screenshotRequested = false;
    try {
      const image = screenshot ? await takeScreenshot({ rect: { x: selection.rect.left, y: selection.rect.top, width: selection.rect.width, height: selection.rect.height }, isLive: () => !closed && version === revision && location.href === url }) : undefined;
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
  // The grabber's plugin goes on before the page agent starts, so the default action the agent restores on each restart is Comment.
  let owned: ReturnType<typeof acquireGrab>;
  try { owned = acquireGrab(); } catch (cause) { ui.close(); throw cause; }
  let unregisterPlugin = () => {};
  const releaseGrab = () => { owned.grab.unregisterPlugin(SIDEBAR_PLUGIN_NAME); unregisterPlugin(); closeTodoModal(); if (owned.created) owned.grab.dispose(); };
  // The gavel icon on the toolbar opens and closes the sidebar like the FAB and the panel's minimize do; registering again refreshes its pressed state.
  const toggleSidebar = () => {
    if (ui.minimized()) ui.showRail();
    else { agent.receive({ type: "mode", mode: "off" }); ui.minimize(); }
  };
  const registerSidebarButton = (open: boolean) => owned.grab.registerPlugin(sidebarButtonPlugin({ icon: open ? GAVEL_FILLED_SVG : GAVEL_SVG, open, toggle: toggleSidebar }));
  sidebarChanged = registerSidebarButton;
  const start = () => startPageAgent({ root: document.body, page: location.href, sourceContext: { mode: "external-document", url: location.href }, send: receive, error, picker: owned.grab });
  let agent: ReturnType<typeof startPageAgent>;
  try {
    const gavel = "gavel" in options ? gavelTodoActions({ grab: owned.grab, server: options.gavel.server, todoRelay: options.gavel.todoRelay, capture: takeScreenshot, upload: options.upload, openModal: openTodoModal }) : undefined;
    unregisterPlugin = registerGrabberPlugin({
      grab: owned.grab,
      comment: commentPlugin,
      plugin: grabberPlugin({
        enabled: ({ element }) => !element.closest("[data-react-grab-ignore]"),
        onComment: commentFromToolbar,
        captureSupported: options.capture ? () => true : screenshotCaptureSupported,
        capture: takeScreenshot,
        ...(gavel ? { gavel } : {}),
      }),
    });
    registerSidebarButton(!ui.minimized());
    agent = start();
  } catch (cause) { releaseGrab(); ui.close(); throw cause; }

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
        case "open-rail": ui.showRail(); break;
        case "dialog":
          if (typeof message["open"] !== "boolean") throw new Error("Invalid dialog presentation");
          ui.dialog(message["open"]); break;
        case "fab-position":
          if (typeof message["x"] !== "number" || !Number.isFinite(message["x"]) || typeof message["y"] !== "number" || !Number.isFinite(message["y"])) throw new Error("Invalid FAB position");
          ui.position({ x: message["x"], y: message["y"] }); break;
        case "draft":
          if (typeof message["active"] !== "boolean" || (message["active"] && typeof message["anchor"] !== "string")) throw new Error("Invalid floating comment presentation");
          ui.draft(message["active"], typeof message["anchor"] === "string" ? message["anchor"] : undefined); break;
        case "draft-size":
          if (typeof message["height"] !== "number" || !Number.isFinite(message["height"]) || message["height"] <= 0) throw new Error("Invalid floating comment height");
          ui.draftSize(message["height"]); break;
        case "pick": screenshotRequested = message["screenshot"] === true; ui.frame.hidden = true; agent.receive({ type: "mode", mode: "comment" }); break;
        case "page": agent.receive({ type: "page" }); break;
        case "settings": {
          const agentSession = message["session"];
          if (agentSession !== null && (typeof agentSession !== "string" || agentSession === "")) throw new Error("Invalid grabber agent session");
          const stored = withSiteSession(localStorage.getItem(SITE_SETTINGS_KEY), agentSession);
          if (stored === null) localStorage.removeItem(SITE_SETTINGS_KEY);
          else localStorage.setItem(SITE_SETTINGS_KEY, stored);
          break;
        }
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
  const startup = setTimeout(() => { if (!ready) ui.error("gavel" in options ? "Gavel comments could not load. Check that the extension is enabled and this page permits extension frames." : "Playground comments could not load. Check that the playground is running and this page permits its scripts and frames."); }, 15000);
  const navigation = setInterval(() => {
    if (state.url === location.href) return;
    version++; agent.dispose();
    try { agent = start(); } catch (cause) { error(cause); return; }
    state = { url: location.href, title: externalTitle({ url: location.href, title: document.title }) }; ui.pageChanged(); send({ type: "state", state });
  }, 250);
  function close() {
    closed = true; version++; clearTimeout(startup); clearInterval(navigation); window.removeEventListener("message", onMessage); releaseScreenshotCapture(); agent.dispose(); releaseGrab(); ui.close(); delete window.__PLAYGROUND_GRABBER__;
    options.onClose?.();
  }
  window.__PLAYGROUND_GRABBER__ = { focus() { agent.receive({ type: "mode", mode: "off" }); ui.compact(); ui.frame.focus(); }, close };
}

const currentScript = document.currentScript as HTMLScriptElement | null;
if (currentScript?.src) {
  try { installBookmarklet({ playground: currentScript.src }); } catch (error) { window.alert(`Playground grabber: ${error instanceof Error ? error.message : String(error)}`); }
}
