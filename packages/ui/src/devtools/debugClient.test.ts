import { describe, expect, it, vi } from "vitest";
import { armUrl, DebugClient, DetailEvictedError, withDebugFetch } from "./debugClient";
import { DEBUG_ID_HEADER, DEBUG_LEVEL_HEADER, DEBUG_REFRESH_HEADER } from "./types";

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

describe("withDebugFetch", () => {
  it("arms every request at the console's current level", async () => {
    const inner = vi.fn(async () => jsonResponse({}));
    const armed = withDebugFetch(inner as unknown as typeof fetch, { level: () => "trace2" });

    await armed("/api/v1/profile/activities");

    const init = inner.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(init.headers).get(DEBUG_LEVEL_HEADER)).toBe("trace2");
  });

  // This is the "console closed costs nothing" guarantee on the client side. If
  // it breaks, every request in the app starts paying for a feature nobody
  // switched on.
  it("sends no header at all when the console is off", async () => {
    const inner = vi.fn(async () => jsonResponse({}));
    const armed = withDebugFetch(inner as unknown as typeof fetch, { level: () => "off" });

    await armed("/api/v1/profile/activities");

    const init = inner.mock.calls[0]?.[1] as RequestInit | undefined;
    expect(init === undefined || new Headers(init.headers).get(DEBUG_LEVEL_HEADER) === null).toBe(
      true,
    );
  });

  it("reports the record id the server stamped on the response", async () => {
    const inner = vi.fn(
      async () => jsonResponse({}, { headers: { [DEBUG_ID_HEADER]: "abc-123" } }),
    );
    const seen: string[] = [];
    const armed = withDebugFetch(inner as unknown as typeof fetch, {
      level: () => "debug",
      onRecordId: (id) => seen.push(id),
    });

    await armed("/api/v1/profile/activities");

    expect(seen).toEqual(["abc-123"]);
  });

  it("asks for a rebuild only when the console is set to", async () => {
    const inner = vi.fn(async () => jsonResponse({}));
    const armed = withDebugFetch(inner as unknown as typeof fetch, {
      level: () => "debug",
      refreshInspection: () => true,
    });

    await armed("/api/v1/profile/activities");

    const init = inner.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get(DEBUG_REFRESH_HEADER)).toBe("true");
  });

  // Absent rather than "false": a header on every request saying it opted out
  // of something is noise the server then has to parse and ignore.
  it("sends no rebuild header at all by default", async () => {
    const inner = vi.fn(async () => jsonResponse({}));
    const armed = withDebugFetch(inner as unknown as typeof fetch, {
      level: () => "debug",
      refreshInspection: () => false,
    });

    await armed("/api/v1/profile/activities");

    const init = inner.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get(DEBUG_REFRESH_HEADER)).toBeNull();
  });

  it("keeps the caller's own headers", async () => {
    const inner = vi.fn(async () => jsonResponse({}));
    const armed = withDebugFetch(inner as unknown as typeof fetch, { level: () => "debug" });

    await armed("/api/v1/profile/activities", { headers: { Accept: "text/csv" } });

    const init = inner.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get("Accept")).toBe("text/csv");
    expect(headers.get(DEBUG_LEVEL_HEADER)).toBe("debug");
  });
});

describe("armUrl", () => {
  it.each([
    ["/api/v1/profile/a", "/api/v1/profile/a?__debug=trace"],
    ["/api/v1/profile/a?format=csv", "/api/v1/profile/a?format=csv&__debug=trace"],
    ["/api/v1/profile/a#rows", "/api/v1/profile/a?__debug=trace#rows"],
  ])("marks %s for a browser that builds its own request", (url, expected) => {
    expect(armUrl(url, "trace")).toBe(expected);
  });

  it("leaves a URL alone when nothing is being captured", () => {
    expect(armUrl("/api/v1/profile/a", "off")).toBe("/api/v1/profile/a");
  });
});

describe("DebugClient", () => {
  it("distinguishes an aged-out detail from a record that never existed", async () => {
    const client = new DebugClient({
      fetch: (async () =>
        jsonResponse(
          { code: "detail_evicted", id: "gone", reason: "detail budget exceeded" },
          { status: 410 },
        )) as unknown as typeof fetch,
    });

    await expect(client.detail("gone")).rejects.toBeInstanceOf(DetailEvictedError);
  });

  it("resumes the stream from the sequence the caller already holds", () => {
    const client = new DebugClient({ prefix: "/api/v1" });

    expect(client.streamUrl(0)).toBe("/api/v1/devtools/stream");
    expect(client.streamUrl(12)).toBe("/api/v1/devtools/stream?after=12");
  });

  it("runs a selected provider operation as a fresh read-only inspection", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          { rows: [], inspection: { status: "complete" } },
          { headers: { [DEBUG_ID_HEADER]: "inspection-1" } },
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          summary: {
            id: "inspection-1",
            sequence: 2,
            source: { surface: "sample" },
            startedAt: "2026-08-23T10:00:00Z",
            durationMs: 12,
            rows: 1,
            level: "debug",
            counts: {
              operations: 1,
              harEntries: 0,
              harDropped: 0,
              logLines: 0,
              logDropped: 0,
              probes: 1,
              inspections: 1,
            },
          },
          probes: [],
          inspections: [],
        }),
      );
    const client = new DebugClient({ fetch: request as unknown as typeof fetch });

    const detail = await client.runInspection({
      provider: "postgres",
      connection: "connection://analytics",
      query: "SELECT region FROM events",
      options: { database: "analytics" },
      columns: ["region"],
      refresh: true,
    });

    expect(detail.summary.id).toBe("inspection-1");
    const [url, init] = request.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/v1/profile/sample");
    expect(new Headers(init.headers).get(DEBUG_LEVEL_HEADER)).toBe("debug");
    expect(new Headers(init.headers).get(DEBUG_REFRESH_HEADER)).toBe("true");
    expect(JSON.parse(String(init.body))).toEqual({
      profile: {
        profile: "manual-inspection",
        provider: {
          type: "postgres",
          connection: "connection://analytics",
          options: { database: "analytics" },
        },
        query: "SELECT region FROM events",
        columns: [{ name: "region", type: "string" }],
      },
      pagination: { limit: 1 },
      refreshInspection: true,
    });
    expect(request.mock.calls[1]?.[0]).toBe("/api/v1/devtools/records/inspection-1");
  });
});
