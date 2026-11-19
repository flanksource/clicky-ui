import { useState } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { TestRunner } from "./TestRunner";
import { emptyTestFilters, type TestFilters } from "./filterState";
import type { TestRunnerView } from "./TestViewToggle";
import type { Test } from "./types";

const timeout: Test = {
  name: "TestTimeout",
  package: "pkg/api",
  failed: true,
  message: "\nexpected 200, got 504\nat handler.go:12",
  route_path: "pkg/api/TestTimeout",
};
const parse: Test = {
  name: "parses dates",
  package: "pkg/dates",
  suite: ["Parser"],
  failed: true,
  message: "Expected 2026 to equal 2025",
  route_path: "pkg/dates/Parser/parses dates",
};
const forest: Test[] = [
  { name: "pkg/api", children: [timeout] },
  { name: "pkg/dates", children: [{ name: "Parser", children: [parse] }] },
];

function Harness({ initialView, withToggle = true }: { initialView: TestRunnerView; withToggle?: boolean }) {
  const [selected, setSelected] = useState<Test | null>(initialView === "tree" ? timeout : null);
  const [filters, setFilters] = useState<TestFilters>(emptyTestFilters());
  const [expandAll, setExpandAll] = useState<boolean | null>(null);
  const [view, setView] = useState<TestRunnerView>(initialView);
  return (
    <TestRunner
      tests={forest}
      selected={selected}
      filters={filters}
      expandAll={expandAll}
      done
      hideHeader
      title={null}
      view={view}
      {...(withToggle ? { onViewChange: setView } : {})}
      onSelect={setSelected}
      onFiltersChange={setFilters}
      onExpandAllChange={setExpandAll}
    />
  );
}

const listRows = () => Array.from(document.querySelectorAll("[data-test-list-row]"));

describe("TestRunner Tree / List view", () => {
  it("puts the Tree / List toggle beside Copy details and switches to one row per test", () => {
    render(<Harness initialView="tree" />);

    const actions = document.querySelector("[data-detail-actions]") as HTMLElement;
    const toggle = within(actions).getByRole("radiogroup", { name: "View" });
    expect(toggle.nextElementSibling?.textContent).toContain("Copy details");

    fireEvent.click(within(toggle).getByRole("radio", { name: /List/ }));

    expect(listRows().map((row) => row.textContent)).toEqual([
      expect.stringContaining("TestTimeoutpkg/apiexpected 200, got 504"),
      expect.stringContaining("parses datespkg/dates › ParserExpected 2026 to equal 2025"),
    ]);
  });

  it("opens a row's detail beneath it without repeating the toggle, and closes it again", () => {
    render(<Harness initialView="list" />);
    const row = () => listRows()[1] as HTMLElement;

    fireEvent.click(within(row()).getByRole("button", { expanded: false }));
    const detail = row().querySelector("[data-test-list-detail]") as HTMLElement;
    expect({
      copy: within(detail).getByText("Copy details") !== null,
      togglesOnPage: screen.getAllByRole("radiogroup", { name: "View" }).length,
      togglesInDetail: within(detail).queryAllByRole("radiogroup", { name: "View" }).length,
    }).toEqual({ copy: true, togglesOnPage: 1, togglesInDetail: 0 });

    fireEvent.click(within(row()).getByRole("button", { expanded: true }));
    expect(row().querySelector("[data-test-list-detail]")).toBeNull();
  });

  it("hides the toggle when the host does not handle view changes", () => {
    render(<Harness initialView="tree" withToggle={false} />);

    expect(screen.queryByRole("radiogroup", { name: "View" })).toBeNull();
  });
});
