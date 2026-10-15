// The verification adapters' "Copy details" contribution: the Markdown brief
// per fixture step kind (each asserted as one whole string), the menu items,
// and the detail header's split button wiring them to the clipboard. Split
// from adapters.test.tsx, which covers the rendered detail bodies.

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  buildNodeBrief,
  createTestRunnerRegistry,
  emptyTestFilters,
  TestDetailPanel,
  TestRunnerProvider,
  type Test,
  type TestNodeAdapterRegistry,
  type TestRunnerContext,
} from "../test-runner";
import { verificationAdapters } from "./adapters";

function runnerContext(
  selected: Test,
  adapters: TestNodeAdapterRegistry = verificationAdapters(),
): TestRunnerContext {
  return {
    tests: [selected],
    selected,
    done: true,
    filters: emptyTestFilters(),
    expandAll: null,
    busy: {},
    adapters,
    onSelect: () => {},
    onFiltersChange: () => {},
    onExpandAllChange: () => {},
  };
}

function renderDetail(selected: Test, adapters?: TestNodeAdapterRegistry) {
  return render(
    <TestRunnerProvider value={runnerContext(selected, adapters)}>
      <TestDetailPanel />
    </TestRunnerProvider>,
  );
}

const ms = (n: number) => n * 1e6;
const sec = (n: number) => n * 1e9;

/** The "Copy details" brief for a node, as the detail header builds it. */
function briefFor(node: Test): string {
  return buildNodeBrief(node, verificationAdapters().resolveCopy(node, runnerContext(node)));
}

const migrateExec: Test = {
  name: "migrations apply cleanly",
  framework: "exec",
  failed: true,
  duration: sec(3),
  command: "gavel db migrate --dry-run",
  stderr: 'ERROR: column "revision" of relation "plans" already exists (SQLSTATE 42701)',
  context: { command: "gavel db migrate --dry-run", cwd: "/src/todos", exit_code: 2 },
};

describe("verificationAdapters: copy brief", () => {
  it("exec step: the command with its cwd and exit code sits between the facts and stderr", () => {
    expect(briefFor(migrateExec)).toEqual(
      [
        "# migrations apply cleanly",
        "",
        "- **Result:** failed",
        "- **Tool:** exec",
        "- **Duration:** 3.0s",
        "",
        "## Command",
        "",
        "```sh",
        "$ gavel db migrate --dry-run",
        "cwd: /src/todos",
        "exit: 2",
        "```",
        "",
        "## stderr",
        "",
        "```",
        'ERROR: column "revision" of relation "plans" already exists (SQLSTATE 42701)',
        "```",
      ].join("\n"),
    );
  });

  it("CEL query: the expression, its trace, its variables as JSON, and expected/actual", () => {
    const pendingQuery: Test = {
      name: "no plan is left without a revision",
      framework: "query",
      failed: true,
      duration: ms(140),
      context: {
        cel_expression: "rows.size() == 0",
        cel_vars: { rows: [{ id: "plan-17", revision: null }] },
        expected: 0,
        actual: 2,
      },
      detail: { cel_trace: "rows.size() == 0 → 2 == 0 → false" },
    };

    expect(briefFor(pendingQuery)).toEqual(
      [
        "# no plan is left without a revision",
        "",
        "- **Result:** failed",
        "- **Tool:** query",
        "- **Duration:** 140ms",
        "",
        "## Assertion",
        "",
        "```",
        "expression: rows.size() == 0",
        "trace:",
        "rows.size() == 0 → 2 == 0 → false",
        "vars: {",
        '  "rows": [',
        "    {",
        '      "id": "plan-17",',
        '      "revision": null',
        "    }",
        "  ]",
        "}",
        "expected: 0",
        "actual: 2",
        "```",
      ].join("\n"),
    );
  });

  it("command step with no CEL gate: leaves the whole command result in `actual` out of the brief", () => {
    const node: Test = {
      name: "prints help",
      framework: "exec",
      passed: true,
      context: { command: "todos --help", exit_code: 0, actual: { stdout: "usage", exit: 0 } },
    };
    expect(briefFor(node)).toEqual(
      [
        "# prints help",
        "",
        "- **Result:** passed",
        "- **Tool:** exec",
        "",
        "## Command",
        "",
        "```sh",
        "$ todos --help",
        "exit: 0",
        "```",
      ].join("\n"),
    );
  });

  it("table parent: one verdict line per row, with the failing row's exit code", () => {
    const helpTable: Test = {
      name: "CLI help for every command",
      framework: "fixture",
      children: [
        {
          name: "todos --help",
          framework: "exec",
          passed: true,
          context: { command: "todos --help", exit_code: 0 },
        },
        {
          name: "todos plan --help",
          framework: "exec",
          failed: true,
          stderr: 'Error: unknown command "plan" for "todos"',
          context: { command: "todos plan --help", exit_code: 1 },
        },
        {
          name: "todos sync --help",
          framework: "exec",
          warned: true,
          message: "deprecated flag --all",
        },
      ],
    };

    expect(briefFor(helpTable)).toEqual(
      [
        "# CLI help for every command",
        "",
        "- **Result:** failed",
        "- **Tool:** fixture",
        "",
        "## Results",
        "",
        "```",
        "✓ todos --help",
        "✗ todos plan --help — exit 1",
        "! todos sync --help — deprecated flag --all",
        "```",
      ].join("\n"),
    );
  });

  it("runner step with elided children: the command and the summary counts, zero counts omitted", () => {
    const testStep: Test = {
      name: "Full test suite",
      framework: "test",
      failed: true,
      command: "gavel test ./...",
      duration: sec(412),
      summary: {
        Total: 4812,
        Passed: 4731,
        Failed: 37,
        Warned: 0,
        Skipped: 44,
        Pending: 0,
        Duration: 0,
      },
    };

    expect(briefFor(testStep)).toEqual(
      [
        "# Full test suite",
        "",
        "- **Result:** failed",
        "- **Tool:** test",
        "- **Duration:** 412.0s",
        "",
        "## Command",
        "",
        "```sh",
        "$ gavel test ./...",
        "```",
        "",
        "## Results",
        "",
        "```",
        "4812 total · 4731 passed · 37 failed · 44 skipped",
        "```",
      ].join("\n"),
    );
  });

  it("checklist parent: each criterion as met, unmet with its reason, or not yet judged", () => {
    const criteria: Test = {
      name: "Acceptance criteria",
      framework: "checklist",
      children: [
        {
          name: "Creating a todo stores the selected plan revision",
          framework: "checklist",
          passed: true,
        },
        {
          name: "Existing todos are backfilled",
          framework: "checklist",
          failed: true,
          message: "plan-17 and plan-23 still have no revision",
        },
        { name: "The change is documented", framework: "checklist", pending: true },
      ],
    };

    expect(briefFor(criteria)).toEqual(
      [
        "# Acceptance criteria",
        "",
        "- **Result:** failed",
        "- **Tool:** checklist",
        "",
        "## Criteria",
        "",
        "```",
        "- [x] Creating a todo stores the selected plan revision",
        "- [ ] Existing todos are backfilled — plan-17 and plan-23 still have no revision",
        "- [?] The change is documented",
        "```",
      ].join("\n"),
    );
  });

  it("offers Copy command only when the step has a command", () => {
    const items = (node: Test) =>
      verificationAdapters().resolveCopy(node, runnerContext(node)).items;
    expect(items(migrateExec)).toEqual([
      expect.objectContaining({ label: "Copy command", value: "gavel db migrate --dry-run" }),
    ]);
    expect(items({ name: "q", framework: "query", context: { cel_expression: "true" } })).toEqual(
      [],
    );
  });
});

describe("TestDetailPanel: Copy details", () => {
  const writeText = vi.fn<(text: string) => Promise<void>>();

  afterEach(() => {
    writeText.mockReset();
    Reflect.deleteProperty(navigator, "clipboard");
  });

  function stubClipboard(accepts: boolean) {
    if (accepts) writeText.mockResolvedValue(undefined);
    else writeText.mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  }

  const buttonByText = (text: string) =>
    [...document.querySelectorAll("button")].find((b) => b.textContent === text);

  it("copies only the selected attempt's execution and final outputs", async () => {
    stubClipboard(true);
    const first: Test = { name: "run", framework: "todo_prompt", failed: true, stdout: "first launch", detail: { step: { id: "run", kind: "todo_prompt" }, outputs: { phase: "refused" } } };
    const last: Test = { name: "run", framework: "todo_prompt", passed: true, stdout: "second launch", detail: { step: { id: "run", kind: "todo_prompt" }, outputs: { phase: "verified" } } };
    renderDetail({ ...last, detail: { ...(last.detail as object), attempts: [{ attempt: 1, status: "failed", result: first }, { attempt: 2, status: "passed", result: last }] } });
    fireEvent.change(screen.getByRole("combobox", { name: "Attempt" }), { target: { value: "1" } });
    await act(async () => { fireEvent.click(buttonByText("Copy details")!); });
    expect(writeText.mock.calls).toEqual([[briefFor(first)]]);
    expect(writeText.mock.calls[0]![0]).not.toContain("second launch");
    expect(writeText.mock.calls[0]![0]).not.toContain("verified");
  });

  it("copies the Markdown brief and flips the label to Copied", async () => {
    stubClipboard(true);
    renderDetail(migrateExec);

    await act(async () => {
      fireEvent.click(buttonByText("Copy details")!);
    });

    expect(writeText.mock.calls).toEqual([[briefFor(migrateExec)]]);
    expect(buttonByText("Copied")).toBeDefined();
  });

  it("says Copy failed when the clipboard rejects, instead of claiming success", async () => {
    stubClipboard(false);
    renderDetail(migrateExec);

    await act(async () => {
      fireEvent.click(buttonByText("Copy details")!);
    });

    expect(buttonByText("Copy failed")).toBeDefined();
    expect(buttonByText("Copied")).toBeUndefined();
  });

  it("lists Copy as JSON then the adapters' items, an item without a value disabled with its reason", () => {
    const registry = createTestRunnerRegistry([
      ...verificationAdapters().adapters,
      {
        id: "recording",
        match: () => true,
        copy: () => ({ items: [{ label: "Copy recording path", reason: "stored in a stream" }] }),
      },
    ]);
    renderDetail(migrateExec, registry);

    fireEvent.click(screen.getByLabelText("More copy options"));

    const menuItems = [...document.querySelectorAll('[role="menu"] button')].map((b) => ({
      label: b.textContent,
      disabled: (b as HTMLButtonElement).disabled,
      title: b.getAttribute("title"),
    }));
    expect(menuItems).toEqual([
      { label: "Copy as JSON", disabled: false, title: null },
      { label: "Copy command", disabled: false, title: null },
      { label: "Copy recording path", disabled: true, title: "stored in a stream" },
    ]);
  });
});
