import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("renders null when total is 0", () => {
    const { container } = render(<ProgressBar segments={[]} total={0} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a segment width as percentage of total", () => {
    render(
      <ProgressBar
        total={100}
        segments={[
          { count: 25, color: "bg-red-500", label: "failed" },
          { count: 75, color: "bg-green-500", label: "passed" },
        ]}
      />,
    );
    const failed = screen.getByTitle("25 failed");
    const passed = screen.getByTitle("75 passed");
    expect((failed as HTMLElement).style.width).toBe("25%");
    expect((passed as HTMLElement).style.width).toBe("75%");
  });

  it("skips zero-count segments", () => {
    render(
      <ProgressBar
        total={10}
        segments={[
          { count: 10, color: "bg-green-500", label: "passed" },
          { count: 0, color: "bg-red-500", label: "failed" },
        ]}
      />,
    );
    expect(screen.queryByTitle("0 failed")).toBeNull();
  });

  it("applies a Tailwind color as a class, leaving inline backgroundColor unset", () => {
    render(
      <ProgressBar
        total={100}
        segments={[
          { count: 60, color: "bg-emerald-500", label: "used" },
          { count: 40, color: "bg-gray-200", label: "free" },
        ]}
      />,
    );
    const seg = screen.getByTitle("60 used") as HTMLElement;
    expect(seg.className).toContain("bg-emerald-500");
    expect(seg.style.backgroundColor).toBe("");
  });

  it("applies a CSS color value as inline backgroundColor, not a class", () => {
    render(
      <ProgressBar
        total={100}
        segments={[
          { count: 60, color: "#10b981", label: "used" },
          { count: 40, color: "var(--chart-2)", label: "free" },
        ]}
      />,
    );
    const seg = screen.getByTitle("60 used") as HTMLElement;
    expect(seg.style.backgroundColor).toBe("rgb(16, 185, 129)");
    expect(seg.className).not.toContain("#10b981");
  });

  it("exposes aria progressbar with aggregated value", () => {
    render(
      <ProgressBar
        total={10}
        segments={[
          { count: 3, color: "bg-green-500", label: "passed" },
          { count: 2, color: "bg-red-500", label: "failed" },
        ]}
      />,
    );
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "5");
    expect(bar).toHaveAttribute("aria-valuemax", "10");
  });
});
