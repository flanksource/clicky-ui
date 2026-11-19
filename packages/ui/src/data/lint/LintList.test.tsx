import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LintList } from "./LintList";
import { emptyLintFilters, type LinterResult } from "./types";

const results: LinterResult[] = [
  {
    linter: "golangci-lint",
    violations: [
      { file: "pkg/b.go", line: 9, column: 2, severity: "warning", message: "exported func lacks comment", rule: { method: "revive" } },
      { file: "pkg/a.go", line: 30, severity: "error", message: "unchecked error", rule: { method: "errcheck" } },
      { file: "pkg/a.go", line: 4, severity: "error", message: "unused variable", rule: { method: "unused" } },
    ],
  },
  { linter: "eslint", violations: [{ file: "ui/app.ts", line: 1, message: "no-console", rule: { method: "no-console" } }] },
];

function outline(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>("[data-lint-list-linter]")].map((linter) => [
    linter.dataset.lintListLinter,
    [...linter.querySelectorAll<HTMLElement>("[data-lint-list-file]")].map((file) => [
      file.dataset.lintListFile,
      [...file.querySelectorAll("[data-lint-line]")].map((line) => line.textContent),
    ]),
  ]);
}

describe("LintList", () => {
  it("prints linter, then sorted files, then violations by line as `:line:col message (rule)`", () => {
    const { container } = render(<LintList results={results} filters={emptyLintFilters()} />);
    expect(outline(container)).toEqual([
      ["golangci-lint", [
        ["pkg/a.go", [":4 unused variable (unused)", ":30 unchecked error (errcheck)"]],
        ["pkg/b.go", [":9:2 exported func lacks comment (revive)"]],
      ]],
      ["eslint", [["ui/app.ts", [":1 no-console (no-console)"]]]],
    ]);
  });

  it("drops linters the filters exclude and opens a violation's detail beneath it", () => {
    const { container } = render(
      <LintList results={results} filters={{ severity: new Map(), linter: new Map([["eslint", "exclude"]]) }} />,
    );
    expect(container.querySelector('[data-lint-list-linter="eslint"]')).toBeNull();
    fireEvent.click(screen.getByText("unchecked error"));
    const details = container.querySelectorAll("[data-lint-violation-detail]");
    expect(details).toHaveLength(1);
    expect(details[0]!.closest("[data-lint-violation]")?.textContent).toContain("unchecked error");
  });
});
