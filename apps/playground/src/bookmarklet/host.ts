import { init } from "react-grab/core";
import type { ReactGrabAPI } from "react-grab";
import {
  captureElementContext,
  captureElementHtml,
} from "../comments/element-context";
import {
  commentAnchor,
  describeElement,
  resolveAnchor,
} from "../comments/dom-anchor";
import {
  captureScreenshot,
  releaseScreenshotCapture,
} from "../comments/screenshot";
import {
  bridgeMessage,
  envelope,
  type HostMessage,
  type HostState,
} from "./model";
import { mountHost } from "./host-dom";

declare global {
  interface Window {
    __PLAYGROUND_GRABBER__?: { focus: () => void; close: () => void };
  }
}

function install() {
  if (window.__PLAYGROUND_GRABBER__) {
    window.__PLAYGROUND_GRABBER__.focus();
    return;
  }
  if (!["http:", "https:", "file:"].includes(location.protocol))
    throw new Error(
      "Playground grabber supports HTTP(S) and file documents only",
    );
  const script = document.currentScript as HTMLScriptElement | null;
  if (!script?.src)
    throw new Error("Bookmarklet must be loaded through its script URL");
  const origin = new URL(script.src).origin;
  const session = Array.from(
    crypto.getRandomValues(new Uint32Array(4)),
    (value) => value.toString(16),
  ).join("");
  const frameUrl = new URL("/", origin);
  frameUrl.search = new URLSearchParams({
    bookmarklet: "1",
    parentOrigin: location.protocol === "file:" ? "null" : location.origin,
    session,
  }).toString();
  let ready = false;
  let closed = false;
  let capturing = false;
  let screenshotRequested = false;
  let selectionVersion = 0;
  let state: HostState = {
    url: location.href,
    title: document.title || location.hostname,
  };
  const send = (message: HostMessage) =>
    ui.frame.contentWindow?.postMessage(envelope(session, message), origin);
  const ui = mountHost(frameUrl.href, (anchor) =>
    send({ type: "focus", anchor }),
  );
  const existing = window.__REACT_GRAB__;
  const api: ReactGrabAPI =
    existing ??
    init({ enabled: true, telemetry: false, freezeReactUpdates: false });
  if (!api || typeof api.registerPlugin !== "function") {
    ui.close();
    throw new Error("Incompatible React Grab API on this page");
  }
  if (!existing) window.__REACT_GRAB__ = api;
  const previousAction = api.getToolbarState()?.defaultAction;
  const previousEnabled = api.isEnabled();
  api.setEnabled(true);
  const plugin = `playground-bookmarklet-${session}`;

  async function select(element: Element, screenshot = false) {
    if (
      ui.root.contains(element) ||
      element.closest("[data-react-grab-ignore]")
    )
      return;
    const anchor = commentAnchor(element, document.body);
    if (!anchor) {
      send({
        type: "error",
        error: "Selected element is outside this document",
      });
      return;
    }
    const version = ++selectionVersion;
    const url = location.href;
    capturing = true;
    ui.frame.hidden = true;
    const image = screenshot ? captureScreenshot(element) : undefined;
    api.deactivate();
    try {
      const context = await captureElementContext(element, url);
      const capture = await image;
      if (closed || version !== selectionVersion || location.href !== url)
        return;
      state = {
        url,
        title: document.title || location.hostname,
        selection: {
          anchor,
          label: describeElement(element),
          element: {
            ...context,
            pageUrl: url,
            ...(capture ? { screenshot: capture } : {}),
          },
        },
      };
      ui.highlight(anchor);
      send({ type: "state", state });
    } catch (error) {
      send({
        type: "error",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      if (version === selectionVersion && !closed) {
        capturing = false;
        ui.frame.hidden = false;
      }
    }
  }

  api.registerPlugin({
    name: plugin,
    hooks: {
      onDeactivate() {
        if (!capturing) ui.frame.hidden = false;
      },
      onElementSelect(element) {
        if (
          api.getToolbarState()?.defaultAction !== "playground-external-comment"
        )
          return;
        const screenshot = screenshotRequested;
        screenshotRequested = false;
        void select(element, screenshot);
        return true;
      },
    },
    actions: [
      {
        id: "playground-external-comment",
        label: "Comment",
        onAction: (context) => {
          context.hideContextMenu();
          context.cleanup();
          return select(context.element);
        },
      },
      {
        id: "playground-external-screenshot",
        label: "Comment with screenshot",
        onAction: (context) => {
          context.hideContextMenu();
          context.cleanup();
          return select(context.element, true);
        },
      },
    ],
  });
  api.setToolbarState({ defaultAction: "playground-external-comment" });

  function onMessage(event: MessageEvent) {
    if (event.origin !== origin || event.source !== ui.frame.contentWindow)
      return;
    const message = bridgeMessage(event.data, session);
    if (!message) return;
    switch (message["type"]) {
      case "ready":
        ready = true;
        ui.root.shadowRoot?.querySelector(".error")?.remove();
        send({ type: "state", state });
        break;
      case "close":
        close();
        break;
      case "pick":
        screenshotRequested = message["screenshot"] === true;
        ui.frame.hidden = true;
        api.setToolbarState({ defaultAction: "playground-external-comment" });
        api.activate();
        break;
      case "page":
        selectionVersion++;
        state = {
          url: location.href,
          title: document.title || location.hostname,
          selection: {
            anchor: "__document__",
            label: "Whole page",
            element: {
              source: location.href,
              pageUrl: location.href,
              html: captureElementHtml(document.body),
            },
          },
        };
        send({ type: "state", state });
        break;
      case "pins":
        if (
          Array.isArray(message["anchors"]) &&
          message["anchors"].every((anchor) => typeof anchor === "string")
        ) {
          ui.update(message["anchors"], (anchors) =>
            send({ type: "anchors", anchors }),
          );
        }
        break;
      case "highlight":
        if (message["anchor"] === null || typeof message["anchor"] === "string")
          ui.highlight(message["anchor"]);
        break;
      case "scroll": {
        if (typeof message["anchor"] !== "string") return;
        const element =
          message["anchor"] === "__document__"
            ? document.body
            : resolveAnchor(document.body, message["anchor"]);
        if (!element) return;
        element.scrollIntoView({
          behavior: message["behavior"] === "auto" ? "auto" : "smooth",
          block: message["block"] === "start" ? "start" : "center",
        });
        if (
          typeof message["offset"] === "number" &&
          Number.isFinite(message["offset"])
        ) {
          window.scrollBy({ top: -message["offset"], behavior: "instant" });
        }
        ui.highlight(message["anchor"]);
        break;
      }
    }
  }
  window.addEventListener("message", onMessage);
  const startup = window.setTimeout(() => {
    if (!ready)
      ui.error(
        "Playground comments could not load. Check that the playground is running and this page permits its scripts and frames, then reload this page and activate the bookmarklet again.",
      );
  }, 15000);
  const navigation = window.setInterval(() => {
    if (state.url === location.href) return;
    selectionVersion++;
    capturing = false;
    ui.frame.hidden = false;
    state = { url: location.href, title: document.title || location.hostname };
    ui.update([], () => {});
    ui.highlight(null);
    send({ type: "state", state });
  }, 250);
  function close() {
    closed = true;
    selectionVersion++;
    window.clearTimeout(startup);
    window.clearInterval(navigation);
    window.removeEventListener("message", onMessage);
    releaseScreenshotCapture();
    api.unregisterPlugin(plugin);
    if (existing) {
      api.setToolbarState({ defaultAction: previousAction ?? "copy" });
      api.setEnabled(previousEnabled);
    } else {
      api.dispose();
      delete window.__REACT_GRAB__;
    }
    ui.close();
    delete window.__PLAYGROUND_GRABBER__;
  }
  window.__PLAYGROUND_GRABBER__ = {
    focus() {
      api.deactivate();
      ui.frame.hidden = false;
      ui.frame.focus();
      if (ready) send({ type: "state", state });
    },
    close,
  };
}

try {
  install();
} catch (error) {
  window.alert(
    `Playground grabber: ${error instanceof Error ? error.message : String(error)}`,
  );
}
