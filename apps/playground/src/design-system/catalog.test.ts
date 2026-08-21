import { describe, expect, it } from "vitest";

import {
  DESIGN_SYSTEM_PAGES,
  designSystemPage,
} from "./catalog";

describe("design-system catalog", () => {
  it("defines the complete foundations and patterns surface in navigation order", () => {
    expect(
      DESIGN_SYSTEM_PAGES.map(({ slug, group }) => ({ slug, group })),
    ).toEqual([
      { slug: "flanksource", group: "Flanksource" },
      { slug: "flanksource/foundations/colors", group: "Flanksource · Foundations" },
      { slug: "flanksource/foundations/typography", group: "Flanksource · Foundations" },
      { slug: "flanksource/foundations/spacing-density", group: "Flanksource · Foundations" },
      { slug: "flanksource/foundations/icons", group: "Flanksource · Foundations" },
      { slug: "flanksource/foundations/tones", group: "Flanksource · Foundations" },
      { slug: "flanksource/patterns/page-anatomy", group: "Flanksource · Patterns" },
      { slug: "flanksource/patterns/collections", group: "Flanksource · Patterns" },
      { slug: "flanksource/patterns/forms-preview", group: "Flanksource · Patterns" },
      { slug: "flanksource/patterns/object-arrays", group: "Flanksource · Patterns" },
      { slug: "flanksource/patterns/feedback-states", group: "Flanksource · Patterns" },
    ]);
  });

  it("gives every page a description, icon, and deterministic order", () => {
    for (const page of DESIGN_SYSTEM_PAGES) {
      expect(page.description).not.toBe("");
      expect(page.icon).toBeTypeOf("function");
      expect(page.groupOrder).toBeTypeOf("number");
      expect(page.navOrder).toBeTypeOf("number");
    }
  });

  it("fails loudly when a page asks for an unknown catalog slug", () => {
    expect(() => designSystemPage("flanksource/missing")).toThrow(
      'Unknown design-system page "flanksource/missing"',
    );
  });
});
