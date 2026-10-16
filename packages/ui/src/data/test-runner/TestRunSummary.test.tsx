import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestRunSummary } from "./TestRunSummary";
import { completedTests } from "./TestRunner.fixtures";

describe("TestRunSummary", () => {
  it("renders the total count and pass percentage in compact mode", () => {
    render(
      <TestRunSummary tests={completedTests} done now={0} startTime={0} endTime={1000} compact />,
    );
    // The compact layout still surfaces the total and the pass-rate percent so a
    // host header (e.g. a dialog) shows the run at a glance on a single line.
    expect(screen.getByText(/\d+ tests/)).toBeInTheDocument();
    expect(screen.getByText(/^\d+%$/)).toBeInTheDocument();
  });

  it("counts warned tests, so the chips add up to the total", () => {
    const WARNED = 2;
    const tests = [
      { name: "a", passed: true },
      ...Array.from({ length: WARNED }, (_, i) => ({ name: `w${i}`, warned: true })),
    ];
    render(<TestRunSummary tests={tests} done now={0} startTime={0} endTime={1000} />);
    expect(screen.getByLabelText(`${WARNED} warned`)).toHaveTextContent(String(WARNED));
  });

  it("says 1 test, not 1 tests, in both layouts", () => {
    const one = [{ name: "only", passed: true }];
    const { unmount } = render(<TestRunSummary tests={one} done now={0} />);
    expect(screen.getByText("1 test")).toBeInTheDocument();
    unmount();
    render(<TestRunSummary tests={one} done now={0} compact />);
    expect(screen.getByText("1 test")).toBeInTheDocument();
  });

  it("counts aborted tests apart from skipped ones, so the chips add up to the total", () => {
    const tests = [
      { name: "a", passed: true },
      { name: "after-failure", aborted: true, skipped: true },
      { name: "intentional", skipped: true },
    ];
    render(<TestRunSummary tests={tests} done now={0} startTime={0} endTime={1000} />);
    expect(screen.getByLabelText("1 aborted")).toHaveTextContent("1");
    expect(screen.getByLabelText("1 skipped")).toHaveTextContent("1");
  });

  describe("run metadata", () => {
    const meta = { sequence: 1 };

    it.each([
      ["compact", true],
      ["default", false],
    ])("shows a Timed out chip in the %s layout when the run timed out", (_name, compact) => {
      render(<TestRunSummary tests={completedTests} done now={0} compact={compact} runMeta={{ ...meta, timed_out: true }} />);
      expect(screen.getByText("Timed out")).toHaveAttribute("data-summary-run", "timed-out");
    });

    it("shows no Timed out chip for a run that did not time out", () => {
      render(<TestRunSummary tests={completedTests} done now={0} runMeta={{ ...meta, timed_out: false }} />);
      expect(screen.queryByText("Timed out")).not.toBeInTheDocument();
    });

    it("shows the exit code, and flags a non-zero one as a failure", () => {
      const { rerender } = render(
        <TestRunSummary tests={completedTests} done now={0} runMeta={{ ...meta, exit_code: 0 }} />,
      );
      expect(screen.getByTitle("Exit code 0")).toHaveTextContent("exit 0");
      expect(screen.getByTitle("Exit code 0")).not.toHaveClass("text-red-600");
      rerender(<TestRunSummary tests={completedTests} done now={0} runMeta={{ ...meta, exit_code: 124 }} />);
      expect(screen.getByTitle("Exit code 124")).toHaveTextContent("exit 124");
      expect(screen.getByTitle("Exit code 124")).toHaveClass("text-red-600");
    });

    it("shows no exit code while the run has none", () => {
      render(<TestRunSummary tests={completedTests} done={false} now={0} runMeta={meta} />);
      expect(screen.queryByText(/^exit /)).not.toBeInTheDocument();
    });
  });

  it("renders the same total in the default two-line layout", () => {
    render(<TestRunSummary tests={completedTests} done now={0} startTime={0} endTime={1000} />);
    expect(screen.getByText(/\d+ tests/)).toBeInTheDocument();
  });
});
