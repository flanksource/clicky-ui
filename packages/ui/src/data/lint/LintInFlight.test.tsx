import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { LintDetailPanel } from "./LintDetail";
import { LintTreeNode } from "./LintTreeNode";
import { LintResults } from "./LintResults";
import { buildLintTree } from "./grouping";
import { collectLintLinters, countLintBySeverity, isLinterErrored } from "./stats";
import { LINT_GROUPINGS, emptyLintFilters, type LintGrouping, type LintNode, type LinterResult } from "./types";
import {
  golangci,
  inFlightLintResults,
  promptFinished,
  promptPending,
  promptRunning,
} from "./LintResults.fixtures";

function linterRoot(result: LinterResult, grouping: LintGrouping = "linter-rule-file"): LintNode {
  const node = buildLintTree({ results: [result], grouping, filters: emptyLintFilters() }).find(
    (n) => n.kind === "linter" && n.linterName === result.linter,
  );
  if (!node) throw new Error(`no linter node for ${result.linter} under ${grouping}`);
  return node;
}

describe("in-flight linters", () => {
  describe("stats", () => {
    it.each([
      ["pending", promptPending],
      ["running", promptRunning],
    ])("does not count a %s linter as failed to run, even if it carries an error", (_status, result) => {
      expect(isLinterErrored({ ...result, error: "partial output" })).toBe(false);
      expect(isLinterErrored({ ...result, timed_out: true })).toBe(false);
    });

    it("still counts a finished linter's error as a failure", () => {
      expect(isLinterErrored({ ...promptFinished, error: "agent crashed" })).toBe(true);
    });

    it("lists an in-flight linter for the filter bar and counts its live violations", () => {
      expect(collectLintLinters(inFlightLintResults)).toEqual([promptRunning.linter, promptPending.linter]);
      expect(countLintBySeverity(inFlightLintResults, new Map())).toEqual({ error: 0, warning: 1, info: 0 });
    });
  });

  describe("tree", () => {
    it.each(LINT_GROUPINGS)("shows a pending linter with no violations under %s grouping", (grouping) => {
      const roots = buildLintTree({ results: [golangci, promptPending], grouping, filters: emptyLintFilters() });
      const node = roots.find((n) => n.linterName === promptPending.linter);
      expect(node).toMatchObject({ kind: "linter", linter: promptPending, failed: false, passed: false });
      expect(node?.children ?? []).toEqual([]);
    });

    it("keeps an in-flight linter that the linter filter does not exclude and drops one it excludes", () => {
      const filters = emptyLintFilters();
      filters.linter.set(promptPending.linter, "exclude");
      const roots = buildLintTree({ results: [promptPending, promptRunning], grouping: "linter-file", filters });
      expect(roots.map((n) => n.linterName)).toEqual([promptRunning.linter]);
    });

    it("does not duplicate a running linter that already has violation nodes", () => {
      const roots = buildLintTree({ results: [promptRunning], grouping: "linter-file", filters: emptyLintFilters() });
      expect(roots.map((n) => n.linterName)).toEqual([promptRunning.linter]);
    });
  });

  describe("LintTreeNode", () => {
    it("shows a spinner for a running linter and keeps its live violation count", () => {
      render(<LintTreeNode node={linterRoot(promptRunning)} selected={false} />);
      const spinner = screen.getByRole("img", { name: "Running" });
      expect(spinner).toHaveClass("motion-safe:animate-spin");
      expect(screen.getByTitle("1 violation")).toBeInTheDocument();
    });

    it("shows a muted clock for a pending linter", () => {
      render(<LintTreeNode node={linterRoot(promptPending)} selected={false} />);
      const clock = screen.getByRole("img", { name: "Pending" });
      expect(clock).toHaveClass("text-muted-foreground");
      expect(clock).not.toHaveClass("motion-safe:animate-spin");
      expect(screen.queryByRole("img", { name: "Running" })).toBeNull();
    });

    it("shows neither mark for a finished linter", () => {
      render(<LintTreeNode node={linterRoot(promptFinished, "summary")} selected={false} />);
      expect(screen.queryByRole("img", { name: "Running" })).toBeNull();
      expect(screen.queryByRole("img", { name: "Pending" })).toBeNull();
    });

    it("renders in the results tree as pending and running beside finished linters", () => {
      render(
        <LintResults
          results={[golangci, ...inFlightLintResults]}
          grouping="linter-rule-file"
          onGroupingChange={vi.fn()}
          filters={emptyLintFilters()}
          onFiltersChange={vi.fn()}
          selected={null}
          onSelect={vi.fn()}
          expandAll={null}
          onExpandAllChange={vi.fn()}
        />,
      );
      const tree = within(screen.getByRole("tree"));
      expect(tree.getAllByRole("img", { name: "Pending" })).toHaveLength(1);
      expect(tree.getAllByRole("img", { name: "Running" })).toHaveLength(1);
      expect(tree.getByText(promptPending.linter)).toBeInTheDocument();
    });
  });

  describe("detail status", () => {
    it.each([
      ["pending", promptPending],
      ["running", promptRunning],
    ])("labels the linter %s", (label, result) => {
      render(<LintDetailPanel node={linterRoot(result)} results={[result]} />);
      const status = screen.getByText("Status").parentElement!;
      expect(within(status).getByText(label)).toBeInTheDocument();
      expect(within(status).queryByText("ran")).toBeNull();
    });

    it("keeps the existing chain for finished linters", () => {
      render(<LintDetailPanel node={linterRoot(promptFinished, "summary")} results={[promptFinished]} />);
      expect(screen.getByText("ran")).toBeInTheDocument();
    });

    it("labels an in-flight linter pending even when an earlier attempt left an error", () => {
      const retried = { ...promptPending, error: "agent crashed", skipped: false };
      render(<LintDetailPanel node={linterRoot(retried)} results={[retried]} />);
      expect(screen.getByText("pending")).toBeInTheDocument();
      expect(screen.queryByText("failed")).toBeNull();
    });
  });

  describe("renderRun", () => {
    it("hands the linter result to the host and shows what it returns in the linter detail", () => {
      const renderRun = vi.fn((result: LinterResult) => <div data-testid="run-view">{result.run_id}</div>);
      render(<LintDetailPanel node={linterRoot(promptRunning)} results={[promptRunning]} renderRun={renderRun} />);
      expect(renderRun).toHaveBeenCalledWith(promptRunning);
      expect(screen.getByTestId("run-view")).toHaveTextContent("run-7f3a");
    });

    it("renders no run section when the host passes no renderRun", () => {
      render(<LintDetailPanel node={linterRoot(promptRunning)} results={[promptRunning]} />);
      expect(screen.queryByTestId("run-view")).toBeNull();
      expect(screen.queryByText("Run")).toBeNull();
    });

    it("renders no run section when the host returns nothing for the linter", () => {
      render(<LintDetailPanel node={linterRoot(promptFinished, "summary")} results={[promptFinished]} renderRun={() => null} />);
      expect(screen.queryByText("Run")).toBeNull();
    });

    it("is not consulted for nodes beneath a linter", () => {
      const renderRun = vi.fn(() => <div />);
      const linter = linterRoot(promptRunning);
      const file = linter.children![0]!;
      render(<LintDetailPanel node={file} results={[promptRunning]} renderRun={renderRun} />);
      expect(renderRun).not.toHaveBeenCalled();
    });
  });
});
