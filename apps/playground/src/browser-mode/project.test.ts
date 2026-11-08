import { expect, it } from "vitest";
import { changedSources, hostRect, reviewToolbarLeft } from "./project";

it("invalidates changed and deleted modules while leaving an unrelated frame alone", () => {
  expect(changedSources({ before: { "page.tsx": "same", "helper.ts": "old", "removed.ts": "gone" }, after: { "page.tsx": "same", "helper.ts": "new", "added.json": "{}" } })).toEqual({ "helper.ts": "new", "added.json": "{}", "removed.ts": null });
  expect(changedSources({ before: { "other.tsx": "same" }, after: { "other.tsx": "same" } })).toEqual({});
});

it("adds the frame content offset to the agent's viewport geometry", () => {
  expect(hostRect({ frame: { left: 300, top: 120 }, rect: { left: 10, top: 20, width: 80, height: 40 } })).toEqual({ x: 310, y: 140, width: 80, height: 40 });
});

it("keeps review controls inside the frame for narrow elements at either edge", () => {
  const frame = { left: 300, width: 900 };
  expect(reviewToolbarLeft({ frame, right: 350, width: 240 })).toBe(300);
  expect(reviewToolbarLeft({ frame, right: 900, width: 240 })).toBe(660);
  expect(reviewToolbarLeft({ frame, right: 1300, width: 240 })).toBe(960);
});
