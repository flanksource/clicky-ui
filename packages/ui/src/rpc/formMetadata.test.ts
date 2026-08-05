import { describe, expect, it } from "vitest";
import {
  dataTablePaginationFromForm,
  OFFSET_DEPTH_LIMIT,
  packParameterValues,
  parametersToFormConfig,
  type ParameterPagination,
} from "./formMetadata";

describe("packParameterValues", () => {
  it("keeps path params named even when they are described as positional", () => {
    expect(
      packParameterValues({ id: "stk-001", events: "3" }, [
        {
          name: "id",
          in: "path",
          description: "Positional argument from command",
          required: true,
        },
        {
          name: "events",
          in: "query",
        },
      ]),
    ).toEqual({
      id: "stk-001",
      events: "3",
    });
  });
});

describe("parametersToFormConfig", () => {
  it("uses explicit multi-filter lookup metadata for tri-state filter values", () => {
    const updates: Array<Record<string, string>> = [];
    const values = { status: "ready,!failed" };
    const config = parametersToFormConfig(
      [{ name: "status", in: "query" }],
      values,
      (updater) => {
        updates.push(typeof updater === "function" ? updater(values) : updater);
      },
      {
        lookup: {
          filters: {
            status: {
              label: "Status",
              type: "multi-filter",
              multi: true,
              options: {
                ready: { kind: "text", text: "Ready" },
                failed: { kind: "text", text: "Failed" },
              },
            },
          },
        },
      },
    );

    const filter = config.filters[0];
    expect(filter.kind).toBe("multi");
    if (filter.kind !== "multi") throw new Error("expected multi filter");

    expect(filter.value).toEqual({ ready: "include", failed: "exclude" });
    filter.onChange({ ready: "exclude", failed: "include" });

    expect(updates).toEqual([{ status: "!ready,failed" }]);
  });

  it("partitions limit/offset role parameters into pagination instead of filters", () => {
    const values = { limit: "50", offset: "0", name: "" };
    const config = parametersToFormConfig(
      [
        { name: "limit", in: "query", "x-clicky": { role: "limit" } },
        { name: "offset", in: "query", "x-clicky": { role: "offset" } },
        { name: "name", in: "query", "x-clicky": { role: "filter" } },
      ],
      values,
      () => {},
    );

    expect(config.pagination).toEqual({
      limitParam: "limit",
      offsetParam: "offset",
      limitValue: "50",
      offsetValue: "0",
      setLimit: expect.any(Function),
      setOffset: expect.any(Function),
    });
    expect(config.filters.map((f) => f.key)).toEqual(["name"]);
  });

  it("partitions the search role parameter into config.search instead of a filter", () => {
    const updates: Array<Record<string, string>> = [];
    const values = { q: "bolt", kind: "" };
    const config = parametersToFormConfig(
      [
        {
          name: "q",
          in: "query",
          description: "Search query",
          placeholder: "Search widgets…",
          "x-clicky": { role: "search" },
        },
        { name: "kind", in: "query", "x-clicky": { role: "filter" } },
      ],
      values,
      (updater) => {
        updates.push(typeof updater === "function" ? updater(values) : updater);
      },
    );

    expect(config.search?.value).toBe("bolt");
    // Placeholder is the explicit placeholder field, not the description.
    expect(config.search?.placeholder).toBe("Search widgets…");
    expect(config.filters.map((f) => f.key)).toEqual(["kind"]);

    config.search?.onChange("gasket");
    expect(updates).toEqual([{ q: "gasket", kind: "" }]);
  });

  it("omits the search placeholder when only a description is provided", () => {
    const values = { q: "" };
    const config = parametersToFormConfig(
      [
        {
          name: "q",
          in: "query",
          description: "Search query",
          "x-clicky": { role: "search" },
        },
      ],
      values,
      () => {},
    );

    expect(config.search?.placeholder).toBeUndefined();
  });

  it("partitions time-from/time-to role parameters into the time range", () => {
    const values = { since: "2024-01-01", to: "2024-12-31" };
    const config = parametersToFormConfig(
      [
        { name: "since", in: "query", "x-clicky": { role: "time-from" } },
        { name: "to", in: "query", "x-clicky": { role: "time-to" } },
      ],
      values,
      () => {},
    );

    expect(config.timeRange?.from).toBe("2024-01-01");
    expect(config.timeRange?.to).toBe("2024-12-31");
    expect(config.filters).toHaveLength(0);
  });

  it("passes time range lookup options through to the range control", () => {
    const values = { from: "", to: "" };
    const config = parametersToFormConfig(
      [
        { name: "from", in: "query" },
        { name: "to", in: "query" },
      ],
      values,
      () => {},
      {
        lookup: {
          filters: {
            from: {
              type: "from",
              presets: ["this", "last"],
              timeEnabled: true,
              timeZone: "Asia/Jerusalem",
              timeZones: ["Asia/Jerusalem", "UTC"],
            },
            to: { type: "to" },
          },
        },
      },
    );

    expect(config.timeRange?.presets).toEqual(["this", "last"]);
    expect(config.timeRange?.timeEnabled).toBe(true);
    expect(config.timeRange?.timeZone).toBe("Asia/Jerusalem");
    expect(config.timeRange?.timeZones).toEqual(["Asia/Jerusalem", "UTC"]);
  });

  it("partitions the cursor role parameter into pagination instead of a filter", () => {
    const values = { limit: "50", offset: "0", cursor: "eyJrIjoxfQ", name: "" };
    const config = parametersToFormConfig(
      [
        { name: "limit", in: "query", "x-clicky": { role: "limit" } },
        { name: "offset", in: "query", "x-clicky": { role: "offset" } },
        { name: "cursor", in: "query", "x-clicky": { role: "cursor" } },
        { name: "name", in: "query", "x-clicky": { role: "filter" } },
      ],
      values,
      () => {},
    );

    expect(config.pagination?.cursorParam).toBe("cursor");
    expect(config.pagination?.cursorValue).toBe("eyJrIjoxfQ");
    // A cursor is server-minted and opaque, so it is never a chip a user types
    // into.
    expect(config.filters.map((f) => f.key)).toEqual(["name"]);
  });

  // A cursor minted under the old filters is rejected by the server outright,
  // and an offset into the old rows names different rows in the new ones. Both
  // positions have to be dropped by the same mutation that changed the query.
  it("returns to the first page on every filter, search and time-range change", () => {
    const values = {
      limit: "50",
      offset: "100",
      cursor: "stale-token",
      name: "widget",
      q: "bolt",
      since: "2024-01-01",
      to: "2024-12-31",
    };
    const updates: Array<Record<string, string>> = [];
    const config = parametersToFormConfig(
      [
        { name: "limit", in: "query", "x-clicky": { role: "limit" } },
        { name: "offset", in: "query", "x-clicky": { role: "offset" } },
        { name: "cursor", in: "query", "x-clicky": { role: "cursor" } },
        { name: "name", in: "query", "x-clicky": { role: "filter" } },
        { name: "q", in: "query", "x-clicky": { role: "search" } },
        { name: "since", in: "query", "x-clicky": { role: "time-from" } },
        { name: "to", in: "query", "x-clicky": { role: "time-to" } },
      ],
      values,
      (updater) => {
        updates.push(typeof updater === "function" ? updater(values) : updater);
      },
    );

    const filter = config.filters[0];
    if (filter.kind !== "text") throw new Error("expected a text filter");
    filter.onChange("gasket");
    config.search?.onChange("nut");
    config.timeRange?.onApply("2025-01-01", "2025-06-30");

    expect(updates).toHaveLength(3);
    for (const update of updates) {
      expect(update.offset).toBe("0");
      expect(update.cursor).toBe("");
    }
    expect(updates[0].name).toBe("gasket");
    expect(updates[1].q).toBe("nut");
    expect(updates[2].since).toBe("2025-01-01");
  });
});

describe("dataTablePaginationFromForm", () => {
  const form = (overrides: Partial<ParameterPagination> = {}): ParameterPagination => ({
    limitParam: "limit",
    offsetParam: "offset",
    limitValue: "25",
    offsetValue: "0",
    setLimit: () => {},
    setOffset: () => {},
    ...overrides,
  });

  it("carries the server's own answers rather than inferring them from the page", () => {
    const table = dataTablePaginationFromForm(form(), {
      pagination: { total: 10_000, totalRelation: "gte", hasMore: true, limit: 25, offset: 0 },
    });

    expect(table?.total).toBe(10_000);
    expect(table?.totalRelation).toBe("gte");
    expect(table?.hasMore).toBe(true);
  });

  it("offers cursor mode only once there is a cursor to send it on", () => {
    const withoutParam = dataTablePaginationFromForm(form({ offsetValue: "20000" }), {
      pagination: { nextCursor: "next-token" },
    });
    expect(withoutParam?.cursor).toBeUndefined();

    const withParam = dataTablePaginationFromForm(
      form({ offsetValue: "20000", cursorParam: "cursor", setCursor: () => {} }),
      { pagination: { nextCursor: "next-token" } },
    );
    expect(withParam?.cursor).toEqual({
      next: "next-token",
      onCursorChange: expect.any(Function),
    });
  });

  // Page-number jumps are worth keeping while they still work, so the mode is
  // chosen by depth: shallow pages stay on offset, and the changeover happens
  // where the offset would be refused rather than wherever a cursor first
  // appeared.
  it("stays on offset until the next page would cross the depth limit", () => {
    const cursorForm = (offsetValue: string) =>
      form({ offsetValue, cursorParam: "cursor", setCursor: () => {} });

    const shallow = dataTablePaginationFromForm(cursorForm("0"), {
      pagination: { nextCursor: "next-token" },
    });
    expect(shallow?.cursor).toBeUndefined();

    const atBoundary = dataTablePaginationFromForm(
      cursorForm(String(OFFSET_DEPTH_LIMIT - 25)),
      { pagination: { nextCursor: "next-token" } },
    );
    expect(atBoundary?.cursor?.next).toBe("next-token");
  });

  // A walk already under way stays a walk: once the caller holds a cursor there
  // is no offset to fall back to, whatever depth the page happens to be at.
  it("keeps cursoring once a walk has started", () => {
    const table = dataTablePaginationFromForm(
      form({ cursorParam: "cursor", cursorValue: "current-token", setCursor: () => {} }),
      { pagination: { nextCursor: "next-token" } },
    );
    expect(table?.cursor?.current).toBe("current-token");
  });

  // A cursor and an offset are two disagreeing positions in one request, so
  // taking either one has to clear the other.
  it("drops the offset when a cursor is taken and the cursor when a page is jumped", () => {
    const offsets: string[] = [];
    const cursors: string[] = [];
    const table = dataTablePaginationFromForm(
      form({
        offsetValue: "50",
        cursorParam: "cursor",
        cursorValue: "current-token",
        setCursor: (next) => cursors.push(next),
        setOffset: (next) => offsets.push(next),
      }),
      { pagination: { nextCursor: "next-token" } },
    );

    table?.cursor?.onCursorChange("next-token");
    expect(offsets).toEqual(["0"]);
    expect(cursors).toEqual(["next-token"]);

    table?.onPageChange(3);
    expect(cursors).toEqual(["next-token", ""]);
    expect(offsets).toEqual(["0", "75"]);
  });

  // A cursor names a position in a page of the old size, so resizing invalidates
  // it and the walk restarts rather than resuming from a token that no longer
  // lines up with a page boundary.
  it("restarts the walk when the page size changes", () => {
    const cursors: string[] = [];
    const limits: string[] = [];
    const table = dataTablePaginationFromForm(
      form({
        cursorParam: "cursor",
        cursorValue: "current-token",
        setCursor: (next) => cursors.push(next),
        setLimit: (next) => limits.push(next),
      }),
      { pagination: { nextCursor: "next-token" } },
    );

    table?.onPageSizeChange(100);
    expect(limits).toEqual(["100"]);
    expect(cursors).toEqual([""]);
  });
});
