import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { EvalResponse, ResultExpectation } from "../api.ts";
import { ExpectationStrip } from "./ExpectationStrip.tsx";

const GENDER: ResultExpectation = {
  options: [
    { value: "F", label: "Female" },
    { value: "M", label: "Male" },
    { value: "U" },
  ],
  rules: ["String", "Required"],
  validate: (response) => (["F", "M", "U"].includes(response.result) ? [] : [`"${response.result}" is not an allowed value`]),
};

function matchedChips() {
  return [...document.querySelectorAll("[data-matched=true]")].map((chip) => chip.textContent);
}

describe("ExpectationStrip", () => {
  it("shows the rules and every option before anything has run, with no verdict", () => {
    render(<ExpectationStrip expectation={GENDER} response={null} stale={false} />);
    expect({
      rules: screen.getByText("String · Required").textContent,
      chips: screen.getAllByTestId("expected-option").map((chip) => chip.textContent),
      verdict: screen.queryByRole("status"),
    }).toEqual({ rules: "String · Required", chips: ["FFemale", "MMale", "U"], verdict: null });
  });

  it("highlights the option the result names and reports it valid", () => {
    render(<ExpectationStrip expectation={GENDER} response={{ result: "M", durationMs: 1 }} stale={false} />);
    expect({ matched: matchedChips(), verdict: screen.getByRole("status").textContent }).toEqual({
      matched: ["MMale"],
      verdict: "Valid",
    });
  });

  it("does not match an option the result only resembles after trimming", () => {
    render(<ExpectationStrip expectation={GENDER} response={{ result: " M\n", durationMs: 1 }} stale={false} />);
    expect({ matched: matchedChips(), verdict: screen.getByRole("status").textContent }).toEqual({
      matched: [],
      verdict: '" M\n" is not an allowed value',
    });
  });

  it("lists the issues of a result the validator rejects", () => {
    render(<ExpectationStrip expectation={GENDER} response={{ result: "X", durationMs: 1 }} stale={false} />);
    expect({ matched: matchedChips(), verdict: screen.getByRole("status").textContent }).toEqual({
      matched: [],
      verdict: '"X" is not an allowed value',
    });
  });

  it("dims only a result that is out of date, never the expectation before a first run", () => {
    const { rerender } = render(<ExpectationStrip expectation={GENDER} response={null} stale />);
    const dimmedBeforeRun = screen.getByRole("region", { name: "Expected result" }).className.includes("opacity-50");
    rerender(<ExpectationStrip expectation={GENDER} response={{ result: "F", durationMs: 1 }} stale />);
    const dimmedWhenStale = screen.getByRole("region", { name: "Expected result" }).className.includes("opacity-50");
    expect({ dimmedBeforeRun, dimmedWhenStale }).toEqual({ dimmedBeforeRun: false, dimmedWhenStale: true });
  });

  it("gives no verdict for an evaluation error", () => {
    const failed: EvalResponse = { result: "", durationMs: 1, error: { message: "boom" } };
    render(<ExpectationStrip expectation={GENDER} response={failed} stale={false} />);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("caps a long option list and expands it on request", () => {
    const options = Array.from({ length: 15 }, (_, index) => ({ value: String(index + 1).padStart(2, "0") }));
    render(<ExpectationStrip expectation={{ options }} response={null} stale={false} />);
    expect(screen.getAllByTestId("expected-option")).toHaveLength(12);
    fireEvent.click(screen.getByRole("button", { name: "+3 more" }));
    expect(screen.getAllByTestId("expected-option")).toHaveLength(15);
  });
});
