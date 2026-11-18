// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { DirectoryEntry, DocumentRepository } from "../../src/documents/types";
import { navigationTarget } from "../../src/documents/repository-navigation";
import type { NavigationActivity, NavigationEntry } from "../../src/navigation/types";
import { repositoryActivity, type ActivityIndex } from "./activity";
import { listDirectory, repositoryRoots, searchRepositories, type DirectoryListing, type RepositoryContext } from "./repository";
import {
  RECENT_WINDOW,
  countOlder,
  emptyActivity,
  externalFolder,
  isRecent,
  matchesActivity,
  navigableFolders,
  pageEntries,
  selectExternal,
  selectPages,
  shapeOpen,
  sortRanked,
  visibleByAge,
  type PageRecord,
  type ViewOptions,
} from "./tree";

const NOW = Date.parse("2026-10-29T12:00:00Z");
const activity = (partial: Partial<NavigationActivity> = {}): NavigationActivity => ({ ...emptyActivity(), ...partial });
const page = (slug: string, partial: Partial<NavigationActivity> = {}, extra: Partial<PageRecord> = {}): PageRecord => ({
  slug,
  title: slug,
  activity: activity(partial),
  ...extra,
});
const view = (partial: Partial<ViewOptions> = {}): ViewOptions => ({ sort: "none", filters: [], age: "all", query: "", active: undefined, now: NOW, ...partial });

const pageSet = [page("alpha/inner"), page("beta/inner"), page("solo")];

function rootKeys(pages: PageRecord[], options: Partial<ViewOptions> = {}, folders: string[] = []) {
  const resolved = view(options);
  return sortRanked(pageEntries(selectPages(pages, folders, resolved), resolved), resolved.sort).map((entry) => entry.key);
}

describe("page tree ordering", () => {
  const commented = [page("alpha/inner", { commented: 10 }), page("beta/inner", { commented: 30 }), page("solo", { commented: 50 })];

  it("ranks folders by their most active descendant and interleaves them with pages", () => {
    expect(rootKeys(commented, { sort: "commented" })).toEqual(["page-item:solo", "page:beta", "page:alpha"]);
  });

  it("orders nested folders and pages by activity inside a group", () => {
    const nested = [page("top/quiet", { updated: 1 }), page("top/sub/busy", { updated: 5 }), page("top/loud", { updated: 9 })];
    const options = view({ sort: "updated" });
    const [top] = sortRanked(pageEntries(selectPages(nested, [], options), options), "updated");
    expect(top?.children?.map((entry) => entry.key)).toEqual(["page-item:top/loud", "page:top/sub", "page-item:top/quiet"]);
  });

  it("lists folders before pages, then by label, when activity ties", () => {
    expect(rootKeys(pageSet, { sort: "updated" })).toEqual(["page:alpha", "page:beta", "page-item:solo"]);
  });

  it("ranks latest activity (sort none) by the later of source edit and last comment", () => {
    const pages = [page("edited", { updated: 5 }), page("discussed", { updated: 1, commented: 9 })];
    expect(rootKeys(pages)).toEqual(["page-item:discussed", "page-item:edited"]);
  });

  it("uses groupOrder for folders and navOrder for pages when activity ties", () => {
    const pages = [page("b/x", {}, { groupOrder: 1 }), page("a/y", {}, { groupOrder: 2 }), page("z", {}, { navOrder: 1 }), page("y", {}, { navOrder: 0 })];
    expect(rootKeys(pages)).toEqual(["page:b", "page:a", "page-item:y", "page-item:z"]);
  });

  it("aggregates folder activity from its descendants", () => {
    const options = view();
    const pages = [page("g/a", { commented: 4, openCount: 1 }), page("g/b", { commented: 9, openCount: 2, resolvedCount: 1 })];
    const [folder] = pageEntries(selectPages(pages, [], options), options);
    expect(folder?.entry.activity).toEqual(activity({ commented: 9, openCount: 3, resolvedCount: 1 }));
  });

  it("gives a folder the slug of the page that shares its path", () => {
    const options = view();
    const [folder] = pageEntries(selectPages([page("gtm"), page("gtm/plan")], [], options), options);
    expect(folder?.entry).toMatchObject({ key: "page:gtm", kind: "folder", slug: "gtm", folderPath: "gtm", label: "Gtm" });
  });
});

describe("page selection", () => {
  it("keeps a user-created empty folder when no query or filter excludes it", () => {
    expect(rootKeys(pageSet, {}, ["drafts"])).toEqual(["page:alpha", "page:beta", "page:drafts", "page-item:solo"]);
  });

  it("drops a user-created empty folder when the query does not match it", () => {
    expect(rootKeys(pageSet, { query: "beta" }, ["drafts"])).toEqual(["page:beta"]);
  });

  it("opens every folder on the way to a search hit and inlines its children", () => {
    const options = view({ query: "inner" });
    const root = shapeOpen(sortRanked(pageEntries(selectPages(pageSet, [], options), options), "none"));
    expect(root.map((entry) => [entry.key, entry.open, entry.children?.map((child) => child.key)])).toEqual([
      ["page:alpha", true, ["page-item:alpha/inner"]],
      ["page:beta", true, ["page-item:beta/inner"]],
    ]);
  });

  it("matches on description and slug as well as title", () => {
    const pages = [page("one", {}, { title: "First", description: "pricing model" }), page("two")];
    expect(rootKeys(pages, { query: "pricing" })).toEqual(["page-item:one"]);
    expect(rootKeys(pages, { query: "TWO" })).toEqual(["page-item:two"]);
  });

  it("filters pages by open or resolved threads and drops folders with nothing left", () => {
    const pages = [page("a/x", { openCount: 1 }), page("b/y", { resolvedCount: 2 }), page("plain")];
    expect(rootKeys(pages, { filters: ["open"] })).toEqual(["page:a"]);
    expect(rootKeys(pages, { filters: ["open", "resolved"] })).toEqual(["page:a", "page:b"]);
  });

  it("opens the folders of the active page and keeps the rest closed", () => {
    const options = view({ active: "a/deep/x" });
    const pages = [page("a/deep/x"), page("a/other"), page("b/y")];
    const root = shapeOpen(sortRanked(pageEntries(selectPages(pages, [], options), options), "none"));
    expect(root.map((entry) => [entry.key, entry.open ?? false, entry.children !== undefined])).toEqual([
      ["page:a", true, true],
      ["page:b", false, false],
    ]);
    expect(root[0]?.children?.map((entry) => [entry.key, entry.open ?? false])).toEqual([["page:a/deep", true], ["page-item:a/other", false]]);
  });
});

describe("navigableFolders", () => {
  const all = [{ slug: "old/page" }, { slug: "fresh/page" }, { slug: "deep/inner/page" }];
  const folders = ["old", "fresh", "deep", "deep/inner", "drafts", "drafts/nested"];

  it("hides a folder whose only pages are outside the visible set and keeps truly empty folders", () => {
    expect(navigableFolders(folders, all, [all[1]!])).toEqual(["fresh", "drafts", "drafts/nested"]);
  });

  it("keeps every ancestor of a visible nested page", () => {
    expect(navigableFolders(folders, all, [all[2]!])).toEqual(["deep", "deep/inner", "drafts", "drafts/nested"]);
  });
});

describe("age visibility", () => {
  it.each([
    [{ updated: NOW - RECENT_WINDOW, commented: 0 }, true],
    [{ updated: NOW - RECENT_WINDOW - 1, commented: 0 }, false],
    [{ updated: 0, commented: NOW }, true],
    [undefined, false],
  ] as const)("uses source or feedback activity at the seven-day boundary (%j)", (value, expected) => {
    expect(isRecent(value, NOW)).toBe(expected);
  });

  it.each([
    ["recent", "", undefined, false],
    ["recent", "", "old-page", true],
    ["recent", "search", undefined, true],
    ["all", "", undefined, true],
  ] as const)("preserves direct links and global discovery (%s, %j, %j)", (age, query, activeSlug, expected) => {
    expect(visibleByAge({ slug: "old-page", age, query, activeSlug, activity: undefined, now: NOW })).toBe(expected);
  });

  it("hides old pages from the tree under age=recent but keeps the active one", () => {
    const old = page("old/page", { updated: NOW - 2 * RECENT_WINDOW });
    const fresh = page("fresh/page", { updated: NOW });
    expect(rootKeys([old, fresh], { age: "recent" })).toEqual(["page:fresh"]);
    expect(rootKeys([old, fresh], { age: "recent", active: "old/page" })).toEqual(["page:fresh", "page:old"]);
  });

  it("counts older pages that match the filters, excluding recent and active ones", () => {
    const items = [
      { slug: "recent", activity: activity({ updated: NOW }) },
      { slug: "old-open", activity: activity({ updated: 1, openCount: 1 }) },
      { slug: "old-quiet", activity: activity({ updated: 1 }) },
      { slug: "old-active", activity: activity({ updated: 1 }) },
    ];
    expect(countOlder(items, view({ age: "recent" }))).toBe(3);
    expect(countOlder(items, view({ filters: ["open"], active: "old-active" }))).toBe(1);
  });
});

describe("matchesActivity", () => {
  it.each([
    [[], activity(), true],
    [[], undefined, true],
    [["open"], activity({ openCount: 1 }), true],
    [["open"], activity({ resolvedCount: 2 }), false],
    [["resolved"], activity({ resolvedCount: 2 }), true],
    [["resolved"], undefined, false],
    [["open", "resolved"], activity({ resolvedCount: 1 }), true],
    [["open", "resolved"], activity(), false],
  ] as const)("filters %j against %j -> %s", (filters, value, expected) => {
    expect(matchesActivity(value, [...filters])).toBe(expected);
  });
});

describe("external pages folder", () => {
  const externals = [
    { id: "external:11111111-1111-1111-1111-111111111111", title: "Dashboard", urls: ["https://example.com/dash"], activity: activity({ updated: NOW - 10, commented: NOW - 5 }) },
    { id: "external:22222222-2222-2222-2222-222222222222", title: "Runbook", urls: ["https://example.com/run"], activity: activity({ updated: NOW, commented: NOW, openCount: 2 }) },
  ];

  it("lists external pages by latest activity under one External pages folder", () => {
    const folder = externalFolder(selectExternal(externals, view()), view());
    expect(folder).toMatchObject({ key: "external", kind: "folder", label: "External pages", source: "external", hasChildren: true });
    expect(folder?.children?.map((entry) => [entry.key, entry.kind, entry.slug, entry.label])).toEqual([
      [externals[1]!.id, "external", externals[1]!.id, "Runbook"],
      [externals[0]!.id, "external", externals[0]!.id, "Dashboard"],
    ]);
    expect(folder?.activity.openCount).toBe(2);
  });

  it("searches title and URLs, applies filters, and disappears when nothing is left", () => {
    expect(selectExternal(externals, view({ query: "example.com/dash" })).map((page) => page.title)).toEqual(["Dashboard"]);
    expect(selectExternal(externals, view({ filters: ["open"] })).map((page) => page.title)).toEqual(["Runbook"]);
    expect(externalFolder(selectExternal(externals, view({ query: "nothing" })), view({ query: "nothing" }))).toBeUndefined();
  });

  it("opens the folder for an active external page", () => {
    const options = view({ active: externals[0]!.id });
    expect(externalFolder(externals, options)?.open).toBe(true);
  });
});

describe("repository documents", () => {
  const repository: DocumentRepository = { id: "11111111-1111-1111-1111-111111111111", root: "/repo", name: "Notes", folders: [{ path: "docs", overrides: [] }] };
  const file = (path: string, visible = true): DirectoryEntry => ({ path, name: path.split("/").at(-1)!, directory: false, visible });
  const directory = (path: string, visible = true): DirectoryEntry => ({ path, name: path.split("/").at(-1)!, directory: true, visible });
  const listings: Record<string, DirectoryEntry[]> = {
    docs: [file("docs/a.md"), file("docs/b.md"), file("docs/skip.txt"), directory("docs/deep"), file("docs/secret.md", false)],
    "docs/deep": [file("docs/deep/setup.md")],
  };
  const list: DirectoryListing = async ({ path }) => {
    const entries = listings[path];
    if (!entries) throw new Error(`unexpected listing ${path}`);
    return entries;
  };
  const id = (path: string) => `document:${repository.id}/${path}`;
  const folder = repository.folders[0]!;

  function context(index: [string, Partial<NavigationActivity>][], options: Partial<ViewOptions> = {}, problems: [string, number][] = []): RepositoryContext {
    const map: ActivityIndex = new Map(index.map(([key, value]) => [key, activity(value)]));
    return { list, options: view(options), activity: map, records: repositoryActivity(map), problems: new Map(problems), target: navigationTarget(options.active) };
  }
  const labels = (entries: NavigationEntry[]) => entries.map((entry) => entry.label);

  const busy: [string, Partial<NavigationActivity>][] = [
    [id("docs/b.md"), { commented: 50, openCount: 1 }],
    [id("docs/deep/setup.md"), { commented: 10, resolvedCount: 1, resolved: 10 }],
  ];

  it("lists markdown documents and directories by comment activity, hiding ignored entries", async () => {
    const entries = await listDirectory(context(busy), repository, folder, "docs");
    expect(labels(entries)).toEqual(["b.md", "deep", "a.md"]);
    expect(entries[1]).toMatchObject({ key: `repo:${repository.id}:docs:docs/deep`, kind: "folder", slug: `folder:${repository.id}/docs/deep`, hasChildren: true });
    expect(entries[1]?.activity).toMatchObject({ commented: 10, resolvedCount: 1 });
    expect(entries[0]).toMatchObject({ key: `doc:${id("docs/b.md")}`, kind: "document", slug: id("docs/b.md"), source: "repository", activity: { commented: 50, openCount: 1 } });
  });

  it("filters repository documents and directories by open or resolved threads", async () => {
    expect(labels(await listDirectory(context(busy, { filters: ["open"] }), repository, folder, "docs"))).toEqual(["b.md"]);
    expect(labels(await listDirectory(context(busy, { filters: ["resolved"] }), repository, folder, "docs"))).toEqual(["deep"]);
    expect(labels(await listDirectory(context(busy, { filters: ["open", "resolved"] }), repository, folder, "docs"))).toEqual(["b.md", "deep"]);
  });

  it("sums lint problems on a document and on the folders above it", async () => {
    const entries = await listDirectory(context([], {}, [[id("docs/deep/setup.md"), 3], [id("docs/a.md"), 1]]), repository, folder, "docs");
    expect(entries.map((entry) => [entry.label, entry.problems])).toEqual([["deep", 3], ["a.md", 1], ["b.md", undefined]]);
  });

  it("reveals the active document: ancestors open with children, ignored entries on the path included", async () => {
    const reveal = context([], { active: id("docs/secret.md") });
    expect(reveal.target).toEqual({ repositoryId: repository.id, path: "docs/secret.md", kind: "document" });
    const [root] = await repositoryRoots(reveal, [repository]);
    expect(root?.entry).toMatchObject({ label: "docs", open: true, hasChildren: true });
    expect(root?.entry.children?.map((entry) => [entry.label, entry.hidden ?? false])).toEqual([["deep", false], ["a.md", false], ["b.md", false], ["secret.md (ignored)", true]]);
  });

  it("opens each directory between the configured folder and a deep active document", async () => {
    const [root] = await repositoryRoots(context([], { active: id("docs/deep/setup.md") }), [repository]);
    const deep = root?.entry.children?.find((entry) => entry.label === "deep");
    expect(deep).toMatchObject({ open: true });
    expect(deep?.children?.map((entry) => entry.label)).toEqual(["setup.md"]);
  });

  it("returns a closed lazy entry per configured folder when nothing is active", async () => {
    const [root] = await repositoryRoots(context(busy), [repository]);
    expect(root?.entry).toMatchObject({ key: `repo:${repository.id}:docs:docs`, label: "docs", slug: `folder:${repository.id}/docs`, hasChildren: true, repository: { id: repository.id, folder: "docs", path: "docs" } });
    expect(root?.entry.children).toBeUndefined();
    expect(root?.entry.activity.commented).toBe(50);
  });

  it("labels the repository root folder with the repository name", async () => {
    const root = { ...repository, folders: [{ path: ".", overrides: [] }] };
    const [item] = await repositoryRoots(context([]), [root]);
    expect(item?.entry.label).toBe("Notes");
  });

  it("merges page folders and repository folders at the root by activity", async () => {
    const options = view({ sort: "commented" });
    const pages = pageEntries(selectPages([page("alpha/x", { commented: 100 })], [], options), options);
    const quiet = await repositoryRoots(context([[id("docs/b.md"), { commented: 50 }]], { sort: "commented" }), [repository]);
    expect(sortRanked([...pages, ...quiet], "commented").map((entry) => entry.key)).toEqual(["page:alpha", `repo:${repository.id}:docs:docs`]);
    const loud = await repositoryRoots(context([[id("docs/b.md"), { commented: 200 }]], { sort: "commented" }), [repository]);
    expect(sortRanked([...pages, ...loud], "commented").map((entry) => entry.key)).toEqual([`repo:${repository.id}:docs:docs`, "page:alpha"]);
  });

  it("finds a document in a nested directory with every ancestor open and children inlined", async () => {
    const found = await searchRepositories(context([], { query: "setup" }), [repository]);
    const [root] = shapeOpen(found.map((item) => item.entry));
    expect(root).toMatchObject({ label: "docs", open: true });
    expect(root?.children?.map((entry) => [entry.label, entry.open])).toEqual([["deep", true]]);
    expect(root?.children?.[0]?.children?.map((entry) => [entry.label, entry.kind])).toEqual([["setup.md", "document"]]);
  });

  it("returns nothing for a repository without a match and a closed folder for a repository-name match", async () => {
    expect(await searchRepositories(context([], { query: "zzz" }), [repository])).toEqual([]);
    const [byName] = await searchRepositories(context([], { query: "notes" }), [repository]);
    expect(byName?.entry).toMatchObject({ label: "docs", hasChildren: true });
    expect(byName?.entry.children).toBeUndefined();
  });

  it("applies filters to search hits", async () => {
    const hits = await searchRepositories(context(busy, { query: ".md", filters: ["open"] }), [repository]);
    const [root] = shapeOpen(hits.map((item) => item.entry));
    expect(root?.children?.map((entry) => entry.label)).toEqual(["b.md"]);
  });
});
