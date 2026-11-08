import { expect, it } from "vitest";
import { validateFrameMessage, validateHostMessage, validateLock } from "./validation.ts";
import { exampleLock } from "../link/testing-fixtures.ts";

it.each([
  { type: "review-list", requestId: "list" },
  { type: "review-select", requestId: "select", id: null },
  { type: "review-visibility", requestId: "visibility", visible: true, showRejected: false },
  { type: "review-action", requestId: "action", id: "summary", action: "approved" },
])("routes host $type through the strict review validator", (message) => {
  expect(validateHostMessage(message)).toEqual(message);
  expect(() => validateHostMessage({ ...message, extra: true })).toThrow();
});

it.each([
  { type: "review-state", elements: [], selected: null, visible: true, showRejected: false },
  { type: "review-error", requestId: "list", error: "Unavailable" },
  { type: "review-action-request", requestId: "action", action: "approved", element: { id: "summary", selection: { anchor: "#summary", label: "Summary", rect: { left: 0, top: 0, width: 100, height: 40 }, element: { source: "report.tsx:1:1", componentName: "article", html: "<article>Summary</article>", locators: [] } } } },
])("routes frame $type through the strict review validator", (message) => {
  expect(validateFrameMessage(message)).toEqual(message);
  expect(() => validateFrameMessage({ ...message, extra: true })).toThrow();
});

it("accepts source-root locks and rejects traversal at the bridge boundary", () => {
  const lock = { ...exampleLock(), pageSources: [{ link: "pages", root: "src/pages", prefix: "", editable: true }] };
  expect(() => validateLock(lock)).not.toThrow();
  expect(validateFrameMessage({ type: "lock", lock })).toEqual({ type: "lock", lock });
  expect(() => validateLock({ ...lock, pageSources: [{ ...lock.pageSources[0], root: "../outside" }] })).toThrow();
});
