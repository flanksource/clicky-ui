import { describe, expect, it } from "vitest";

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
  it("orders explicit groups before scratch pages and marks the active item", () => {
    const sections = buildPlaygroundNavSections(
      [
        entry("scratch"),
        entry("flanksource/patterns/collections"),
        entry("flanksource"),
        entry("flanksource/foundations/colors"),
      ],
      {
        activeSlug: "flanksource/foundations/colors",
        query: "",
        metaFor: (page) => orderedMeta.get(page.slug),
      },
    );

    expect(
      sections.map((section) => ({
        label: section.label,
        items: section.items?.map(({ key, active }) => ({ key, active })),
      })),
    ).toEqual([
      {
        label: "Flanksource",
        items: [{ key: "flanksource", active: false }],
      },
      {
        label: "Flanksource · Foundations",
        items: [{ key: "flanksource/foundations/colors", active: true }],
      },
      {
        label: "Flanksource · Patterns",
        items: [{ key: "flanksource/patterns/collections", active: false }],
      },
      {
        label: "Pages",
        items: [{ key: "scratch", active: false }],
      },
    ]);
  });

  it("matches descriptions as well as titles and slugs", () => {
    const sections = buildPlaygroundNavSections(
      [entry("flanksource/patterns/collections"), entry("flanksource")],
      {
        activeSlug: undefined,
        query: "detail panes",
        metaFor: (page) => orderedMeta.get(page.slug),
      },
    );

    expect(sections.flatMap((section) => section.items?.map((item) => item.key))).toEqual([
      "flanksource/patterns/collections",
    ]);
  });

  it("rejects conflicting order metadata within one group", () => {
    expect(() =>
      buildPlaygroundNavSections([entry("a"), entry("b")], {
        activeSlug: undefined,
        query: "",
        metaFor: (page) => ({
          group: "Flanksource",
          groupOrder: page.slug === "a" ? 0 : 10,
        }),
      }),
    ).toThrow('Conflicting groupOrder values for "Flanksource"');
  });
});
