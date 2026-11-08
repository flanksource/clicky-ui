import { expect, it } from "vitest";
import { searchItems } from "./search";
import type { NavigationEntry } from "./types";

it("keeps page-backed folders and nested artifacts while excluding structural folders and duplicate routes", () => {
  const entry = (
    key: string,
    extra: Partial<NavigationEntry> = {},
  ): NavigationEntry => ({
    key,
    kind: "folder",
    label: key,
    source: "pages",
    hasChildren: true,
    activity: {
      updated: 0,
      commented: 0,
      resolved: 0,
      openCount: 0,
      resolvedCount: 0,
    },
    ...extra,
  });
  expect(
    searchItems([
      entry("group", {
        children: [
          entry("page", {
            kind: "page",
            slug: "group/page",
            hasChildren: false,
          }),
        ],
      }),
      entry("landing", { slug: "landing" }),
      entry("repo", { source: "repository", slug: "folder:repo/." }),
      entry("duplicate", { slug: "landing" }),
    ]).map((item) => [item.id, item.description]),
  ).toEqual([
    ["group/page", "group/page"],
    ["landing", "landing"],
  ]);
});
