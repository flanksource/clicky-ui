import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { vi } from "vitest";
import { DataTable, type DataTableColumn } from "./DataTable";

type ServiceRow = {
  service: string;
  status: string;
  restarts: number;
  notes: string;
  tags: string[];
};

const rows: ServiceRow[] = [
  {
    service: "api",
    status: "healthy",
    restarts: 0,
    notes: "Production API service",
    tags: Array.from({ length: 10 }, (_, index) => `infra-${index + 1}`),
  },
  {
    service: "worker",
    status: "degraded",
    restarts: 3,
    notes: "Processes jobs with backoff",
    tags: Array.from({ length: 10 }, (_, index) => `queue-${index + 11}`),
  },
  {
    service: "cron",
    status: "healthy",
    restarts: 1,
    notes: "Nightly reporting task",
    tags: Array.from({ length: 10 }, (_, index) => `batch-${index + 21}`),
  },
];

const columns: DataTableColumn<ServiceRow>[] = [
  { key: "service", label: "Service", grow: true },
  { key: "status", label: "Status", shrink: true },
  {
    key: "restarts",
    label: "Restarts",
    align: "right",
    shrink: true,
    sortValue: (value) => Number(value ?? 0),
  },
  { key: "notes", label: "Notes", grow: true },
  {
    key: "tags",
    label: "Tags",
    grow: true,
    render: (value) => (Array.isArray(value) ? value.join(", ") : String(value ?? "")),
    filterValue: (value) => (Array.isArray(value) ? value : []),
  },
];

describe("DataTable", () => {
  it("sorts columns by default and toggles the sort order", () => {
    render(<DataTable data={rows} columns={columns} defaultSort={{ key: "restarts" }} />);

    const table = within(screen.getByRole("table"));
    expect(table.getAllByRole("row")[1]).toHaveTextContent("api");

    fireEvent.click(screen.getByRole("button", { name: /restarts/i }));

    expect(table.getAllByRole("row")[1]).toHaveTextContent("worker");
    expect(table.getAllByRole("row")[2]).toHaveTextContent("cron");
  });

  it("applies the built-in global search", () => {
    vi.useFakeTimers();
    render(<DataTable data={rows} columns={columns} autoFilter />);

    fireEvent.change(screen.getByPlaceholderText("Search all columns…"), {
      target: { value: "nightly" },
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText("cron")).toBeInTheDocument();
    expect(screen.queryByText("worker")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("generates multi-select and text filters automatically", () => {
    vi.useFakeTimers();
    render(<DataTable data={rows} columns={columns} autoFilter />);

    fireEvent.click(screen.getByRole("button", { name: /status filter/i }));
    const healthyFilter = document.querySelector('[data-filter-option="healthy"]');
    if (!healthyFilter) {
      throw new Error("Expected healthy filter option");
    }
    fireEvent.click(healthyFilter);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText("api")).toBeInTheDocument();
    expect(screen.getByText("cron")).toBeInTheDocument();
    expect(screen.queryByText("worker")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Tags"), { target: { value: "batch-21" } });

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText("cron")).toBeInTheDocument();
    expect(screen.queryByText("api")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("generates number range filters for numeric columns", () => {
    vi.useFakeTimers();
    render(<DataTable data={rows} columns={columns} autoFilter />);

    fireEvent.click(screen.getByRole("button", { name: /restarts filter/i }));
    fireEvent.change(screen.getByLabelText("Restarts minimum"), { target: { value: "2" } });

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByText("api")).not.toBeInTheDocument();
    expect(screen.queryByText("cron")).not.toBeInTheDocument();
    expect(screen.getByText("worker")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("applies grow and shrink cell behavior", () => {
    render(<DataTable data={rows} columns={columns} />);

    expect(screen.getAllByText("healthy")[0]).toHaveClass("whitespace-nowrap");
    expect(screen.getByText("Production API service")).toHaveClass(
      "min-w-56",
      "max-w-[36rem]",
      "truncate",
    );
  });

  it("passes native filter bar range controls through", () => {
    const onApply = vi.fn();

    render(
      <DataTable
        data={rows}
        columns={columns}
        autoFilter
        filterBarProps={{
          timeRange: {
            from: "now-24h",
            to: "now",
            onApply,
            presets: [{ label: "Last 1 hour", from: "now-1h", to: "now" }],
          },
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /time range filter/i }));
    fireEvent.click(screen.getByRole("button", { name: /last 1 hour/i }));

    expect(onApply).toHaveBeenCalledWith("now-1h", "now");
  });
});
