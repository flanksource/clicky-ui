import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FindingsSummaryChips } from "./FindingsSummaryChips";
import type { FileFinding, LintSeverity } from "./types";

function finding(line: number, severity: LintSeverity): FileFinding {
  return { file: "docs/guide.md", line, severity, message: `finding on ${line}`, source: "vale", kind: "lint" };
}

const FINDINGS = [finding(1, "warning"), finding(2, "error"), finding(3, "warning"), finding(4, "warning")];

describe("FindingsSummaryChips", () => {
  it("counts the findings per severity, worst first", () => {
    render(<FindingsSummaryChips findings={FINDINGS} />);

    expect(screen.getAllByRole("button").map((chip) => chip.getAttribute("aria-label"))).toEqual([
      "1 error",
      "3 warning",
      "0 info",
    ]);
  });

  it("reports the clicked severity", () => {
    const onSelect = vi.fn();
    render(<FindingsSummaryChips findings={FINDINGS} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: "3 warning" }));

    expect(onSelect).toHaveBeenCalledWith("warning");
  });

  it("disables a chip with nothing to select", () => {
    render(<FindingsSummaryChips findings={FINDINGS} onSelect={vi.fn()} />);

    expect(screen.getByRole("button", { name: "0 info" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "1 error" })).toBeEnabled();
  });
});
