import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProcessNotFoundError, type ProcessMetrics } from "./process-metrics";
import { TestAttemptDetail } from "./TestAttemptDetail";
import type { TestAttempt } from "./types";

const finished: TestAttempt = {
  sequence: 1,
  passed: true,
  pid: 4242,
  cpu_percent: 37.5,
  rss: 150 * 1024 * 1024,
  duration: 1_250_000_000,
  exit_code: 0,
};
const live: TestAttempt = { sequence: 2, pid: 4242, cpu_percent: 1, rss: 1024 * 1024 };

const tile = (label: string) => document.querySelector<HTMLElement>(`[data-metric="${label}"]`);
const value = (label: string) => tile(label)?.textContent?.replace(label, "") ?? null;

describe("TestAttemptDetail", () => {
  describe("recorded metrics", () => {
    it("shows pid, cpu, rss, duration and exit code of a finished attempt", () => {
      render(<TestAttemptDetail attempt={finished} />);
      expect(value("PID")).toBe("4242");
      expect(value("CPU")).toBe("37.5%");
      expect(value("RSS")).toBe("150 MB");
      expect(value("Duration")).toBe("1.3s");
      expect(value("Exit")).toBe("0");
    });

    it("shows file descriptors and goroutines only when they were captured", () => {
      const { rerender } = render(<TestAttemptDetail attempt={finished} />);
      expect(tile("FDs")).toBeNull();
      expect(tile("Goroutines")).toBeNull();
      rerender(<TestAttemptDetail attempt={{ ...finished, goroutine_count: 312 }} />);
      expect(value("Goroutines")).toBe("312");
    });

    it("flags a non-zero exit code as a failure", () => {
      render(<TestAttemptDetail attempt={{ ...finished, passed: false, failed: true, exit_code: 2 }} />);
      expect(screen.getByText("2")).toHaveClass("text-red-600");
    });

    it("says no metrics were captured when there is no pid, cpu or rss", () => {
      render(<TestAttemptDetail attempt={{ sequence: 1, passed: true }} />);
      expect(screen.getByText("No metrics captured for this attempt.")).toBeInTheDocument();
      expect(tile("PID")).toBeNull();
    });

    it("labels metrics of a process shared by a go test batch", () => {
      const { rerender } = render(<TestAttemptDetail attempt={finished} />);
      expect(screen.queryByText("shared by batch")).not.toBeInTheDocument();
      rerender(<TestAttemptDetail attempt={{ ...finished, shared_process: true }} />);
      expect(screen.getByText("shared by batch")).toBeInTheDocument();
    });
  });

  describe("stack trace", () => {
    it("renders a Go dump of a timed-out attempt as goroutines", () => {
      const stack = "goroutine 7 [chan receive, 30 minutes]:\nmain.wait()\n\t/app/main.go:9 +0x1f\n";
      render(<TestAttemptDetail attempt={{ sequence: 1, timed_out: true, stack_trace: stack, goroutine_count: 1 }} />);
      expect(screen.getByText("Stack trace")).toBeInTheDocument();
      expect(screen.getByText("g7")).toBeInTheDocument();
    });

    it("shows a non-Go dump as raw text", () => {
      const { container } = render(<TestAttemptDetail attempt={{ sequence: 1, timed_out: true, stack_trace: "SIGQUIT: quit" }} />);
      expect(container.querySelector("pre")).toHaveTextContent("SIGQUIT: quit");
    });

    it("shows no stack section without a stack trace", () => {
      render(<TestAttemptDetail attempt={finished} />);
      expect(screen.queryByText("Stack trace")).not.toBeInTheDocument();
    });
  });

  describe("live polling", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    const reading = (cpu: number): ProcessMetrics => ({ pid: 4242, cpu_percent: cpu, rss: 8 * 1024 * 1024, open_files: 12 });

    it("reads once immediately, then every two seconds, showing the latest reading", async () => {
      const fetchProcessMetrics = vi.fn().mockResolvedValueOnce(reading(10)).mockResolvedValue(reading(55));
      render(<TestAttemptDetail attempt={live} fetchProcessMetrics={fetchProcessMetrics} />);
      await act(async () => {});
      expect(fetchProcessMetrics).toHaveBeenCalledTimes(1);
      expect(fetchProcessMetrics).toHaveBeenCalledWith(4242);
      expect(value("CPU")).toBe("10.0%");
      expect(value("FDs")).toBe("12");

      await act(() => vi.advanceTimersByTimeAsync(1999));
      expect(fetchProcessMetrics).toHaveBeenCalledTimes(1);
      await act(() => vi.advanceTimersByTimeAsync(1));
      expect(fetchProcessMetrics).toHaveBeenCalledTimes(2);
      expect(value("CPU")).toBe("55.0%");
      expect(screen.getByRole("status", { name: "Reading live metrics" })).toBeInTheDocument();
    });

    it("stops polling when the attempt finishes and shows its recorded numbers", async () => {
      const fetchProcessMetrics = vi.fn().mockResolvedValue(reading(55));
      const { rerender } = render(<TestAttemptDetail attempt={live} fetchProcessMetrics={fetchProcessMetrics} />);
      await act(async () => {});
      rerender(<TestAttemptDetail attempt={{ ...live, passed: true, cpu_percent: 12.5 }} fetchProcessMetrics={fetchProcessMetrics} />);
      await act(() => vi.advanceTimersByTimeAsync(10_000));
      expect(fetchProcessMetrics).toHaveBeenCalledTimes(1);
      expect(value("CPU")).toBe("12.5%");
      expect(screen.queryByRole("status", { name: "Reading live metrics" })).not.toBeInTheDocument();
    });

    it("stops and says the process exited when the fetch reports it not found", async () => {
      const fetchProcessMetrics = vi
        .fn()
        .mockResolvedValueOnce(reading(10))
        .mockRejectedValue(new ProcessNotFoundError(4242));
      render(<TestAttemptDetail attempt={live} fetchProcessMetrics={fetchProcessMetrics} />);
      await act(async () => {});
      await act(() => vi.advanceTimersByTimeAsync(2000));
      expect(screen.getByText("process exited")).toBeInTheDocument();
      expect(value("CPU")).toBe("10.0%");
      await act(() => vi.advanceTimersByTimeAsync(10_000));
      expect(fetchProcessMetrics).toHaveBeenCalledTimes(2);
      expect(screen.queryByRole("status", { name: "Reading live metrics" })).not.toBeInTheDocument();
    });

    it("shows any other failure and keeps polling", async () => {
      const fetchProcessMetrics = vi
        .fn()
        .mockRejectedValueOnce(new Error("HTTP 500"))
        .mockResolvedValue(reading(20));
      render(<TestAttemptDetail attempt={live} fetchProcessMetrics={fetchProcessMetrics} />);
      await act(async () => {});
      expect(screen.getByText("HTTP 500")).toBeInTheDocument();
      await act(() => vi.advanceTimersByTimeAsync(2000));
      expect(fetchProcessMetrics).toHaveBeenCalledTimes(2);
      expect(screen.queryByText("HTTP 500")).not.toBeInTheDocument();
      expect(value("CPU")).toBe("20.0%");
    });

    it("does not poll a finished attempt, an attempt without a pid, or without a fetcher", async () => {
      const fetchProcessMetrics = vi.fn().mockResolvedValue(reading(1));
      const { unmount } = render(<TestAttemptDetail attempt={finished} fetchProcessMetrics={fetchProcessMetrics} />);
      unmount();
      const noPid = render(<TestAttemptDetail attempt={{ sequence: 1 }} fetchProcessMetrics={fetchProcessMetrics} />);
      noPid.unmount();
      render(<TestAttemptDetail attempt={live} />);
      await act(() => vi.advanceTimersByTimeAsync(5000));
      expect(fetchProcessMetrics).not.toHaveBeenCalled();
    });

    it("does not restart the poll when the host passes a new fetcher function", async () => {
      const first = vi.fn().mockResolvedValue(reading(10));
      const second = vi.fn().mockResolvedValue(reading(30));
      const { rerender } = render(<TestAttemptDetail attempt={live} fetchProcessMetrics={first} />);
      await act(async () => {});
      rerender(<TestAttemptDetail attempt={live} fetchProcessMetrics={second} />);
      await act(async () => {});
      expect(first).toHaveBeenCalledTimes(1);
      expect(second).not.toHaveBeenCalled();
      await act(() => vi.advanceTimersByTimeAsync(2000));
      expect(second).toHaveBeenCalledTimes(1);
      expect(value("CPU")).toBe("30.0%");
    });

    it("stops polling on unmount", async () => {
      const fetchProcessMetrics = vi.fn().mockResolvedValue(reading(10));
      const { unmount } = render(<TestAttemptDetail attempt={live} fetchProcessMetrics={fetchProcessMetrics} />);
      await act(async () => {});
      unmount();
      await act(() => vi.advanceTimersByTimeAsync(10_000));
      expect(fetchProcessMetrics).toHaveBeenCalledTimes(1);
    });
  });
});
