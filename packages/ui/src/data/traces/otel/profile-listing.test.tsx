import { describe, expect, it, vi } from "vitest";
import type { ClickyNode } from "../../Clicky";
import { profileListingSort, profileTraceListing } from "./profile-listing";

const table: ClickyNode = {
  kind: "table",
  columns: [
    { name: "operation", label: "Operation", sortKey: "op_sort" },
    { name: "service", label: "Service", filterKey: "filter.service", filterable: true },
    { name: "hidden", label: "Hidden", defaultHidden: true },
  ],
  rows: [{ cells: { operation: { kind: "text", text: "GET /", plain: "GET /" } } }],
};

describe("profileListingSort", () => {
  it("maps the server sort key back to its column and a header sort to the server key", () => {
    const onChange = vi.fn();
    const sorting = profileListingSort(table, { value: { key: "op_sort", dir: "asc" }, onChange });
    expect(sorting.sort).toEqual({ key: "operation", dir: "asc" });
    expect(sorting.manualSort).toBe(true);
    sorting.onSortChange({ key: "operation", dir: "desc" });
    expect(onChange).toHaveBeenCalledWith({ key: "op_sort", dir: "desc" });
    sorting.onSortChange(null);
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("has no sort while the server applies none", () => {
    expect(profileListingSort(table, { value: null, onChange: vi.fn() }).sort).toBeNull();
  });

  it("fails loudly when the server sorts by a key no column declares", () => {
    expect(() => profileListingSort(table, { value: { key: "nope", dir: "asc" }, onChange: vi.fn() })).toThrow(
      "Server sort key nope does not match a trace listing column",
    );
  });

  it("fails loudly when a clicked column has no server sort key", () => {
    const sorting = profileListingSort(table, { value: null, onChange: vi.fn() });
    expect(() => sorting.onSortChange({ key: "service", dir: "asc" })).toThrow(
      "Trace listing column service does not declare a server sort key",
    );
  });
});

describe("profileTraceListing", () => {
  const rows = [{ _trace: { spanId: "a" } }];

  it("pairs each row with its rendered cells and drops default-hidden columns", () => {
    const listing = profileTraceListing(rows, table);
    expect(listing.columns.map((column) => column.key)).toEqual(["operation", "service"]);
    expect(listing.columns.map((column) => column.sortable)).toEqual([true, false]);
    expect(listing.rows).toEqual([{ ...rows[0], _presentation: table.rows![0]!.cells }]);
  });

  it("only gives a column a server filter key when the table declares one", () => {
    const [operation, service] = profileTraceListing(rows, table).columns;
    expect(operation).not.toHaveProperty("filterKey");
    expect(service).toMatchObject({ filterKey: "filter.service", filterable: true });
  });

  it.each([
    { name: "is not a table", node: { kind: "text" } as ClickyNode },
    { name: "has no columns", node: { kind: "table", rows: table.rows } as ClickyNode },
    { name: "has a different row count", node: { ...table, rows: [] } as ClickyNode },
  ])("rejects a rendered node that $name", ({ node }) => {
    expect(() => profileTraceListing(rows, node)).toThrow("Trace listing requires a rendered table matching the span rows");
  });
});
