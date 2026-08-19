import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, vi } from "vitest";
import { DataTable, type DataTableColumn } from "./DataTable";
import { RouterProvider } from "../rpc/RouterProvider";
import type { RouterAdapter } from "../rpc/router";

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
    render: (value) =>
      Array.isArray(value) ? value.join(", ") : String(value ?? ""),
    filterValue: (value) => (Array.isArray(value) ? value : []),
  },
];

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

function mockFilterBarWidths(listWidth: number, itemWidth = 112) {
  const original = HTMLElement.prototype.getBoundingClientRect;
  return vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockImplementation(function () {
      if (this instanceof HTMLElement) {
        if (this.hasAttribute("data-filter-bar-list")) return rect(listWidth);
        if (this.hasAttribute("data-filter-bar-item")) return rect(itemWidth);
        if (this.getAttribute("aria-label") === "More filters") return rect(44);
      }
      return original.call(this);
    });
}

describe("DataTable", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the table frame on the shared background surface", () => {
    render(<DataTable data={rows} columns={columns} />);

    expect(screen.getByRole("table").parentElement).toHaveClass("bg-background");
  });

  it("sorts columns by default and toggles the sort order", () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        defaultSort={{ key: "restarts" }}
      />,
    );

    const table = within(screen.getByRole("table"));
    expect(table.getAllByRole("row")[1]).toHaveTextContent("api");

    fireEvent.click(screen.getByRole("button", { name: /restarts/i }));

    expect(table.getAllByRole("row")[1]).toHaveTextContent("worker");
    expect(table.getAllByRole("row")[2]).toHaveTextContent("cron");
  });

  it("supports controlled multi-row selection on entity tables", () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.service}
        rowSelection={{
          selectedRowIds: [],
          onSelectionChange,
          isRowSelectable: (row) => row.service !== "worker",
          toggleOnRowClick: true,
        }}
      />,
    );

    expect(
      screen.getByRole("checkbox", { name: "Select row worker" }),
    ).toBeDisabled();
    fireEvent.click(screen.getByText("api"));
    expect(onSelectionChange).toHaveBeenLastCalledWith(["api"], [rows[0]]);

    fireEvent.click(
      screen.getByRole("checkbox", { name: "Select all visible rows" }),
    );
    expect(onSelectionChange).toHaveBeenLastCalledWith(
      ["api", "cron"],
      [rows[0], rows[2]],
    );
  });

  it("renders selectionActions only while rows are selected", () => {
    const onSelectionChange = vi.fn();
    const { rerender } = render(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.service}
        rowSelection={{ selectedRowIds: [], onSelectionChange }}
        selectionActions={({ selectedRows, clearSelection }) => (
          <button type="button" onClick={clearSelection}>
            Clear {selectedRows.map((row) => row.service).join(", ")}
          </button>
        )}
      />,
    );

    expect(screen.queryByTestId("data-table-selection-actions")).toBeNull();

    rerender(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.service}
        rowSelection={{ selectedRowIds: ["api", "cron"], onSelectionChange }}
        selectionActions={({ selectedRows, clearSelection }) => (
          <button type="button" onClick={clearSelection}>
            Clear {selectedRows.map((row) => row.service).join(", ")}
          </button>
        )}
      />,
    );

    const bar = within(screen.getByTestId("data-table-selection-actions"));
    fireEvent.click(bar.getByRole("button", { name: "Clear api, cron" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith([], []);
  });

  it("applies getRowClassName to the matching row", () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowClassName={(row) =>
          row.restarts > 0 ? "stale-row" : "fresh-row"
        }
      />,
    );

    const bodyRows = within(screen.getByRole("table")).getAllByRole("row");
    expect(bodyRows[1]).toHaveClass("fresh-row");
    expect(bodyRows[2]).toHaveClass("stale-row");
  });

  it("replaces the default row-count strip with the footer slot", () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        footer={({ visibleRowCount, totalRowCount }) =>
          `Showing ${visibleRowCount} of ${totalRowCount} services`
        }
      />,
    );

    expect(screen.getByText("Showing 3 of 3 services")).toBeInTheDocument();
    expect(screen.queryByText("3 of 3 rows")).toBeNull();
  });

  it("introduces each group with a full-width header that collapses its rows", () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.service}
        grouping={{
          getGroupKey: (row) => row.status,
          getGroupLabel: (key) => `Status: ${key}`,
          getGroupMeta: (_key, groupRows) => `${groupRows.length} services`,
        }}
      />,
    );

    const header = screen.getByRole("button", { name: /Status: healthy/ });
    const headerCell = header.closest("td");
    expect(headerCell).toHaveAttribute(
      "colSpan",
      String(columns.length),
    );
    expect(headerCell).toHaveTextContent("2 services");
    expect(header).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("api")).toBeInTheDocument();
    expect(screen.getByText("cron")).toBeInTheDocument();

    fireEvent.click(header);

    expect(header).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("api")).not.toBeInTheDocument();
    expect(screen.queryByText("cron")).not.toBeInTheDocument();
    // Collapsing one group leaves the others rendered.
    expect(screen.getByText("worker")).toBeInTheDocument();
  });

  // The summary is always the label's next sibling; what moves it to the
  // trailing edge is the label growing to fill the row. So the class is the
  // behaviour here, not an implementation detail standing in for it.
  it("stops the group label filling the row when metaAlign is start, so the summary sits next to it", () => {
    const grouping = {
      getGroupKey: (row: ServiceRow) => row.status,
      getGroupLabel: (key: string) => `Status: ${key}`,
      getGroupMeta: (_key: string, groupRows: ServiceRow[]) =>
        `${groupRows.length} services`,
    };

    const { rerender } = render(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.service}
        grouping={{ ...grouping, metaAlign: "start", metaClassName: "font-mono" }}
      />,
    );

    const label = screen.getByRole("button", { name: /Status: healthy/ });
    expect(label).not.toHaveClass("flex-1");
    expect(label.nextElementSibling).toHaveTextContent("2 services");
    expect(label.nextElementSibling).toHaveClass("font-mono");

    rerender(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.service}
        grouping={grouping}
      />,
    );

    expect(screen.getByRole("button", { name: /Status: healthy/ })).toHaveClass(
      "flex-1",
    );
  });

  it("selects only the selectable rows of the group whose header checkbox is toggled", () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.service}
        grouping={{ getGroupKey: (row) => row.status }}
        rowSelection={{
          selectedRowIds: [],
          onSelectionChange,
          isRowSelectable: (row) => row.service !== "cron",
        }}
      />,
    );

    // The selection column widens every group header by one.
    expect(
      screen.getByRole("button", { name: /healthy/ }).closest("td"),
    ).toHaveAttribute("colSpan", String(columns.length + 1));

    fireEvent.click(screen.getByRole("checkbox", { name: "Select group healthy" }));

    expect(onSelectionChange).toHaveBeenLastCalledWith(["api"], [rows[0]]);
  });

  it("orders groups by compareGroups and starts matching groups collapsed", () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.service}
        grouping={{
          getGroupKey: (row) => row.status,
          compareGroups: (a, b) => a.key.localeCompare(b.key),
          defaultCollapsed: (key) => key === "degraded",
        }}
      />,
    );

    const groupHeaders = screen
      .getAllByRole("button")
      .filter((button) => button.hasAttribute("aria-expanded"));
    expect(groupHeaders.map((button) => button.textContent)).toEqual([
      "degraded1",
      "healthy2",
    ]);
    expect(screen.queryByText("worker")).not.toBeInTheDocument();
    expect(screen.getByText("api")).toBeInTheDocument();
  });

  it("reports controlled manual sort without reordering the current page", () => {
    const onSortChange = vi.fn();
    render(
      <DataTable
        data={rows}
        columns={columns}
        sort={{ key: "restarts", dir: "asc" }}
        onSortChange={onSortChange}
        manualSort
      />,
    );

    const table = within(screen.getByRole("table"));
    expect(table.getAllByRole("row")[1]).toHaveTextContent("api");
    expect(table.getAllByRole("row")[2]).toHaveTextContent("worker");
    expect(table.getAllByRole("row")[3]).toHaveTextContent("cron");

    fireEvent.click(screen.getByRole("button", { name: /restarts/i }));

    expect(onSortChange).toHaveBeenCalledWith({ key: "restarts", dir: "desc" });
    expect(table.getAllByRole("row")[1]).toHaveTextContent("api");
    expect(table.getAllByRole("row")[2]).toHaveTextContent("worker");
    expect(table.getAllByRole("row")[3]).toHaveTextContent("cron");
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

  it("keeps the table shell visible when a filter matches no rows", () => {
    vi.useFakeTimers();
    render(<DataTable data={rows} columns={columns} autoFilter />);

    fireEvent.change(screen.getByPlaceholderText("Search all columns…"), {
      target: { value: "not-a-real-service" },
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByRole("table")).toBeInTheDocument();
    // Header row + the empty-state row.
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getByText("0 of 3 rows")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("renders the empty message when client filtering removes every row", () => {
    vi.useFakeTimers();
    render(
      <DataTable
        data={rows}
        columns={columns}
        autoFilter
        emptyMessage="No matching records"
      />,
    );

    expect(screen.queryByText("No matching records")).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search all columns…"), {
      target: { value: "not-a-real-service" },
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByText("No matching records")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("keeps the table shell visible with empty source data", () => {
    render(<DataTable data={[]} columns={columns} emptyMessage="No matching records" />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /service/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getByText("No matching records")).toBeInTheDocument();
    expect(screen.getByText("0 of 0 rows")).toBeInTheDocument();
  });

  it("renders an accessible table error instead of rows and table actions", () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        error={<span>Plan selection is ambiguous</span>}
        pagination={{
          page: 0,
          pageSize: 10,
          total: rows.length,
          onPageChange: vi.fn(),
          onPageSizeChange: vi.fn(),
        }}
        getRowId={(row) => row.service}
        rowSelection={{
          selectedRowIds: ["api"],
          onSelectionChange: vi.fn(),
        }}
        selectionActions={() => <button type="button">Restart selected</button>}
      />,
    );

    const table = within(screen.getByRole("table"));
    expect(
      table.getByRole("columnheader", { name: /service/i }),
    ).toBeInTheDocument();
    expect(table.getByRole("alert")).toHaveTextContent(
      "Plan selection is ambiguous",
    );
    expect(table.getAllByRole("row")).toHaveLength(2);
    expect(screen.queryByText("api")).not.toBeInTheDocument();
    expect(screen.queryByText("Restart selected")).not.toBeInTheDocument();
    expect(screen.queryByText("Page 1 of 1")).not.toBeInTheDocument();
  });

  // Column widths sized for rows that are no longer rendered stretch the table
  // past the viewport, taking the error's own copy and expand controls with it.
  it("stops sizing columns while an error replaces the rows", () => {
    const sized: DataTableColumn<ServiceRow>[] = [
      { key: "service", label: "Service", grow: true },
      { key: "status", label: "Status", shrink: true },
    ];
    const { rerender, container } = render(
      <DataTable data={rows} columns={sized} getRowId={(row) => row.service} />,
    );
    expect(
      Array.from(container.querySelectorAll("col")).map((col) => col.className),
    ).toEqual(["", "w-px"]);

    rerender(
      <DataTable
        data={rows}
        columns={sized}
        getRowId={(row) => row.service}
        error={<span>Plan selection is ambiguous</span>}
      />,
    );

    const onError = Array.from(container.querySelectorAll("col"));
    expect(onError.map((col) => col.className)).toEqual(["", ""]);
    expect(onError.map((col) => col.getAttribute("style"))).toEqual([
      null,
      null,
    ]);
  });

  it("renders native server pagination controls", () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    const pageRows: ServiceRow[] = Array.from({ length: 5 }, (_, index) => ({
      service: `service-${index + 6}`,
      status: "healthy",
      restarts: index,
      notes: "Paged result",
      tags: [],
    }));

    render(
      <DataTable
        data={pageRows}
        columns={columns}
        pagination={{
          page: 1,
          pageSize: 5,
          total: 14,
          onPageChange,
          onPageSizeChange,
        }}
      />,
    );

    expect(screen.getByText("6-10 of 14")).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageChange).toHaveBeenCalledWith(0);

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(2);

    fireEvent.change(screen.getByLabelText("Rows per page"), {
      target: { value: "10" },
    });
    expect(onPageSizeChange).toHaveBeenCalledWith(10);
  });

  // Sorting one page of a server-paged result reorders that page alone, which
  // reads as a sort of the whole table and is not one.
  it("disables the header sort under server paging unless the sort is server-backed", () => {
    const paged = {
      page: 0,
      pageSize: 5,
      total: 100,
      onPageChange: vi.fn(),
      onPageSizeChange: vi.fn(),
    };
    const view = render(<DataTable data={rows} columns={columns} pagination={paged} />);
    expect(screen.queryByRole("button", { name: /service/i })).not.toBeInTheDocument();

    // A caller that wired the sort to the server gets the header back, because
    // then it sorts the whole result rather than the page.
    const onSortChange = vi.fn();
    view.rerender(
      <DataTable
        data={rows}
        columns={columns}
        pagination={paged}
        manualSort
        sort={null}
        onSortChange={onSortChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /service/i }));
    expect(onSortChange).toHaveBeenCalledWith({ key: "service", dir: "asc" });
  });

  // A total the backend could only bound is a lower bound, and rendering it as
  // a count states a number nobody promised — including the page count derived
  // from it, which is why the jump target disappears with it.
  it("renders an approximate total as a bound and drops the page count", () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        pagination={{
          page: 0,
          pageSize: 5,
          total: 10000,
          totalRelation: "gte",
          onPageChange: vi.fn(),
          onPageSizeChange: vi.fn(),
        }}
      />,
    );

    expect(screen.getByText(/of ~10000\+/)).toBeInTheDocument();
    expect(screen.queryByText(/Page 1 of/)).not.toBeInTheDocument();
  });

  // A short page and the end of the data are different facts, and only the
  // server knows which one happened.
  it("keeps Next enabled on a short page the server says has more", () => {
    render(
      <DataTable
        data={rows.slice(0, 2)}
        columns={columns}
        pagination={{
          page: 0,
          pageSize: 25,
          hasMore: true,
          onPageChange: vi.fn(),
          onPageSizeChange: vi.fn(),
        }}
      />,
    );

    expect(screen.getByRole("button", { name: "Next page" })).not.toBeDisabled();
  });

  describe("cursor pagination", () => {
    const cursorTable = (
      cursor: { current?: string; next?: string },
      onCursorChange = vi.fn(),
    ) => {
      const view = render(
        <DataTable
          data={rows}
          columns={columns}
          pagination={{
            page: 0,
            pageSize: 5,
            total: 10000,
            totalRelation: "gte",
            cursor: { ...cursor, onCursorChange },
            onPageChange: vi.fn(),
            onPageSizeChange: vi.fn(),
          }}
        />,
      );
      return { view, onCursorChange };
    };

    it("steps forward on the cursor the server minted", () => {
      const { onCursorChange } = cursorTable({ next: "page-2" });

      expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
      fireEvent.click(screen.getByRole("button", { name: "Next page" }));
      expect(onCursorChange).toHaveBeenCalledWith("page-2");
    });

    // A cursor points forward only, so Previous is a position the client
    // already visited — the first page is the one it returns to from page two.
    it("returns to the first page from the second", () => {
      const onCursorChange = vi.fn();
      const { view } = cursorTable({ next: "page-2" }, onCursorChange);

      fireEvent.click(screen.getByRole("button", { name: "Next page" }));
      view.rerender(
        <DataTable
          data={rows}
          columns={columns}
          pagination={{
            page: 0,
            pageSize: 5,
            cursor: { current: "page-2", next: "page-3", onCursorChange },
            onPageChange: vi.fn(),
            onPageSizeChange: vi.fn(),
          }}
        />,
      );

      const previous = screen.getByRole("button", { name: "Previous page" });
      expect(previous).not.toBeDisabled();
      fireEvent.click(previous);
      expect(onCursorChange).toHaveBeenLastCalledWith(undefined);
    });

    // The end of a cursor walk is the absence of a next cursor, not a short
    // page: there is no token to ask the server to resume from.
    it("stops at the page with no next cursor", () => {
      cursorTable({ current: "page-2" });
      expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    });
  });

  it("renders caller menu actions in the table menu", () => {
    const exportPdf = vi.fn();

    render(
      <DataTable
        data={rows}
        columns={columns}
        hideableColumns={false}
        showDensityControl
        menuActions={[
          {
            id: "pdf",
            label: "PDF",
            onSelect: exportPdf,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    const menu = screen.getByRole("menu", { name: /column menu/i });

    const densityItem = within(menu).getByRole("menuitemradio", {
      name: /use page density/i,
    });
    const downloadHeader = within(menu).getByText("Download");
    const actionItem = within(menu).getByRole("menuitem", { name: /pdf/i });

    expect(downloadHeader).toBeInTheDocument();
    expect(actionItem).toBeInTheDocument();
    expect(
      Boolean(
        densityItem.compareDocumentPosition(downloadHeader) &
        Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true);
    expect(
      Boolean(
        densityItem.compareDocumentPosition(actionItem) &
        Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true);
    expect(
      within(menu).queryByText("Portable document"),
    ).not.toBeInTheDocument();

    fireEvent.click(actionItem);
    expect(exportPdf).toHaveBeenCalledTimes(1);
  });

  it("opens a submenu for a menu action with children rather than listing them", () => {
    const chooseJson = vi.fn();
    const parent = vi.fn();

    render(
      <DataTable
        data={rows}
        columns={columns}
        hideableColumns={false}
        menuActions={[
          {
            id: "view",
            label: "View: Clicky",
            section: "",
            onSelect: parent,
            children: [
              { id: "view-clicky", label: "Clicky", disabled: true, onSelect: vi.fn() },
              { id: "view-json", label: "JSON", onSelect: chooseJson },
            ],
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    const menu = screen.getByRole("menu", { name: /column menu/i });

    // The children stay behind the trigger — that is the whole point of a
    // submenu, and what keeps a dozen formats from burying the rows below them.
    expect(
      within(menu).queryByRole("menuitem", { name: "JSON" }),
    ).not.toBeInTheDocument();

    const trigger = within(menu).getByRole("menuitem", { name: /^View: Clicky/ });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");

    // Hovering past the row must not open it: a flyout nobody asked for covers
    // the rows they were reaching for.
    fireEvent.mouseEnter(trigger);
    expect(
      screen.queryByRole("menu", { name: "View: Clicky" }),
    ).not.toBeInTheDocument();

    fireEvent.click(trigger);

    // A trigger opens its flyout instead of firing its own onSelect.
    expect(parent).not.toHaveBeenCalled();
    const submenu = screen.getByRole("menu", { name: "View: Clicky" });
    expect(
      within(submenu).getByRole("menuitem", { name: "Clicky" }),
    ).toBeDisabled();

    // Clicking the trigger again closes it, so the same gesture undoes itself.
    fireEvent.click(trigger);
    expect(
      screen.queryByRole("menu", { name: "View: Clicky" }),
    ).not.toBeInTheDocument();
    fireEvent.click(trigger);

    fireEvent.click(
      within(screen.getByRole("menu", { name: "View: Clicky" })).getByRole(
        "menuitem",
        { name: "JSON" },
      ),
    );
    expect(chooseJson).toHaveBeenCalledTimes(1);
    // Choosing a child closes the whole menu, both levels with it.
    expect(
      screen.queryByRole("menu", { name: /column menu/i }),
    ).not.toBeInTheDocument();
  });

  it("renders an initial loading state inside the table shell", () => {
    render(
      <DataTable
        data={[]}
        columns={columns}
        loading
        loadingMessage="Loading execution results..."
        loadingRowCount={3}
      />,
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /service/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Loading execution results...")).toHaveLength(2);
    expect(screen.getByRole("table").parentElement).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getAllByRole("row")).toHaveLength(5);
  });

  it("keeps rows visible with a top-border loading bar while refetching", () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        loading
        loadingMessage="Refreshing…"
        pagination={{
          page: 0,
          pageSize: 2,
          total: 2,
          onPageSizeChange: vi.fn(),
        }}
      />,
    );

    // Existing rows stay rendered instead of being swapped for skeleton rows.
    expect(screen.getByText("api")).toBeInTheDocument();
    expect(screen.getByText("worker")).toBeInTheDocument();
    // The indeterminate bar rides the table's top border.
    expect(screen.getByTestId("data-table-loading-bar")).toBeInTheDocument();
    // Refetching has one loading affordance: the bar. The stable page range is
    // more useful than replacing it with a second loading message.
    expect(screen.queryByText("Refreshing…")).not.toBeInTheDocument();
    expect(screen.getByText("1-2 of 2")).toBeInTheDocument();
  });

  it("renders each row as a real stretched anchor and routes plain clicks client-side", () => {
    const navigate = vi.fn();
    const adapter: RouterAdapter = {
      pathname: "/",
      navigate,
      renderLink: ({ to, className, children }) => (
        <a
          href={to}
          className={className}
          onClick={(event) => {
            event.preventDefault();
            navigate(to);
          }}
        >
          {children}
        </a>
      ),
    };

    render(
      <RouterProvider adapter={adapter}>
        <DataTable
          data={rows}
          columns={columns}
          getRowHref={(row) => `/services/${row.service}`}
        />
      </RouterProvider>,
    );

    // A real <a href> — so right-click / middle-click "open in new tab" works.
    const link = screen.getByRole("link", { name: "api" });
    expect(link).toHaveAttribute("href", "/services/api");
    // Its ::after overlay stretches the clickable area across the whole row.
    expect(link).toHaveClass("after:inset-0");

    // A plain left-click routes client-side (no hard navigation).
    fireEvent.click(link);
    expect(navigate).toHaveBeenCalledWith("/services/api");
  });

  it("keeps cell-filter buttons outside the row link so both stay activatable", () => {
    vi.useFakeTimers();
    const navigate = vi.fn();
    const onCellFilterChange = vi.fn();
    const adapter: RouterAdapter = {
      pathname: "/",
      navigate,
      renderLink: ({ to, className, children }) => (
        <a
          href={to}
          className={className}
          onClick={(event) => {
            event.preventDefault();
            navigate(to);
          }}
        >
          {children}
        </a>
      ),
    };

    render(
      <RouterProvider adapter={adapter}>
        <DataTable
          data={[{ service: "payments" }]}
          columns={[
            { key: "service", label: "Service", filterKey: "filter.service" },
          ]}
          getRowHref={(row) => `/services/${row.service}`}
          onCellFilterChange={onCellFilterChange}
        />
      </RouterProvider>,
    );

    fireEvent.mouseEnter(screen.getByText("payments").closest("span.relative")!);
    act(() => vi.advanceTimersByTime(150));

    const link = screen.getByRole("link", { name: "payments" });
    const include = screen.getByRole("button", { name: "Include payments" });

    // Nested interactive controls are invalid HTML and break keyboard
    // activation of both the filter button and the row link.
    expect(link.contains(include)).toBe(false);
    expect(include.closest("a")).toBeNull();

    // The link's stretched ::after overlay paints over the cell, so the hover
    // trigger that reveals the buttons has to be lifted above it.
    const elevated = link.querySelector(".z-10");
    expect(elevated).not.toBeNull();
    expect(elevated).toHaveTextContent("payments");

    fireEvent.click(include);
    expect(onCellFilterChange).toHaveBeenCalledWith({
      key: "filter.service",
      value: "payments",
      mode: "include",
    });
    expect(navigate).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("generates multi-select and text filters automatically", () => {
    vi.useFakeTimers();
    render(<DataTable data={rows} columns={columns} autoFilter />);

    expect(document.querySelector("[data-filter-bar-list]")).not.toHaveClass(
      "overflow-hidden",
    );

    fireEvent.focus(screen.getByRole("combobox", { name: "Status" }));
    const healthyFilter = document.querySelector(
      '[data-filter-option="healthy"]',
    );
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

  it("uses responsive overflow for generated filter-bar filters", async () => {
    const measurement = mockFilterBarWidths(260);
    render(<DataTable data={rows} columns={columns} autoFilter />);

    expect(
      await screen.findByRole("button", { name: /more filters/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /more filters/i }));
    expect(
      screen.getByRole("dialog", { name: /overflow filters/i }),
    ).toBeInTheDocument();

    measurement.mockRestore();
  });

  it("exposes generated filters from column headers", () => {
    vi.useFakeTimers();
    render(<DataTable data={rows} columns={columns} autoFilter />);

    const statusFilterButton = screen.getByRole("button", {
      name: /open status column filter/i,
    });
    expect(statusFilterButton).toHaveAttribute("aria-pressed", "false");
    expect(
      statusFilterButton.querySelector('[data-filter-icon-state="outline"]'),
    ).not.toBeNull();

    fireEvent.click(statusFilterButton);
    const healthyFilter = document.querySelector(
      '[data-filter-option="healthy"]',
    );
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

    expect(statusFilterButton).toHaveAttribute("aria-pressed", "true");
    expect(
      statusFilterButton.querySelector('[data-filter-icon-state="filled"]'),
    ).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /clear all/i }));
    expect(statusFilterButton).toHaveAttribute("aria-pressed", "false");
    expect(
      statusFilterButton.querySelector('[data-filter-icon-state="outline"]'),
    ).not.toBeNull();
    vi.useRealTimers();
  });

  it("embeds header filter controls without duplicate panel chrome", () => {
    render(<DataTable data={rows} columns={columns} autoFilter />);

    fireEvent.click(
      screen.getByRole("button", { name: /open status column filter/i }),
    );

    const dialog = screen.getByRole("dialog", {
      name: /status column filter/i,
    });
    expect(within(dialog).getAllByText("Status")).toHaveLength(1);
    expect(within(dialog).getAllByText("Clear all")).toHaveLength(1);
    expect(
      within(dialog).getByRole("button", { name: /close column filter/i }),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("button", { name: /^close$/i }),
    ).not.toBeInTheDocument();
    expect(
      dialog.querySelector('[data-filter-panel-chrome="embedded"]'),
    ).toBeInTheDocument();
    expect(
      dialog.querySelector('[data-filter-panel-chrome="full"]'),
    ).not.toBeInTheDocument();
  });

  it("exposes number filters from column headers", () => {
    vi.useFakeTimers();
    render(<DataTable data={rows} columns={columns} autoFilter />);

    fireEvent.click(
      screen.getByRole("button", { name: /open restarts column filter/i }),
    );
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
      "w-full",
      "min-w-0",
      "truncate",
    );
    expect(screen.getAllByText("healthy")[0].closest("td")).toHaveStyle({
      maxWidth: "256px",
    });
  });

  // A cap on the content truncates against empty space once the column is wider
  // than the cap, so every cap sits on the cell: it bounds what the column asks
  // for without clipping what the column is finally given.
  it("caps the cell rather than its content, so text fills the width the column gets", () => {
    const sized: DataTableColumn<ServiceRow>[] = [
      { key: "service", label: "Service", grow: true, minWidth: 360 },
      { key: "status", label: "Status", shrink: true },
      { key: "notes", label: "Notes" },
      { key: "restarts", label: "Restarts", maxWidth: 400 },
    ];
    render(<DataTable data={rows} columns={sized} />);

    // A grow column asks for nothing and lives on the leftover width.
    expect(screen.getByText("api").closest("td")).toHaveStyle({
      maxWidth: "0px",
      minWidth: "360px",
    });
    expect(screen.getAllByText("healthy")[0].closest("td")).toHaveStyle({
      maxWidth: "256px",
    });
    expect(screen.getByText("Production API service").closest("td")).toHaveStyle(
      { maxWidth: "288px" },
    );
    expect(screen.getByText("0").closest("td")).toHaveStyle({
      maxWidth: "400px",
    });
    // Nothing left on the content to stop it filling the cell.
    for (const text of ["api", "healthy", "Production API service", "0"]) {
      expect(screen.getAllByText(text)[0]).not.toHaveAttribute("style");
      expect(screen.getAllByText(text)[0].className).not.toMatch(/max-w-/);
    }
  });

  it("uses max-content auto table layout without handle padding by default", () => {
    render(<DataTable data={rows} columns={columns} />);

    expect(screen.getByRole("table")).toHaveClass(
      "w-max",
      "min-w-full",
      "table-auto",
    );
    expect(screen.getByRole("table")).not.toHaveClass("w-full");
    expect(screen.getByRole("table").parentElement).toHaveClass(
      "min-h-0",
      "max-w-full",
      "flex-1",
      "overflow-auto",
      "overscroll-x-contain",
    );
    expect(screen.getByRole("columnheader", { name: /service/i })).toHaveClass(
      "whitespace-nowrap",
    );
    expect(
      screen.getByRole("columnheader", { name: /service/i }),
    ).not.toHaveClass("pr-5");
  });

  it("keeps the table body scrollable while the header and pagination stay visible", () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();

    render(
      <DataTable
        className="h-full"
        data={rows}
        columns={columns}
        pagination={{
          page: 0,
          pageSize: 3,
          total: 3,
          onPageChange,
          onPageSizeChange,
        }}
      />,
    );

    const table = screen.getByRole("table");
    const scrollBody = table.parentElement;
    const shell = scrollBody?.parentElement;
    const header = screen
      .getByRole("columnheader", { name: /service/i })
      .closest("thead");
    const footer = screen.getByText("1-3 of 3").parentElement;

    expect(shell).toHaveClass("flex", "min-h-0", "flex-1", "flex-col");
    expect(scrollBody).toHaveClass("min-h-0", "flex-1", "overflow-auto");
    expect(header).toHaveClass("sticky", "top-0");
    expect(footer).toHaveClass("shrink-0");
  });

  it("uses distinct table row padding for compact and spacious density", () => {
    render(<DataTable data={rows} columns={columns} density="compact" />);

    expect(
      screen.getByRole("table").closest('[data-density="compact"]'),
    ).not.toBeNull();
    expect(screen.getByRole("columnheader", { name: /service/i })).toHaveClass(
      "density-compact:py-1",
      "density-spacious:py-3",
    );
    expect(screen.getAllByText("api")[0]?.closest("td")).toHaveClass(
      "density-compact:py-0.5",
      "density-spacious:py-3",
    );
  });

  it("renders column resize handles by default", () => {
    render(<DataTable data={rows} columns={columns} />);

    expect(
      screen.getAllByRole("separator", { name: /resize .* column/i }),
    ).toHaveLength(columns.length);
  });

  it("updates column width when dragging a resize handle", () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        columnResizeStorageKey="clicky-ui-test-widths-drag"
      />,
    );

    fireEvent.mouseDown(
      screen.getByRole("separator", { name: /resize service column/i }),
      {
        clientX: 100,
      },
    );
    fireEvent.mouseMove(document, { clientX: 180 });
    fireEvent.mouseUp(document);

    expect(document.querySelector("col")?.getAttribute("style")).toContain(
      "width: 304px",
    );
  });

  it("adapts cell truncation width when a column is resized", () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        columnResizeStorageKey="clicky-ui-test-widths-cell-content"
      />,
    );

    fireEvent.mouseDown(
      screen.getByRole("separator", { name: /resize notes column/i }),
      {
        clientX: 100,
      },
    );
    fireEvent.mouseMove(document, { clientX: 400 });
    fireEvent.mouseUp(document);

    const notesContent = screen.getByText("Production API service");
    // The resized width is what the column asks for now, replacing the default
    // cap; the content still fills whatever the column ends up with.
    expect(notesContent.closest("td")).toHaveStyle({ maxWidth: "524px" });
    expect(notesContent).not.toHaveAttribute("style");
  });

  it("auto-fits a column when double-clicking a resize handle", () => {
    const storageKey = "clicky-ui-test-widths-autofit";
    render(
      <DataTable
        data={rows}
        columns={columns}
        columnResizeStorageKey={storageKey}
      />,
    );

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

    fireEvent.doubleClick(
      screen.getByRole("separator", { name: /resize notes column/i }),
    );

    const notesCol = document.querySelectorAll("col")[3];
    expect(notesCol?.getAttribute("style")).toContain("width: 360px");
    expect(window.localStorage.getItem(storageKey)).toBe(
      JSON.stringify({ notes: 360 }),
    );
  });

  it("clamps resized widths to column minWidth and maxWidth", () => {
    render(
      <DataTable
        data={rows}
        columns={[
          { ...columns[0], minWidth: 120, maxWidth: 240 },
          ...columns.slice(1),
        ]}
        columnResizeStorageKey="clicky-ui-test-widths-clamp"
      />,
    );

    const handle = screen.getByRole("separator", {
      name: /resize service column/i,
    });
    fireEvent.mouseDown(handle, { clientX: 100 });
    fireEvent.mouseMove(document, { clientX: 1000 });
    fireEvent.mouseUp(document);

    expect(document.querySelector("col")?.getAttribute("style")).toContain(
      "width: 240px",
    );

    fireEvent.mouseDown(handle, { clientX: 100 });
    fireEvent.mouseMove(document, { clientX: -1000 });
    fireEvent.mouseUp(document);

    expect(document.querySelector("col")?.getAttribute("style")).toContain(
      "width: 120px",
    );
  });

  it("persists resized widths to localStorage and restores them on remount", () => {
    const storageKey = "clicky-ui-test-widths-persist";
    const { unmount } = render(
      <DataTable
        data={rows}
        columns={columns}
        columnResizeStorageKey={storageKey}
      />,
    );

    fireEvent.mouseDown(
      screen.getByRole("separator", { name: /resize service column/i }),
      {
        clientX: 100,
      },
    );
    fireEvent.mouseMove(document, { clientX: 140 });
    fireEvent.mouseUp(document);

    expect(window.localStorage.getItem(storageKey)).toBe(
      JSON.stringify({ service: 264 }),
    );

    unmount();
    render(
      <DataTable
        data={rows}
        columns={columns}
        columnResizeStorageKey={storageKey}
      />,
    );

    expect(document.querySelector("col")?.getAttribute("style")).toContain(
      "width: 264px",
    );
  });

  it("hides a column from the header context menu and persists the choice", () => {
    const storageKey = "clicky-ui-test-column-visibility-context";
    render(
      <DataTable
        data={rows}
        columns={columns}
        columnVisibilityStorageKey={storageKey}
      />,
    );

    fireEvent.contextMenu(
      screen.getByRole("columnheader", { name: /notes/i }),
      {
        clientX: 120,
        clientY: 80,
      },
    );
    fireEvent.click(screen.getByRole("menuitem", { name: /hide notes/i }));

    expect(
      screen.queryByRole("columnheader", { name: /notes/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Production API service"),
    ).not.toBeInTheDocument();
    expect(window.localStorage.getItem(storageKey)).toBe(
      JSON.stringify({ notes: true }),
    );
  });

  it("keeps generated filters available when their columns are hidden", () => {
    vi.useFakeTimers();
    const storageKey = "clicky-ui-test-hidden-column-filters";
    window.localStorage.setItem(storageKey, JSON.stringify({ status: true }));

    render(
      <DataTable
        data={rows}
        columns={columns}
        autoFilter
        columnVisibilityStorageKey={storageKey}
      />,
    );

    expect(
      screen.queryByRole("columnheader", { name: /status/i }),
    ).not.toBeInTheDocument();
    const statusFilterInput = screen.getByRole("combobox", { name: "Status" });

    fireEvent.focus(statusFilterInput);
    const degradedFilter = document.querySelector(
      '[data-filter-option="degraded"]',
    );
    if (!degradedFilter) {
      throw new Error("Expected degraded filter option");
    }
    fireEvent.click(degradedFilter);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByText("worker")).toBeInTheDocument();
    expect(screen.queryByText("api")).not.toBeInTheDocument();
    expect(screen.queryByText("cron")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("restores hidden columns from localStorage and can show them from the column menu", () => {
    const storageKey = "clicky-ui-test-column-visibility-menu";
    window.localStorage.setItem(storageKey, JSON.stringify({ notes: true }));

    const { unmount } = render(
      <DataTable
        data={rows}
        columns={columns}
        columnVisibilityStorageKey={storageKey}
      />,
    );

    expect(
      screen.queryByRole("columnheader", { name: /notes/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /notes/i }));

    expect(
      screen.getByRole("columnheader", { name: /notes/i }),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem(storageKey)).toBeNull();

    unmount();
    render(
      <DataTable
        data={rows}
        columns={columns}
        columnVisibilityStorageKey={storageKey}
      />,
    );

    expect(
      screen.getByRole("columnheader", { name: /notes/i }),
    ).toBeInTheDocument();
  });

  it("does not expose non-hideable columns as removable", () => {
    render(
      <DataTable
        data={rows}
        columns={[{ ...columns[0], hideable: false }, ...columns.slice(1)]}
      />,
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

    expect(
      screen.getByRole("columnheader", { name: /notes/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /open column menu/i }),
    ).not.toBeInTheDocument();
  });

  it("overrides table density from the column menu and persists the choice", () => {
    const storageKey = "clicky-ui-test-density-override";
    const { unmount } = render(
      <DataTable
        data={rows}
        columns={columns}
        densityStorageKey={storageKey}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: /compact/i }));

    expect(
      screen.getByRole("table").closest('[data-density="compact"]'),
    ).not.toBeNull();
    expect(window.localStorage.getItem(storageKey)).toBe("compact");

    unmount();
    render(
      <DataTable
        data={rows}
        columns={columns}
        densityStorageKey={storageKey}
      />,
    );

    expect(
      screen.getByRole("table").closest('[data-density="compact"]'),
    ).not.toBeNull();
  });

  it("can clear table density back to the page density", () => {
    const storageKey = "clicky-ui-test-density-clear";
    window.localStorage.setItem(storageKey, "spacious");

    render(
      <DataTable
        data={rows}
        columns={columns}
        densityStorageKey={storageKey}
      />,
    );

    expect(
      screen.getByRole("table").closest('[data-density="spacious"]'),
    ).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    fireEvent.click(
      screen.getByRole("menuitemradio", { name: /use page density/i }),
    );

    expect(screen.getByRole("table").closest("[data-density]")).toBeNull();
    expect(window.localStorage.getItem(storageKey)).toBeNull();
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

    fireEvent.mouseDown(
      screen.getByRole("separator", { name: /resize service column/i }),
      {
        clientX: 100,
      },
    );
    fireEvent.mouseMove(document, { clientX: 140 });
    fireEvent.mouseUp(document);

    expect(document.querySelector("col")?.getAttribute("style")).toContain(
      "width: 264px",
    );
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });

  it("can disable all resize handles", () => {
    render(
      <DataTable data={rows} columns={columns} resizableColumns={false} />,
    );

    expect(
      screen.queryByRole("separator", { name: /resize .* column/i }),
    ).not.toBeInTheDocument();
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
    expect(
      screen.getByRole("separator", { name: /resize status column/i }),
    ).toBeInTheDocument();
  });

  it("keeps sorting independent from resize handles", () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        defaultSort={{ key: "restarts" }}
      />,
    );

    const table = within(screen.getByRole("table"));
    fireEvent.click(
      screen.getByRole("separator", { name: /resize restarts column/i }),
    );

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
    expect(screen.queryByText("Quick ranges")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Time range from"), {
      target: { value: "now-1h" },
    });
    fireEvent.change(screen.getByLabelText("Time range to"), {
      target: { value: "now" },
    });
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

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
    expect(
      within(rows[0]!).getByRole("img", { name: "ERROR" }),
    ).toBeInTheDocument();
    expect(
      within(rows[1]!).getByRole("img", { name: "ok" }),
    ).toBeInTheDocument();
    expect(
      within(rows[2]!).getByRole("img", { name: "warning" }),
    ).toBeInTheDocument();
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

  it("auto-mounts a Time range picker for kind:'timestamp' columns under autoFilter", () => {
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

    expect(
      screen.getByRole("button", { name: /time range filter/i }),
    ).toBeInTheDocument();

    const rows = screen.getAllByRole("row").slice(1);
    // cron (Apr 8) is below the 'from' bound; api + worker remain.
    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining("api"),
      expect.stringContaining("worker"),
    ]);

    fireEvent.click(
      screen.getByRole("button", { name: /open timestamp column filter/i }),
    );
    const dialog = screen.getByRole("dialog", {
      name: /time range column filter/i,
    });
    fireEvent.click(within(dialog).getByRole("button", { name: /clear all/i }));

    const clearedRows = screen.getAllByRole("row").slice(1);
    expect(clearedRows).toHaveLength(3);
    expect(clearedRows.map((row) => row.textContent)).toEqual([
      expect.stringContaining("api"),
      expect.stringContaining("worker"),
      expect.stringContaining("cron"),
    ]);
  });

  it("resolves the auto range through the column accessor, not the raw row path", () => {
    // A clicky result's row is { cells: { <name>: ClickyNode } } and the column
    // addresses it as "cells.<name>" with an accessor. Reading the path
    // directly hands the range a node object rather than a timestamp, which
    // parses to null and silently drops every row.
    type Cell = { plain: string };
    type ClickyRow = { cells: Record<string, Cell> };
    const cell = (plain: string): Cell => ({ plain });
    const data: ClickyRow[] = [
      { cells: { ts: cell("2026-04-15T12:00:00Z"), service: cell("api") } },
      { cells: { ts: cell("2026-04-08T12:00:00Z"), service: cell("cron") } },
    ];
    const cols: DataTableColumn<ClickyRow>[] = [
      {
        key: "cells.ts",
        label: "Timestamp",
        kind: "timestamp",
        accessor: (row) => row.cells.ts,
        sortValue: (value) => (value as Cell).plain,
        filterValue: (value) => (value as Cell).plain,
        timestamp: { defaultRange: { from: "2026-04-13T00:00:00Z", to: "" } },
      },
      {
        key: "cells.service",
        label: "Service",
        accessor: (row) => row.cells.service,
        render: (value) => (value as Cell).plain,
        filterValue: (value) => (value as Cell).plain,
      },
    ];

    render(<DataTable data={data} columns={cols} autoFilter />);

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("api");
  });

  it("leaves rows alone and mounts no client time range when autoFilter is off", () => {
    type LogRow = { ts: string; service: string };
    const data: LogRow[] = [
      { ts: "2026-04-15T12:00:00Z", service: "api" },
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

    render(<DataTable data={data} columns={cols} />);

    expect(
      screen.queryByRole("button", { name: /time range filter/i }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("row").slice(1)).toHaveLength(2);
  });

  it("hoists the timestamp column's server date-range into the bar's range slot", () => {
    type LogRow = { ts: string; service: string };
    const data: LogRow[] = [
      { ts: "2026-04-15T12:00:00Z", service: "api" },
      { ts: "2026-04-08T12:00:00Z", service: "cron" },
    ];
    const cols: DataTableColumn<LogRow>[] = [
      {
        key: "ts",
        label: "Timestamp",
        kind: "timestamp",
        filterKey: "filter.ts",
        // A default the source has already applied. The bar must show it
        // without re-applying it to rows the source already answered with.
        timestamp: { defaultRange: { from: "2026-04-13T00:00:00Z", to: "" } },
      },
      { key: "service", label: "Service", filterKey: "filter.service" },
    ];

    const onApply = vi.fn();
    render(
      <DataTable
        data={data}
        columns={cols}
        externalFilters={[
          {
            key: "filter.ts",
            kind: "date-range",
            label: "Timestamp",
            from: "now-7d",
            to: "now",
            onApply,
          },
        ]}
      />,
    );

    // One control for one filter: the range lives in the bar's trailing slot,
    // not also as a chip among the filters.
    expect(
      screen.getAllByRole("button", { name: /time range filter/i }),
    ).toHaveLength(1);
    expect(
      screen.queryByRole("button", { name: /^timestamp filter$/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /time range filter/i }));
    fireEvent.change(screen.getByLabelText("Time range from"), {
      target: { value: "now-30d" },
    });
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    expect(onApply).toHaveBeenCalledWith("now-30d", "now");
    // The source owns filtering, so nothing was narrowed locally.
    expect(screen.getAllByRole("row").slice(1)).toHaveLength(2);
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
    expect(
      screen.queryByRole("button", { name: /^Include env=prod$/ }),
    ).toBeNull();

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

  it("sends scalar hover actions through the controlled server-filter contract", () => {
    vi.useFakeTimers();
    const onCellFilterChange = vi.fn();
    render(
      <DataTable
        data={[{ service: "payments" }]}
        columns={[
          {
            key: "service",
            label: "Service",
            filterKey: "filter.service",
          },
        ]}
        cellFilters={{ "filter.service": { payments: "exclude" } }}
        onCellFilterChange={onCellFilterChange}
      />,
    );

    fireEvent.mouseEnter(screen.getByText("payments").closest("span.relative")!);
    act(() => vi.advanceTimersByTime(150));

    expect(screen.getByRole("button", { name: "Exclude payments" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "Include payments" }));
    expect(onCellFilterChange).toHaveBeenCalledWith({
      key: "filter.service",
      value: "payments",
      mode: "include",
    });
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

  describe("compact-mode tag rendering and body-only theme", () => {
    type TagRow = { name: string; labels: Record<string, string> };

    const tagRows: TagRow[] = [
      { name: "api", labels: { env: "prod", region: "us-east-1" } },
    ];

    const tagColumns: DataTableColumn<TagRow>[] = [
      { key: "name", label: "Name" },
      { key: "labels", label: "Labels", kind: "tags" },
    ];

    it("hides tag keys inline when density is compact (keys still in tooltip)", () => {
      render(
        <DataTable
          data={tagRows}
          columns={tagColumns}
          defaultDensity="compact"
          theme="light"
        />,
      );

      const labelsCell = screen.getByText("prod").closest("td") as HTMLElement;
      // value-only badges in compact: 'env' / 'region' don't appear as text inside the cell.
      expect(within(labelsCell).queryByText("env")).toBeNull();
      expect(within(labelsCell).queryByText("region")).toBeNull();
      expect(within(labelsCell).getByText("prod")).toBeInTheDocument();
      expect(within(labelsCell).getByText("us-east-1")).toBeInTheDocument();

      // tag.display ("env=prod") is preserved as a tooltip on the outer
      // badge wrapper so users can still see the key on hover. Walk up
      // ancestors until we hit a title containing "=".
      let node: HTMLElement | null = within(labelsCell).getByText("prod");
      let foundDisplay: string | null = null;
      while (node) {
        const t = node.getAttribute("title");
        if (t && t.includes("=")) {
          foundDisplay = t;
          break;
        }
        node = node.parentElement;
      }
      expect(foundDisplay).toBe("env=prod");
    });

    it("renders key=value inline when density is comfortable (default)", () => {
      render(<DataTable data={tagRows} columns={tagColumns} theme="light" />);

      const labelsCell = screen.getByText("prod").closest("td") as HTMLElement;
      expect(within(labelsCell).getByText("env")).toBeInTheDocument();
      expect(within(labelsCell).getByText("region")).toBeInTheDocument();
      expect(within(labelsCell).getByText("prod")).toBeInTheDocument();
      expect(within(labelsCell).getByText("us-east-1")).toBeInTheDocument();
    });
  });

  describe("row detail (renderExpandedRow)", () => {
    const renderDetail = (row: ServiceRow) => (
      <div>Detail for {row.service}</div>
    );

    it("expands an inline detail row by default (detailStyle omitted)", () => {
      render(
        <DataTable
          data={rows}
          columns={columns}
          renderExpandedRow={renderDetail}
        />,
      );

      expect(screen.queryByText("Detail for api")).not.toBeInTheDocument();

      fireEvent.click(screen.getByText("api"));

      const detail = screen.getByText("Detail for api");
      expect(detail).toBeInTheDocument();
      // Inline style renders the detail inside the table, not in a dialog.
      expect(detail.closest('[role="dialog"]')).toBeNull();
      expect(detail.closest("table")).not.toBeNull();
    });

    it("opens the detail in a dialog when detailStyle is 'dialog'", () => {
      render(
        <DataTable
          data={rows}
          columns={columns}
          detailStyle="dialog"
          detailDialogTitle={(row) => `Service ${row.service}`}
          renderExpandedRow={renderDetail}
        />,
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      fireEvent.click(screen.getByText("worker"));

      const dialog = screen.getByRole("dialog", { name: /service worker/i });
      expect(within(dialog).getByText("Detail for worker")).toBeInTheDocument();
      // Dialog style does NOT also render an inline detail row in the table.
      const detail = within(dialog).getByText("Detail for worker");
      expect(detail.closest("table")).toBeNull();
    });
  });
});

describe("DataTable caller-owned FilterBar inputs", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders externalSearch and externalFilters in the same bar as the column menu", () => {
    const onSearch = vi.fn<(value: string) => void>();
    render(
      <DataTable
        data={rows}
        columns={columns}
        externalSearch={{
          value: "",
          onChange: onSearch,
          placeholder: "Search query",
        }}
        externalFilters={[
          {
            key: "kind",
            kind: "enum",
            label: "Kind",
            value: "",
            options: [
              { value: "big", label: "big" },
              { value: "small", label: "small" },
            ],
            onChange: () => {},
          },
        ]}
      />,
    );

    const search = screen.getByPlaceholderText("Search query");
    const kind = screen.getByRole("combobox", { name: "Kind" });
    const columnMenu = screen.getByRole("button", {
      name: /open column menu/i,
    });

    // The FilterBar root is the parent of the [data-filter-bar-list] container;
    // search, the Kind filter, and the column menu all live inside that one bar.
    const filterList = document.querySelector("[data-filter-bar-list]");
    const bar = filterList?.parentElement;
    expect(bar).not.toBeNull();
    expect(bar).toContainElement(search);
    expect(bar).toContainElement(kind);
    expect(bar).toContainElement(columnMenu);
  });

  it("does not filter rows client-side when externalSearch changes", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn<(value: string) => void>();
    render(
      <DataTable
        data={rows}
        columns={columns}
        externalSearch={{
          value: "",
          onChange: onSearch,
          placeholder: "Search query",
        }}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search query"), {
      target: { value: "nothing-matches" },
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // The caller owns the query (server-side); rows are untouched locally.
    expect(onSearch).toHaveBeenCalledWith("nothing-matches");
    expect(screen.getByText("api")).toBeInTheDocument();
    expect(screen.getByText("worker")).toBeInTheDocument();
    expect(screen.getByText("cron")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("prefers externalSearch over the built-in global search input", () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        autoFilter
        externalSearch={{
          value: "",
          onChange: () => {},
          placeholder: "Search query",
        }}
      />,
    );

    expect(screen.getByPlaceholderText("Search query")).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("Search all columns…"),
    ).not.toBeInTheDocument();
  });

  it("reads cell value and sort key from a column accessor", () => {
    type SqlRow = Record<string, unknown>;
    // Keys a SQL result set can produce that a dotted-path resolver would
    // misread: "a.b" (literal, not nested) and "" (unnamed column).
    const sqlRows: SqlRow[] = [
      { "a.b": "alpha", "": 2 },
      { "a.b": "bravo", "": 1 },
    ];
    const sqlColumns: DataTableColumn<SqlRow>[] = [
      { key: "label", label: "Dotted", accessor: (row) => row["a.b"] },
      {
        key: "count",
        label: "Count",
        accessor: (row) => row[""],
        sortValue: (value) => Number(value ?? 0),
      },
    ];

    render(
      <DataTable
        data={sqlRows}
        columns={sqlColumns}
        defaultSort={{ key: "count" }}
      />,
    );

    const table = within(screen.getByRole("table"));
    // Accessor drives both rendering (the dotted key resolves to a value
    // instead of undefined) and sorting (ascending by the unnamed count).
    expect(table.getAllByRole("row")[1]).toHaveTextContent("bravo");
    expect(table.getAllByRole("row")[2]).toHaveTextContent("alpha");
  });

  it("incrementally reveals rows on scroll when clientReveal is set", () => {
    let latestCallback: IntersectionObserverCallback | null = null;
    class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        latestCallback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const manyRows: ServiceRow[] = Array.from({ length: 25 }, (_, index) => ({
      service: `svc-${index}`,
      status: "healthy",
      restarts: index,
      notes: "",
      tags: [],
    }));

    render(
      <DataTable
        data={manyRows}
        columns={columns}
        clientReveal={{ batchSize: 10 }}
        defaultSort={{ key: "restarts" }}
      />,
    );

    // Only the first batch is rendered; a sentinel advertises more.
    expect(screen.getByText("svc-0")).toBeInTheDocument();
    expect(screen.queryByText("svc-10")).not.toBeInTheDocument();
    expect(screen.getByText("Loading more…")).toBeInTheDocument();

    // Scrolling the sentinel into view reveals the next batch.
    act(() => {
      latestCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(screen.getByText("svc-10")).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  describe("server-driven infinite scroll", () => {
    // The mock stands in for the browser's observer: it records the callback the
    // table registered so a test can deliver intersections deliberately, one at
    // a time or in the burst a real scroll produces.
    let latestCallback: IntersectionObserverCallback | null = null;

    class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        latestCallback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }

    function intersect(times = 1) {
      act(() => {
        for (let index = 0; index < times; index += 1) {
          latestCallback?.(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            {} as IntersectionObserver,
          );
        }
      });
    }

    function pageRows(from: number, count: number): ServiceRow[] {
      return Array.from({ length: count }, (_, index) => ({
        service: `svc-${from + index}`,
        status: "healthy",
        restarts: from + index,
        notes: "",
        tags: [],
      }));
    }

    beforeEach(() => {
      latestCallback = null;
      vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("asks for exactly one page however many intersections a scroll delivers", () => {
      const onLoadMore = vi.fn();

      render(
        <DataTable
          data={pageRows(0, 3)}
          columns={columns}
          infinite={{ hasMore: true, loading: false, onLoadMore }}
        />,
      );

      expect(screen.getByText("Scroll to load more…")).toBeInTheDocument();

      intersect(4);

      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it("stays silent while the page it already asked for is in flight", () => {
      const onLoadMore = vi.fn();

      render(
        <DataTable
          data={pageRows(0, 3)}
          columns={columns}
          infinite={{ hasMore: true, loading: true, onLoadMore }}
        />,
      );

      expect(screen.getByText("Loading more…")).toBeInTheDocument();

      intersect(3);

      expect(onLoadMore).not.toHaveBeenCalled();
    });

    it("withdraws the sentinel once the server says nothing follows", () => {
      const onLoadMore = vi.fn();

      render(
        <DataTable
          data={pageRows(0, 3)}
          columns={columns}
          infinite={{ hasMore: false, loading: false, onLoadMore }}
        />,
      );

      expect(screen.queryByText(/load more/i)).not.toBeInTheDocument();
      intersect(2);
      expect(onLoadMore).not.toHaveBeenCalled();
    });

    it("asks again only after the page it requested has landed", () => {
      const onLoadMore = vi.fn();
      const infinite = { hasMore: true, loading: false, onLoadMore };

      const view = render(
        <DataTable data={pageRows(0, 3)} columns={columns} infinite={infinite} />,
      );

      intersect(2);
      expect(onLoadMore).toHaveBeenCalledTimes(1);

      // The request is in flight: the burst that follows must not duplicate it.
      view.rerender(
        <DataTable
          data={pageRows(0, 3)}
          columns={columns}
          infinite={{ ...infinite, loading: true }}
        />,
      );
      intersect(2);
      expect(onLoadMore).toHaveBeenCalledTimes(1);

      // The page landed and the rows grew, so the next intersection is a new
      // request rather than a repeat of the one already answered.
      view.rerender(
        <DataTable data={pageRows(0, 6)} columns={columns} infinite={infinite} />,
      );
      intersect(1);
      expect(onLoadMore).toHaveBeenCalledTimes(2);
    });

    it("keeps every accumulated row on screen instead of windowing them", () => {
      // clientReveal windows rows the caller already holds; under infinite
      // scroll the caller owns the accumulation, so the window would hide rows
      // it just paid the server for.
      render(
        <DataTable
          data={pageRows(0, 25)}
          columns={columns}
          clientReveal={{ batchSize: 10 }}
          infinite={{ hasMore: true, loading: false, onLoadMore: vi.fn() }}
        />,
      );

      expect(screen.getByText("svc-0")).toBeInTheDocument();
      expect(screen.getByText("svc-24")).toBeInTheDocument();
    });

    it("drops the pager step controls but keeps the count and the page size", () => {
      const onPageSizeChange = vi.fn();

      render(
        <DataTable
          data={pageRows(0, 50)}
          columns={columns}
          pagination={{
            page: 1,
            pageSize: 25,
            total: 140,
            onPageChange: vi.fn(),
            onPageSizeChange,
          }}
          infinite={{ hasMore: true, loading: false, onLoadMore: vi.fn() }}
        />,
      );

      expect(screen.queryByRole("button", { name: "Previous page" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Next page" })).not.toBeInTheDocument();
      expect(screen.queryByText(/^Page /)).not.toBeInTheDocument();

      // The accumulated run starts at the top, not at the offset the most
      // recent page happened to be fetched from.
      expect(screen.getByText("1-50 of 140")).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText("Rows per page"), {
        target: { value: "50" },
      });
      expect(onPageSizeChange).toHaveBeenCalledWith(50);
    });
  });

  it("exposes the scrollable region through scrollContainerRef", () => {
    const ref = createRef<HTMLDivElement>();

    render(<DataTable data={rows} columns={columns} scrollContainerRef={ref} />);

    expect(ref.current).not.toBeNull();
    expect(ref.current).toHaveClass("overflow-auto");
    expect(ref.current).toContainElement(screen.getByRole("table"));
  });

  it("hands scrollContainerRef to whichever copy of the table is on screen", async () => {
    // Fullscreen renders a second table inside a modal while the first stays
    // mounted behind it. If both wrote the ref, the last one mounted would win
    // and closing the modal would null it — leaving a caller that pins a live
    // tail scrolling an element nobody is looking at.
    const ref = createRef<HTMLDivElement>();

    render(
      <DataTable
        data={rows}
        columns={columns}
        scrollContainerRef={ref}
        showFullscreenControl
        fullscreenTitle="Logs"
      />,
    );
    const inline = ref.current;
    expect(inline).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /full screen/i }));
    const dialog = await screen.findByRole("dialog");
    expect(ref.current).not.toBe(inline);
    expect(dialog).toContainElement(ref.current);

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(ref.current).toBe(inline));
  });
});
