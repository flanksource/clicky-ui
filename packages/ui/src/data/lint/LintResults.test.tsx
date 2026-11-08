import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { LintResults, type LintResultsProps } from "./LintResults";
import { emptyLintFilters, type LintAction, type LintFilters, type LintGrouping, type LinterResult } from "./types";
import { allLintResults, betterleaks, eslint, golangci, pyrightFailed } from "./LintResults.fixtures";

type HarnessProps = Partial<
  Pick<LintResultsProps, "onIgnore" | "ignoreBusy" | "title" | "headerSlot" | "onOpenFile" | "entityHref" | "view" | "onViewChange">
> & {
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
const filterBar = () => document.querySelector<HTMLElement>("[data-lint-filter-bar]")!;

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
    fireEvent.click(within(tree()).getByText("pkg/server/handler.go"));
    expect(onSelectSpy).toHaveBeenLastCalledWith("golangci-lint/errcheck/pkg-server-handler-go");
    expect(screen.getByText("Error return value of `w.Write` is not checked")).toBeInTheDocument();
    expect(screen.getByText("Error return value of `f.Close` is not checked")).toBeInTheDocument();
  });

  it("keeps the selected row when clicked again", () => {
    const onSelectSpy = vi.fn();
    render(<Harness onSelectSpy={onSelectSpy} initialSelected="golangci-lint/errcheck/pkg-server-handler-go" />);
    fireEvent.click(within(tree()).getByText("pkg/server/handler.go"));
    expect(onSelectSpy).toHaveBeenLastCalledWith("golangci-lint/errcheck/pkg-server-handler-go");
  });

  it("opens the detail for a route path the host restored from its URL", () => {
    render(<Harness initialSelected="golangci-lint/unused/pkg-server-routes-api-go" />);
    expect(screen.getByText("func `legacyRoute` is unused")).toBeInTheDocument();
  });

  // One fix at three places (lab run 2026-10-30: an nvarchar parameter
  // against varchar OMDataIntakeGL.FileID) is one violation listing each place.
  it("lists every place a violation applies, each opening its own line", () => {
    const onOpenFile = vi.fn();
    const workDir = "/repo/oipa";
    const file = "rules/tr/Billing/XMLData.xml";
    const convert: LinterResult = {
      linter: "oipa-transaction",
      work_dir: workDir,
      violations: [
        {
          file,
          line: 125,
          severity: "warning",
          rule: { method: "transaction.math.sql.plan-warning" },
          message: "PlanAffectingConvert — CONVERT_IMPLICIT(nvarchar(100),[OMDataIntakeGL].[FileID],0)",
          locations: [
            { file: `${workDir}/${file}`, line: 125, message: "screen over activity a1: statement s1" },
            { file, line: 126, message: "screen over activity a1: statement s2" },
            { file: "rules/br/CopyBook-Fees/XMLData.xml", line: 9, message: "transaction math over activity a1: statement s3" },
          ],
        },
      ],
    };
    render(<Harness results={[convert]} onOpenFile={onOpenFile} />);
    fireEvent.click(within(tree()).getByText("rules/tr/Billing/XMLData.xml"));
    fireEvent.click(screen.getByRole("button", { name: /PlanAffectingConvert/ }));
    const places = screen.getAllByTestId("lint-violation-location");
    expect(places.map((p) => p.textContent)).toEqual([
      expect.stringContaining(`${file}:125screen over activity a1: statement s1`),
      expect.stringContaining(`${file}:126screen over activity a1: statement s2`),
      expect.stringContaining("rules/br/CopyBook-Fees/XMLData.xml:9transaction math over activity a1: statement s3"),
    ]);
    expect(screen.getByText("3 locations")).toBeInTheDocument();
    fireEvent.click(within(places[2]!).getByRole("button"));
    expect(onOpenFile).toHaveBeenLastCalledWith({ file: "rules/br/CopyBook-Fees/XMLData.xml", workDir, line: 9 });
  });

  it("groups a file-less finding under its entity kind and links the entity through the host", () => {
    const policyId = "7f3a2c10-5b0a-4c53-9a73-0c9d3f5e8b11";
    const results: LinterResult[] = [
      {
        linter: "data-lint",
        work_dir: "/repo/oipa",
        violations: [
          {
            severity: "error",
            rule: { method: "looping-spawn" },
            message: "P-1001 spawned InvoiceStart 3 times",
            locations: [
              { entity: { kind: "Policy", id: policyId, name: "P-1001" } },
              { url: { url: "https://oipa.example.com/entity/policy/p1", css: ".row[data-activity='a1']" } },
            ],
          },
        ],
      },
    ];
    render(
      <Harness
        results={results}
        entityHref={(entity) => `/entity/${entity.kind.toLowerCase()}/${entity.id}`}
        initialSelected="data-lint/looping-spawn/policy"
      />,
    );
    expect(screen.getByRole("heading", { name: "Policy" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /P-1001 spawned InvoiceStart 3 times/ }));
    expect(screen.getByRole("link", { name: "Policy · P-1001" })).toHaveAttribute("href", `/entity/policy/${policyId}`);
    expect(screen.getByText("css: .row[data-activity='a1']")).toBeInTheDocument();
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
      fireEvent.click(screen.getByRole("button", { name: /^View Options/ }));
      fireEvent.click(screen.getByTitle("Group by Summary"));
      expect(onGroupingSpy).toHaveBeenCalledWith("summary");
      expect(within(tree()).getByText(/^errcheck \(2\)/)).toBeInTheDocument();
    });

    const facetMenu = (name: string) => {
      fireEvent.click(within(filterBar()).getByRole("button", { name: /^View Options/ }));
      return screen.getByRole("region", { name });
    };

    it("keeps View Options in the results toolbar and its facets inside the menu", () => {
      render(<Harness results={[golangci, eslint]} />);
      const header = document.querySelector<HTMLElement>("[data-lint-header]")!;
      expect(within(header).queryByRole("button", { name: /^View Options/ })).toBeNull();
      facetMenu("Severity");
      expect(screen.getByRole("region", { name: "Linter" })).toBeInTheDocument();
    });

    it("includes then excludes a severity picked from the filter bar's Severity multi-select", () => {
      const onFiltersSpy = vi.fn();
      render(<Harness onFiltersSpy={onFiltersSpy} />);
      fireEvent.click(within(facetMenu("Severity")).getByText("Warning"));
      expect(onFiltersSpy).toHaveBeenLastCalledWith({
        severity: new Map([["warning", "include"]]),
        linter: new Map(),
      });
      expect(within(tree()).queryByText("errcheck")).toBeNull();
      expect(within(tree()).getByText("unused")).toBeInTheDocument();

      fireEvent.click(within(screen.getByRole("region", { name: "Severity" })).getByText("Warning"));
      expect(onFiltersSpy).toHaveBeenLastCalledWith({
        severity: new Map([["warning", "exclude"]]),
        linter: new Map(),
      });
    });

    it("offers the Linter multi-select only when there is more than one linter", () => {
      const { unmount } = render(<Harness results={[golangci]} />);
      facetMenu("Severity");
      expect(screen.queryByRole("region", { name: "Linter" })).toBeNull();
      unmount();
      render(<Harness results={[golangci, eslint]} />);
      fireEvent.click(within(facetMenu("Linter")).getByText("ESLint"));
      expect(within(tree()).queryByText("golangci-lint")).toBeNull();
    });

    it("clears every filter at once", () => {
      const filters = emptyLintFilters();
      filters.severity.set("error", "exclude");
      const onFiltersSpy = vi.fn();
      render(<Harness initialFilters={filters} onFiltersSpy={onFiltersSpy} />);
      facetMenu("Severity");
      fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
      expect(onFiltersSpy).toHaveBeenLastCalledWith(emptyLintFilters());
    });

    it("keeps the filter controls when the filters leave nothing to show", () => {
      const filters = emptyLintFilters();
      filters.linter.set("golangci-lint", "exclude");
      render(<Harness initialFilters={filters} />);
      expect(screen.getByText("No violations match the current filters")).toBeInTheDocument();
      facetMenu("Severity");
      expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
    });
  });

  describe("table view", () => {
    it("hides the Tree / Table toggle unless the host handles view changes", () => {
      render(<Harness />);
      expect(screen.queryByRole("radiogroup", { name: "View" })).toBeNull();
    });

    it("reports the view picked from the toggle", () => {
      const onViewChange = vi.fn();
      render(<Harness onViewChange={onViewChange} />);
      fireEvent.click(screen.getByRole("radio", { name: /Table/ }));
      expect(onViewChange).toHaveBeenCalledWith("table");
    });

    it("lists the filtered violations as rows, errors first, and opens a row's violation card beneath it", () => {
      const filters = emptyLintFilters();
      filters.linter.set("eslint", "exclude");
      render(<Harness results={[golangci, eslint]} initialFilters={filters} view="table" onViewChange={vi.fn()} />);
      const table = document.querySelector<HTMLElement>("[data-lint-table]")!;
      const bodyRows = within(table).getAllByRole("row").slice(1);
      const rules = bodyRows.map((row) => within(row).getAllByRole("cell")[2]?.textContent);
      expect(rules).toEqual(["errcheck", "errcheck", "unused", "godot"]);
      fireEvent.click(within(table).getByText("Error return value of `w.Write` is not checked"));
      expect(table.querySelectorAll("[data-lint-violation-detail]")).toHaveLength(1);
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
      fireEvent.click(within(document.querySelector<HTMLElement>("[data-lint-node-actions]")!).getByRole("button", { name: "Actions" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Ignore rule errcheck everywhere" }));
      expect(onIgnore).toHaveBeenCalledTimes(1);
      expect(onIgnore.mock.calls[0]![0].req).toEqual({
        source: "golangci-lint",
        rule: "errcheck",
        work_dir: "/repo/gavel",
      });
    });

    it("offers occurrence, rule and file ignores in the finding menu", async () => {
      const onIgnore = vi.fn<(action: LintAction) => void>();
      render(<Harness onIgnore={onIgnore} initialSelected={`${ruleNode}/pkg-server-handler-go`} />);
      const first = document.querySelectorAll<HTMLElement>("[data-lint-violation]")[0]!;
      fireEvent.click(within(first).getByRole("button", { name: "Problem actions" }));
      const menuLabels = (await screen.findAllByRole("menuitem")).map((item) => item.textContent);
      fireEvent.click(screen.getByRole("menuitem", { name: "Ignore this occurrence" }));
      expect({ menuLabels, req: onIgnore.mock.calls[0]![0].req }).toEqual({
        menuLabels: ["Copy description", "Ignore this occurrence", "Ignore errcheck everywhere", "Ignore all golangci-lint in this file"],
        req: { source: "golangci-lint", rule: "errcheck", file: "pkg/server/handler.go", line: 41, work_dir: "/repo/gavel" },
      });
    });

    it("offers a row's ignore actions from its right-click menu without selecting the row", async () => {
      const onIgnore = vi.fn<(action: LintAction) => void>();
      const onSelectSpy = vi.fn();
      render(<Harness onIgnore={onIgnore} onSelectSpy={onSelectSpy} />);
      const label = within(tree()).getByText("errcheck");
      fireEvent.contextMenu(label);
      fireEvent.click(await screen.findByRole("menuitem", { name: /Ignore rule errcheck everywhere/ }));
      expect({ req: onIgnore.mock.calls[0]![0].req, selected: onSelectSpy.mock.calls.length }).toEqual({
        req: { source: "golangci-lint", rule: "errcheck", work_dir: "/repo/gavel" },
        selected: 0,
      });
    });

    it("offers a row's ignore actions from its ⋯ menu", async () => {
      render(<Harness onIgnore={vi.fn()} />);
      fireEvent.click(within(tree()).getByRole("button", { name: "Ignore options for errcheck" }));
      expect((await screen.findAllByRole("menuitem")).map((item) => item.textContent)).toEqual([
        "Ignore rule errcheck everywhere",
        "Disable golangci-lint entirely",
      ]);
    });

    it("renders no ignore buttons without onIgnore", () => {
      render(<Harness initialSelected={ruleNode} />);
      expect(screen.queryByRole("button", { name: /Ignore|Disable/ })).toBeNull();
    });

    it("offers the selected node's actions in a menu in the detail header", async () => {
      const onIgnore = vi.fn<(action: LintAction) => void>();
      render(<Harness onIgnore={onIgnore} initialSelected={ruleNode} />);
      const actions = document.querySelector<HTMLElement>("[data-detail-header] [data-lint-node-actions]")!;
      fireEvent.click(within(actions).getByRole("button", { name: "Actions" }));
      expect((await screen.findAllByRole("menuitem")).map((item) => item.textContent)).toEqual([
        "Ignore rule errcheck everywhere",
        "Disable golangci-lint entirely",
      ]);
      fireEvent.click(screen.getByRole("menuitem", { name: "Ignore rule errcheck everywhere" }));
      expect(onIgnore.mock.calls[0]![0].req).toEqual({ source: "golangci-lint", rule: "errcheck", work_dir: "/repo/gavel" });
    });

    it("disables the header split button while the host is busy", () => {
      render(<Harness onIgnore={vi.fn()} ignoreBusy initialSelected={ruleNode} />);
      const actions = document.querySelector<HTMLElement>("[data-lint-node-actions]")!;
      fireEvent.click(within(actions).getByRole("button", { name: "Actions" }));
      expect(screen.getByRole("menuitem", { name: "Ignore rule errcheck everywhere" })).toBeDisabled();
    });

    it("disables folder-scoped ignores when the work dir is unknown", async () => {
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
      const actions = document.querySelector<HTMLElement>("[data-lint-node-actions]")!;
      fireEvent.click(within(actions).getByRole("button", { name: "Actions" }));
      expect(screen.getByRole("menuitem", { name: "Ignore everything in this folder" })).toBeDisabled();
      expect(await screen.findByRole("menuitem", { name: /Disable x entirely/ })).toBeEnabled();
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

  describe("Open in Files", () => {
    const SELECTED_FILE = "golangci-lint/errcheck/pkg-server-handler-go";

    it("hands the host each violation's file, work dir and line", () => {
      const onOpenFile = vi.fn();
      render(<Harness onOpenFile={onOpenFile} initialSelected={SELECTED_FILE} />);

      const menus = screen.getAllByRole("button", { name: "Problem actions" });
      expect(menus).toHaveLength(2);
      fireEvent.click(menus[1]!);
      fireEvent.click(screen.getByRole("menuitem", { name: "Open in Files" }));

      expect(onOpenFile).toHaveBeenCalledWith({ file: "pkg/server/handler.go", workDir: "/repo/gavel", line: 88 });
    });

    it("is absent unless the host supplies onOpenFile", () => {
      render(<Harness initialSelected={SELECTED_FILE} />);
      expect(screen.queryByRole("button", { name: "Open in Files" })).toBeNull();
    });

    it("is absent for a violation that names no file", () => {
      render(<Harness onOpenFile={vi.fn()} results={[betterleaks]} initialSelected="betterleaks/generic-api-key/other" />);
      expect(screen.getByText("Potential API key found in git history")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Open in Files" })).toBeNull();
    });
  });

  describe("in a container narrower than the split needs", () => {
    afterEach(() => vi.restoreAllMocks());

    it("shows the tree alone, then the selected node's detail with a way back", () => {
      vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ width: 390 } as DOMRect);
      render(<Harness />);
      expect(screen.queryByText("Select a linter, rule or file to view its findings.")).toBeNull();

      fireEvent.click(within(tree()).getByText("pkg/server/handler.go"));
      expect(screen.queryByRole("tree")).toBeNull();
      expect(screen.getByText("Error return value of `w.Write` is not checked")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Back to results" }));
      expect(within(tree()).getByText("pkg/server/handler.go")).toBeInTheDocument();
    });
  });
});
