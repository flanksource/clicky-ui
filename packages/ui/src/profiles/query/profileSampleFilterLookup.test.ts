import { afterEach, describe, expect, it, vi } from "vitest";
import {
  registerDebugConsole,
  setDebugCaptureLevel,
} from "../../data/debugConsoleSignal";
import { lookupProfileSampleFilterValues } from "./profileSampleFilterLookup";

const connectionID = "source-stub";
const query = "SELECT message FROM logs";
const options = { database: "observability" };

describe("lookupProfileSampleFilterValues", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("looks up a draft profile filter with the current query context", async () => {
    const unregister = registerDebugConsole(() => {});
    setDebugCaptureLevel("debug");
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          options: [{ value: "started", count: 7 }],
          total: 1,
          totalRelation: "eq",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetch);

    await expect(
      lookupProfileSampleFilterValues({
        draft: {
          profile: "events",
          provider: {
            type: "sql",
            connection: `connection://${connectionID}`,
            options,
          },
          query,
        },
        params: { tenant: "acme" },
        filterColumns: [
          { name: "message", type: "string", filter: { lookup: true } },
        ],
        request: {
          query,
          options,
          filters: { "filter.level": "error" },
          filterKey: "filter.message",
          search: "sta",
          limit: 20,
        },
      }),
    ).resolves.toEqual({ options: [{ value: "started", count: 7 }] });

    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/profile/sample/filters/values",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Level": "debug",
        },
        body: JSON.stringify({
          profile: {
            profile: "events",
            provider: {
              type: "sql",
              connection: `connection://${connectionID}`,
              options,
            },
            query,
          },
          params: { tenant: "acme" },
          filters: { "filter.level": "error" },
          filterColumns: [
            { name: "message", type: "string", filter: { lookup: true } },
          ],
          filterKey: "filter.message",
          search: "sta",
          limit: 20,
        }),
      },
    );
    unregister();
    setDebugCaptureLevel("off");
  });
});
