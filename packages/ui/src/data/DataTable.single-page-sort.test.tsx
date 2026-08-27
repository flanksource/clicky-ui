import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataTable, type DataTableColumn } from "./DataTable";

type Row = { service: string; restarts: number };

const rows: Row[] = [
  { service: "worker", restarts: 9 },
  { service: "api", restarts: 10 },
  { service: "cron", restarts: 2 },
];

const columns: DataTableColumn<Row>[] = [
  { key: "service", label: "Service", accessor: (row) => row.service },
  { key: "restarts", label: "Restarts", accessor: (row) => row.restarts },
];

function pagination(overrides: Record<string, unknown> = {}) {
  return {
    page: 0,
    pageSize: 25,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
    ...overrides,
  };
}

/** The header cell for a column, by its rendered label. */
function header(label: string): HTMLElement {
  return screen.getByText(label).closest("th") as HTMLElement;
}

function serviceColumn(): string[] {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0].textContent ?? "");
}

describe("DataTable sorting under server pagination", () => {
  it("leaves headers inert while other pages exist", () => {
    render(
      <DataTable<Row>
        data={rows}
        columns={columns}
        pagination={pagination({ hasMore: true })}
      />,
    );

    expect(within(header("Service")).queryByRole("button")).toBeNull();
  });

  it("leaves headers inert past the first page", () => {
    render(
      <DataTable<Row>
        data={rows}
        columns={columns}
        pagination={pagination({ page: 1, hasMore: false })}
      />,
    );

    expect(within(header("Service")).queryByRole("button")).toBeNull();
  });

  it("sorts client-side when the page holds the whole result", () => {
    render(
      <DataTable<Row>
        data={rows}
        columns={columns}
        pagination={pagination({ hasMore: false })}
      />,
    );

    const control = within(header("Service")).getByRole("button");
    fireEvent.click(control);

    expect(serviceColumn()).toEqual(["api", "cron", "worker"]);
  });

  it("reads an exact total as the end of the data", () => {
    render(
      <DataTable<Row>
        data={rows}
        columns={columns}
        pagination={pagination({ total: 3, totalRelation: "eq" })}
      />,
    );

    expect(within(header("Service")).queryByRole("button")).not.toBeNull();
  });

  it("reads a short page as the end of the data", () => {
    render(
      <DataTable<Row>
        data={rows}
        columns={columns}
        pagination={pagination({ pageSize: 25 })}
      />,
    );

    expect(within(header("Service")).queryByRole("button")).not.toBeNull();
  });

  it("does not read a full page as the end of the data", () => {
    render(
      <DataTable<Row>
        data={rows}
        columns={columns}
        pagination={pagination({ pageSize: 3, total: 3, totalRelation: "gte" })}
      />,
    );

    expect(within(header("Service")).queryByRole("button")).toBeNull();
  });

  it("defers to the server whenever the caller wired a sort through", () => {
    const onSortChange = vi.fn();
    render(
      <DataTable<Row>
        data={rows}
        columns={columns}
        sort={null}
        onSortChange={onSortChange}
        pagination={pagination({ hasMore: true })}
      />,
    );

    fireEvent.click(within(header("Service")).getByRole("button"));
    expect(onSortChange).toHaveBeenCalledWith({ key: "service", dir: "asc" });
  });
});
