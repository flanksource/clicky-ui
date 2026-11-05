import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TaskExecDetailsView } from "./TaskExecDetails";
import type { TaskExecDetails } from "./TaskSnapshot";

const details: TaskExecDetails = {
  command: "make",
  args: ["build"],
  status: "running",
  exitCode: 0,
  started: "2026-10-15T07:00:00Z",
};

describe("TaskExecDetailsView elapsed time", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.parse("2026-10-15T07:00:02Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("ticks from started while the process has not finished", () => {
    render(<TaskExecDetailsView details={details} />);
    expect(screen.getByText("2 s")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText("5 s")).toBeInTheDocument();
  });

  it("shows the span from started to finished, and keeps finished out of the extra details", () => {
    render(<TaskExecDetailsView details={{ ...details, status: "success", finished: "2026-10-15T07:01:30Z", scanId: "s1" }} />);
    const region = within(screen.getByRole("region", { name: "Execution details" }));

    expect(region.getByText("1.5 min")).toBeInTheDocument();
    expect(region.getByText("scanId")).toBeInTheDocument();
    expect(region.queryByText("finished")).not.toBeInTheDocument();
  });

  it("shows no elapsed time for a process that has not started", () => {
    const { started: _started, ...unstarted } = details;
    render(<TaskExecDetailsView details={unstarted} />);

    expect(screen.queryByText(/\d (ms|s|min|h)$/)).not.toBeInTheDocument();
  });
});
