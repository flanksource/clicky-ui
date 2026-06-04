import { render, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatusRows, type StatusSegment } from "./StatusBreakdown";

// The live Credit Life Billing File breakdown: 852 ACTIVE + 148 EXECSR.
const segments: StatusSegment[] = [
  { key: "execution-system-error", label: "EXECUTION SYSTEM ERROR", count: 148, className: "bg-red-500" },
  { key: "active", label: "ACTIVE", count: 852, className: "bg-green-500" },
  { key: "reversed", label: "REVERSED", count: 0, className: "bg-green-500" },
];

describe("StatusRows", () => {
  it("renders one row per non-zero status with proportional bar widths", () => {
    const { container } = render(<StatusRows segments={segments} />);
    const labels = Array.from(container.querySelectorAll("span")).map((s) => s.textContent);
    expect(labels).toContain("EXECUTION SYSTEM ERROR");
    expect(labels).toContain("ACTIVE");
    // The zero-count REVERSED bucket is dropped.
    expect(labels).not.toContain("REVERSED");

    // Bars are sized count/total (1000): 148 → 14.8%, 852 → 85.2%.
    const bars = Array.from(container.querySelectorAll<HTMLDivElement>("div[style*='width']"));
    const widths = bars.map((b) => parseFloat(b.style.width));
    expect(widths).toContainEqual(expect.closeTo((148 / 1000) * 100, 5));
    expect(widths).toContainEqual(expect.closeTo((852 / 1000) * 100, 5));
  });

  it("shows a Retry button only on retryable rows and fires onRetry", () => {
    const onRetry = vi.fn();
    const { container } = render(
      <StatusRows
        segments={segments}
        onRetry={onRetry}
        isRetryable={(s) => /EXECUTION SYSTEM ERROR/.test(s.label)}
      />,
    );
    const buttons = Array.from(container.querySelectorAll("button"));
    expect(buttons).toHaveLength(1);

    fireEvent.click(buttons[0]!);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(segments[0]);
  });

  it("renders an empty state when no status has a count", () => {
    const { container } = render(
      <StatusRows segments={[{ key: "x", label: "X", count: 0, className: "bg-muted" }]} />,
    );
    expect(container.textContent).toContain("No status data");
  });

  it("links a row via the default <a> renderer when the segment carries an href", () => {
    const linked: StatusSegment[] = [
      { ...segments[0], href: "/intake/get/f1/phase/process?mode=failed" },
      segments[1]!,
    ];
    const { container } = render(<StatusRows segments={linked} />);
    const link = container.querySelector("a[href='/intake/get/f1/phase/process?mode=failed']");
    expect(link?.textContent).toContain("EXECUTION SYSTEM ERROR");
    // The unlinked ACTIVE row stays a plain row, not an anchor.
    expect(container.querySelectorAll("a")).toHaveLength(1);
  });

  it("uses a custom renderLink when provided", () => {
    const linked: StatusSegment[] = [{ ...segments[0], href: "/x" }];
    const { container } = render(
      <StatusRows
        segments={linked}
        renderLink={({ to, children }) => (
          <a href={to} data-custom="yes">
            {children}
          </a>
        )}
      />,
    );
    expect(container.querySelector("a[data-custom='yes']")).not.toBeNull();
  });
});
