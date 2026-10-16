import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestAttempts, type TestAttempt } from "../../index";

const attempts: TestAttempt[] = [
  { sequence: 1, run_kind: "initial", failed: true, message: "connection failed", duration: 1_500_000_000 },
  { sequence: 2, run_kind: "retry", passed: true, message: "connection recovered", duration: 2_000_000_000 },
];

describe("TestAttempts public export", () => {
  it("renders every attempt and its result for a consumer detail panel", () => {
    render(<TestAttempts attempts={attempts} />);

    expect(screen.getByText("Attempts (2)")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("#1 initial")).toHaveClass("text-red-600");
    expect(screen.getByText("connection failed")).toBeInTheDocument();
    expect(screen.getByText("#2 retry")).toHaveClass("text-green-600");
    expect(screen.getByText("connection recovered")).toBeInTheDocument();
  });
});
