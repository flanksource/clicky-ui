import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { TestFilterBar } from "./TestFilterBar";
import { emptyTestFilters, type TestFilters } from "./filterState";
import type { StatusCounts } from "./status";

const counts: StatusCounts = {
  total: 6,
  failed: 1,
  warned: 1,
  aborted: 0,
  timedout: 1,
  passed: 1,
  skipped: 1,
  running: 0,
  pending: 1,
};

function renderBar({
  filters = emptyTestFilters(),
  frameworks = [] as string[],
  barCounts = counts,
} = {}) {
  const onChange = vi.fn<(next: TestFilters) => void>();
  render(
    <TestFilterBar filters={filters} onChange={onChange} counts={barCounts} frameworks={frameworks} />,
  );
  return onChange;
}

function openFacet(name: string) {
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${name}`) }));
  const menu = screen.getByRole("menu", { name });
  return {
    menu,
    values: Array.from(menu.querySelectorAll("[data-filter-option]")).map((o) =>
      o.getAttribute("data-filter-option"),
    ),
  };
}

describe("TestFilterBar", () => {
  it("lists every non-zero status in the Status facet, in STATUS_LABELS order", () => {
    renderBar();
    // running is zero, so it's not offered.
    expect(openFacet("Status").values).toEqual([
      "failed",
      "warned",
      "timedout",
      "passed",
      "skipped",
      "pending",
    ]);
  });

  it("includes a status when its option is picked", () => {
    const onChange = renderBar();
    const { menu } = openFacet("Status");
    fireEvent.click(within(menu).getByText("Failed"));
    expect(onChange).toHaveBeenLastCalledWith({
      status: new Map([["failed", "include"]]),
      framework: new Map(),
    });
  });

  it("summarises included and excluded statuses on the trigger", () => {
    renderBar({
      filters: {
        status: new Map([
          ["failed", "include"],
          ["passed", "exclude"],
        ]),
        framework: new Map(),
      },
    });
    expect(screen.getByRole("button", { name: /^Status/ })).toHaveTextContent("Status +1 -1");
  });

  it("hides the Tool facet when the run uses a single tool", () => {
    renderBar({ frameworks: ["go test"] });
    expect(screen.queryByRole("button", { name: /^Tool/ })).not.toBeInTheDocument();
  });

  it("labels Tool options by their mark and filters by the wire name", () => {
    const onChange = renderBar({ frameworks: ["exec", "verify"] });
    const { menu, values } = openFacet("Tool");
    expect(values).toEqual(["exec", "verify"]);
    fireEvent.click(within(menu).getByText("AI review"));
    expect(onChange).toHaveBeenLastCalledWith({
      status: new Map(),
      framework: new Map([["verify", "include"]]),
    });
  });
});
