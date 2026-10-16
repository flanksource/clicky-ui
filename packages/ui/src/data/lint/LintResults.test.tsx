import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { LintResults, type LintResultsProps } from "./LintResults";
import { emptyLintFilters, type LintAction, type LintFilters, type LintGrouping, type LinterResult } from "./types";
import { allLintResults, eslint, golangci, pyrightFailed } from "./LintResults.fixtures";

type HarnessProps = Partial<Pick<LintResultsProps, "onIgnore" | "ignoreBusy" | "title" | "headerSlot">> & {
  results?: LinterResult[];
  initialGrouping?: LintGrouping;
  initialFilters?: LintFilters;
  initialSelected?: string | null;
  onSelectSpy?: (path: string | null) => void;
  onFiltersSpy?: (filters: LintFilters) => void;
  onGroupingSpy?: (grouping: LintGrouping) => void;
};

function Harness({
  results = [golangci],
  initialGrouping = "linter-rule-file",
  initialFilters = emptyLintFilters(),
  initialSelected = null,
  onSelectSpy,
  onFiltersSpy,
  onGroupingSpy,
  ...rest
}: HarnessProps) {
  const [grouping, setGrouping] = useState<LintGrouping>(initialGrouping);
  const [filters, setFilters] = useState<LintFilters>(initialFilters);
  const [selected, setSelected] = useState<string | null>(initialSelected);
  const [expandAll, setExpandAll] = useState<boolean | null>(null);
  return (
    <LintResults
      results={results}
      grouping={grouping}
      onGroupingChange={(g) => {
        onGroupingSpy?.(g);
        setGrouping(g);
      }}
      filters={filters}
      onFiltersChange={(f) => {
        onFiltersSpy?.(f);
        setFilters(f);
      }}
      selected={selected}
      onSelect={(p) => {
        onSelectSpy?.(p);
        setSelected(p);
      }}
      expandAll={expandAll}
      onExpandAllChange={setExpandAll}
      {...rest}
    />
  );
}

const tree = () => screen.getByRole("tree");

describe("LintResults", () => {
  it("lists each linter as a root with its violations opened beneath it", () => {
    render(<Harness results={[golangci, eslint]} />);
    const t = within(tree());
    expect(t.getByText("golangci-lint")).toBeInTheDocument();
    expect(t.getByText("eslint")).toBeInTheDocument();
    expect(t.getByText("errcheck")).toBeInTheDocument();
    expect(t.getByText("react-hooks/exhaustive-deps")).toBeInTheDocument();
  });

  it("reports the selected node's route path and shows its findings", () => {
    const onSelectSpy = vi.fn();
    render(<Harness onSelectSpy={onSelectSpy} />);
    fireEvent.click(within(tree()).getByText("pkg > server > handler.go"));
    expect(onSelectSpy).toHaveBeenLastCalledWith("golangci-lint/errcheck/pkg-server-handler-go");
    expect(screen.getByText("Error return value of `w.Write` is not checked")).toBeInTheDocument();
    expect(screen.getByText("Error return value of `f.Close` is not checked")).toBeInTheDocument();
  });

  it("deselects when the selected row is clicked again", () => {
    const onSelectSpy = vi.fn();
    render(<Harness onSelectSpy={onSelectSpy} initialSelected="golangci-lint/errcheck/pkg-server-handler-go" />);
    fireEvent.click(within(tree()).getByText("pkg > server > handler.go"));
    expect(onSelectSpy).toHaveBeenLastCalledWith(null);
  });

  it("opens the detail for a route path the host restored from its URL", () => {
    render(<Harness initialSelected="golangci-lint/unused/pkg-server-routes-api-go" />);
    expect(screen.getByText("func `legacyRoute` is unused")).toBeInTheDocument();
  });

  it("shows a placeholder until something is selected", () => {
    render(<Harness />);
    expect(screen.getByText("Select a linter, rule or file to view its findings.")).toBeInTheDocument();
  });

  it("shows a linter that failed to run, with its error in the detail pane", () => {
    render(<Harness results={allLintResults} />);
    expect(screen.getByText("1 linter failed to run")).toBeInTheDocument();
    const row = within(tree()).getByText("pyright: configuration file pyrightconfig.json is invalid");
    fireEvent.click(row);
    expect(screen.getByText("Linter error")).toBeInTheDocument();
    expect(
      screen.getByText((_, el) => el?.tagName === "PRE" && el.textContent === pyrightFailed.error),
    ).toBeInTheDocument();
    expect(screen.getByText("Error: Unexpected token } in JSON at position 41")).toBeInTheDocument();
  });

  it("keeps the failed linter visible in the summary grouping too", () => {
    render(<Harness results={allLintResults} initialGrouping="summary" />);
    expect(within(tree()).getByText("pyright: configuration file pyrightconfig.json is invalid")).toBeInTheDocument();
    expect(within(tree()).getByText("skipped: no .vale.ini found")).toBeInTheDocument();
  });

  describe("grouping and filters", () => {
    it("regroups through the picker", () => {
      const onGroupingSpy = vi.fn();
      render(<Harness onGroupingSpy={onGroupingSpy} />);
      fireEvent.click(screen.getByTitle("Group by Summary"));
      expect(onGroupingSpy).toHaveBeenCalledWith("summary");
      expect(within(tree()).getByText(/^errcheck \(2\)/)).toBeInTheDocument();
    });

    it("includes then excludes a severity as its pill is clicked", () => {
      const onFiltersSpy = vi.fn();
      render(<Harness onFiltersSpy={onFiltersSpy} />);
      fireEvent.click(screen.getByTitle("Warning: neutral. Click to include"));
      expect(onFiltersSpy).toHaveBeenLastCalledWith({
        severity: new Map([["warning", "include"]]),
        linter: new Map(),
      });
      expect(within(tree()).queryByText("errcheck")).toBeNull();
      expect(within(tree()).getByText("unused")).toBeInTheDocument();

      fireEvent.click(screen.getByTitle("Warning: included. Click to exclude"));
      expect(onFiltersSpy).toHaveBeenLastCalledWith({
        severity: new Map([["warning", "exclude"]]),
        linter: new Map(),
      });
    });

    it("offers linter pills only when there is more than one linter", () => {
      const { unmount } = render(<Harness results={[golangci]} />);
      expect(screen.queryByTitle("golangci-lint: neutral. Click to include")).toBeNull();
      unmount();
      render(<Harness results={[golangci, eslint]} />);
      fireEvent.click(screen.getByTitle("eslint: neutral. Click to include"));
      expect(within(tree()).queryByText("golangci-lint")).toBeNull();
    });

    it("clears every filter at once", () => {
      const filters = emptyLintFilters();
      filters.severity.set("error", "exclude");
      const onFiltersSpy = vi.fn();
      render(<Harness initialFilters={filters} onFiltersSpy={onFiltersSpy} />);
      fireEvent.click(screen.getByRole("button", { name: "Clear" }));
      expect(onFiltersSpy).toHaveBeenLastCalledWith(emptyLintFilters());
    });

    it("keeps the filter controls when the filters leave nothing to show", () => {
      const filters = emptyLintFilters();
      filters.linter.set("golangci-lint", "exclude");
      render(<Harness initialFilters={filters} />);
      expect(screen.getByText("No violations match the current filters")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
    });
  });

  describe("empty states", () => {
    it("says so when there are no results at all", () => {
      render(<Harness results={[]} />);
      expect(screen.getByText("No lint results")).toBeInTheDocument();
    });

    it("says so when every linter ran clean", () => {
      render(<Harness results={[{ linter: "eslint", success: true, violations: [] }]} />);
      expect(screen.getByText("No lint violations")).toBeInTheDocument();
    });
  });

  describe("ignore actions", () => {
    const ruleNode = "golangci-lint/errcheck";

    it("hands the chosen action to onIgnore", () => {
      const onIgnore = vi.fn<(action: LintAction) => void>();
      render(<Harness onIgnore={onIgnore} initialSelected={ruleNode} />);
      fireEvent.click(screen.getByRole("button", { name: "Ignore rule errcheck everywhere" }));
      expect(onIgnore).toHaveBeenCalledTimes(1);
      expect(onIgnore.mock.calls[0]![0].req).toEqual({
        source: "golangci-lint",
        rule: "errcheck",
        work_dir: "/repo/gavel",
      });
    });

    it("offers a per-violation ignore on a file's findings", () => {
      const onIgnore = vi.fn<(action: LintAction) => void>();
      render(<Harness onIgnore={onIgnore} initialSelected={`${ruleNode}/pkg-server-handler-go`} />);
      const first = document.querySelectorAll<HTMLElement>("[data-lint-violation]")[0]!;
      fireEvent.click(within(first).getByRole("button", { name: "Ignore this violation" }));
      expect(onIgnore.mock.calls[0]![0].req).toEqual({
        source: "golangci-lint",
        rule: "errcheck",
        file: "pkg/server/handler.go",
        work_dir: "/repo/gavel",
      });
    });

    it("renders no ignore buttons without onIgnore", () => {
      render(<Harness initialSelected={ruleNode} />);
      expect(screen.queryByRole("button", { name: /Ignore|Disable/ })).toBeNull();
    });

    it("disables the buttons while the host is busy", () => {
      render(<Harness onIgnore={vi.fn()} ignoreBusy initialSelected={ruleNode} />);
      expect(screen.getByRole("button", { name: "Ignore rule errcheck everywhere" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Disable golangci-lint entirely" })).toBeDisabled();
    });

    it("disables folder-scoped ignores when the work dir is unknown", () => {
      const noWorkDir: LinterResult = {
        linter: "x",
        violations: [{ file: "a/b/c.go", line: 1, severity: "error", rule: { method: "r" } }],
      };
      render(
        <Harness
          results={[noWorkDir, { ...noWorkDir, violations: [{ file: "a/d/e.go", line: 1, rule: { method: "r" } }] }]}
          initialGrouping="linter-file"
          initialSelected="x/a"
          onIgnore={vi.fn()}
        />,
      );
      expect(screen.getByRole("button", { name: "Ignore everything in this folder" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Disable x entirely" })).toBeEnabled();
    });
  });

  describe("header", () => {
    it("shows the default title, severity totals and the host's slot", () => {
      render(<Harness results={[golangci, eslint]} headerSlot={<button type="button">Re-run</button>} />);
      const header = document.querySelector<HTMLElement>("[data-lint-header]")!;
      expect(within(header).getByText("Lint Results")).toBeInTheDocument();
      expect(within(header).getByText("Re-run")).toBeInTheDocument();
      expect(header.querySelector("[data-lint-summary]")!.textContent).toBe("321");
    });

    it("omits the title when null", () => {
      render(<Harness title={null} />);
      expect(screen.queryByText("Lint Results")).toBeNull();
    });
  });

  describe("in a container narrower than the split needs", () => {
    afterEach(() => vi.restoreAllMocks());

    it("shows the tree alone, then the selected node's detail with a way back", () => {
      vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ width: 390 } as DOMRect);
      render(<Harness />);
      expect(screen.queryByText("Select a linter, rule or file to view its findings.")).toBeNull();

      fireEvent.click(within(tree()).getByText("pkg > server > handler.go"));
      expect(screen.queryByRole("tree")).toBeNull();
      expect(screen.getByText("Error return value of `w.Write` is not checked")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Back to results" }));
      expect(within(tree()).getByText("pkg > server > handler.go")).toBeInTheDocument();
    });
  });
});
