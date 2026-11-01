import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { LintDetailPanel } from "./LintDetail";
import { LintTreeNode } from "./LintTreeNode";
import { buildLintTree } from "./grouping";
import { emptyLintFilters, type LintNode, type LinterResult } from "./types";

const THREE_HOURS_AGO = new Date(Date.now() - 3 * 60 * 60 * 1000 - 60 * 1000).toISOString();

function cachedResult(hit: boolean): LinterResult {
  return {
    linter: "oipa-transaction",
    success: true,
    duration: 1_500_000_000,
    violations: [{ file: "transaction/Fee", line: 3, severity: "warning", message: "Fee reads FileID through CONVERT_IMPLICIT" }],
    cache: { source: "build", fingerprint: "lint+v7+transaction:fee+fp:build+static", stored_at: THREE_HOURS_AGO, hit },
  };
}

function linterRoot(result: LinterResult): LintNode {
  const node = buildLintTree({ results: [result], grouping: "linter-rule-file", filters: emptyLintFilters() }).find(
    (n) => n.kind === "linter",
  );
  if (!node) throw new Error("no linter node");
  return node;
}

describe("a linter that answered from its own cache", () => {
  it("shows the age of a full hit in the tree instead of the duration", () => {
    render(<LintTreeNode node={linterRoot(cachedResult(true))} selected={false} />);
    expect(screen.getByText("cached · 3h")).toBeInTheDocument();
    expect(screen.queryByText("1.5s")).toBeNull();
  });

  it("says when and from what a full hit was linted in the detail status", () => {
    render(<LintDetailPanel node={linterRoot(cachedResult(true))} results={[cachedResult(true)]} />);
    const status = screen.getByText("Status").parentElement!;
    expect(within(status).getByText("cached · linted 3h ago")).toHaveAttribute(
      "title",
      "build fingerprint lint+v7+transaction:fee+fp:build+static",
    );
  });

  it("treats a partial hit as a fresh run", () => {
    render(<LintTreeNode node={linterRoot(cachedResult(false))} selected={false} />);
    expect(screen.queryByText(/cached/)).toBeNull();
    expect(screen.getByText("1.5s")).toBeInTheDocument();
  });
});
