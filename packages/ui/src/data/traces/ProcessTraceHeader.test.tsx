import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProcessTraceHeader } from "./ProcessTraceHeader";
import type { ProcessHeaderRow } from "./process-header";

const worker: ProcessHeaderRow = { runId: "run", stream: "capture", key: "7@start", pid: 7, name: "worker", command: "worker serve", cpuPercent: 125, rssBytes: 2048, memoryPercent: 4 };

describe("ProcessTraceHeader", () => {
  it("updates existing process rows and caps CPU fill without changing the measured label", () => {
    const props = { rows: [worker], showExited: false, onShowExitedChange: vi.fn() };
    const { rerender } = render(<ProcessTraceHeader {...props} />);
    const row = screen.getByText("worker").closest("li");
    expect(screen.getByRole("progressbar", { name: "CPU for pid 7" })).toHaveAttribute("aria-valuenow", "100");
    expect(screen.getByText("125.0%")).toBeInTheDocument();
    rerender(<ProcessTraceHeader {...props} rows={[{ ...worker, cpuPercent: 25 }]} />);
    expect(screen.getByText("worker").closest("li")).toBe(row);
    expect(screen.getByText("25.0%")).toBeInTheDocument();
  });

  it("hides exited processes until requested and labels missing CPU as waiting", () => {
    const onChange = vi.fn();
    const rows = [{ ...worker, cpuPercent: null }, { ...worker, key: "7@old", name: "old worker", exitedAt: "2026-11-08T12:00:00Z" }];
    const { rerender } = render(<ProcessTraceHeader rows={rows} showExited={false} onShowExitedChange={onChange} />);
    expect(screen.queryByText("old worker")).not.toBeInTheDocument();
    expect(screen.getByText("Waiting for sample")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: /Show exited/ }));
    expect(onChange).toHaveBeenCalledWith(true);
    rerender(<ProcessTraceHeader rows={rows} showExited onShowExitedChange={onChange} />);
    expect(screen.getByText("old worker")).toBeInTheDocument();
    expect(screen.getByText("Exited · last sample")).toBeInTheDocument();
  });
});
