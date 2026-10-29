import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WorkloadPanel } from "./WorkloadPanel";
import { workloadPanelExample } from "./fixtures";

describe("WorkloadPanel", () => {
  it("combines one container's resources, memory regions, GC distribution and threads without a query provider", () => {
    render(<WorkloadPanel {...workloadPanelExample} />);
    const panel = screen.getByRole("region", {
      name: "worker / processor workload",
    });
    expect(within(panel).getByText("worker / processor")).toBeInTheDocument();
    expect(within(panel).getByText("Running")).toBeInTheDocument();
    expect(
      within(panel).getByRole("img", {
        name: /CPU usage.*Average 1.24.*Request 2.*P90 2.4.*P95 3.2.*Limit 4/,
      }),
    ).toBeInTheDocument();
    expect(
      within(panel).getByRole("img", {
        name: /Memory usage.*Average 3.6 GB.*Request 4 GB/,
      }),
    ).toBeInTheDocument();
    expect(
      within(panel).getByRole("progressbar", { name: "Heap" }),
    ).toHaveAttribute("aria-valuenow", String(2458 * 1024 ** 2));
    expect(
      within(panel).getByRole("progressbar", { name: "Non-heap" }),
    ).toHaveAttribute("aria-valuenow", String((3686 - 2458) * 1024 ** 2));
    expect(
      within(panel).getByRole("img", {
        name: /GC collection time.*Average 70 ms.*P90 92 ms.*P95 116 ms.*Max 280 ms/,
      }),
    ).toBeInTheDocument();
    expect(
      within(panel).getByRole("img", {
        name: /Time in GC.*Average 0.0334%.*P90 0.12%.*P95 0.31%/,
      }),
    ).toBeInTheDocument();
    expect(panel.querySelector('[data-metric="Live"]')).toHaveTextContent("96");
    expect(panel.querySelector('[data-metric="Daemon"]')).toHaveTextContent(
      "24",
    );
    expect(panel.querySelector('[data-metric="Peak"]')).toHaveTextContent(
      "128",
    );
    expect(panel.querySelector('[data-metric="Blocked"]')).toHaveTextContent(
      "1",
    );
    expect(within(panel).queryByText("No metrics configured")).toBeNull();
  });

  it("supports a non-JVM container while preserving the resource gauges", () => {
    const { jvm: _jvm, ...container } = workloadPanelExample;
    render(<WorkloadPanel {...container} />);
    expect(screen.getByRole("img", { name: /CPU usage/ })).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /Memory usage/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "JVM" })).toBeNull();
    expect(screen.queryByRole("img", { name: /Time in GC/ })).toBeNull();
  });

  it("shows no collected average when no garbage collections occurred, with zero overhead", () => {
    const { container } = render(
      <WorkloadPanel
        {...workloadPanelExample}
        jvm={{
          ...workloadPanelExample.jvm,
          gc: {
            count: 0,
            timeMs: 0,
            p90Ms: 0,
            p95Ms: 0,
            maxMs: 0,
            percentP90: 0,
            percentP95: 0,
          },
        }}
      />,
    );
    expect(
      screen.getByRole("img", {
        name: /GC collection time.*Average not collected/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: /Time in GC.*Average 0%.*P90 0%.*P95 0%/,
      }),
    ).toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
  });
});
