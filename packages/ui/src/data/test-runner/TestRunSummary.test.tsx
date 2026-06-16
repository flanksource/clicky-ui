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

  it("renders the same total in the default two-line layout", () => {
    render(<TestRunSummary tests={completedTests} done now={0} startTime={0} endTime={1000} />);
    expect(screen.getByText(/\d+ tests/)).toBeInTheDocument();
  });
});
