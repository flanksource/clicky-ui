import { useState, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { TestRunner } from "./TestRunner";
import { createTestRunnerRegistry } from "./adapter";
import { emptyTestFilters, type TestFilters } from "./filterState";
import { filterTests } from "./status";
import type { Test } from "./types";
import {
  completedTests,
  largeDetailTests,
  largeTreeTests,
  setupAdapter,
} from "./TestRunner.fixtures";

function Harness({
  tests = completedTests,
  adapters,
  title,
  showSummary,
}: {
  tests?: Test[];
  adapters?: ReturnType<typeof createTestRunnerRegistry>;
  title?: ReactNode;
  showSummary?: boolean;
}) {
  const [selected, setSelected] = useState<Test | null>(null);
  const [filters, setFilters] = useState<TestFilters>(emptyTestFilters());
  const [expandAll, setExpandAll] = useState<boolean | null>(null);
  const visible = filterTests(tests, filters.status, filters.framework);
  return (
    <TestRunner
      tests={visible}
      selected={selected}
      filters={filters}
      expandAll={expandAll}
      done
      now={0}
      startTime={0}
      endTime={1000}
      onSelect={setSelected}
      onFiltersChange={setFilters}
      onExpandAllChange={setExpandAll}
      {...(adapters ? { adapters } : {})}
      {...(title !== undefined ? { title } : {})}
      {...(showSummary !== undefined ? { showSummary } : {})}
    />
  );
}

// ControlledHarness mirrors the active detail tab into host state via
// activeTab/onTabChange, the contract a router-backed host uses to put the tab
// in the URL.
function ControlledHarness({ initialTab = "detail" }: { initialTab?: string }) {
  const [selected, setSelected] = useState<Test | null>(null);
  const [filters, setFilters] = useState<TestFilters>(emptyTestFilters());
  const [expandAll, setExpandAll] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const visible = filterTests(completedTests, filters.status, filters.framework);
  return (
    <>
      <span data-testid="active-tab">{activeTab}</span>
      <TestRunner
        tests={visible}
        selected={selected}
        filters={filters}
        expandAll={expandAll}
        done
        now={0}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSelect={setSelected}
        onFiltersChange={setFilters}
        onExpandAllChange={setExpandAll}
        adapters={createTestRunnerRegistry([setupAdapter])}
      />
    </>
  );
}

const tree = () => screen.getByRole("tree");

describe("TestRunner", () => {
  it("renders the test forest and the empty detail state", () => {
    render(<Harness />);
    expect(within(tree()).getByText(/acme \/ api \/ auth/)).toBeInTheDocument();
    expect(screen.getByText("Select a test to view its details.")).toBeInTheDocument();
  });

  it("opens failing branches by default so the failing leaf is visible", () => {
    render(<Harness />);
    // auth contains a failing leaf, so it (and the failing child) render without
    // any manual expansion.
    expect(within(tree()).getByText(/rejects bad password/)).toBeInTheDocument();
  });

  it("shows the default detail body with failure info when a node is selected", () => {
    render(<Harness />);
    fireEvent.click(within(tree()).getByText(/rejects bad password/));
    expect(screen.getByText("login should reject an incorrect password")).toBeInTheDocument();
    expect(screen.getByText("status 401 Unauthorized")).toBeInTheDocument();
  });

  it("lets a registered adapter override the body and add a tab", () => {
    render(<Harness adapters={createTestRunnerRegistry([setupAdapter])} />);
    fireEvent.click(within(tree()).getByText("setup"));
    expect(screen.getByText("Custom setup panel")).toBeInTheDocument();
    // The adapter contributes a Context tab alongside the built-in Detail tab.
    expect(screen.getByRole("tab", { name: "Context" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Detail" })).toBeInTheDocument();
  });

  it("filters the tree to only failing branches when Failed is included", () => {
    render(<Harness />);
    // The status pill shows the count + label; clicking includes it.
    fireEvent.click(screen.getByTitle(/Failed/));
    expect(within(tree()).queryByText(/issues a refund/)).not.toBeInTheDocument();
    expect(within(tree()).getByText(/rejects bad password/)).toBeInTheDocument();
  });

  it("renders a large/deep JSON payload in the detail pane via JsonView", () => {
    render(<Harness tests={largeDetailTests} />);
    fireEvent.click(within(tree()).getByText(/imports 500 policy rows/));
    // The detail Detail section labels the structured payload...
    expect(screen.getByText("Detail")).toBeInTheDocument();
    // ...and JsonView surfaces top-level keys of the 500-row payload.
    expect(screen.getByText("summary")).toBeInTheDocument();
    expect(screen.getByText("rows")).toBeInTheDocument();
  });

  it("renders a very large tree with the top-level groups visible", () => {
    render(<Harness tests={largeTreeTests} />);
    // 4 roots, each a "group N" container, render at the top level.
    expect(within(tree()).getByText("group 0")).toBeInTheDocument();
    expect(within(tree()).getByText("group 3")).toBeInTheDocument();
  });

  it("switches the detail tab from internal state when uncontrolled", () => {
    render(<Harness adapters={createTestRunnerRegistry([setupAdapter])} />);
    fireEvent.click(within(tree()).getByText("setup"));
    // Starts on the built-in Detail tab.
    expect(screen.getByText("Custom setup panel")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Context" }));
    expect(screen.getByText(/Context tab for/)).toBeInTheDocument();
  });

  it("renders the default Test Results title and the run summary", () => {
    render(<Harness />);
    expect(screen.getByText("Test Results")).toBeInTheDocument();
    expect(screen.getByText(/\d+ tests/)).toBeInTheDocument();
  });

  it("omits the title when title is null and the summary when showSummary is false", () => {
    render(<Harness title={null} showSummary={false} />);
    // A host that owns the title/summary in its own header (e.g. a dialog) embeds
    // the runner with both suppressed so they are not duplicated.
    expect(screen.queryByText("Test Results")).not.toBeInTheDocument();
    expect(screen.queryByText(/\d+ tests/)).not.toBeInTheDocument();
  });

  it("renders a custom title node in place of the default", () => {
    render(<Harness title={<span>My Run</span>} />);
    expect(screen.getByText("My Run")).toBeInTheDocument();
    expect(screen.queryByText("Test Results")).not.toBeInTheDocument();
  });

  it("renders the host-controlled tab and reports clicks via onTabChange", () => {
    render(<ControlledHarness initialTab="context" />);
    fireEvent.click(within(tree()).getByText("setup"));
    // The host's activeTab ("context") drives the rendered body, not internal state.
    expect(screen.getByText(/Context tab for/)).toBeInTheDocument();
    expect(screen.queryByText("Custom setup panel")).not.toBeInTheDocument();
    // Clicking Detail bubbles up to the host, which flips its state to "detail".
    fireEvent.click(screen.getByRole("tab", { name: "Detail" }));
    expect(screen.getByTestId("active-tab")).toHaveTextContent("detail");
    expect(screen.getByText("Custom setup panel")).toBeInTheDocument();
  });
});
