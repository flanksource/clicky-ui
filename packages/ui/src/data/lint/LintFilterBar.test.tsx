import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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

describe("LintFilterBar", () => {
  it("reports the grouping whose pill is clicked", () => {
    const { onGroupingChange } = renderBar(emptyLintFilters());
    fireEvent.click(screen.getByTitle("Group by File · Linter · Rule"));
    expect(onGroupingChange).toHaveBeenCalledWith("file-linter-rule");
  });

  it("hides a severity nobody reported until a severity filter is active", () => {
    const results = [betterleaks];
    const { unmount } = render(
      <LintFilterBar
        results={results}
        grouping="summary"
        onGroupingChange={vi.fn()}
        filters={emptyLintFilters()}
        onFiltersChange={vi.fn()}
      />,
    );
    expect(screen.getByTitle("Error: neutral. Click to include")).toBeInTheDocument();
    expect(screen.queryByTitle("Warning: neutral. Click to include")).toBeNull();
    unmount();

    const filters = emptyLintFilters();
    filters.severity.set("error", "include");
    renderBar(filters, results);
    expect(screen.getByTitle("Warning: neutral. Click to include")).toBeInTheDocument();
  });

  it("counts each linter's violations through the active severity filter", () => {
    const filters = emptyLintFilters();
    filters.severity.set("warning", "include");
    renderBar(filters);
    // golangci-lint has one warning, eslint has one warning.
    const golang = screen.getByTitle("golangci-lint: neutral. Click to include");
    expect(golang.textContent).toContain("1");
    const esl = screen.getByTitle("eslint: neutral. Click to include");
    expect(esl.textContent).toContain("1");
  });

  it("cycles a linter from excluded back to neutral", () => {
    const filters = emptyLintFilters();
    filters.linter.set("eslint", "exclude");
    const { onFiltersChange } = renderBar(filters);
    fireEvent.click(screen.getByTitle("eslint: excluded. Click to clear"));
    expect(onFiltersChange).toHaveBeenCalledWith(emptyLintFilters());
  });
});
