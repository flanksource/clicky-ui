import { describe, expect, it } from "vitest";

import {
  DEFAULT_PAGE_SLUG,
  PAGES,
  buildRegistry,
  fallbackPageSlug,
  folderForPage,
  groupFromSlug,
  humanizeSlug,
  isPlaygroundPage,
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
