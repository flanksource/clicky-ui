import { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestRunner, type TestRunnerProps } from "./TestRunner";
import { emptyTestFilters } from "./filterState";
import { ProcessNotFoundError } from "./process-metrics";
import type { Test } from "./types";

const flaky: Test = {
  name: "TestCharge",
  framework: "ginkgo",
  route_path: "billing/charge",
  failed: true,
  message: "final failure",
  duration: 3e9,
  attempts: [
    { sequence: 1, failed: true, message: "card declined", pid: 11, cpu_percent: 20, rss: 20 * 1024 * 1024, duration: 1e9 },
    { sequence: 2, run_kind: "rerun", failed: true, message: "gateway timeout", pid: 12, shared_process: true, duration: 2e9 },
  ],
};

const running: Test = {
  name: "TestSlow",
  framework: "ginkgo",
  route_path: "billing/slow",
  running: true,
  attempts: [{ sequence: 1, pid: 77, cpu_percent: 1, rss: 1024 * 1024 }],
};

function Harness({ tests, fetchProcessMetrics }: { tests: Test[]; fetchProcessMetrics?: TestRunnerProps["fetchProcessMetrics"] }) {
  const [selected, setSelected] = useState<Test | null>(null);
  const [filters, setFilters] = useState(emptyTestFilters());
  const [expandAll, setExpandAll] = useState<boolean | null>(null);
  return (
    <TestRunner
      tests={tests}
      selected={selected}
      filters={filters}
      expandAll={expandAll}
      done={false}
      now={0}
      onSelect={setSelected}
      onFiltersChange={setFilters}
      onExpandAllChange={setExpandAll}
      {...(fetchProcessMetrics ? { fetchProcessMetrics } : {})}
    />
  );
}

const metricValue = (label: string) =>
  document.querySelector<HTMLElement>(`[data-metric="${label}"]`)?.textContent?.replace(label, "") ?? null;

describe("TestRunner attempts", () => {
  it("offers the built-in attempt chooser for a test's own attempts, latest selected", () => {
    render(<Harness tests={[flaky]} />);
    fireEvent.click(screen.getByText("TestCharge"));
    const chooser = screen.getByLabelText("Attempt") as HTMLSelectElement;
    expect([...chooser.options].map((o) => o.textContent)).toEqual([
      "Attempt 1/2 · failed · 1.0s",
      "Attempt 2/2 · failed · 2.0s",
    ]);
    expect(chooser.value).toBe("2");
    expect(screen.getByText("gateway timeout")).toBeInTheDocument();
  });

  it("switches the body and the metrics to the chosen attempt", () => {
    render(<Harness tests={[flaky]} />);
    fireEvent.click(screen.getByText("TestCharge"));
    expect(screen.getByText("shared by batch")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Attempt"), { target: { value: "1" } });
    expect(screen.getByText("card declined")).toBeInTheDocument();
    expect(screen.queryByText("gateway timeout")).not.toBeInTheDocument();
    expect(screen.queryByText("shared by batch")).not.toBeInTheDocument();
    expect(metricValue("PID")).toBe("11");
    expect(metricValue("CPU")).toBe("20.0%");
  });

  it("shows a single attempt's metrics without a chooser", () => {
    const single: Test = { ...flaky, attempts: [flaky.attempts![0]!] };
    render(<Harness tests={[single]} />);
    fireEvent.click(screen.getByText("TestCharge"));
    expect(screen.queryByLabelText("Attempt")).not.toBeInTheDocument();
    expect(metricValue("PID")).toBe("11");
  });

  describe("live metrics", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("polls the selected live attempt through fetchProcessMetrics and stops when the process is gone", async () => {
      const fetchProcessMetrics = vi
        .fn()
        .mockResolvedValueOnce({ pid: 77, cpu_percent: 64, rss: 2 * 1024 * 1024, open_files: 9 })
        .mockRejectedValue(new ProcessNotFoundError(77));
      render(<Harness tests={[running]} fetchProcessMetrics={fetchProcessMetrics} />);
      fireEvent.click(screen.getByText("TestSlow"));
      await act(async () => {});
      expect(fetchProcessMetrics).toHaveBeenCalledWith(77);
      expect(metricValue("CPU")).toBe("64.0%");
      expect(metricValue("FDs")).toBe("9");
      await act(() => vi.advanceTimersByTimeAsync(2000));
      expect(screen.getByText("process exited")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTimeAsync(6000));
      expect(fetchProcessMetrics).toHaveBeenCalledTimes(2);
    });

    it("does not poll when the host gives no fetchProcessMetrics", async () => {
      render(<Harness tests={[running]} />);
      fireEvent.click(screen.getByText("TestSlow"));
      await act(() => vi.advanceTimersByTimeAsync(4000));
      expect(metricValue("CPU")).toBe("1.0%");
    });
  });
});
