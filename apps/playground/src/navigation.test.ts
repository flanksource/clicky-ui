import { describe, expect, it } from "vitest";

import { buildPlaygroundNavSections, navigableFolders } from "./navigation";
import type { PageEntry } from "./registry";
import type { PageActivity } from "./sidebar-activity";

function page(slug: string): PageEntry {
  return { kind: "component", slug, title: slug, group: "Pages", loadGuidance: async () => { throw new Error("unused"); }, load: async () => ({}) };
}

function activity(partial: Partial<PageActivity>): PageActivity {
  return { updated: 0, commented: 0, resolved: 0, openCount: 0, resolvedCount: 0, ...partial };
}

const entries = [page("alpha/inner"), page("beta/inner"), page("solo")];
const base = { activeSlug: undefined, query: "", metaFor: () => undefined };

function groupKeys(options: Partial<Parameters<typeof buildPlaygroundNavSections>[2]>, folders: string[] = []) {
  const [pages] = buildPlaygroundNavSections(entries, folders, { ...base, ...options });
  return { groups: pages?.groups?.map((group) => group.key), items: pages?.items?.map((item) => item.key) };
}

function renderOrder(options: Partial<Parameters<typeof buildPlaygroundNavSections>[2]>, source: PageEntry[] = entries) {
  const [pages] = buildPlaygroundNavSections(source, [], { ...base, ...options });
  return pages?.order;
}

describe("buildPlaygroundNavSections", () => {
  it("ranks folders by their most active descendant when an activity sort is chosen", () => {
    const map = new Map<string, PageActivity>([
      ["alpha/inner", activity({ commented: 10 })],
      ["beta/inner", activity({ commented: 30 })],
      ["solo", activity({ commented: 50 })],
    ]);
    expect(groupKeys({ activity: map, sort: "commented" })).toEqual({ groups: ["beta", "alpha"], items: ["solo"] });
  });

  it("renders the most-commented top-level page before a less active folder", () => {
    const map = new Map<string, PageActivity>([
      ["alpha/inner", activity({ commented: 10 })],
      ["beta/inner", activity({ commented: 30 })],
      ["solo", activity({ commented: 50 })],
    ]);
    expect(renderOrder({ activity: map, sort: "commented" })).toEqual(["solo", "beta", "alpha"]);
  });

  it("orders nested folders and pages by activity inside a group", () => {
    const nested = [page("top/quiet"), page("top/sub/busy"), page("top/loud")];
    const map = new Map<string, PageActivity>([
      ["top/quiet", activity({ updated: 1 })],
      ["top/sub/busy", activity({ updated: 5 })],
      ["top/loud", activity({ updated: 9 })],
    ]);
    const [pages] = buildPlaygroundNavSections(nested, [], { ...base, activity: map, sort: "updated" });
    expect(pages?.groups?.[0]?.order).toEqual(["top/loud", "top/sub", "top/quiet"]);
  });

  it("lists folders before pages when activity ranks tie", () => {
    expect(renderOrder({ activity: new Map(), sort: "updated" })).toEqual(["alpha", "beta", "solo"]);
  });

  it("falls back to folder name order when activity ranks tie", () => {
    expect(groupKeys({ activity: new Map(), sort: "updated" }).groups).toEqual(["alpha", "beta"]);
  });

  it("keeps a user-created empty folder when no query or filter excludes it", () => {
    expect(groupKeys({}, ["drafts"]).groups).toEqual(["alpha", "beta", "drafts"]);
  });

  it("drops a user-created empty folder when the query does not match it", () => {
    expect(groupKeys({ query: "beta" }, ["drafts"]).groups).toEqual(["beta"]);
  });
});

describe("navigableFolders", () => {
  const all = [page("old/page"), page("fresh/page"), page("deep/inner/page")];
  const folders = ["old", "fresh", "deep", "deep/inner", "drafts", "drafts/nested"];

  it("hides a folder whose only pages are outside the visible set and keeps truly empty folders", () => {
    const visible = [all[1]!];
    expect(navigableFolders(folders, all, visible)).toEqual(["fresh", "drafts", "drafts/nested"]);
  });

  it("keeps every ancestor of a visible nested page", () => {
    const visible = [all[2]!];
    expect(navigableFolders(folders, all, visible)).toEqual(["deep", "deep/inner", "drafts", "drafts/nested"]);
  });
});
