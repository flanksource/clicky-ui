import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestTreeNode } from "./TestTreeNode";
import { TestRunnerProvider } from "./context";
import { createTestRunnerRegistry } from "./adapter";
import { emptyTestFilters } from "./filterState";
import type { Test } from "./types";

const ROOT_CAUSE =
  "Please note that Policy Allocations cannot be copied from the configured source allocation. [linked activity 0ed0e177-90af-4399-822c-c2925bad7aac]";

function renderRow(node: Test) {
  return render(
    <TestRunnerProvider
      value={{
        tests: [node],
        selected: null,
        done: true,
        filters: emptyTestFilters(),
        expandAll: true,
        busy: {},
        adapters: createTestRunnerRegistry([]),
        onSelect: () => {},
        onFiltersChange: () => {},
        onExpandAllChange: () => {},
      }}
    >
      <TestTreeNode node={node} selected={false} />
    </TestRunnerProvider>,
  );
}

describe("TestTreeNode message line", () => {
  it("renders a failed node's message under its name with the full text as the title", () => {
    renderRow({ name: "trace", failed: true, message: ROOT_CAUSE } as Test);
    const line = screen.getByText(ROOT_CAUSE);
    expect(line.closest("[title]")?.getAttribute("title")).toBe(ROOT_CAUSE);
    expect(screen.getByText("trace")).toBeTruthy();
  });

  it.each([
    ["warned", { warned: true }],
    ["skipped", { skipped: true }],
  ])("renders the message on a %s node", (_status, flags) => {
    renderRow({ name: "step", message: "Quality Check Required.", ...flags } as Test);
    expect(screen.getByText("Quality Check Required.")).toBeTruthy();
  });

  it("does not render a message on a passed node", () => {
    renderRow({ name: "step", passed: true, message: "left over from a previous attempt" } as Test);
    expect(screen.queryByText("left over from a previous attempt")).toBeNull();
  });

  it("renders only the name when a failed node carries no message", () => {
    const { container } = renderRow({ name: "step", failed: true } as Test);
    expect(container.querySelectorAll("[title]").length).toBe(0);
  });
});
