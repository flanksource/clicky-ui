import type { ReviewHostMessage, ReviewFrameMessage } from "../../review-schema.ts";
import { keys, record } from "../../sw/profile.ts";
import { text, list, validateAgentSelection } from "../message-values.ts";

export const REVIEW_ID = /^[A-Za-z][A-Za-z0-9:_-]*$/;
export const REVIEW_ACTIONS = ["mark", "approved", "rejected", "revision_requested", "delete", "export"] as const;
function id(value: unknown): void { text(value); if (!REVIEW_ID.test(value)) throw new Error("Invalid review id"); }
function bool(value: unknown): void { if (typeof value !== "boolean") throw new Error("Invalid review visibility"); }
function action(value: unknown): void { if (!REVIEW_ACTIONS.some((action) => action === value)) throw new Error("Invalid review action"); }
function element(value: unknown): string {
  const e = record(value, "review.element"); keys(e, ["id", "selection", "domId"], "review.element");
  id(e.id); validateAgentSelection(e.selection);
  if (e.domId !== undefined) text(e.domId);
  return e.id as string;
}

export function validateReviewHostMessage(value: unknown): ReviewHostMessage {
  const m = record(value, "review"); text(m.requestId);
  switch (m.type) {
    case "review-remove": keys(m, ["type", "requestId", "id", "removed"], "review"); id(m.id); bool(m.removed); break;
    case "review-list": keys(m, ["type", "requestId"], "review"); break;
    case "review-select": keys(m, ["type", "requestId", "id"], "review"); if (m.id !== null) id(m.id); break;
    case "review-visibility": keys(m, ["type", "requestId", "visible", "showRejected"], "review"); bool(m.visible); bool(m.showRejected); break;
    case "review-action": keys(m, ["type", "requestId", "id", "action"], "review"); id(m.id); action(m.action); break;
    default: throw new Error("Unsupported review host message");
  }
  return m as ReviewHostMessage;
}

export function validateReviewFrameMessage(value: unknown): ReviewFrameMessage {
  const m = record(value, "review");
  if (m.type === "review-state") {
    keys(m, ["type", "requestId", "elements", "selected", "visible", "showRejected"], "review");
    if (m.requestId !== undefined) text(m.requestId);
    bool(m.visible); bool(m.showRejected);
    const ids = list(m.elements).map(element);
    if (new Set(ids).size !== ids.length) throw new Error("Review state contains duplicate ids");
    if (m.selected !== null && !ids.includes(m.selected as string)) throw new Error("Selected review element is absent");
  } else if (m.type === "review-action-request") {
    keys(m, ["type", "requestId", "action", "element", ...(m.action === "delete" ? ["containedAnchors"] : ["content"])], "review"); text(m.requestId); action(m.action); element(m.element);
    if (m.action === "delete") {
      const anchors = list(m.containedAnchors);
      for (const anchor of anchors) { text(anchor); if (Array.from(anchor).some((character) => character.charCodeAt(0) < 0x20 || character.charCodeAt(0) === 0x7f)) throw new Error("Invalid contained anchor"); }
      if (new Set(anchors).size !== anchors.length) throw new Error("Review deletion contains duplicate anchors");
    }
    if (m.content !== undefined) {
      if (m.action !== "export") throw new Error("Review content requires export action");
      const c = record(m.content, "review.content"); keys(c, ["html", "svg"], "review.content"); text(c.html, 10_000_000);
      if (c.svg !== undefined) text(c.svg, 10_000_000);
    }
    if (m.action === "export" && m.content === undefined) throw new Error("Review export requires content");
  } else if (m.type === "review-error") { keys(m, ["type", "requestId", "error"], "review"); text(m.requestId); text(m.error); }
  else throw new Error("Unsupported review frame message");
  return m as ReviewFrameMessage;
}
