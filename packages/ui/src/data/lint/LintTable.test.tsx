import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LintTable } from "./LintTable";
import { emptyLintFilters, type LinterResult } from "./types";

describe("lint table expansion identity", () => {
  it("keeps an expansion attached to its finding when another tool is filtered out", () => {
    const results: LinterResult[] = [
      {
        linter: "one",
        violations: [{ file: "a.go", line: 1, message: "First finding" }],
      },
      {
        linter: "two",
        violations: [{ file: "a.go", line: 1, message: "Second finding" }],
      },
    ];
    const { container, rerender } = render(
      <LintTable results={results} filters={emptyLintFilters()} />,
    );
    fireEvent.click(screen.getByText("Second finding"));
    expect(
      container.querySelector("[data-lint-violation-detail]"),
    ).toHaveTextContent("Second finding");
    rerender(
      <LintTable
        results={results}
        filters={{ severity: new Map(), linter: new Map([["one", "exclude"]]) }}
      />,
    );
    expect(
      container.querySelectorAll("[data-lint-violation-detail]"),
    ).toHaveLength(1);
    expect(
      container.querySelector("[data-lint-violation-detail]"),
    ).toHaveTextContent("Second finding");
  });
});
