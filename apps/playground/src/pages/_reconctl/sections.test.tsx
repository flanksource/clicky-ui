// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EngineGrid, EntityGrid, PaletteBand, ToneLegend, VocabularyTable } from "./sections";
import { ENGINE_TERMS, ENTITY_TERMS, VOCABULARIES } from "./vocabulary";

/**
 * A render check, not a snapshot.
 *
 * `vocabulary.test.ts` proves the data is coherent; this proves the components
 * actually put it on screen. The two failure modes it catches are the ones that
 * look fine in review: an offline Iconify import that resolves to `undefined`
 * and throws inside `<Icon>`, and a table that silently renders a subset of the
 * terms it was handed.
 */

afterEach(cleanup);

describe("VocabularyTable", () => {
  it.each(VOCABULARIES.map((vocabulary) => [vocabulary.id, vocabulary] as const))(
    "renders every %s term with its value and meaning",
    (_id, vocabulary) => {
      const { container } = render(<VocabularyTable vocabulary={vocabulary} />);
      const rows = container.querySelectorAll("tbody tr");
      expect(rows).toHaveLength(vocabulary.terms.length);

      for (const [index, term] of vocabulary.terms.entries()) {
        const row = rows[index]!;
        expect(within(row as HTMLElement).getByText(term.value)).toBeTruthy();
        expect(row.textContent).toContain(term.meaning);
      }
    },
  );

  it("draws an svg for every term, so no offline icon import resolved to undefined", () => {
    for (const vocabulary of VOCABULARIES) {
      const { container } = render(<VocabularyTable vocabulary={vocabulary} />);
      // One glyph inside the chip per row.
      expect(container.querySelectorAll("tbody tr svg").length).toBe(vocabulary.terms.length);
      cleanup();
    }
  });
});

describe("grids", () => {
  it("renders all ten engines, split into two families", () => {
    const { container } = render(<EngineGrid />);
    for (const term of ENGINE_TERMS) {
      expect(screen.getByText(term.value)).toBeTruthy();
    }
    expect(container.querySelectorAll("ul")).toHaveLength(2);
  });

  it("renders all eleven entities", () => {
    const { container } = render(<EntityGrid />);
    for (const term of ENTITY_TERMS) {
      expect(screen.getByText(term.value)).toBeTruthy();
    }
    expect(container.querySelectorAll("article")).toHaveLength(ENTITY_TERMS.length);
  });

  it("names all four added tones", () => {
    render(<ToneLegend />);
    for (const tone of ["action", "chrome", "healthy", "absent"]) {
      expect(screen.getByText(tone)).toBeTruthy();
    }
  });
});

describe("PaletteBand", () => {
  it.each(["dark", "light"] as const)("reports %s contrast as measured ratios", (theme) => {
    const { container } = render(<PaletteBand theme={theme} />);
    // Every ratio the band prints, e.g. "12.34:1".
    const ratios = container.textContent?.match(/\d+\.\d{2}:1/g) ?? [];
    expect(ratios).toHaveLength(3);
  });

  it("clears AA for body text and AA-large for the accent, in both themes", () => {
    for (const theme of ["dark", "light"] as const) {
      const { container } = render(<PaletteBand theme={theme} />);
      const text = container.textContent ?? "";
      // The band prints "Body text N:1 (GRADE) · muted N:1 (GRADE) · accent N:1 (GRADE)".
      const grades = text.match(/\((AAA|AA|AA-large|fail)\)/g) ?? [];
      expect(grades, `${theme} grades`).toHaveLength(3);
      expect(grades, `${theme} has a failing pair`).not.toContain("(fail)");
      cleanup();
    }
  });
});
