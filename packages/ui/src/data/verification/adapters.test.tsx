// Unit tests for the verification node adapters, rendered through
// TestDetailPanel + TestRunnerProvider directly (rather than the full
// VerificationResults + tree) so a checklist item's name/message — which also
// appears as a tree row once its parent is selected — isn't asserted twice.

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  emptyTestFilters,
  TestDetailPanel,
  TestRunnerProvider,
  type Test,
  type TestRunnerContext,
} from "../test-runner";
import { verificationAdapters } from "./adapters";

function renderDetail(selected: Test) {
  const context: TestRunnerContext = {
    tests: [selected],
    selected,
    done: true,
    filters: emptyTestFilters(),
    expandAll: null,
    busy: {},
    adapters: verificationAdapters(),
    onSelect: () => {},
    onFiltersChange: () => {},
    onExpandAllChange: () => {},
  };
  return render(
    <TestRunnerProvider value={context}>
      <TestDetailPanel />
    </TestRunnerProvider>,
  );
}

describe("verificationAdapters: fixture/CEL detail", () => {
  it("shows the CEL expression, the variable table, and expected/actual when they differ", () => {
    renderDetail({
      name: "assert no failures",
      failed: true,
      context: {
        cel_expression: "results.failed == 0",
        cel_vars: { failed: 3, changed_files: ["todos/runtime/lifecycle.go"] },
        expected: 0,
        actual: 3,
      },
    });

    expect(screen.getByText("results.failed == 0")).toBeInTheDocument();
    const varRow = screen.getByText("failed").closest("tr");
    expect(varRow?.textContent).toBe("failed3");
    expect(screen.getByText('["todos/runtime/lifecycle.go"]')).toBeInTheDocument();
    expect(screen.getByText("expected").parentElement?.textContent).toBe("expected 0");
    expect(screen.getByText("actual").parentElement?.textContent).toBe("actual 3");
  });

  it("prefers detail.cel_trace over the plain expression", () => {
    const trace = "cel: results.failed == 0\n     └─ int(3)";
    renderDetail({
      name: "assert no failures",
      failed: true,
      context: { cel_expression: "results.failed == 0" },
      detail: { cel_trace: trace },
    });

    expect(screen.getByText((_, el) => el?.textContent === trace)).toBeInTheDocument();
    expect(screen.queryByText("results.failed == 0")).not.toBeInTheDocument();
  });

  it("still shows expected/actual when the values are equal — a failing node's evidence must not be hidden", () => {
    renderDetail({
      name: "flaky assertion",
      failed: true,
      context: { cel_expression: "x == y", expected: 3, actual: 3 },
    });

    expect(screen.getByText("expected").parentElement?.textContent).toBe("expected 3");
    expect(screen.getByText("actual").parentElement?.textContent).toBe("actual 3");
  });

  it("reveals a structured expected/actual value when the CEL gate comes only from detail.cel_trace", () => {
    renderDetail({
      name: "assert config shape",
      failed: true,
      context: { expected: { count: 1 }, actual: { count: 2 } },
      detail: { cel_trace: "cel: config.count == 1" },
    });

    expect(screen.getByText("expected").parentElement?.textContent).toBe('expected {"count":1}');
    expect(screen.getByText("actual").parentElement?.textContent).toBe('actual {"count":2}');
  });

  it("omits the CEL block entirely for a passing node", () => {
    renderDetail({
      name: "assert no failures",
      passed: true,
      context: { cel_expression: "results.failed == 0", expected: 0, actual: 0 },
    });

    expect(screen.queryByText("results.failed == 0")).not.toBeInTheDocument();
    expect(screen.queryByText("expression")).not.toBeInTheDocument();
  });

  it("renders the command, working directory and exit code for a fixture step", () => {
    renderDetail({
      name: "run smoke test",
      failed: true,
      context: { command: "go test ./todos/...", cwd: "/workspace", exit_code: 2 },
    });

    expect(screen.getByText("go test ./todos/...")).toBeInTheDocument();
    expect(screen.getByText("in /workspace")).toBeInTheDocument();
    expect(screen.getByText("exit 2")).toBeInTheDocument();
  });

  it("renders the provider-owned node.detail as JSON beneath the CEL block", () => {
    renderDetail({
      name: "run smoke test",
      failed: true,
      context: { command: "go test ./todos/...", cel_expression: "results.failed == 0" },
      detail: { changed_files: ["todos/runtime/lifecycle.go"] },
    });

    expect(screen.getByText("Detail")).toBeInTheDocument();
    expect(screen.getByText("changed_files")).toBeInTheDocument();
  });
});

describe("verificationAdapters: checklist detail", () => {
  it("lists every criterion with its message and pass/fail/pending state", () => {
    renderDetail({
      name: "Acceptance criteria",
      framework: "checklist",
      task_id: "acceptance-criteria",
      failed: true,
      children: [
        { name: "docs updated", framework: "checklist", passed: true },
        {
          name: "tests added",
          framework: "checklist",
          failed: true,
          message: "no new test file",
        },
        { name: "reviewed", framework: "checklist", pending: true },
      ],
    });

    expect(screen.getByText("docs updated")).toBeInTheDocument();
    expect(screen.getByText("tests added")).toBeInTheDocument();
    expect(screen.getByText("no new test file")).toBeInTheDocument();
    expect(screen.getByText("reviewed")).toBeInTheDocument();
  });

  // The default detail body also renders `node.message` for any non-failure-
  // detail node, so asserting the message alone proves nothing about whether
  // the checklist adapter's own body ran. Assert the checklist-specific glyph
  // tone instead — `DefaultDetailBody` never renders these classes.
  it("renders the passed glyph (emerald) for a leaf criterion selected directly", () => {
    const { container } = renderDetail({ name: "docs updated", framework: "checklist", passed: true });
    expect(container.querySelector("svg.text-emerald-600")).toBeInTheDocument();
  });

  it("renders the failed glyph (red) for a leaf criterion selected directly", () => {
    const { container } = renderDetail({
      name: "tests added",
      framework: "checklist",
      failed: true,
      message: "no new test file",
    });
    expect(container.querySelector("svg.text-red-600")).toBeInTheDocument();
  });

  it("renders the pending glyph for a leaf criterion carrying no status flag", () => {
    const { container } = renderDetail({ name: "reviewed", framework: "checklist" });
    expect(container.querySelector("svg.text-muted-foreground")).toBeInTheDocument();
  });
});
