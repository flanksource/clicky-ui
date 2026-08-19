import { describe, expect, it } from "vitest";
import { parametersToFormConfig } from "./formMetadata";
import type { OpenAPIParameter } from "./types";

function timeRangeParameters(format: "date" | "date-time"): OpenAPIParameter[] {
  return [
    {
      name: "from",
      in: "query",
      schema: { type: "string", format },
      "x-clicky": { role: "time-from" },
    },
    {
      name: "to",
      in: "query",
      schema: { type: "string", format },
      "x-clicky": { role: "time-to" },
    },
  ];
}

describe("time range parameter schemas", () => {
  it("hides time controls for date-only role parameters", () => {
    const config = parametersToFormConfig(
      timeRangeParameters("date"),
      { from: "2026-07-01", to: "2026-07-31" },
      () => {},
    );

    expect(config.timeRange?.timeEnabled).toBe(false);
  });

  it("enables time controls for date-time role parameters", () => {
    const config = parametersToFormConfig(
      timeRangeParameters("date-time"),
      { from: "2026-07-01T00:00:00Z", to: "2026-07-31T23:59:59Z" },
      () => {},
    );

    expect(config.timeRange?.timeEnabled).toBe(true);
  });

  it("keeps an explicit false lookup override for date-time parameters", () => {
    const config = parametersToFormConfig(
      timeRangeParameters("date-time"),
      { from: "", to: "" },
      () => {},
      {
        lookup: {
          filters: {
            from: { type: "from", timeEnabled: false },
            to: { type: "to" },
          },
        },
      },
    );

    expect(config.timeRange?.timeEnabled).toBe(false);
  });
});
