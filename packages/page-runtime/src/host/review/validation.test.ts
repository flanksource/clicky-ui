import { expect, it } from "vitest";
import { validateReviewHostMessage, validateReviewFrameMessage } from "./validation.ts";

const element = { id: "summary", selection: { anchor: '[data-review-id="summary"]', label: "Summary", rect: { left: 10, top: 20, width: 100, height: 40 }, element: { source: "report.tsx:1:1#0@012345abcdef", componentName: "article", html: "<article>Summary</article>", locators: [] } } };
it("validates review enumeration, selection, visibility and action messages", () => {
  for (const message of [{ type: "review-list", requestId: "list" }, { type: "review-select", requestId: "select", id: "summary" }, { type: "review-visibility", requestId: "visibility", visible: true, showRejected: false }, { type: "review-action", requestId: "action", id: "summary", action: "approved" }]) expect(validateReviewHostMessage(message)).toEqual(message);
  const message = { type: "review-state", requestId: "list", elements: [element], selected: null, visible: true, showRejected: false };
  expect(validateReviewFrameMessage(message)).toEqual(message);
});
it.each([
  { type: "review-action", requestId: "action", id: "summary", action: "execute" },
  { type: "review-select", requestId: "select", id: '[onclick="run()"]' },
  { type: "review-visibility", requestId: "visibility", visible: "true", showRejected: false },
  { type: "review-list", requestId: "list", secret: true },
])("rejects untrusted review requests %#", (message) => expect(() => validateReviewHostMessage(message)).toThrow());
it("rejects duplicate IDs, library sources, nonfinite geometry and mismatched actions", () => {
  const state = { type: "review-state", requestId: "list", elements: [element], selected: null, visible: true, showRejected: false };
  expect(() => validateReviewFrameMessage({ ...state, elements: [element, element] })).toThrow(/duplicate/);
  expect(() => validateReviewFrameMessage({ ...state, selected: "missing" })).toThrow();
  for (const selection of [{ ...element.selection, rect: { ...element.selection.rect, top: NaN } }, { ...element.selection, element: { ...element.selection.element, source: "/link/library/Button.tsx:1:1" } }]) expect(() => validateReviewFrameMessage({ ...state, elements: [{ ...element, selection }] })).toThrow();
});

const deletion = { type: "review-action-request", requestId: "delete", action: "delete", element };
it.each([{ containedAnchors: [] }, { containedAnchors: ['[data-review-id="summary"]', "#nested", "moved-feedback"] }, { containedAnchors: Array.from({ length: 10000 }, (_, index) => `anchor-${index}`) }])("accepts bounded contained anchor IDs for deletion %#", ({ containedAnchors }) => {
  const message = { ...deletion, containedAnchors };
  expect(validateReviewFrameMessage(message)).toEqual(message);
});
it.each([undefined, null, "#nested", [""], [42], ["#nested", "#nested"], ["x".repeat(4097)], ["bad\u0000anchor"], ["bad\u001fanchor"], ["bad\u007fanchor"], Array.from({ length: 10001 }, (_, index) => `anchor-${index}`)].map(containedAnchors => ({ containedAnchors })))("rejects missing or malformed contained anchors %#", ({ containedAnchors }) => {
  expect(() => validateReviewFrameMessage({ ...deletion, containedAnchors })).toThrow();
});
it("permits contained anchors only on delete requests", () => {
  expect(() => validateReviewFrameMessage({ ...deletion, action: "approved", containedAnchors: [] })).toThrow();
  expect(() => validateReviewFrameMessage({ ...deletion, containedAnchors: [], content: { html: "<article/>" } })).toThrow();
});
