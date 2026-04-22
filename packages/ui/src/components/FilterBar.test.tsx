import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { FilterBar } from "./FilterBar";

describe("FilterBar", () => {
  it("renders native search, filters, and range controls", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    const onStatus = vi.fn();
    const onOwner = vi.fn();
    const onRestarts = vi.fn();
    const onTimeRange = vi.fn();
    const onDateRange = vi.fn();

    render(
      <FilterBar
        search={{
          value: "",
          onChange: onSearch,
          placeholder: "Search traces…",
        }}
        filters={[
          {
            key: "status",
            kind: "multi",
            label: "Status",
            value: { healthy: "include" },
            onChange: onStatus,
            options: [
              { value: "healthy", label: "Healthy" },
              { value: "degraded", label: "Degraded" },
            ],
          },
          {
            key: "owner",
            kind: "text",
            label: "Owner",
            value: "",
            onChange: onOwner,
            placeholder: "platform",
          },
          {
            key: "restarts",
            kind: "number",
            label: "Restarts",
            value: { min: "", max: "" },
            domainMin: 0,
            domainMax: 6,
            onChange: onRestarts,
          },
        ]}
        timeRange={{
          from: "now-24h",
          to: "now",
          onApply: onTimeRange,
          presets: [{ label: "Last 1 hour", from: "now-1h", to: "now" }],
        }}
        dateRange={{
          from: "",
          to: "",
          onApply: onDateRange,
          presets: [{ label: "Today", from: "2026-04-21", to: "2026-04-21" }],
        }}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox", { name: /search traces/i }), {
      target: { value: "api" },
    });
    expect(onSearch).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onSearch).toHaveBeenCalledWith("api");

    expect(screen.getByRole("button", { name: /status filter/i })).toHaveTextContent("Status +1");

    fireEvent.change(screen.getByLabelText("Owner"), { target: { value: "platform" } });
    expect(onOwner).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onOwner).toHaveBeenCalledWith("platform");

    fireEvent.click(screen.getByRole("button", { name: /restarts filter/i }));
    fireEvent.change(screen.getByLabelText("Restarts minimum"), { target: { value: "2" } });
    expect(onRestarts).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onRestarts).toHaveBeenCalledWith({ min: "2", max: "" });

    fireEvent.click(screen.getByRole("button", { name: /time range filter/i }));
    fireEvent.click(screen.getByRole("button", { name: /last 1 hour/i }));
    expect(onTimeRange).toHaveBeenCalledWith("now-1h", "now");

    fireEvent.click(screen.getByRole("button", { name: /date range filter/i }));
    fireEvent.click(screen.getByRole("button", { name: /today/i }));
    expect(onDateRange).toHaveBeenCalledWith("2026-04-21", "2026-04-21");

    vi.useRealTimers();
  });

  it("keeps inline labels visible for selected values", () => {
    render(
      <FilterBar
        search={{
          value: "api",
          onChange: vi.fn(),
          placeholder: "Search traces…",
        }}
        filters={[
          {
            key: "status",
            kind: "multi",
            label: "Status",
            value: { healthy: "include" },
            onChange: vi.fn(),
            options: [{ value: "healthy", label: "Healthy" }],
          },
        ]}
        timeRange={{
          from: "now-24h",
          to: "now",
          onApply: vi.fn(),
        }}
        dateRange={{
          from: "2026-04-21",
          to: "2026-04-21",
          onApply: vi.fn(),
        }}
      />,
    );

    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /status filter/i })).toHaveTextContent("Status +1");
    expect(screen.getByRole("button", { name: /time range filter/i })).toHaveTextContent(
      "now-24h",
    );
    expect(screen.getByRole("button", { name: /time range filter/i })).not.toHaveTextContent(
      "Time range",
    );
    expect(screen.getByRole("button", { name: /date range filter/i })).toHaveTextContent(
      "Date range:",
    );
  });

  it("autoSubmit=false forwards text edits immediately and renders an Apply button", () => {
    const onOwner = vi.fn();
    const onApply = vi.fn();

    render(
      <FilterBar
        autoSubmit={false}
        onApply={onApply}
        filters={[
          {
            key: "owner",
            kind: "text",
            label: "Owner",
            value: "",
            onChange: onOwner,
          },
        ]}
      />,
    );

    fireEvent.change(screen.getByLabelText("Owner"), { target: { value: "platform" } });
    expect(onOwner).toHaveBeenCalledWith("platform");

    fireEvent.click(screen.getByRole("button", { name: /apply/i }));
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it("autoSubmit=false + isPending disables Apply with loading label", () => {
    render(
      <FilterBar
        autoSubmit={false}
        onApply={vi.fn()}
        isPending
        filters={[{ key: "q", kind: "text", label: "Q", value: "", onChange: vi.fn() }]}
      />,
    );

    const apply = screen.getByRole("button", { name: /loading/i });
    expect(apply).toBeDisabled();
  });

  it("renders enum and boolean filters", () => {
    const onStatus = vi.fn();
    const onActive = vi.fn();

    render(
      <FilterBar
        filters={[
          {
            key: "status",
            kind: "enum",
            label: "Status",
            value: "",
            options: [
              { value: "open", label: "Open" },
              { value: "closed", label: "Closed" },
            ],
            onChange: onStatus,
          },
          {
            key: "active",
            kind: "boolean",
            label: "Active",
            value: false,
            onChange: onActive,
          },
        ]}
      />,
    );

    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "closed" } });
    expect(onStatus).toHaveBeenCalledWith("closed");

    fireEvent.click(screen.getByLabelText("Active"));
    expect(onActive).toHaveBeenCalledWith(true);
  });

  it("opens the native date picker affordance", () => {
    render(
      <FilterBar
        dateRange={{
          from: "",
          to: "",
          onApply: vi.fn(),
        }}
        timeRange={{
          from: "",
          to: "",
          onApply: vi.fn(),
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /time range filter/i }));
    expect(screen.getAllByLabelText(/open time picker/i)).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: /date range filter/i }));
    expect(screen.getAllByLabelText(/open date picker/i)).toHaveLength(2);
  });
});
