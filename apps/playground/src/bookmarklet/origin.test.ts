import { expect, it } from "vitest";
import { bookmarkletParentOrigin, matchesBookmarkletParent } from "./origin";

it("normalizes file documents and accepts only their opaque origin representations", () => {
  expect(bookmarkletParentOrigin("file:///documents/report.html")).toBe("null");
  expect(bookmarkletParentOrigin("https://example.com/report")).toBe("https://example.com");
  expect(matchesBookmarkletParent({ expected: "null", received: "file://" })).toBe(true);
  expect(matchesBookmarkletParent({ expected: "null", received: "null" })).toBe(true);
  expect(matchesBookmarkletParent({ expected: "null", received: "https://example.com" })).toBe(false);
  expect(matchesBookmarkletParent({ expected: "https://example.com", received: "null" })).toBe(false);
});
