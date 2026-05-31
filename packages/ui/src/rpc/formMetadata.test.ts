import { describe, expect, it } from "vitest";
import { packParameterValues, parametersToFormConfig } from "./formMetadata";

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
    expect(config.search?.placeholder).toBe("Search query");
    expect(config.filters.map((f) => f.key)).toEqual(["kind"]);

    config.search?.onChange("gasket");
    expect(updates).toEqual([{ q: "gasket", kind: "" }]);
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
});
