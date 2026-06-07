import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { vi } from "vitest";
import { FilterBar, type FilterBarFilter } from "./FilterBar";

function rect(width: number): DOMRect {
  return {
    width,
    height: 32,
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: width,
    bottom: 32,
    toJSON: () => ({}),
  } as DOMRect;
}

function mockFilterBarWidths({
  listWidth,
  itemWidths,
  triggerWidth = 44,
}: {
  listWidth: () => number;
  itemWidths: Record<string, number>;
  triggerWidth?: number;
}) {
  const original = HTMLElement.prototype.getBoundingClientRect;
  return vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
    if (this instanceof HTMLElement) {
      if (this.hasAttribute("data-filter-bar-list")) return rect(listWidth());
      const itemKey = this.getAttribute("data-filter-bar-item");
      if (itemKey) return rect(itemWidths[itemKey] ?? 120);
      if (this.getAttribute("aria-label") === "More filters") return rect(triggerWidth);
    }
    return original.call(this);
  });
}

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
            description: "Filter by owner team",
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
    expect(screen.getByLabelText("Owner").closest("label")).toHaveAttribute(
      "title",
      "Filter by owner team",
    );
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
    expect(screen.queryByText("Quick ranges")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Time range from"), { target: { value: "now-1h" } });
    fireEvent.change(screen.getByLabelText("Time range to"), { target: { value: "now" } });
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));
    expect(onTimeRange).toHaveBeenCalledWith("now-1h", "now");

    fireEvent.click(screen.getByRole("button", { name: /date range filter/i }));
    expect(screen.queryByText("Quick ranges")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Date range from"), {
      target: { value: "2026-04-21" },
    });
    fireEvent.change(screen.getByLabelText("Date range to"), {
      target: { value: "2026-04-21" },
    });
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));
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
    expect(screen.getByRole("button", { name: /time range filter/i })).toHaveTextContent("now-24h");
    expect(screen.getByRole("button", { name: /time range filter/i })).not.toHaveTextContent(
      "Time range",
    );
    expect(screen.getByRole("button", { name: /date range filter/i })).toHaveTextContent(
      "2026-04-21",
    );
    expect(screen.getByRole("button", { name: /date range filter/i })).not.toHaveTextContent(
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

    const status = screen.getByLabelText("Status");
    fireEvent.focus(status);
    fireEvent.mouseDown(screen.getByRole("option", { name: "Closed" }));
    expect(onStatus).toHaveBeenCalledWith("closed");

    fireEvent.click(screen.getByLabelText("Active"));
    expect(onActive).toHaveBeenCalledWith(true);
  });

  it("renders include-only multi-select filters", () => {
    const onGroupBy = vi.fn();

    render(
      <FilterBar
        filters={[
          {
            key: "groupBy",
            kind: "select-multi",
            label: "Group By",
            value: ["type"],
            options: [
              { value: "type", label: "Type" },
              { value: "health", label: "Health" },
            ],
            onChange: onGroupBy,
          },
        ]}
      />,
    );

    const trigger = screen.getByRole("button", { name: /group by filter/i });
    expect(trigger).toHaveTextContent("Type");

    fireEvent.click(trigger);
    fireEvent.click(screen.getByText("Health"));
    expect(onGroupBy).toHaveBeenCalledWith(["type", "health"]);
  });

  it("adds typeahead filtering for long tri-state option lists", () => {
    render(
      <FilterBar
        filters={[
          {
            key: "status",
            kind: "multi",
            label: "Status",
            value: {},
            options: Array.from({ length: 8 }, (_, index) => ({
              value: `status-${index}`,
              label: `Status ${index}`,
            })),
            onChange: vi.fn(),
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /status filter/i }));
    expect(screen.getByLabelText("Filter Status options")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Filter Status options"), {
      target: { value: "status 7" },
    });

    expect(screen.getByText("Status 7")).toBeInTheDocument();
    expect(screen.queryByText("Status 1")).not.toBeInTheDocument();
  });

  it("renders lookup-backed single and multi filters as option-restricted comboboxes", () => {
    const onTeam = vi.fn();
    const onTags = vi.fn();

    render(
      <FilterBar
        autoSubmit={false}
        filters={[
          {
            key: "team",
            kind: "lookup",
            label: "Team",
            value: "",
            options: [
              { value: "team/platform", label: "Platform" },
              { value: "team/core", label: "Core" },
            ],
            onChange: onTeam,
          },
          {
            key: "tags",
            kind: "lookup-multi",
            label: "Tags",
            value: ["api"],
            options: [
              { value: "api", label: "API" },
              { value: "worker", label: "Worker" },
            ],
            onChange: onTags,
          },
        ]}
      />,
    );

    // Single lookup: selecting an option commits its value; freeform text is not committed.
    const team = screen.getByLabelText("Team");
    fireEvent.focus(team);
    fireEvent.change(team, { target: { value: "plat" } });
    fireEvent.mouseDown(screen.getByRole("option", { name: "Platform" }));
    expect(onTeam).toHaveBeenCalledWith("team/platform");

    // Multi lookup: toggling an option appends it to the existing selection.
    const tags = screen.getByLabelText("Tags");
    fireEvent.focus(tags);
    fireEvent.mouseDown(screen.getByRole("option", { name: "Worker" }));
    expect(onTags).toHaveBeenCalledWith(["api", "worker"]);
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
    expect(screen.getAllByLabelText(/pick time range/i)).toHaveLength(2);
    expect(screen.queryByLabelText(/time range from time/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /date range filter/i }));
    expect(screen.getAllByLabelText(/pick date range/i)).toHaveLength(2);
  });

  it("renders a nested-multi filter as a key→value submenu and round-trips selection", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();

    render(
      <FilterBar
        filters={[
          {
            key: "tags",
            kind: "nested-multi",
            label: "Tags",
            value: {},
            onChange,
            groups: [
              {
                groupKey: "env",
                options: [
                  { value: "env=prod", label: "env=prod" },
                  { value: "env=staging", label: "env=staging" },
                ],
              },
              {
                groupKey: "tier",
                options: [
                  { value: "tier=edge", label: "tier=edge" },
                  { value: "tier=core", label: "tier=core" },
                ],
              },
            ],
          },
        ]}
      />,
    );

    // Outer panel shows keys, not raw tokens.
    fireEvent.click(screen.getByRole("button", { name: /tags filter/i }));
    const envGroup = screen.getByRole("button", { name: /^env$/ });
    const tierGroup = screen.getByRole("button", { name: /^tier$/ });
    expect(envGroup).toBeInTheDocument();
    expect(tierGroup).toBeInTheDocument();
    expect(screen.queryByText("env=prod")).not.toBeInTheDocument();

    // Hovering a key reveals its values in the second panel.
    fireEvent.mouseEnter(envGroup);
    expect(screen.getByRole("button", { name: /^prod$/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^staging$/ })).toBeInTheDocument();

    // Toggle the value's pill into include — this mirrors the flat multi
    // pathway exactly (same wire shape, same handler).
    fireEvent.click(screen.getByRole("button", { name: /^prod$/ }));
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onChange).toHaveBeenCalledWith({ "env=prod": "include" });

    vi.useRealTimers();
  });

  it("moves only overflowing filters behind the filter menu and restores them when space returns", async () => {
    let width = 260;
    const measurement = mockFilterBarWidths({
      listWidth: () => width,
      itemWidths: {
        team: 100,
        owner: 100,
        service: 100,
        status: 100,
        region: 100,
      },
    });

    render(
      <FilterBar
        autoSubmit={false}
        filters={[
          { key: "team", kind: "text", label: "Team", value: "", onChange: vi.fn() },
          { key: "owner", kind: "text", label: "Owner", value: "", onChange: vi.fn() },
          { key: "service", kind: "text", label: "Service", value: "", onChange: vi.fn() },
          {
            key: "status",
            kind: "multi",
            label: "Status",
            value: {},
            onChange: vi.fn(),
            options: [
              { value: "healthy", label: "Healthy" },
              { value: "degraded", label: "Degraded" },
            ],
          },
          { key: "region", kind: "text", label: "Region", value: "", onChange: vi.fn() },
        ]}
      />,
    );

    await screen.findByRole("button", { name: /more filters/i });
    expect(screen.getByRole("button", { name: /more filters/i })).not.toHaveTextContent(/\d/);
    expect(screen.getByLabelText("Team")).toBeInTheDocument();
    expect(screen.getByLabelText("Owner")).toBeInTheDocument();
    expect(screen.queryByLabelText("Service")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /more filters/i }));
    const dialog = screen.getByRole("dialog", { name: /overflow filters/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByLabelText("Service")).toBeInTheDocument();
    expect(screen.getByLabelText("Region")).toBeInTheDocument();
    expect(screen.queryByLabelText("Overflow filter")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^close$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^apply$/i })).toBeInTheDocument();
    expect(dialog.querySelectorAll("[data-overflow-filter-row]")).toHaveLength(3);
    for (const row of Array.from(dialog.querySelectorAll("[data-overflow-filter-row]"))) {
      expect(row).toHaveClass("h-12");
    }

    fireEvent.click(within(dialog).getByRole("button", { name: /status filter/i }));
    expect(within(dialog).getByText("Healthy")).toBeInTheDocument();

    width = 700;
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    expect(screen.queryByRole("button", { name: /more filters/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Service")).toBeInTheDocument();
    expect(screen.getByLabelText("Region")).toBeInTheDocument();

    measurement.mockRestore();
  });

  it("counts only active hidden filters in the overflow trigger badge", async () => {
    const measurement = mockFilterBarWidths({
      listWidth: () => 220,
      itemWidths: {
        team: 100,
        owner: 100,
        service: 100,
        status: 100,
      },
    });

    const { rerender } = render(
      <FilterBar
        filters={[
          { key: "team", kind: "text", label: "Team", value: "platform", onChange: vi.fn() },
          { key: "owner", kind: "text", label: "Owner", value: "data", onChange: vi.fn() },
          { key: "service", kind: "text", label: "Service", value: "", onChange: vi.fn() },
          {
            key: "status",
            kind: "multi",
            label: "Status",
            value: {},
            onChange: vi.fn(),
            options: [
              { value: "healthy", label: "Healthy" },
              { value: "degraded", label: "Degraded" },
            ],
          },
        ]}
      />,
    );

    expect(await screen.findByRole("button", { name: /more filters/i })).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: /more filters/i })).not.toHaveTextContent("1/3");
    expect(screen.getByRole("button", { name: /more filters/i })).not.toHaveTextContent("3");

    rerender(
      <FilterBar
        filters={[
          { key: "team", kind: "text", label: "Team", value: "platform", onChange: vi.fn() },
          { key: "owner", kind: "text", label: "Owner", value: "data", onChange: vi.fn() },
          { key: "service", kind: "text", label: "Service", value: "api", onChange: vi.fn() },
          {
            key: "status",
            kind: "multi",
            label: "Status",
            value: { degraded: "exclude" },
            onChange: vi.fn(),
            options: [
              { value: "healthy", label: "Healthy" },
              { value: "degraded", label: "Degraded" },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: /more filters/i })).toHaveTextContent("3");

    measurement.mockRestore();
  });

  it("keeps all filters inline when the measured row has enough space", () => {
    const measurement = mockFilterBarWidths({
      listWidth: () => 500,
      itemWidths: {
        team: 100,
        owner: 100,
        service: 100,
        region: 100,
      },
    });

    render(
      <FilterBar
        filters={[
          { key: "team", kind: "text", label: "Team", value: "", onChange: vi.fn() },
          { key: "owner", kind: "text", label: "Owner", value: "", onChange: vi.fn() },
          { key: "service", kind: "text", label: "Service", value: "", onChange: vi.fn() },
          { key: "region", kind: "text", label: "Region", value: "", onChange: vi.fn() },
        ]}
      />,
    );

    expect(screen.queryByRole("button", { name: /more filters/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Team")).toBeInTheDocument();
    expect(screen.getByLabelText("Owner")).toBeInTheDocument();
    expect(screen.getByLabelText("Service")).toBeInTheDocument();
    expect(screen.getByLabelText("Region")).toBeInTheDocument();

    measurement.mockRestore();
  });

  it("applies edits from overflowed filters using the bar autoSubmit mode", async () => {
    const onService = vi.fn();
    const onApply = vi.fn();
    const measurement = mockFilterBarWidths({
      listWidth: () => 220,
      itemWidths: {
        team: 100,
        owner: 100,
        service: 100,
      },
    });

    render(
      <FilterBar
        autoSubmit={false}
        onApply={onApply}
        filters={[
          { key: "team", kind: "text", label: "Team", value: "", onChange: vi.fn() },
          { key: "owner", kind: "text", label: "Owner", value: "", onChange: vi.fn() },
          { key: "service", kind: "text", label: "Service", value: "", onChange: onService },
        ]}
      />,
    );

    fireEvent.click(await screen.findByRole("button", { name: /more filters/i }));
    fireEvent.change(screen.getByLabelText("Service"), { target: { value: "api" } });
    expect(onService).not.toHaveBeenCalled();
    fireEvent.click(
      within(screen.getByRole("dialog", { name: /overflow filters/i })).getByRole("button", {
        name: /^apply$/i,
      }),
    );

    expect(onService).toHaveBeenCalledWith("api");
    expect(onApply).toHaveBeenCalledTimes(1);
    measurement.mockRestore();
  });

  it("cancels staged overflow edits when the popover is closed", async () => {
    const onService = vi.fn();
    const measurement = mockFilterBarWidths({
      listWidth: () => 220,
      itemWidths: {
        team: 100,
        owner: 100,
        service: 100,
      },
    });

    render(
      <FilterBar
        autoSubmit={false}
        filters={[
          { key: "team", kind: "text", label: "Team", value: "", onChange: vi.fn() },
          { key: "owner", kind: "text", label: "Owner", value: "", onChange: vi.fn() },
          { key: "service", kind: "text", label: "Service", value: "", onChange: onService },
        ]}
      />,
    );

    fireEvent.click(await screen.findByRole("button", { name: /more filters/i }));
    fireEvent.change(screen.getByLabelText("Service"), { target: { value: "api" } });
    fireEvent.click(
      within(screen.getByRole("dialog", { name: /overflow filters/i })).getByRole("button", {
        name: /^close$/i,
      }),
    );

    expect(onService).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /more filters/i }));
    expect(screen.getByLabelText("Service")).toHaveValue("");

    measurement.mockRestore();
  });

  it("keeps wrap mode available for legacy multi-row layouts", () => {
    const filters: FilterBarFilter[] = [
      { key: "team", kind: "text", label: "Team", value: "", onChange: vi.fn() },
      { key: "owner", kind: "text", label: "Owner", value: "", onChange: vi.fn() },
    ];

    render(<FilterBar overflowMode="wrap" filters={filters} />);

    expect(screen.queryByRole("button", { name: /more filters/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Team")).toBeInTheDocument();
    expect(screen.getByLabelText("Owner")).toBeInTheDocument();
  });

  it("renders an 'and N more' hint for a truncated multi filter", () => {
    render(
      <FilterBar
        filters={[
          {
            key: "plan",
            kind: "multi",
            label: "Plan",
            value: {},
            options: Array.from({ length: 3 }, (_, i) => ({
              value: `plan-${i}`,
              label: `Plan ${i}`,
            })),
            truncated: true,
            total: 250,
            onChange: vi.fn(),
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /plan filter/i }));
    // 250 total - 3 head = 247 more.
    expect(screen.getByText(/and 247 more/i)).toBeInTheDocument();
    // The search box is forced visible for a truncated filter even with <8 options.
    expect(screen.getByLabelText("Filter Plan options")).toBeInTheDocument();
  });

  it("replaces the head with onSearch matches and hides non-selected head items", async () => {
    vi.useFakeTimers();
    // onSearch returns a value (plan-0225) that is NOT in the head set.
    const onSearch = vi.fn().mockResolvedValue([{ value: "plan-0225", label: "Plan 0225" }]);

    render(
      <FilterBar
        filters={[
          {
            key: "plan",
            kind: "multi",
            label: "Plan",
            value: {},
            options: [{ value: "plan-0000", label: "Plan 0000" }],
            truncated: true,
            total: 250,
            onSearch,
            onChange: vi.fn(),
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /plan filter/i }));
    fireEvent.change(screen.getByLabelText("Filter Plan options"), {
      target: { value: "plan-0225" },
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(onSearch).toHaveBeenCalledWith("plan-0225");
    expect(screen.getByText("Plan 0225")).toBeInTheDocument();
    // The unselected head item is replaced by the matches while searching.
    expect(screen.queryByText("Plan 0000")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("keeps an already-toggled head item visible during an onSearch query", async () => {
    vi.useFakeTimers();
    const onSearch = vi.fn().mockResolvedValue([{ value: "plan-0225", label: "Plan 0225" }]);

    render(
      <FilterBar
        filters={[
          {
            key: "plan",
            kind: "multi",
            label: "Plan",
            // plan-0000 is already included; plan-0001 is untouched.
            value: { "plan-0000": "include" },
            options: [
              { value: "plan-0000", label: "Plan 0000" },
              { value: "plan-0001", label: "Plan 0001" },
            ],
            truncated: true,
            total: 250,
            onSearch,
            onChange: vi.fn(),
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /plan filter/i }));
    fireEvent.change(screen.getByLabelText("Filter Plan options"), {
      target: { value: "plan-0225" },
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    // The match shows; the already-included head item stays; the untouched head
    // item is hidden.
    expect(screen.getByText("Plan 0225")).toBeInTheDocument();
    expect(screen.getByText("Plan 0000")).toBeInTheDocument();
    expect(screen.queryByText("Plan 0001")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("does not call onSearch for an empty query and filters the head client-side", () => {
    const onSearch = vi.fn();
    render(
      <FilterBar
        filters={[
          {
            key: "plan",
            kind: "multi",
            label: "Plan",
            value: {},
            options: Array.from({ length: 8 }, (_, i) => ({
              value: `plan-${i}`,
              label: `Plan ${i}`,
            })),
            onChange: vi.fn(),
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /plan filter/i }));
    fireEvent.change(screen.getByLabelText("Filter Plan options"), {
      target: { value: "Plan 7" },
    });

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByText("Plan 7")).toBeInTheDocument();
    expect(screen.queryByText("Plan 1")).not.toBeInTheDocument();
  });
});

describe("FilterBar label icons", () => {
  it("renders a text filter's icon node before its label", () => {
    render(
      <FilterBar
        filters={[
          {
            key: "owner",
            kind: "text",
            label: "Owner",
            icon: <span data-testid="owner-icon">@</span>,
            value: "",
            onChange: vi.fn(),
          },
        ]}
      />,
    );
    expect(screen.getByTestId("owner-icon")).toBeInTheDocument();
  });

  it("renders a number filter's icon in the trigger button", () => {
    render(
      <FilterBar
        filters={[
          {
            key: "restarts",
            kind: "number",
            label: "Restarts",
            icon: <span data-testid="restarts-icon">#</span>,
            value: { min: "", max: "" },
            domainMin: 0,
            domainMax: 6,
            onChange: vi.fn(),
          },
        ]}
      />,
    );
    const trigger = screen.getByRole("button", { name: /restarts filter/i });
    expect(within(trigger).getByTestId("restarts-icon")).toBeInTheDocument();
  });
});

describe("FilterBar date lookup rendering", () => {
  it("shows the human-readable absolute+relative date as the field title", () => {
    render(
      <FilterBar
        filters={[
          {
            key: "since",
            kind: "lookup",
            label: "Since",
            inputType: "date",
            value: "2026-04-15T12:00:00Z",
            options: [],
            onChange: vi.fn(),
          },
        ]}
      />,
    );
    const title = screen.getByLabelText("Since").closest("label")?.getAttribute("title");
    expect(title).toMatch(/2026/);
    expect(title).toMatch(/\(.+\)$/);
  });
});
