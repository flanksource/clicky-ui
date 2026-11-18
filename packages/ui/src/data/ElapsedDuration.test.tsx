import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ElapsedDuration } from "./ElapsedDuration";

const STARTED = "2026-10-15T07:00:00Z";

describe("ElapsedDuration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.parse("2026-10-15T07:00:05Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("ticks while the run has started and not finished", () => {
    render(<ElapsedDuration startedAt={STARTED} finishedAt={undefined} />);
    expect(screen.getByText("5 s")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText("8 s")).toBeInTheDocument();
  });

  it("shows the span between the timestamps once finished, however long ago", () => {
    render(<ElapsedDuration startedAt={STARTED} finishedAt="2026-10-15T07:02:00Z" />);
    expect(screen.getByText("2 min")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText("2 min")).toBeInTheDocument();
  });

  it("stops ticking when the run finishes", () => {
    const { rerender } = render(<ElapsedDuration startedAt={STARTED} finishedAt={undefined} />);
    rerender(<ElapsedDuration startedAt={STARTED} finishedAt="2026-10-15T07:00:09Z" />);
    expect(screen.getByText("9 s")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByText("9 s")).toBeInTheDocument();
  });

  it("renders the fallback, or nothing, before the run has started", () => {
    const { container, rerender } = render(<ElapsedDuration startedAt={undefined} finishedAt={undefined} />);
    expect(container).toBeEmptyDOMElement();

    rerender(<ElapsedDuration startedAt={undefined} finishedAt={undefined} fallback={<span>—</span>} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("formats with the caller's formatter", () => {
    render(
      <ElapsedDuration startedAt={STARTED} finishedAt={undefined} format={(ms) => `${ms / 1000} seconds`} />,
    );
    expect(screen.getByText("5 seconds")).toBeInTheDocument();
  });
});
