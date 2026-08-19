import { describe, expect, it } from "vitest";
import type { SetStateAction } from "react";
import {
  dataTablePaginationFromForm,
  OFFSET_DEPTH_LIMIT,
  packLookupParameterValues,
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

  it("drops a value the operation declares no parameter for", () => {
    // Filter state outlives a surface — the explorer seeds it from the URL and
    // carries it across routes. Forwarding another surface's `filter.*` makes
    // the server reject the whole request ("column filter is not supported by
    // profile"), so the table shows an error instead of the rows it has.
    expect(
      packParameterValues({ "filter.tenant": "acme", "filter.stale": "x" }, [
        { name: "filter.tenant", in: "query" },
      ]),
    ).toEqual({ "filter.tenant": "acme" });
  });
});

describe("packLookupParameterValues", () => {
  it("excludes pagination roles while preserving lookup context and positional arguments", () => {
    expect(
      packLookupParameterValues(
        {
          pageSize: "50",
          startAt: "100",
          resumeFrom: "opaque-cursor",
          status: "ready",
          query: "api",
          target: "payments",
        },
        [
          { name: "pageSize", in: "query", "x-clicky": { role: "limit" } },
          { name: "startAt", in: "query", "x-clicky": { role: "offset" } },
          { name: "resumeFrom", in: "query", "x-clicky": { role: "cursor" } },
          { name: "status", in: "query", "x-clicky": { role: "filter" } },
          { name: "query", in: "query", "x-clicky": { role: "search" } },
          {
            name: "target",
            in: "query",
            description: "Positional argument from command",
          },
        ],
      ),
    ).toEqual({ status: "ready", query: "api", args: "payments" });
  });
});

describe("parametersToFormConfig", () => {
  it("maps sort roles to controlled server sorting and rewinds both paging modes", () => {
    let values: Record<string, string> = {
      sortBy: "updated",
      direction: "desc",
      startAt: "50",
      resumeFrom: "opaque-cursor",
    };
    const setValues = (update: SetStateAction<Record<string, string>>) => {
      values = typeof update === "function" ? update(values) : update;
    };
    const parameters = [
      { name: "sortBy", in: "query", "x-clicky": { role: "sort" } },
      { name: "direction", in: "query", "x-clicky": { role: "order" } },
      { name: "startAt", in: "query", "x-clicky": { role: "offset" } },
      { name: "resumeFrom", in: "query", "x-clicky": { role: "cursor" } },
    ];

    const config = parametersToFormConfig(parameters, values, setValues);
    expect(config.filters).toEqual([]);
    expect(config.sort?.value).toEqual({ key: "updated", dir: "desc" });

    config.sort?.onChange({ key: "name", dir: "asc" });
    expect(values).toEqual({
      sortBy: "name",
      direction: "asc",
      startAt: "0",
      resumeFrom: "",
    });

    config.sort?.onChange(null);
    expect(values).toEqual({ startAt: "0", resumeFrom: "" });
  });

  it("maps a workload lookup to the shared Kubernetes workload picker", async () => {
    const values = { workload: "payments/Deployment/api" };
    const config = parametersToFormConfig(
      [{ name: "workload", in: "query" }],
      values,
      () => {},
      {
        lookup: {
          filters: {
            workload: {
              label: "Workload",
              type: "workload",
              options: {
                "payments/Deployment/api": { kind: "text", text: "api" },
                "platform/DaemonSet/agent": { kind: "text", text: "agent" },
              },
            },
          },
        },
      },
    );

    const filter = config.filters[0];
    expect(filter.kind).toBe("workload");
    if (filter.kind !== "workload") throw new Error("expected workload filter");
    await expect(
      filter.loadWorkloads(["deployment", "daemonset"]),
    ).resolves.toEqual({
      deployment: [{ name: "api", namespace: "payments" }],
      daemonset: [{ name: "agent", namespace: "platform" }],
    });
  });

  it("groups generic Kubernetes labels and keeps explicit label-key values flat", () => {
    const config = parametersToFormConfig(
      [
        { name: "labels", in: "query" },
        { name: "applications", in: "query" },
      ],
      { labels: "app=api,!tier=worker", applications: "api,!worker" },
      () => {},
      {
        lookup: {
          filters: {
            labels: {
              label: "Labels",
              type: "labels",
              options: {
                "app=api": { kind: "text", text: "api" },
                "tier=worker": { kind: "text", text: "worker" },
              },
            },
            applications: {
              label: "Applications",
              type: "labels",
              options: {
                api: { kind: "text", text: "api" },
                worker: { kind: "text", text: "worker" },
              },
            },
          },
        },
      },
    );

    const grouped = config.filters[0];
    expect(grouped.kind).toBe("nested-multi");
    if (grouped.kind !== "nested-multi")
      throw new Error("expected grouped labels");
    expect(grouped.groups.map((group) => group.groupKey)).toEqual([
      "app",
      "tier",
    ]);
    expect(grouped.value).toEqual({
      "app=api": "include",
      "tier=worker": "exclude",
    });

    const explicit = config.filters[1];
    expect(explicit.kind).toBe("multi");
    if (explicit.kind !== "multi")
      throw new Error("expected explicit label values");
    expect(explicit.value).toEqual({ api: "include", worker: "exclude" });
  });

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

  // Both edges under one parameter, which is how a column filter carries a time
  // bound — unlike the from/to pair above, which is two parameters.
  it("builds a range control from a single date-range parameter", () => {
    const updates: Array<Record<string, string>> = [];
    const values = { "filter.updated_at": ">=2026-01-01,<=2026-02-01" };
    const config = parametersToFormConfig(
      [{ name: "filter.updated_at", in: "query" }],
      values,
      (updater) => {
        updates.push(typeof updater === "function" ? updater(values) : updater);
      },
      {
        lookup: {
          filters: {
            "filter.updated_at": {
              label: "Updated At",
              type: "date-range",
              multi: true,
            },
          },
        },
      },
    );

    const filter = config.filters[0];
    expect(filter).toMatchObject({
      kind: "date-range",
      label: "Updated At",
      from: "2026-01-01",
      to: "2026-02-01",
    });
    // The bar's own trailing range stays free: this one is a filter among the
    // filters, so a surface can carry several.
    expect(config.timeRange).toBeUndefined();

    if (filter.kind !== "date-range")
      throw new Error(`unexpected kind ${filter.kind}`);
    filter.onApply("now-7d", "now");
    expect(updates[0]["filter.updated_at"]).toBe(">=now-7d,<=now");
  });

  // A generated control whose absence is not a sensible query — Kubernetes log
  // reads default to the last hour — declares its bound in the schema. An empty
  // range control over a bounded query would state the wrong query.
  it("shows a date-range parameter's declared default when nothing is selected", () => {
    const values = { time: "" };
    const config = parametersToFormConfig(
      [
        {
          name: "time",
          in: "query",
          schema: { type: "string", default: ">=now-1h" },
        },
      ],
      values,
      () => {},
      { lookup: { filters: { time: { label: "Time", type: "date-range" } } } },
    );

    expect(config.filters[0]).toMatchObject({
      kind: "date-range",
      label: "Time",
      from: "now-1h",
    });
  });

  it("prefers a selected range over the declared default", () => {
    const values = { time: ">=now-15m,<=now" };
    const config = parametersToFormConfig(
      [
        {
          name: "time",
          in: "query",
          schema: { type: "string", default: ">=now-1h" },
        },
      ],
      values,
      () => {},
      { lookup: { filters: { time: { label: "Time", type: "date-range" } } } },
    );

    expect(config.filters[0]).toMatchObject({
      kind: "date-range",
      from: "now-15m",
      to: "now",
    });
  });

  // A UUID column: exact values, nothing to enumerate. `multi` stays true on the
  // wire because the grammar still takes several, but the control is typed —
  // without the "value" type this fell through to a comma-joined lookup-multi.
  it("renders an exact-value filter with nothing to enumerate as a text input", () => {
    const updates: Array<Record<string, string>> = [];
    const values = { "filter.id": "" };
    const config = parametersToFormConfig(
      [{ name: "filter.id", in: "query" }],
      values,
      (updater) => {
        updates.push(typeof updater === "function" ? updater(values) : updater);
      },
      {
        lookup: {
          filters: { "filter.id": { label: "Id", type: "value", multi: true } },
        },
      },
    );

    const filter = config.filters[0];
    expect(filter).toMatchObject({ kind: "text", label: "Id", value: "" });

    if (filter.kind !== "text")
      throw new Error(`unexpected kind ${filter.kind}`);
    filter.onChange("6ba7b810-9dad-11d1-80b4-00c04fd430c8");
    expect(updates[0]["filter.id"]).toBe(
      "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    );
  });
});

// A control's identity comes from the spec, which is fetched once, and not from
// the lookup response, which is refetched on every selection. Reading it from
// the lookup is what used to collapse every chip into a plain text box for the
// length of that refetch — on first paint, and again on each filter change.
describe("parametersToFormConfig — shape without live lookup data", () => {
  const shapeParam = (name: string, ref: string) => ({
    name,
    in: "query" as const,
    "x-clicky-lookup": { $ref: `#/components/x-clicky-filters/${ref}` },
  });

  it("keeps the workload picker while its options are in flight", async () => {
    const config = parametersToFormConfig(
      [shapeParam("workload", "wl")],
      { workload: "payments/Deployment/api" },
      () => {},
      { components: { wl: { type: "workload", label: "Workload" } } },
    );

    const filter = config.filters[0];
    expect(filter.kind).toBe("workload");
    if (filter.kind !== "workload") throw new Error("expected workload filter");
    expect(filter.label).toBe("Workload");
    expect(filter.value).toBe("payments/Deployment/api");
    // No options yet is an empty set, not a failure: the picker pins the current
    // value itself, so the chip still reads back what is selected.
    await expect(filter.loadWorkloads(["deployment"])).resolves.toEqual({});
  });

  it("keeps the labels control and its selection while options are in flight", () => {
    const config = parametersToFormConfig(
      [shapeParam("labels", "lb")],
      { labels: "app=api,!tier=worker" },
      () => {},
      { components: { lb: { type: "labels", label: "Labels", multi: true } } },
    );

    const filter = config.filters[0];
    expect(filter.kind).toBe("nested-multi");
    if (filter.kind !== "nested-multi")
      throw new Error("expected nested-multi");
    expect(filter.value).toEqual({
      "app=api": "include",
      "tier=worker": "exclude",
    });
  });

  it("keeps the range control and its server default while options are in flight", () => {
    const config = parametersToFormConfig(
      [
        {
          ...shapeParam("time", "tm"),
          schema: { type: "string", default: ">=now-1h" },
        },
      ],
      {},
      () => {},
      { components: { tm: { type: "date-range", label: "Time" } } },
    );

    const filter = config.filters[0];
    expect(filter.kind).toBe("date-range");
    if (filter.kind !== "date-range") throw new Error("expected date-range");
    expect(filter.from).toBe("now-1h");
  });

  it("prefers live options once the lookup resolves, without changing the control", () => {
    const config = parametersToFormConfig(
      [shapeParam("workload", "wl")],
      { workload: "payments/Deployment/api" },
      () => {},
      {
        components: { wl: { type: "workload", label: "Workload" } },
        lookup: {
          filters: {
            workload: {
              type: "workload",
              options: {
                "payments/Deployment/api": { kind: "text", text: "api" },
              },
            },
          },
        },
      },
    );

    expect(config.filters[0].kind).toBe("workload");
  });

  it("still classifies from the lookup when a parameter names no shape", () => {
    const config = parametersToFormConfig(
      [{ name: "workload", in: "query" }],
      {},
      () => {},
      { lookup: { filters: { workload: { type: "workload" } } } },
    );

    expect(config.filters[0].kind).toBe("workload");
  });

  it("renders a parameter with neither shape nor lookup as the text input it is", () => {
    const config = parametersToFormConfig(
      [{ name: "namespace", in: "query" }],
      { namespace: "payments" },
      () => {},
      { components: { wl: { type: "workload" } } },
    );

    expect(config.filters[0].kind).toBe("text");
    expect(config.filters[0].label).toBe("Namespace");
  });

  it("ignores a ref that resolves to nothing rather than failing the whole bar", () => {
    const config = parametersToFormConfig(
      [shapeParam("workload", "missing"), { name: "namespace", in: "query" }],
      {},
      () => {},
      { components: { wl: { type: "workload" } } },
    );

    expect(config.filters.map((filter) => filter.kind)).toEqual([
      "text",
      "text",
    ]);
  });
});

describe("dataTablePaginationFromForm", () => {
  const form = (
    overrides: Partial<ParameterPagination> = {},
  ): ParameterPagination => ({
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
      pagination: {
        total: 10_000,
        totalRelation: "gte",
        hasMore: true,
        limit: 25,
        offset: 0,
      },
    });

    expect(table?.total).toBe(10_000);
    expect(table?.totalRelation).toBe("gte");
    expect(table?.hasMore).toBe(true);
  });

  // A surface whose operation declares no offset — a profile with no total
  // order, which serves its first page and refuses every page after it — still
  // knows how many rows there are and can still resize its page. Dropping the
  // whole footer for it reported "100 of 100 rows" while the server was
  // answering X-Total-Count: 12558.
  it("reports the served total for an operation that cannot step pages", () => {
    const limitOnly: ParameterPagination = {
      limitParam: "limit",
      limitValue: "100",
      setLimit: () => {},
    };

    const table = dataTablePaginationFromForm(limitOnly, {
      pagination: {
        total: 12_558,
        totalRelation: "eq",
        hasMore: false,
        limit: 100,
        offset: 0,
      },
    });

    expect(table).toBeDefined();
    expect(table?.total).toBe(12_558);
    expect(table?.totalRelation).toBe("eq");
    expect(table?.pageSize).toBe(100);
    expect(table?.page).toBe(0);
    // Resizing is still possible; stepping is not, and the footer reads
    // onPageChange's absence as "render no step controls".
    expect(table?.onPageSizeChange).toBeTypeOf("function");
    expect(table?.onPageChange).toBeUndefined();
  });

  it("still steps when the operation declares an offset", () => {
    const offsets: string[] = [];
    const table = dataTablePaginationFromForm(
      form({ setOffset: (next) => offsets.push(next) }),
      {
        pagination: {
          total: 500,
          totalRelation: "eq",
          hasMore: true,
          limit: 25,
          offset: 0,
        },
      },
    );

    expect(table?.onPageChange).toBeTypeOf("function");
    table?.onPageChange?.(3);
    expect(offsets).toEqual(["75"]);
  });

  it("offers cursor mode only once there is a cursor to send it on", () => {
    const withoutParam = dataTablePaginationFromForm(
      form({ offsetValue: "20000" }),
      {
        pagination: { nextCursor: "next-token" },
      },
    );
    expect(withoutParam?.cursor).toBeUndefined();

    const withParam = dataTablePaginationFromForm(
      form({
        offsetValue: "20000",
        cursorParam: "cursor",
        setCursor: () => {},
      }),
      { pagination: { nextCursor: "next-token" } },
    );
    expect(withParam?.cursor).toEqual({
      next: "next-token",
      onCursorChange: expect.any(Function),
    });
  });

  it("uses the first cursor returned by an operation with no offset", () => {
    const cursors: string[] = [];
    const table = dataTablePaginationFromForm(
      form({
        offsetParam: undefined,
        offsetValue: undefined,
        setOffset: undefined,
        cursorParam: "cursor",
        setCursor: (next) => cursors.push(next),
      }),
      { pagination: { nextCursor: "next-token", hasMore: true } },
    );

    expect(table?.onPageChange).toBeUndefined();
    expect(table?.cursor?.next).toBe("next-token");
    table?.cursor?.onCursorChange("next-token");
    expect(cursors).toEqual(["next-token"]);
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
      form({
        cursorParam: "cursor",
        cursorValue: "current-token",
        setCursor: () => {},
      }),
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

  // Under an infinite walk the footer describes an accumulation rather than a
  // window, and the DataTable withdraws the step controls on the strength of its
  // own `infinite` prop. What it still needs from here are the counting facts —
  // and they come from the newest page, whose total covers the whole result and
  // whose limit is the size of one request, not of the run on screen.
  it("reports the newest page's counts and request size across an accumulated walk", () => {
    const walk: ParameterPagination = {
      limitParam: "limit",
      limitValue: "25",
      setLimit: () => {},
      cursorParam: "cursor",
      // The cursor of a walk lives in the query, not in the form — the form's
      // copy stays empty, and the footer must not read that as "first page of
      // an offset run" and start quoting positions.
      cursorValue: "",
      setCursor: () => {},
    };

    const table = dataTablePaginationFromForm(walk, {
      pagination: {
        total: 12_558,
        totalRelation: "eq",
        hasMore: true,
        limit: 25,
        nextCursor: "page-4",
      },
    });

    expect(table?.total).toBe(12_558);
    expect(table?.totalRelation).toBe("eq");
    expect(table?.pageSize).toBe(25);
    expect(table?.hasMore).toBe(true);
    expect(table?.onPageChange).toBeUndefined();
    expect(table?.onPageSizeChange).toBeTypeOf("function");
  });
});
