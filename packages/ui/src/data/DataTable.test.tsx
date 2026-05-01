import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, vi } from "vitest";
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
  beforeEach(() => {
    window.localStorage.clear();
  });

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

  it("uses max-content auto table layout without handle padding by default", () => {
    render(<DataTable data={rows} columns={columns} />);

    expect(screen.getByRole("table")).toHaveClass("w-max", "table-auto");
    expect(screen.getByRole("table")).not.toHaveClass("w-full");
    expect(screen.getByRole("columnheader", { name: /service/i })).toHaveClass("whitespace-nowrap");
    expect(screen.getByRole("columnheader", { name: /service/i })).not.toHaveClass("pr-5");
  });

  it("renders column resize handles by default", () => {
    render(<DataTable data={rows} columns={columns} />);

    expect(screen.getAllByRole("separator", { name: /resize .* column/i })).toHaveLength(
      columns.length,
    );
  });

  it("updates column width when dragging a resize handle", () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        columnResizeStorageKey="clicky-ui-test-widths-drag"
      />,
    );

    fireEvent.mouseDown(screen.getByRole("separator", { name: /resize service column/i }), {
      clientX: 100,
    });
    fireEvent.mouseMove(document, { clientX: 180 });
    fireEvent.mouseUp(document);

    expect(document.querySelector("col")?.getAttribute("style")).toContain("width: 304px");
  });

  it("auto-fits a column when double-clicking a resize handle", () => {
    const storageKey = "clicky-ui-test-widths-autofit";
    render(<DataTable data={rows} columns={columns} columnResizeStorageKey={storageKey} />);

    const notesHeader = screen.getByRole("columnheader", { name: /notes/i });
    const notesCell = screen.getByText("Production API service").closest("td");
    const notesContent = screen.getByText("Production API service");
    if (!notesCell) {
      throw new Error("Expected notes cell");
    }

    Object.defineProperty(notesHeader, "scrollWidth", { configurable: true, value: 120 });
    Object.defineProperty(notesCell, "scrollWidth", { configurable: true, value: 280 });
    Object.defineProperty(notesContent, "scrollWidth", { configurable: true, value: 360 });

    fireEvent.doubleClick(screen.getByRole("separator", { name: /resize notes column/i }));

    const notesCol = document.querySelectorAll("col")[3];
    expect(notesCol?.getAttribute("style")).toContain("width: 360px");
    expect(window.localStorage.getItem(storageKey)).toBe(JSON.stringify({ notes: 360 }));
  });

  it("clamps resized widths to column minWidth and maxWidth", () => {
    render(
      <DataTable
        data={rows}
        columns={[{ ...columns[0], minWidth: 120, maxWidth: 240 }, ...columns.slice(1)]}
        columnResizeStorageKey="clicky-ui-test-widths-clamp"
      />,
    );

    const handle = screen.getByRole("separator", { name: /resize service column/i });
    fireEvent.mouseDown(handle, { clientX: 100 });
    fireEvent.mouseMove(document, { clientX: 1000 });
    fireEvent.mouseUp(document);

    expect(document.querySelector("col")?.getAttribute("style")).toContain("width: 240px");

    fireEvent.mouseDown(handle, { clientX: 100 });
    fireEvent.mouseMove(document, { clientX: -1000 });
    fireEvent.mouseUp(document);

    expect(document.querySelector("col")?.getAttribute("style")).toContain("width: 120px");
  });

  it("persists resized widths to localStorage and restores them on remount", () => {
    const storageKey = "clicky-ui-test-widths-persist";
    const { unmount } = render(
      <DataTable data={rows} columns={columns} columnResizeStorageKey={storageKey} />,
    );

    fireEvent.mouseDown(screen.getByRole("separator", { name: /resize service column/i }), {
      clientX: 100,
    });
    fireEvent.mouseMove(document, { clientX: 140 });
    fireEvent.mouseUp(document);

    expect(window.localStorage.getItem(storageKey)).toBe(JSON.stringify({ service: 264 }));

    unmount();
    render(<DataTable data={rows} columns={columns} columnResizeStorageKey={storageKey} />);

    expect(document.querySelector("col")?.getAttribute("style")).toContain("width: 264px");
  });

  it("can resize without persisting widths", () => {
    const storageKey = "clicky-ui-test-widths-no-persist";
    render(
      <DataTable
        data={rows}
        columns={columns}
        persistColumnWidths={false}
        columnResizeStorageKey={storageKey}
      />,
    );

    fireEvent.mouseDown(screen.getByRole("separator", { name: /resize service column/i }), {
      clientX: 100,
    });
    fireEvent.mouseMove(document, { clientX: 140 });
    fireEvent.mouseUp(document);

    expect(document.querySelector("col")?.getAttribute("style")).toContain("width: 264px");
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });

  it("can disable all resize handles", () => {
    render(<DataTable data={rows} columns={columns} resizableColumns={false} />);

    expect(screen.queryByRole("separator", { name: /resize .* column/i })).not.toBeInTheDocument();
  });

  it("can disable resizing for a single column", () => {
    render(
      <DataTable
        data={rows}
        columns={[{ ...columns[0], resizable: false }, ...columns.slice(1)]}
      />,
    );

    expect(
      screen.queryByRole("separator", { name: /resize service column/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("separator", { name: /resize status column/i })).toBeInTheDocument();
  });

  it("keeps sorting independent from resize handles", () => {
    render(<DataTable data={rows} columns={columns} defaultSort={{ key: "restarts" }} />);

    const table = within(screen.getByRole("table"));
    fireEvent.click(screen.getByRole("separator", { name: /resize restarts column/i }));

    expect(table.getAllByRole("row")[1]).toHaveTextContent("api");

    fireEvent.click(screen.getByRole("button", { name: /restarts/i }));

    expect(table.getAllByRole("row")[1]).toHaveTextContent("worker");
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
