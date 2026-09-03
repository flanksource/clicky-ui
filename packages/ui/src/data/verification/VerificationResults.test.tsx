import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { VerificationResults } from "./VerificationResults";
import { summarizeVerifyNodes, type VerifyReport } from "./verify-report";
import { emptyTestFilters, type Test, type TestFilters } from "../test-runner";

// Every fixture must be a report captain's `Validate` would accept: `summary`
// matches the `tests` leaves and `passed` matches `state === "passed"`.
function report(overrides: Partial<VerifyReport> = {}): VerifyReport {
  const state = overrides.state ?? "passed";
  const tests = overrides.tests ?? [];
  return {
    kind: "fixture",
    ran: true,
    passed: state === "passed",
    summary: summarizeVerifyNodes(tests),
    state,
    ...overrides,
  };
}

const tree = () => screen.getByRole("tree");

describe("VerificationResults", () => {
  it("renders the report's test nodes in the tree", () => {
    render(
      <VerificationResults
        report={report({ tests: [{ name: "compile the fixture", passed: true }] })}
      />,
    );
    expect(within(tree()).getByText("compile the fixture")).toBeInTheDocument();
  });

  it("renders the acceptance criteria node when a checklist is present", () => {
    render(
      <VerificationResults
        report={report({ checklist: [{ item: "docs updated", passed: true }] })}
      />,
    );
    expect(within(tree()).getByText("Acceptance criteria")).toBeInTheDocument();
  });

  it("shows the empty text for a null report instead of an empty tree", () => {
    render(<VerificationResults report={null} />);
    expect(screen.getByText("No verification has run yet")).toBeInTheDocument();
    expect(screen.queryByRole("tree")).not.toBeInTheDocument();
  });

  it("renders a caller-supplied empty text", () => {
    render(<VerificationResults report={null} emptyText="Verify has not started" />);
    expect(screen.getByText("Verify has not started")).toBeInTheDocument();
  });

  it("shows a running status line while the report is in progress", () => {
    render(
      <VerificationResults
        report={report({ state: "running", tests: [{ name: "step one", running: true }] })}
      />,
    );
    expect(screen.getByText("Running verification…")).toBeInTheDocument();
  });

  it("does not show the running status line once the report is terminal", () => {
    render(<VerificationResults report={report({ tests: [{ name: "step one", passed: true }] })} />);
    expect(screen.queryByText("Running verification…")).not.toBeInTheDocument();
  });

  describe("empty/errored reports and the verdict text", () => {
    it("shows both the reason and the feedback for a cmd report with no test nodes", () => {
      render(
        <VerificationResults
          report={report({
            kind: "cmd",
            state: "failed",
            reason: "1 of 2 checks failed",
            feedback: "checking config...\nFAIL: missing field 'name'",
          })}
        />,
      );
      expect(screen.getByText("1 of 2 checks failed")).toBeInTheDocument();
      expect(screen.getByText(/FAIL: missing field 'name'/)).toBeInTheDocument();
      expect(screen.queryByRole("tree")).not.toBeInTheDocument();
    });

    it("shows the reason for an errored report with no nodes instead of the select-a-test placeholder", () => {
      render(
        <VerificationResults
          report={report({ state: "errored", reason: "verifier crashed: exit status 1" })}
        />,
      );
      expect(screen.getByText("verifier crashed: exit status 1")).toBeInTheDocument();
      expect(screen.queryByText("Select a test to view its details.")).not.toBeInTheDocument();
    });

    it("renders the reason above the runner even when test nodes are present", () => {
      render(
        <VerificationResults
          report={report({
            state: "failed",
            reason: "1 of 2 checks failed",
            tests: [{ name: "assert no regressions", failed: true }],
          })}
        />,
      );
      expect(screen.getByText("1 of 2 checks failed")).toBeInTheDocument();
      expect(within(tree()).getByText("assert no regressions")).toBeInTheDocument();
    });
  });

  describe("filter bar survives filtering out the only match", () => {
    it("keeps the filter bar and the unfiltered summary total after excluding the only failed node", () => {
      render(
        <VerificationResults
          report={report({
            tests: [
              { name: "lint the repo", passed: true },
              { name: "assert no regressions", failed: true },
            ],
          })}
        />,
      );

      expect(screen.getByText("2 tests")).toBeInTheDocument();
      fireEvent.click(screen.getByTitle(/Failed/));
      // Filtering to only "Failed" hides the passing node from the tree...
      expect(within(tree()).queryByText("lint the repo")).not.toBeInTheDocument();
      // ...but the filter bar (with its Failed pill) and the total count must
      // still be driven by the full report, not the now-filtered tree.
      expect(screen.getByTitle(/Failed/)).toBeInTheDocument();
      expect(screen.getByText("2 tests")).toBeInTheDocument();
    });

    it("keeps the filter bar mounted on a one-node report after excluding its only (failed) node", () => {
      // The exact regression scenario: a single-node report, "Failed" clicked
      // twice (include, then exclude) so the tree empties out entirely.
      render(
        <VerificationResults report={report({ tests: [{ name: "assert no regressions", failed: true }] })} />,
      );

      const failedPill = () => screen.getByTitle(/Failed/);
      fireEvent.click(failedPill());
      fireEvent.click(failedPill());
      // Excluding the only node legitimately empties the tree itself (Tree
      // renders its empty state, dropping the `tree` role) — the regression is
      // whether the *header* (pill + summary) disappears along with it.
      expect(screen.queryByText("assert no regressions")).not.toBeInTheDocument();
      expect(screen.getByTitle(/Failed/)).toBeInTheDocument();
      expect(screen.getByText("1 tests")).toBeInTheDocument();
    });
  });

  describe("selection survives a re-created report", () => {
    function Harness({ initial, next }: { initial: VerifyReport; next: VerifyReport }) {
      const [current, setCurrent] = useState(initial);
      return (
        <div>
          <button type="button" onClick={() => setCurrent(next)}>
            refresh
          </button>
          <VerificationResults report={current} />
        </div>
      );
    }

    it("keeps the same row selected and shows the new node's data after a same-shaped re-render", () => {
      const initial = report({
        tests: [{ name: "assert no regressions", task_id: "step:0", failed: true, message: "first run" }],
      });
      const refreshed = report({
        tests: [{ name: "assert no regressions", task_id: "step:0", failed: true, message: "second run" }],
      });
      render(<Harness initial={initial} next={refreshed} />);

      fireEvent.click(within(tree()).getByText("assert no regressions"));
      expect(screen.getByText("first run", { selector: "p" })).toBeInTheDocument();

      fireEvent.click(screen.getByText("refresh"));
      expect(screen.getByText("second run", { selector: "p" })).toBeInTheDocument();
    });
  });

  describe("controlled selection and filters", () => {
    function ControlledHarness({ testsForReport }: { testsForReport: Test[] }) {
      const [selected, setSelected] = useState<Test | null>(null);
      const [filters, setFilters] = useState<TestFilters>(emptyTestFilters());
      return (
        <VerificationResults
          report={report({ tests: testsForReport })}
          selected={selected}
          onSelect={setSelected}
          filters={filters}
          onFiltersChange={setFilters}
        />
      );
    }

    it("drives selection from the host-owned selected/onSelect props", () => {
      render(
        <ControlledHarness
          testsForReport={[{ name: "run the suite", passed: true, message: "all good" }]}
        />,
      );
      fireEvent.click(within(tree()).getByText("run the suite"));
      expect(screen.getByText("all good")).toBeInTheDocument();
    });
  });
});
