import { afterEach, describe, expect, it } from "vitest";

import {
  DEFAULT_PAGE_SLUG,
  PAGES,
  applyFolderDeleted,
  applyPageCreated,
  applyPageDeleted,
  applyPageMoved,
  buildRegistry,
  fallbackPageSlug,
  findPage,
  folderForPage,
  groupFromSlug,
  humanizeSlug,
  isPlaygroundPage,
  loadPage,
  pageMeta,
  pageTitle,
  pages,
  slugFromGlobKey,
} from "./registry";

describe("default page", () => {
  it("opens the Flanksource design-system hub independently of glob order", () => {
    expect(DEFAULT_PAGE_SLUG).toBe("flanksource");
    expect(PAGES.some((entry) => entry.slug === DEFAULT_PAGE_SLUG)).toBe(true);
  });
});

describe("fallbackPageSlug", () => {
  const entries = registryOf("./pages/zebra.tsx", "./pages/alpha.tsx");

  it("uses the first remaining page when the preferred page is unavailable", () => {
    expect(fallbackPageSlug(entries)).toBe("alpha");
  });

  it("excludes a page that is about to be deleted", () => {
    expect(fallbackPageSlug(entries, "alpha")).toBe("zebra");
  });

  it("returns undefined when no page remains", () => {
    expect(fallbackPageSlug([], "alpha")).toBeUndefined();
  });
});

const noop = () => Promise.resolve({});

function registryOf(...keys: string[]) {
  return buildRegistry(Object.fromEntries(keys.map((key) => [key, noop])));
}

describe("slugFromGlobKey", () => {
  it.each([
    ["./pages/welcome.tsx", "welcome"],
    ["./pages/agent-inbox.tsx", "agent-inbox"],
    ["./pages/nested/thing.tsx", "nested/thing"],
  ])("maps %s to %s", (key, slug) => {
    expect(slugFromGlobKey(key)).toBe(slug);
  });
});

describe("isPlaygroundPage", () => {
  it.each([
    ["./pages/welcome.tsx", true],
    ["./pages/nested/thing.tsx", true],
    ["./pages/_draft.tsx", false],
    ["./pages/_scratch/thing.tsx", false],
    ["./pages/welcome.test.tsx", false],
    ["./pages/welcome.stories.tsx", false],
    ["./comments/CommentLayer.tsx", false],
    ["./pages/notes.md", false],
  ])("classifies %s as %s", (key, expected) => {
    expect(isPlaygroundPage(key)).toBe(expected);
  });
});

describe("humanizeSlug", () => {
  it.each([
    ["welcome", "Welcome"],
    ["agent-inbox", "Agent inbox"],
    ["pricing_table", "Pricing table"],
    ["nested/deep-thing", "Deep thing"],
  ])("titles %s as %s", (slug, title) => {
    expect(humanizeSlug(slug)).toBe(title);
  });
});

describe("groupFromSlug", () => {
  it("puts root-level pages in the default group", () => {
    expect(groupFromSlug("welcome")).toBe("Pages");
  });

  it("uses the nearest directory as the group for nested pages", () => {
    expect(groupFromSlug("dashboards/overview")).toBe("Dashboards");
    expect(groupFromSlug("a/b/c")).toBe("B");
  });
});

describe("buildRegistry", () => {
  it("drops excluded files and keeps only pages", () => {
    const entries = registryOf(
      "./pages/welcome.tsx",
      "./pages/_draft.tsx",
      "./pages/welcome.test.tsx",
    );

    expect(entries.map((entry) => entry.slug)).toEqual(["welcome"]);
  });

  it("derives slug, title and group for each page", () => {
    const [entry] = registryOf("./pages/dashboards/agent-inbox.tsx");

    expect(entry).toMatchObject({
      slug: "dashboards/agent-inbox",
      title: "Agent inbox",
      group: "Dashboards",
    });
  });

  it("sorts root pages before grouped pages, then alphabetically", () => {
    const entries = registryOf(
      "./pages/zebra.tsx",
      "./pages/widgets/beta.tsx",
      "./pages/alpha.tsx",
      "./pages/dashboards/overview.tsx",
    );

    expect(entries.map((entry) => `${entry.group}/${entry.title}`)).toEqual([
      "Pages/Alpha",
      "Pages/Zebra",
      "Dashboards/Overview",
      "Widgets/Beta",
    ]);
  });

  it("exposes a loader that resolves the underlying module", async () => {
    const module = { default: () => null };
    const [entry] = buildRegistry({ "./pages/welcome.tsx": () => Promise.resolve(module) });

    await expect(entry?.load()).resolves.toBe(module);
  });
});

// The glob is baked into the module at transform time, so a page edited through
// the sources endpoint stays visible at its old path until the dev server
// re-evaluates it. These overrides are what keep the nav honest in between.
describe("optimistic overlay", () => {
  const moved: [string, string][] = [];
  const hidden: string[] = [];

  function move(slug: string, nextSlug: string, title?: string) {
    applyPageMoved(slug, nextSlug, title);
    moved.push([nextSlug, slug]);
  }

  function hide(slug: string) {
    applyPageDeleted(slug);
    hidden.push(slug);
  }

  // The overlay is module state shared with the real registry, so every test
  // puts back exactly what it changed.
  afterEach(() => {
    for (const slug of hidden.splice(0)) applyPageCreated(slug);
    for (const [from, to] of moved.splice(0).reverse()) applyPageMoved(from, to);
  });

  it("shows a moved page at its new path and nowhere else", () => {
    move(DEFAULT_PAGE_SLUG, `designs/${DEFAULT_PAGE_SLUG}`);

    const slugs = pages().map((entry) => entry.slug);
    expect(slugs).toContain(`designs/${DEFAULT_PAGE_SLUG}`);
    expect(slugs).not.toContain(DEFAULT_PAGE_SLUG);
    expect(findPage(`designs/${DEFAULT_PAGE_SLUG}`)?.group).toBe("Designs");
    expect(findPage(DEFAULT_PAGE_SLUG)).toBeUndefined();
  });

  it("follows a page moved twice back to where it started", () => {
    move(DEFAULT_PAGE_SLUG, "one/moved");
    move("one/moved", "two/moved");
    expect(pages().map((entry) => entry.slug)).toContain("two/moved");

    applyPageMoved("two/moved", DEFAULT_PAGE_SLUG);
    moved.length = 0;
    expect(pages().map((entry) => entry.slug)).toContain(DEFAULT_PAGE_SLUG);
    expect(pages()).toHaveLength(PAGES.length);
  });

  // The module at the old path is already in the browser's cache and still
  // announces the title the file had before the rename rewrote it, so loading
  // the renamed page must not put the old label back in the nav.
  it("keeps a renamed title even after the moved module reports its own", async () => {
    move(DEFAULT_PAGE_SLUG, "renamed-hub", "Renamed hub");
    const entry = findPage("renamed-hub");
    expect(entry).toBeDefined();
    expect(pageTitle(entry!)).toBe("Renamed hub");
    expect(pageMeta(entry!)?.title).toBe("Renamed hub");

    // Opening the page loads the module from its pre-rename path, which still
    // carries the old title and writes it into the meta cache.
    await loadPage({
      ...entry!,
      load: () =>
        Promise.resolve({ default: () => null, meta: { title: "Old hub" } }),
    });
    expect(pageTitle(entry!)).toBe("Renamed hub");
  });

  it("drops a deleted page, and un-drops it when the slug comes back", () => {
    hide(DEFAULT_PAGE_SLUG);
    expect(findPage(DEFAULT_PAGE_SLUG)).toBeUndefined();
    expect(pages()).toHaveLength(PAGES.length - 1);

    applyPageCreated(DEFAULT_PAGE_SLUG);
    hidden.length = 0;
    expect(findPage(DEFAULT_PAGE_SLUG)).toBeDefined();
  });

  it("drops every page under a deleted folder and leaves the rest", () => {
    const folder = "flanksource";
    const inFolder = PAGES.filter((entry) =>
      entry.slug.startsWith(`${folder}/`),
    );
    expect(inFolder.length).toBeGreaterThan(0);

    applyFolderDeleted(folder);
    for (const entry of inFolder) hidden.push(entry.slug);

    expect(
      pages().some((entry) => entry.slug.startsWith(`${folder}/`)),
    ).toBe(false);
    // The folder's own page is a sibling of the folder, not inside it.
    expect(findPage(folder)).toBeDefined();
  });
});

describe("folderForPage", () => {
  const entries = registryOf(
    "./pages/flanksource.tsx",
    "./pages/flanksource/foundations/colors.tsx",
    "./pages/flanksource/patterns/collections.tsx",
    "./pages/makerprint/scad-studio.tsx",
    "./pages/welcome.tsx",
  );

  it.each([
    ["flanksource", "flanksource"],
    ["flanksource/foundations/colors", "flanksource/foundations"],
    ["makerprint/scad-studio", "makerprint"],
    ["welcome", undefined],
  ])("finds the nearest artifact folder for %s", (slug, expected) => {
    expect(folderForPage(slug, entries)).toBe(expected);
  });
});
