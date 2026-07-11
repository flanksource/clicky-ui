import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestFilterBar } from "./TestFilterBar";
import { emptyTestFilters } from "./filterState";
import type { StatusCounts } from "./status";

const counts: StatusCounts = {
  total: 6,
  failed: 1,
  warned: 1,
  timedout: 1,
  passed: 1,
  skipped: 1,
  running: 0,
  pending: 1,
};

describe("TestFilterBar", () => {
  it("renders one pill per non-zero status, in STATUS_LABELS order", () => {
    render(
      <TestFilterBar
        filters={emptyTestFilters()}
        onChange={vi.fn()}
        counts={counts}
        frameworks={[]}
      />,
    );
    // running is zero, so it's hidden; the rest render in the fixed key order
    // Failed, Warned, Timed out, Passed, Skipped, Queued.
    const labels = screen
      .getAllByRole("button", { name: /./ })
      .map((el) => el.textContent?.trim())
      .filter((t): t is string => !!t && t !== "Clear");
    expect(labels).toEqual([
      "1Failed",
      "1Warned",
      "1Timed out",
      "1Passed",
      "1Skipped",
      "1Queued",
    ]);
  });

  it("hides a status pill whose count is zero", () => {
    render(
      <TestFilterBar
        filters={emptyTestFilters()}
        onChange={vi.fn()}
        counts={{ ...counts, warned: 0 }}
        frameworks={[]}
      />,
    );
    expect(screen.queryByTitle(/Warned/)).not.toBeInTheDocument();
  });
});
