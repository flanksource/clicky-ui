import { init } from "@flanksource/react-grab/core";
import type { ReactGrabAPI } from "@flanksource/react-grab";
import { getFiberFromHostInstance } from "bippy";
import {
  captureLocators, commentAnchor, describeElement, COMMENT_ELEMENT_HTML_LIMIT, COMMENT_ELEMENT_HTML_TRUNCATION,
} from "@flanksource/clicky-ui/comments";
import type { AgentFrameMessage, AgentHostMessage, AgentSourceContext } from "../../schema.ts";
import { validateAgentHostMessage } from "../../host/agent-validation.ts";
import { isPageElement, resolvePageOwner } from "./owner.ts";
import { elementRect, mountAgentOverlay } from "./overlay.ts";
import { createDesignAgent, resolveDesignTarget } from "./design.ts";
import { validateDocumentSource } from "../../host/agent-source.ts";
import { createReviewAgent } from "./review.ts";
import { REVIEW_ACTIONS } from "../../host/review/validation.ts";
import { validatePageSources, type PageSourceContext } from "../../link/page-sources.ts";
import { captureVocabulary } from "./vocabulary.ts";

export type PageAgentOptions = {
  root: HTMLElement;
  page: string;
  send: (message: AgentFrameMessage) => void;
  error: (error: Error) => void;
  picker?: ReactGrabAPI;
  sourceContext?: AgentSourceContext;
} & PageSourceContext;

export function startPageAgent(options: PageAgentOptions) {
  if (!options.root.isConnected || !options.page) throw new Error("page agent requires a mounted root and page path");
  if (options.sourceContext) validateDocumentSource(options.sourceContext.url);
  if (options.pageSources) validatePageSources(options.pageSources);
  const design = createDesignAgent(options);
  const api = options.picker ?? init({ enabled: true, telemetry: false, freezeReactUpdates: false });
  const registered = new Map<string, Element>();
  const overlay = mountAgentOverlay({ root: options.root, send: options.send, registered });
  const review = createReviewAgent({ ...options, componentName: (element) => api.getDisplayName(element), containedAnchors: overlay.containedAnchors });
  const plugin = `page-agent-${crypto.randomUUID()}`;
  const previousAction = api.getToolbarState()?.defaultAction;
  const previousEnabled = api.isEnabled();
  let picking = false;
  let disposed = false;
  let version = 0;
  let mode: "off" | "comment" | "design" = "off";

  async function select(element: Element) {
    if (element.closest("[data-react-grab-ignore]")) return;
    picking = false;
    const revision = ++version;
    const componentName = api.getDisplayName(element);
    const owner = mode === "design" ? { ...resolveDesignTarget({ element, root: options.root }), componentName: componentName ?? element.tagName.toLowerCase() } : resolvePageOwner({ element, root: options.root, componentName, fiber: getFiberFromHostInstance(element), ...(options.sourceContext ? { sourceContext: options.sourceContext } : {}) });
    const anchor = commentAnchor(owner.element, options.root);
    if (!anchor) throw new Error("selected page element cannot be anchored");
    const html = owner.element.outerHTML;
    const context = {
      source: owner.source, componentName: owner.componentName,
      ...(options.sourceContext ? { sourceContext: options.sourceContext } : {}),
      html: html.length <= COMMENT_ELEMENT_HTML_LIMIT ? html : `${html.slice(0, COMMENT_ELEMENT_HTML_LIMIT)}${COMMENT_ELEMENT_HTML_TRUNCATION}`,
      locators: captureLocators(owner.element, options.root),
    };
    api.deactivate();
    if (disposed || version !== revision) return;
    overlay.highlight(anchor);
    const selection = { anchor, label: describeElement(owner.element), element: context, rect: elementRect(owner.element) };
    if (mode === "design") design.select(owner, selection); else options.send({ type: "selection", selection });
  }
  api.registerPlugin({ name: plugin, actions: REVIEW_ACTIONS.map((action) => ({
    id: `review-${action}`, label: action === "mark" ? "Make reviewable" : action === "approved" ? "Approve" : action === "rejected" ? "Reject with comment" : action === "revision_requested" ? "Request revision" : action === "delete" ? "Delete source and feedback" : "Export review content",
    enabled: ({ element }) => review.enabled() && isPageElement({ element, root: options.root }) && (action === "mark" ? !element.closest("[data-review-id]") : Boolean(element.closest("[data-review-id]"))),
    onAction: ({ element, hideContextMenu, cleanup }) => { hideContextMenu(); cleanup(); review.action(element, action); },
  })), hooks: {
    onElementSelect(element) {
      if (!picking) return;
      void select(element).catch((error: unknown) => options.error(error instanceof Error ? error : new Error(String(error))));
      return true;
    },
    onDeactivate() { picking = false; },
    transformActionContext(context) { return { ...context, enterPromptMode: () => {
      void select(context.element).catch((error: unknown) => options.error(error instanceof Error ? error : new Error(String(error))));
    } }; },
  } });
  function pick() { picking = true; api.setEnabled(true); api.setToolbarState({ defaultAction: "comment" }); api.activate(); }
  function receive(value: AgentHostMessage): void {
    if (disposed) throw new Error("page agent is disposed");
    if (value.type === "review-list" || value.type === "review-select" || value.type === "review-visibility" || value.type === "review-action") { review.receive(value); return; }
    const m = validateAgentHostMessage(value);
    switch (m.type) {
      case "mode":
        if (m.mode === "design" && options.sourceContext) throw new Error("Design mode requires runtime page sources");
        mode = m.mode;
        if (mode !== "off") pick(); else { version++; picking = false; api.deactivate(); } break;
      case "design-override": case "design-write": case "design-write-result":
        if (mode !== "design") throw new Error("Design request requires Design mode");
        design.receive(m); break;
      case "pick": pick(); break;
      case "page": {
        version++; picking = false; api.deactivate();
        const html = options.root.outerHTML;
        options.send({ type: "selection", selection: { anchor: "__document__", label: "Whole page", rect: elementRect(options.root), element: {
          source: options.sourceContext?.url ?? `${options.page}:1:1`, ...(options.sourceContext ? { sourceContext: options.sourceContext } : {}), componentName: "Page", locators: [],
          html: html.length <= COMMENT_ELEMENT_HTML_LIMIT ? html : `${html.slice(0, COMMENT_ELEMENT_HTML_LIMIT)}${COMMENT_ELEMENT_HTML_TRUNCATION}`,
        } } }); break;
      }
      case "pins": overlay.update(m.anchors, m.focus); break;
      case "highlight": overlay.highlight(m.anchor); break;
      case "scroll": {
        const element = overlay.target(m.anchor);
        if (!element) throw new Error(`cannot scroll to orphaned anchor ${m.anchor}`);
        element.scrollIntoView({ behavior: m.behavior ?? "smooth", block: m.block ?? "center" });
        if (m.offset !== undefined) window.scrollBy({ top: -m.offset, behavior: "instant" });
        overlay.highlight(m.anchor); break;
      }
      default: throw new Error(`page agent message ${m.type} requires a dedicated handler`);
    }
  }
  function keys(event: KeyboardEvent) {
    const toggle = event.key.toLowerCase() === "c" && event.altKey && !event.ctrlKey && !event.metaKey;
    if (event.key !== "Escape" && !toggle) return;
    if (event.isComposing || (toggle && event.composedPath().some((node) => node instanceof Element && node.matches('input,textarea,select,[contenteditable="true"]')))) return;
    event.preventDefault();
    if (event.key === "Escape") { version++; picking = false; api.deactivate(); }
    options.send({ type: "keys", key: event.key === "Escape" ? "Escape" : "c", ctrlKey: event.ctrlKey, metaKey: event.metaKey, altKey: event.altKey, shiftKey: event.shiftKey });
  }
  window.addEventListener("keydown", keys, true);
  return {
    receive,
    captureVocabulary(request: { ready: boolean }) {
      if (disposed) throw new Error("page agent is disposed");
      return captureVocabulary({ ready: request.ready, page: options.page });
    },
    registerAnchor(anchor: string, element: Element | null) {
      if (!anchor || (element && !isPageElement({ element, root: options.root }))) throw new Error("registered anchor must belong to the page root");
      if (element) {
        const existing = registered.get(anchor);
        if (existing && existing !== element && existing.isConnected) throw new Error(`duplicate registered anchor ${anchor}`);
        registered.set(anchor, element);
      } else registered.delete(anchor);
      overlay.schedule();
    },
    focusAnchor(anchor: string) { options.send({ type: "focus", anchor }); },
    dispose() {
      disposed = true; version++; window.removeEventListener("keydown", keys, true); api.deactivate(); api.unregisterPlugin(plugin);
      if (options.picker) { api.setToolbarState({ defaultAction: previousAction ?? "copy" }); api.setEnabled(previousEnabled); } else api.dispose();
      overlay.dispose(); registered.clear(); design.dispose(); review.dispose();
    },
  };
}

export type PageAgent = ReturnType<typeof startPageAgent>;
