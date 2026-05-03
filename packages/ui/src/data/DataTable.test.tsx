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

    fireEvent.change(screen.getByLabelText("Tags"), {
      target: { value: "batch-21" },
    });

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
    fireEvent.change(screen.getByLabelText("Restarts minimum"), {
      target: { value: "2" },
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByText("api")).not.toBeInTheDocument();
    expect(screen.queryByText("cron")).not.toBeInTheDocument();
    expect(screen.getByText("worker")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("exposes generated filters from column headers", () => {
    vi.useFakeTimers();
    render(<DataTable data={rows} columns={columns} autoFilter />);

    fireEvent.click(screen.getByRole("button", { name: /open status column filter/i }));
    const healthyFilter = document.querySelector('[data-filter-option="healthy"]');
    if (!healthyFilter) {
      throw new Error("Expected healthy header filter option");
    }
    fireEvent.click(healthyFilter);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText("api")).toBeInTheDocument();
    expect(screen.getByText("cron")).toBeInTheDocument();
    expect(screen.queryByText("worker")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("embeds header filter controls without duplicate panel chrome", () => {
    render(<DataTable data={rows} columns={columns} autoFilter />);

    fireEvent.click(screen.getByRole("button", { name: /open status column filter/i }));

    const dialog = screen.getByRole("dialog", {
      name: /status column filter/i,
    });
    expect(within(dialog).getAllByText("Status")).toHaveLength(1);
    expect(within(dialog).getAllByText("Clear all")).toHaveLength(1);
    expect(
      within(dialog).getByRole("button", { name: /close column filter/i }),
    ).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: /^close$/i })).not.toBeInTheDocument();
    expect(dialog.querySelector('[data-filter-panel-chrome="embedded"]')).toBeInTheDocument();
    expect(dialog.querySelector('[data-filter-panel-chrome="full"]')).not.toBeInTheDocument();
  });

  it("exposes number filters from column headers", () => {
    vi.useFakeTimers();
    render(<DataTable data={rows} columns={columns} autoFilter />);

    fireEvent.click(screen.getByRole("button", { name: /open restarts column filter/i }));
    fireEvent.change(screen.getByLabelText("Restarts minimum"), {
      target: { value: "2" },
    });

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

    Object.defineProperty(notesHeader, "scrollWidth", {
      configurable: true,
      value: 120,
    });
    Object.defineProperty(notesCell, "scrollWidth", {
      configurable: true,
      value: 280,
    });
    Object.defineProperty(notesContent, "scrollWidth", {
      configurable: true,
      value: 360,
    });

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

    const handle = screen.getByRole("separator", {
      name: /resize service column/i,
    });
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

  it("hides a column from the header context menu and persists the choice", () => {
    const storageKey = "clicky-ui-test-column-visibility-context";
    render(<DataTable data={rows} columns={columns} columnVisibilityStorageKey={storageKey} />);

    fireEvent.contextMenu(screen.getByRole("columnheader", { name: /notes/i }), {
      clientX: 120,
      clientY: 80,
    });
    fireEvent.click(screen.getByRole("menuitem", { name: /hide notes/i }));

    expect(screen.queryByRole("columnheader", { name: /notes/i })).not.toBeInTheDocument();
    expect(screen.queryByText("Production API service")).not.toBeInTheDocument();
    expect(window.localStorage.getItem(storageKey)).toBe(JSON.stringify({ notes: true }));
  });

  it("restores hidden columns from localStorage and can show them from the column menu", () => {
    const storageKey = "clicky-ui-test-column-visibility-menu";
    window.localStorage.setItem(storageKey, JSON.stringify({ notes: true }));

    const { unmount } = render(
      <DataTable data={rows} columns={columns} columnVisibilityStorageKey={storageKey} />,
    );

    expect(screen.queryByRole("columnheader", { name: /notes/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /notes/i }));

    expect(screen.getByRole("columnheader", { name: /notes/i })).toBeInTheDocument();
    expect(window.localStorage.getItem(storageKey)).toBeNull();

    unmount();
    render(<DataTable data={rows} columns={columns} columnVisibilityStorageKey={storageKey} />);

    expect(screen.getByRole("columnheader", { name: /notes/i })).toBeInTheDocument();
  });

  it("does not expose non-hideable columns as removable", () => {
    render(
      <DataTable data={rows} columns={[{ ...columns[0], hideable: false }, ...columns.slice(1)]} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));

    expect(screen.getByRole("checkbox", { name: /service/i })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: /notes/i })).toBeEnabled();
  });

  it("can disable column hiding even when localStorage has hidden columns", () => {
    const storageKey = "clicky-ui-test-column-visibility-disabled";
    window.localStorage.setItem(storageKey, JSON.stringify({ notes: true }));

    render(
      <DataTable
        data={rows}
        columns={columns}
        hideableColumns={false}
        columnVisibilityStorageKey={storageKey}
      />,
    );

    expect(screen.getByRole("columnheader", { name: /notes/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /open column menu/i })).not.toBeInTheDocument();
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

  it("renders a status dot for a kind:'status' column", () => {
    type StatusRow = { service: string; level: string };
    const data: StatusRow[] = [
      { service: "api", level: "ERROR" },
      { service: "worker", level: "ok" },
      { service: "cron", level: "warning" },
    ];
    const cols: DataTableColumn<StatusRow>[] = [
      { key: "service", label: "Service" },
      {
        key: "level",
        label: "Status",
        kind: "status",
        status: { showLabel: true },
      },
    ];

    render(<DataTable data={data} columns={cols} />);

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(3);
    expect(within(rows[0]!).getByRole("img", { name: "ERROR" })).toBeInTheDocument();
    expect(within(rows[1]!).getByRole("img", { name: "ok" })).toBeInTheDocument();
    expect(within(rows[2]!).getByRole("img", { name: "warning" })).toBeInTheDocument();
  });

  it("emits tag tokens for a kind:'tags' column so auto-filter can pick them up", () => {
    vi.useFakeTimers();
    type TagRow = { name: string; tags: string[] };
    const data: TagRow[] = [
      { name: "alpha", tags: ["env=prod", "tier=edge"] },
      { name: "beta", tags: ["env=staging"] },
    ];
    const cols: DataTableColumn<TagRow>[] = [
      { key: "name", label: "Name" },
      { key: "tags", label: "Tags", kind: "tags" },
    ];

    render(<DataTable data={data} columns={cols} autoFilter />);

    const search = screen.getByPlaceholderText("Search all columns…");
    fireEvent.change(search, { target: { value: "env=staging" } });
    act(() => {
      vi.runAllTimers();
    });

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("beta");
    vi.useRealTimers();
  });

  it("auto-mounts a Time range picker for kind:'timestamp' columns and filters by range", () => {
    type LogRow = { ts: string; service: string };
    const data: LogRow[] = [
      { ts: "2026-04-15T12:00:00Z", service: "api" },
      { ts: "2026-04-14T12:00:00Z", service: "worker" },
      { ts: "2026-04-08T12:00:00Z", service: "cron" },
    ];
    const cols: DataTableColumn<LogRow>[] = [
      {
        key: "ts",
        label: "Timestamp",
        kind: "timestamp",
        timestamp: { defaultRange: { from: "2026-04-13T00:00:00Z", to: "" } },
      },
      { key: "service", label: "Service" },
    ];

    render(<DataTable data={data} columns={cols} autoFilter />);

    expect(screen.getByRole("button", { name: /time range filter/i })).toBeInTheDocument();

    const rows = screen.getAllByRole("row").slice(1);
    // cron (Apr 8) is below the 'from' bound; api + worker remain.
    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining("api"),
      expect.stringContaining("worker"),
    ]);
  });

  it("defers to a user-supplied timeRange when one is provided via filterBarProps", () => {
    type LogRow = { ts: string; service: string };
    const data: LogRow[] = [{ ts: "2026-04-15T12:00:00Z", service: "api" }];
    const cols: DataTableColumn<LogRow>[] = [
      {
        key: "ts",
        label: "Timestamp",
        kind: "timestamp",
        timestamp: { defaultRange: { from: "2026-04-30T00:00:00Z" } },
      },
      { key: "service", label: "Service" },
    ];

    const onApply = vi.fn();
    render(
      <DataTable
        data={data}
        columns={cols}
        autoFilter
        filterBarProps={{
          timeRange: { from: "now-7d", to: "now", onApply },
        }}
      />,
    );

    // Auto-range was suppressed, so the row's timestamp isn't filtered out
    // even though the column's defaultRange would otherwise have excluded it.
    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(1);
  });

  it("renders the tag filter as a nested key→value submenu and narrows rows", () => {
    vi.useFakeTimers();
    type TagRow = { name: string; tags: string[] };
    const data: TagRow[] = [
      { name: "alpha", tags: ["env=prod", "tier=edge"] },
      { name: "beta", tags: ["env=staging", "tier=core"] },
      { name: "gamma", tags: ["env=prod", "tier=core"] },
    ];
    const cols: DataTableColumn<TagRow>[] = [
      { key: "name", label: "Name" },
      { key: "tags", label: "Tags", kind: "tags" },
    ];

    render(<DataTable data={data} columns={cols} autoFilter />);

    fireEvent.click(screen.getByRole("button", { name: /tags filter/i }));

    // The outer panel of the nested filter exposes its rows as role=button.
    const envGroup = screen.getByRole("button", { name: /^env$/ });
    const tierGroup = screen.getByRole("button", { name: /^tier$/ });
    expect(envGroup).toBeInTheDocument();
    expect(tierGroup).toBeInTheDocument();

    // Hover env to open the value sub-panel, then include `prod`.
    fireEvent.mouseEnter(envGroup);
    fireEvent.click(screen.getByRole("button", { name: /^prod$/ }));
    act(() => {
      vi.advanceTimersByTime(500);
    });

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining("alpha"),
      expect.stringContaining("gamma"),
    ]);

    vi.useRealTimers();
  });

  it("reveals +/-/copy icons in a hover card and the +/- buttons drive the filter pipeline", () => {
    vi.useFakeTimers();
    type TagRow = { name: string; tags: string[] };
    const data: TagRow[] = [
      { name: "alpha", tags: ["env=prod"] },
      { name: "beta", tags: ["env=staging"] },
    ];
    const cols: DataTableColumn<TagRow>[] = [
      { key: "name", label: "Name" },
      { key: "tags", label: "Tags", kind: "tags" },
    ];

    render(<DataTable data={data} columns={cols} autoFilter />);

    // The action icons live inside a hover card — not visible at rest.
    expect(screen.queryByRole("button", { name: /^Include env=prod$/ })).toBeNull();

    // Hover the prod tag's wrapper to open its action card.
    const prodTag = screen.getByText("prod").closest("span.relative");
    expect(prodTag).not.toBeNull();
    fireEvent.mouseEnter(prodTag!);
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Now the action toolbar is mounted.
    fireEvent.click(screen.getByRole("button", { name: /^Include env=prod$/ }));

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("alpha");

    // Toggle off (the active include pins the card open, so the button is
    // still in the DOM at this point).
    fireEvent.click(screen.getByRole("button", { name: /^Include env=prod$/ }));
    expect(screen.getAllByRole("row").slice(1)).toHaveLength(2);

    vi.useRealTimers();
  });

  it("accepts bare string columns as shorthand for {key, label}", () => {
    const data = [
      { name: "alpha", count: 1 },
      { name: "bravo", count: 2 },
    ];
    render(<DataTable data={data} columns={["name", "count"]} />);

    const table = within(screen.getByRole("table"));
    const headerRow = table.getAllByRole("row")[0];
    expect(within(headerRow).getByText("name")).toBeInTheDocument();
    expect(within(headerRow).getByText("count")).toBeInTheDocument();
    expect(table.getAllByRole("row")[1]).toHaveTextContent("alpha");
    expect(table.getAllByRole("row")[1]).toHaveTextContent("1");
    expect(table.getAllByRole("row")[2]).toHaveTextContent("bravo");
    expect(table.getAllByRole("row")[2]).toHaveTextContent("2");
  });

  it("mixes string columns with full DataTableColumn descriptors", () => {
    const data = [{ name: "alpha", count: 5 }];
    render(
      <DataTable
        data={data}
        columns={["name", { key: "count", label: "Count", align: "right" }]}
      />,
    );
    const headerRow = within(screen.getByRole("table")).getAllByRole("row")[0];
    expect(within(headerRow).getByText("name")).toBeInTheDocument();
    expect(within(headerRow).getByText("Count")).toBeInTheDocument();
  });
});
