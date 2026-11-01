import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { LintFilterBar } from "./LintFilterBar";
import { emptyLintFilters, type LintFilters } from "./types";
import { betterleaks, eslint, golangci } from "./LintResults.fixtures";

function renderBar(filters: LintFilters, results = [golangci, eslint]) {
  const onFiltersChange = vi.fn<(next: LintFilters) => void>();
  const onGroupingChange = vi.fn();
  render(
    <LintFilterBar
      results={results}
      grouping="linter-file"
      onGroupingChange={onGroupingChange}
      filters={filters}
      onFiltersChange={onFiltersChange}
    />,
  );
  return { onFiltersChange, onGroupingChange };
}

function openFacet(name: string) {
  fireEvent.click(screen.getByRole("button", { name: /^View Options/ }));
  const menu = screen.getByRole("region", { name });
  const options = Array.from(menu.querySelectorAll<HTMLElement>("[data-filter-option]"));
  return {
    menu,
    values: options.map((o) => o.getAttribute("data-filter-option")),
    texts: options.map((o) => o.textContent),
  };
}

describe("LintFilterBar", () => {
  it("reports the grouping whose pill is clicked", () => {
    const { onGroupingChange } = renderBar(emptyLintFilters());
    fireEvent.click(screen.getByRole("button", { name: /^View Options/ }));
    fireEvent.click(screen.getByTitle("Group by File · Linter · Rule"));
    expect(onGroupingChange).toHaveBeenCalledWith("file-linter-rule");
  });

  it("offers only reported severities until a severity filter is active", () => {
    const { unmount } = render(
      <LintFilterBar
        results={[betterleaks]}
        grouping="summary"
        onGroupingChange={vi.fn()}
        filters={emptyLintFilters()}
        onFiltersChange={vi.fn()}
      />,
    );
    expect(openFacet("Severity").values).toEqual(["error"]);
    unmount();

    const filters = emptyLintFilters();
    filters.severity.set("error", "include");
    renderBar(filters, [betterleaks]);
    expect(openFacet("Severity").values).toEqual(["error", "warning", "info"]);
  });

  it("includes a severity when its option is picked", () => {
    const { onFiltersChange } = renderBar(emptyLintFilters());
    fireEvent.click(within(openFacet("Severity").menu).getByText("Warning"));
    expect(onFiltersChange).toHaveBeenLastCalledWith({ severity: new Map([["warning", "include"]]), linter: new Map() });
  });

  it("counts each linter's violations through the active severity filter", () => {
    const filters = emptyLintFilters();
    filters.severity.set("warning", "include");
    renderBar(filters);
    // golangci-lint and eslint each report one warning.
    const { values, texts } = openFacet("Linter");
    expect(values).toEqual(["eslint", "golangci-lint"]);
    expect(texts.every((t) => t?.includes("1"))).toBe(true);
  });

  it("summarises included and excluded linters on the trigger and clears them", () => {
    const filters = emptyLintFilters();
    filters.linter.set("eslint", "exclude");
    const { onFiltersChange } = renderBar(filters);
    expect(screen.getByRole("button", { name: /^View Options/ })).toHaveTextContent("(1)");
    openFacet("Linter");
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(onFiltersChange).toHaveBeenCalledWith(emptyLintFilters());
  });
});
