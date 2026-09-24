import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { emptyVerifySummary } from "../verification/verify-report";
import { SessionVerificationPanel } from "./SessionInspector.verification";

describe("SessionVerificationPanel", () => {
  it("shows each iteration's kind and renders the selected report", () => {
    render(
      <SessionVerificationPanel
        verifications={[
          {
            iteration: 1,
            report: {
              kind: "cmd",
              name: "lint",
              ran: true,
              passed: false,
              state: "failed",
              reason: "lint failed",
              summary: emptyVerifySummary(),
            },
          },
          {
            iteration: 2,
            report: {
              kind: "fixture",
              name: "tests",
              ran: true,
              passed: true,
              state: "passed",
              reason: "tests passed",
              summary: emptyVerifySummary(),
            },
          },
        ]}
      />,
    );

    expect(screen.getByText("tests passed")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "1. cmd · failed" }));
    expect(screen.getByText("lint failed")).toBeInTheDocument();
    expect(screen.queryByText("tests passed")).not.toBeInTheDocument();
  });
});
