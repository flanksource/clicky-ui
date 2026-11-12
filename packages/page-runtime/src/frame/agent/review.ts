import { getFiberFromHostInstance } from "bippy";
import { captureLocators, describeElement, COMMENT_ELEMENT_HTML_LIMIT, COMMENT_ELEMENT_HTML_TRUNCATION } from "@flanksource/clicky-ui/comments";
import type { ReviewAction, ReviewElement, ReviewFrameMessage, ReviewHostMessage } from "../../review-schema.ts";
import { REVIEW_ID, validateReviewHostMessage } from "../../host/review/validation.ts";
import { resolvePageOwner, isPageElement } from "./owner.ts";
import { elementRect } from "./overlay.ts";
import { setRemoved } from "../../editing.ts";

export function createReviewAgent(options: { root: HTMLElement; send(message: ReviewFrameMessage): void; error(error: Error): void; componentName(element: Element): string | null; containedAnchors(element: Element): string[] }) {
  let visible = false;
  let showRejected = false;
  let selected: string | null = null;
  let scheduled: number | undefined;
  let disposed = false;
  const previousRejected = new Map<Element, string | null>();
  function applyVisibility(): void {
    for (const node of [options.root, ...options.root.querySelectorAll("[data-review-content]")]) {
      if (!previousRejected.has(node)) previousRejected.set(node, node.getAttribute("data-show-rejected"));
      if (node.getAttribute("data-show-rejected") !== String(showRejected)) node.setAttribute("data-show-rejected", String(showRejected));
    }
  }
  function nodes(): HTMLElement[] {
    return [...options.root.querySelectorAll<HTMLElement>("[data-review-id]")].filter((node) => isPageElement({ element: node, root: options.root }));
  }
  function describe(node: Element, id: string): ReviewElement {
    const owner = resolvePageOwner({ element: node, root: options.root, componentName: options.componentName(node), fiber: getFiberFromHostInstance(node) });
    const html = node.outerHTML;
    return { id, ...(node.id ? { domId: node.id } : {}), selection: { anchor: `[data-review-id="${id}"]`, label: describeElement(node), rect: elementRect(node), element: {
      source: owner.source, componentName: owner.componentName, locators: captureLocators(node, options.root),
      html: html.length <= COMMENT_ELEMENT_HTML_LIMIT ? html : `${html.slice(0, COMMENT_ELEMENT_HTML_LIMIT)}${COMMENT_ELEMENT_HTML_TRUNCATION}`,
    } } };
  }
  function enumerate(): ReviewElement[] {
    const seen = new Set<string>();
    return nodes().flatMap((node) => {
      const id = node.getAttribute("data-review-id")!;
      if (!REVIEW_ID.test(id) || seen.has(id)) throw new Error(`Review id ${JSON.stringify(id)} must be valid and unique on this page`);
      seen.add(id);
      return node.getClientRects().length ? [describe(node, id)] : [];
    });
  }
  function state(requestId?: string): void {
    applyVisibility();
    const elements = visible ? enumerate() : [];
    if (!elements.some((element) => element.id === selected)) selected = null;
    options.send({ type: "review-state", ...(requestId ? { requestId } : {}), elements, selected, visible, showRejected });
  }
  function schedule(): void {
    if (!visible || disposed || scheduled !== undefined) return;
    scheduled = requestAnimationFrame(() => { scheduled = undefined; try { state(); } catch (error) { options.error(error instanceof Error ? error : new Error(String(error))); } });
  }
  function target(id: string): HTMLElement {
    const found = nodes().filter((node) => node.getAttribute("data-review-id") === id);
    if (found.length !== 1) throw new Error(`Review element ${JSON.stringify(id)} must exist exactly once`);
    return found[0]!;
  }
  function action(optionsForAction: { node: Element; id: string; action: ReviewAction; requestId: string }): void {
    if (!visible) throw new Error("Review actions require visible review controls");
    const { node, id, action, requestId } = optionsForAction;
    if (action === "delete") {
      options.send({ type: "review-action-request", requestId, action, element: describe(node, id), containedAnchors: options.containedAnchors(node) });
      return;
    }
    let content;
    if (action === "export") {
      const region = [...node.querySelectorAll("[data-review-content]")].find((region) => region.parentElement?.closest("[data-review-id]") === node) ?? node;
      const clone = region.cloneNode(true) as Element;
      for (const ignored of clone.querySelectorAll("script,[data-page-agent],[data-react-grab],[data-react-grab-ignore]")) ignored.remove();
      content = { html: clone.outerHTML, ...(clone.matches("svg") ? { svg: clone.outerHTML } : {}) };
    }
    options.send({ type: "review-action-request", requestId, action, element: describe(node, id), ...(content ? { content } : {}) });
  }
  const mutation = new MutationObserver(schedule);
  mutation.observe(options.root, { childList: true, subtree: true, attributes: true, characterData: true });
  const resize = new ResizeObserver(schedule); resize.observe(options.root);
  window.addEventListener("scroll", schedule, true); window.addEventListener("resize", schedule);
  return {
    receive(value: ReviewHostMessage): void {
      if (disposed) throw new Error("Review agent is disposed");
      const m = validateReviewHostMessage(value);
      try {
        if (m.type === "review-remove") { setRemoved(`review:${m.id}`, m.removed); selected = null; state(m.requestId); return; }
        if (m.type === "review-action") action({ node: target(m.id), id: m.id, action: m.action, requestId: m.requestId });
        else {
          if (m.type === "review-visibility") { visible = m.visible; showRejected = m.showRejected; }
          if (m.type === "review-select") { if (m.id !== null) { if (!visible) throw new Error("Review selection requires visible review controls"); target(m.id).scrollIntoView({ block: "center" }); } selected = m.id; }
          state(m.requestId);
        }
      } catch (error) { options.send({ type: "review-error", requestId: m.requestId, error: error instanceof Error ? error.message : String(error) }); }
    },
    action(node: Element, kind: ReviewAction): void {
      if (!isPageElement({ element: node, root: options.root })) throw new Error("Review target must belong to the page");
      const reviewable = node.closest("[data-review-id]");
      if (kind !== "mark" && (!reviewable || !options.root.contains(reviewable))) throw new Error("Selected element is not reviewable");
      const id = kind === "mark" ? `new:${crypto.randomUUID()}` : reviewable!.getAttribute("data-review-id")!;
      action({ node: kind === "mark" ? node : reviewable!, id, action: kind, requestId: crypto.randomUUID() });
    },
    enabled: () => visible,
    dispose(): void {
      disposed = true; mutation.disconnect(); resize.disconnect();
      window.removeEventListener("scroll", schedule, true); window.removeEventListener("resize", schedule);
      if (scheduled !== undefined) cancelAnimationFrame(scheduled);
      for (const [node, value] of previousRejected) { if (value === null) node.removeAttribute("data-show-rejected"); else node.setAttribute("data-show-rejected", value); }
      previousRejected.clear();
    },
  };
}
