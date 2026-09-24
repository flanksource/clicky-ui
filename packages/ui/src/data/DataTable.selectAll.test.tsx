import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataTable, type DataTableColumn } from "./DataTable";

type Row = { service: string; status: string };

const rows: Row[] = [
  { service: "api", status: "healthy" },
  { service: "cron", status: "healthy" },
  { service: "worker", status: "degraded" },
];

const columns: DataTableColumn<Row>[] = [
  { key: "service", label: "Service" },
  { key: "status", label: "Status" },
];

describe("DataTable rowSelection.selectAll", () => {
  it.each([
    ["false hides", false, 0],
    ["true keeps", true, 1],
    ["omitted keeps", undefined, 1],
  ] as const)("%s the header and group checkboxes", (_name, selectAll, expected) => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.service}
        grouping={{ getGroupKey: (row) => row.status }}
        rowSelection={{
          selectedRowIds: [],
          onSelectionChange: vi.fn(),
          ...(selectAll !== undefined ? { selectAll } : {}),
        }}
      />,
    );

    expect({
      header: screen.queryAllByRole("checkbox", { name: "Select all visible rows" }).length,
      groups: screen.queryAllByRole("checkbox", { name: /^Select group / }).length,
    }).toEqual({ header: expected, groups: expected * 2 });
  });

  it("still selects one row at a time through its own checkbox when selectAll is false", () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.service}
        grouping={{ getGroupKey: (row) => row.status }}
        rowSelection={{ selectedRowIds: [], onSelectionChange, selectAll: false }}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Select row cron" }));

    expect(onSelectionChange).toHaveBeenLastCalledWith(["cron"], [rows[1]]);
    // The selection column is still there, so group headers span it.
    expect(screen.getByRole("button", { name: /healthy/ }).closest("td")).toHaveAttribute(
      "colSpan",
      String(columns.length + 1),
    );
  });

  it("refuses selectAll: false together with selectAllPages", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() =>
        render(
          <DataTable
            data={rows}
            columns={columns}
            getRowId={(row) => row.service}
            rowSelection={{
              selectedRowIds: [],
              onSelectionChange: vi.fn(),
              selectAll: false,
              selectAllPages: { scopes: [{ id: "all", total: 3, onSelectAll: vi.fn() }] },
            }}
          />,
        ),
      ).toThrow(/selectAll: false and selectAllPages/);
    } finally {
      consoleError.mockRestore();
    }
  });
});
