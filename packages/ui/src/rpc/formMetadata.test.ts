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
