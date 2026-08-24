import { QueryBrowserExecutionError } from "../../data/query-browser/QueryBrowser.types";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchJSON,
  mergeProviderOptions,
  openSearchIndexOptions,
  withTarget,
} from "./connectionBrowserModel";
import { effectiveInspectionDatabase, inspectionURL } from "./useInspection";

afterEach(() => vi.unstubAllGlobals());

it("preserves provider diagnostics from a failed JSON request", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "query failed",
          trace: "trace-query-1",
          time: "2026-08-11T12:00:00Z",
          context: { connection: "tenant-x" },
          stacktrace: "query failed\n--- at example/query.go:42 runQuery",
          diagnostics: {
            provider: "clickhouse",
            request: { query: "SELECT broken" },
            error: "unknown identifier broken",
          },
        }),
        { status: 422, headers: { "Content-Type": "application/json" } },
      ),
    ),
  );

  try {
    await fetchJSON("/query");
    throw new Error("expected fetchJSON to reject");
  } catch (error) {
    expect(error).toBeInstanceOf(QueryBrowserExecutionError);
    expect((error as QueryBrowserExecutionError).message).toBe("query failed");
    expect(
      (error as QueryBrowserExecutionError).diagnostics?.request.query,
    ).toBe("SELECT broken");
    expect((error as QueryBrowserExecutionError).errorDetails).toEqual({
      message: "query failed",
      trace: "trace-query-1",
      time: "2026-08-11T12:00:00Z",
      context: [["connection", "tenant-x"]],
      stacktrace: "query failed\n--- at example/query.go:42 runQuery",
      raw: {
        error: "query failed",
        trace: "trace-query-1",
        time: "2026-08-11T12:00:00Z",
        context: { connection: "tenant-x" },
        stacktrace: "query failed\n--- at example/query.go:42 runQuery",
        diagnostics: {
          provider: "clickhouse",
          request: { query: "SELECT broken" },
          error: "unknown identifier broken",
        },
      },
    });
  }
});

describe("provider option layering", () => {
  const stored = { index: "logs-2024", limit: "100" };
  const catalog = { index: "logs-2025" };
  const live = { limit: "500", targetKind: "data_stream" };

  it("lets each later layer override the one before it", () => {
    expect(mergeProviderOptions({ layers: [stored, catalog, live] })).toEqual({
      index: "logs-2025",
      limit: "500",
    });
  });

  it("skips layers a host has not supplied", () => {
    expect(mergeProviderOptions({ layers: [undefined, stored] })).toEqual(
      stored,
    );
  });

  // targetKind only tells the inspection endpoint which mappings to fetch. It
  // is not a provider option, so it must not reach the stored profile.
  it("drops targetKind from the options a query runs with", () => {
    expect(mergeProviderOptions({ layers: [live] })).toEqual({ limit: "500" });
    expect(
      mergeProviderOptions({ layers: [live], keepTargetKind: true }),
    ).toEqual(live);
  });

  it("pins the active database over whatever the layers carried", () => {
    expect(
      mergeProviderOptions({
        layers: [{ database: "stale" }],
        database: "analytics",
      }),
    ).toEqual({ database: "analytics" });
  });

  // An empty database means the connection's own default, which the backend
  // resolves — sending "" would ask for a database literally named "".
  it("leaves the database alone when none is active", () => {
    expect(
      mergeProviderOptions({ layers: [{ database: "app" }], database: "" }),
    ).toEqual({ database: "app" });
  });

  it("does not mutate the layers it merges", () => {
    mergeProviderOptions({ layers: [live], database: "analytics" });
    expect(live).toEqual({ limit: "500", targetKind: "data_stream" });
  });
});

describe("inspection cache requests", () => {
  it("uses a stored database before the first inspection fetch", () => {
    expect(
      effectiveInspectionDatabase({
        database: "",
        fallbackDatabase: "analytics",
      }),
    ).toBe("analytics");
    expect(
      effectiveInspectionDatabase({
        database: "billing",
        fallbackDatabase: "analytics",
      }),
    ).toBe("billing");
  });

  it("adds refresh without losing the active database or target", () => {
    expect(
      inspectionURL("/browser", {
        database: "analytics",
        target: "logs-a,logs-b",
        targetKind: "group",
        refresh: true,
      }),
    ).toBe(
      "/browser/inspect?database=analytics&target=logs-a%2Clogs-b&targetKind=group&refresh=true",
    );
  });
});

describe("provider-owned targets", () => {
  it("writes a selection to the option named by the descriptor", () => {
    expect(
      withTarget(
        { limit: "200", workspaceID: "old" },
        { option: "workspaceID", value: "workspace-new", targetKind: "" },
      ),
    ).toEqual({ limit: "200", workspaceID: "workspace-new" });
  });

  it("renders an exact rollover group under its readable pattern", () => {
    expect(
      openSearchIndexOptions({
        kind: "opensearch",
        targets: [
          {
            name: "logs-2026.08.21,logs-2026.08.22",
            kind: "group",
            pattern: "logs-*",
            members: ["logs-2026.08.21", "logs-2026.08.22"],
            count: 2,
          },
        ],
      }),
    ).toEqual([
      expect.objectContaining({
        value: "logs-2026.08.21,logs-2026.08.22",
        label: "logs-* · 2 indexes",
        group: "Index groups",
      }),
    ]);
  });
});
