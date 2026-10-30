import { describe, expect, it } from "vitest";
import { isRecent, RECENT_WINDOW, visibleByAge } from "./sidebar-visibility";

const now = Date.parse("2026-10-29T12:00:00Z");
describe("sidebar age visibility", () => {
  it.each([
    [{ updated: now - RECENT_WINDOW, commented: 0 }, true],
    [{ updated: now - RECENT_WINDOW - 1, commented: 0 }, false],
    [{ updated: 0, commented: now }, true],
    [undefined, false],
  ] as const)("uses source or feedback activity at the seven-day boundary", (activity, expected) => {
    expect(isRecent(activity, now)).toBe(expected);
  });
  it.each([
    ["recent", "", undefined, false],
    ["recent", "", "old-page", true],
    ["recent", "search", undefined, true],
    ["all", "", undefined, true],
  ] as const)("preserves direct links and global discovery", (age, query, activeSlug, expected) => {
    expect(visibleByAge({ slug: "old-page", age, query, activeSlug, activity: undefined, now })).toBe(expected);
  });
});
