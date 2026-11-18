import { describe, expect, it } from "vitest";
import { parseComments } from "./store";

describe("comment sidecar trust boundary", () => {
  const comment = { id: "review-1", body: "Review this action", createdAt: "2026-11-06T12:00:00Z", author: { name: "Local reviewer" }, selection: { anchor: "action", label: "Action", element: { source: "page.tsx:1:1", componentName: "Button", html: '<button onclick="evil()">Action</button>', locators: [] }, rect: { left: 0, top: 0, width: 10, height: 10 } } };
  it("preserves element context as text and rejects corrupted selection geometry", () => {
    expect(parseComments({ format: 1, pages: { "page.tsx": [comment] } })).toEqual({ "page.tsx": [comment] });
    expect(() => parseComments({ format: 1, pages: { "page.tsx": [{ ...comment, selection: { ...comment.selection, rect: { ...comment.selection.rect, width: -1 } } }] } })).toThrow();
  });
  it("refuses unsupported formats and non-image attachments", () => {
    expect(() => parseComments({ format: 2, pages: {} })).toThrow("Unsupported");
    expect(() => parseComments({ format: 1, pages: { "page.tsx": [{ ...comment, screenshot: "javascript:evil()" }] } })).toThrow("Invalid comment screenshot");
  });
});
