import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { LintDetailPanel } from "./LintDetail";
import { LintTreeNode } from "./LintTreeNode";
import { buildLintTree, findLintNode } from "./grouping";
import { emptyLintFilters, type LintGrouping, type LintNode, type LinterResult } from "./types";
import {
  golangci,
  promptRunning,
  promptRunWithNestedLinters,
  pyrightFailed,
  reviewRunning,
  reviewUirFailed,
} from "./LintResults.fixtures";

function treeOf(results: LinterResult[], grouping: LintGrouping = "linter-rule-file"): LintNode[] {
  return buildLintTree({ results, grouping, filters: emptyLintFilters() });
}

function linterRoot(result: LinterResult, grouping: LintGrouping = "linter-rule-file"): LintNode {
  const [node] = treeOf([result], grouping);
  if (!node) throw new Error(`no linter node for ${result.linter}`);
  return node;
}

describe("LintTreeNode linter rows", () => {
  it("shows a finished linter's duration beside its violation count", () => {
    render(<LintTreeNode node={linterRoot(golangci)} selected={false} />);
    expect(screen.getByText("4.2s")).toBeInTheDocument();
    expect(screen.getByTitle("4 violations")).toBeInTheDocument();
  });

  it("shows no duration for a linter that is still running", () => {
    render(<LintTreeNode node={linterRoot(promptRunning)} selected={false} />);
    expect(screen.queryByText(/\d(ms|s)$/)).toBeNull();
  });

  it("shows no duration for a rule row beneath the linter", () => {
    const rule = linterRoot(golangci).children![0]!;
    render(<LintTreeNode node={rule} selected={false} />);
    expect(screen.queryByText("4.2s")).toBeNull();
  });

  it("marks a linter that failed to run in red with a note whose tooltip is the whole error", () => {
    render(<LintTreeNode node={linterRoot(pyrightFailed)} selected={false} />);
    const note = screen.getByText("failed to run");
    expect(note).toHaveClass("text-red-600");
    expect(note).toHaveAttribute("title", pyrightFailed.error);
    expect(screen.getByText("pyright")).toHaveClass("text-red-600");
    expect(screen.getByRole("img", { name: /error/i })).toBeInTheDocument();
  });

  it("shows a nested linter by its child name", () => {
    const parent = treeOf(promptRunWithNestedLinters)[0]!;
    const uir = parent.children!.find((c) => c.linterName === reviewUirFailed.linter)!;
    render(<LintTreeNode node={uir} selected={false} />);
    expect(screen.getByText("uir")).toBeInTheDocument();
    expect(screen.getByText("failed to run")).toHaveAttribute("title", reviewUirFailed.error);
  });
});

describe("linter detail run identity", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("shows the run id and session id as copyable mono text", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    render(<LintDetailPanel node={linterRoot(reviewRunning)} results={[reviewRunning]} />);
    expect(screen.getByText(reviewRunning.run_id!)).toHaveClass("font-mono");
    expect(screen.getByText(reviewRunning.session_id!)).toHaveClass("font-mono");
    fireEvent.click(screen.getByRole("button", { name: "Copy session id" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledExactlyOnceWith(reviewRunning.session_id));
  });

  it("shows only the run id when the result has no session", () => {
    render(<LintDetailPanel node={linterRoot(promptRunning)} results={[promptRunning]} />);
    expect(screen.getByText(promptRunning.run_id!)).toBeInTheDocument();
    expect(screen.queryByText("session id")).toBeNull();
  });

  it("shows neither for a linter that has no run", () => {
    render(<LintDetailPanel node={linterRoot(golangci)} results={[golangci]} />);
    expect(screen.queryByText("run id")).toBeNull();
    expect(screen.queryByText("session id")).toBeNull();
  });

  it("shows a nested failed linter's error and its parent run id", () => {
    const nodes = treeOf(promptRunWithNestedLinters);
    const uir = findLintNode(nodes, "messaging-review-report-mdx/uir")!;
    render(<LintDetailPanel node={uir} results={promptRunWithNestedLinters} />);
    const error = screen.getByText("Error").parentElement!;
    expect(within(error).getByText("uir executable not found on PATH")).toBeInTheDocument();
    expect(screen.getByText(reviewUirFailed.run_id!)).toBeInTheDocument();
  });
});
