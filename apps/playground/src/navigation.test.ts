import { describe, expect, it, vi } from "vitest";

import { buildPlaygroundNavSections } from "./navigation";
import type { PageEntry, PageMeta } from "./registry";

const load = () => Promise.resolve({});

function entry(slug: string): PageEntry {
  return { slug, title: slug, group: "Pages", load };
}

const orderedMeta = new Map<string, PageMeta>([
  ["scratch", { title: "Scratch", group: "Pages" }],
  [
    "flanksource/patterns/collections",
    {
      title: "Collections",
      description: "Tables, filters, selection, and detail panes.",
      group: "Flanksource · Patterns",
      groupOrder: 20,
      navOrder: 20,
    },
  ],
  [
    "flanksource",
    {
      title: "Flanksource",
      description: "Design-system overview.",
      group: "Flanksource",
      groupOrder: 0,
      navOrder: 0,
    },
  ],
  [
    "flanksource/foundations/colors",
    {
      title: "Colors",
      description: "Semantic color tokens.",
      group: "Flanksource · Foundations",
      groupOrder: 10,
      navOrder: 10,
    },
  ],
]);

describe("buildPlaygroundNavSections", () => {
  const folders = [
    "empty-folder",
    "flanksource",
    "flanksource/foundations",
    "flanksource/patterns",
  ];

  it("builds the filesystem hierarchy, including empty folders", () => {
    const sections = buildPlaygroundNavSections(
      [
        entry("scratch"),
        entry("flanksource/patterns/collections"),
        entry("flanksource"),
        entry("flanksource/foundations/colors"),
      ],
      folders,
      {
        activeSlug: "flanksource/foundations/colors",
        query: "",
        metaFor: (page) => orderedMeta.get(page.slug),
        badgeFor: (page) => (page.slug === "scratch" ? 3 : 0),
        folderBadgeFor: (folder, pages) => `${folder}:${pages.length}`,
      },
    );

    expect(sections).toMatchObject([
      {
        label: "Pages",
        variant: "tree",
        items: [{ key: "scratch", active: false, badge: 3 }],
        groups: [
          {
            key: "flanksource",
            label: "Flanksource",
            forceExpanded: true,
            badge: "flanksource:3",
            item: { key: "flanksource", active: false },
            groups: [
              {
                key: "flanksource/foundations",
                groups: [],
                items: [
                  {
                    key: "flanksource/foundations/colors",
                    active: true,
                  },
                ],
              },
              {
                key: "flanksource/patterns",
                groups: [],
                items: [
                  {
                    key: "flanksource/patterns/collections",
                    active: false,
                  },
                ],
              },
            ],
          },
          {
            key: "empty-folder",
            label: "Empty folder",
            items: [],
            groups: [],
          },
        ],
      },
    ]);
  });

  it("keeps ancestors when a page description matches", () => {
    const sections = buildPlaygroundNavSections(
      [entry("flanksource/patterns/collections"), entry("flanksource")],
      folders,
      {
        activeSlug: undefined,
        query: "detail panes",
        metaFor: (page) => orderedMeta.get(page.slug),
      },
    );

    expect(sections[0]?.groups).toMatchObject([
      {
        key: "flanksource",
        groups: [
          {
            key: "flanksource/patterns",
            items: [{ key: "flanksource/patterns/collections" }],
          },
        ],
      },
    ]);
  });

  it("includes every descendant when a folder name matches", () => {
    const sections = buildPlaygroundNavSections(
      [entry("flanksource/patterns/collections"), entry("flanksource")],
      folders,
      {
        activeSlug: undefined,
        query: "patterns",
        metaFor: (page) => orderedMeta.get(page.slug),
      },
    );

    expect(sections[0]?.groups?.[0]?.groups?.[0]).toMatchObject({
      key: "flanksource/patterns",
      items: [{ key: "flanksource/patterns/collections" }],
    });
  });

  it("binds page and folder context menus to their exact filesystem nodes", () => {
    const contextMenuForPage = vi.fn(() => [
      { label: "Rename", onSelect: vi.fn() },
    ]);
    const contextMenuForFolder = vi.fn(() => [
      { label: "New page", onSelect: vi.fn() },
    ]);
    const page = entry("designs/review");

    const sections = buildPlaygroundNavSections([page], ["designs"], {
      activeSlug: undefined,
      query: "",
      metaFor: () => undefined,
      contextMenuForPage,
      contextMenuForFolder,
    });

    expect(contextMenuForPage).toHaveBeenCalledWith(page);
    expect(contextMenuForFolder).toHaveBeenCalledWith("designs");
    expect(sections[0]?.groups?.[0]).toMatchObject({
      contextMenu: [{ label: "New page" }],
      items: [{ contextMenu: [{ label: "Rename" }] }],
    });
  });

  it("combines folder and page actions when one filesystem node is both", () => {
    const sections = buildPlaygroundNavSections(
      [entry("designs"), entry("designs/review")],
      ["designs"],
      {
        activeSlug: undefined,
        query: "",
        metaFor: () => undefined,
        contextMenuForPage: () => [{ label: "Rename", onSelect: vi.fn() }],
        contextMenuForFolder: () => [{ label: "New page", onSelect: vi.fn() }],
      },
    );

    expect(sections[0]?.groups?.[0]?.item?.contextMenu).toMatchObject([
      { label: "New page" },
      { label: "Rename" },
    ]);
  });
});
