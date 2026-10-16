import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MetricTile } from "./MetricTile";
import { cpuTone, memoryTone } from "./metric-tone";

describe("MetricTile", () => {
  it("shows the label and value, with no bar unless barPct is given", () => {
    const { container } = render(<MetricTile label="CPU" value="12.0%" />);
    expect(screen.getByText("CPU")).toBeInTheDocument();
    expect(screen.getByText("12.0%")).toBeInTheDocument();
    expect(container.querySelector("[data-metric-bar]")).toBeNull();
  });

  it("fills the bar to barPct and colours value and bar by tone", () => {
    const { container } = render(<MetricTile label="CPU" value="95.0%" barPct={95} tone="danger" />);
    const bar = container.querySelector<HTMLElement>("[data-metric-bar]")!;
    expect(bar.style.width).toBe("95%");
    expect(bar).toHaveClass("bg-red-500");
    expect(screen.getByText("95.0%")).toHaveClass("text-red-600");
  });
});

describe("cpuTone", () => {
  it.each([
    [0, "neutral"],
    [0.1, "success"],
    [59.9, "success"],
    [60, "warning"],
    [89.9, "warning"],
    [90, "danger"],
  ] as const)("maps %s%% to %s", (pct, tone) => {
    expect(cpuTone(pct)).toBe(tone);
  });
});

describe("memoryTone", () => {
  it.each([
    [undefined, 100, "neutral"],
    [50, undefined, "neutral"],
    [50, 100, "info"],
    [60, 100, "warning"],
    [90, 100, "danger"],
  ] as const)("maps rss %s of vms %s to %s", (rss, vms, tone) => {
    expect(memoryTone(rss, vms)).toBe(tone);
  });
});
