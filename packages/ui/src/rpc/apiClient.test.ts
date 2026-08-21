import { afterEach, describe, expect, it, vi } from "vitest";
import { createOperationsApiClient, OperationsApiClientError } from "./apiClient";

function clickyFailure(error: string) {
  return {
    version: 1,
    node: {
      kind: "map",
      fields: [
        {
          name: "Success",
          value: { kind: "text", plain: "false", text: "false" },
        },
        {
          name: "Error",
          value: { kind: "text", plain: error, text: error },
        },
      ],
    },
  };
}

function jsonResponse(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

describe("createOperationsApiClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends positional arguments as a JSON array without comma splitting", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await createOperationsApiClient().executeCommand(
      "/api/v1/3mf/diff",
      "POST",
      { args: ["first,version.3mf", "second.3mf"] },
      { Accept: "application/json" },
    );

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init!.body as string)).toEqual({
      args: ["first,version.3mf", "second.3mf"],
    });
  });

  it("returns non-2xx Clicky failure envelopes as renderable execution responses", async () => {
    const body = clickyFailure("tenant not found");
    const fetchMock = vi.fn(async () =>
      jsonResponse(body, {
        status: 500,
        headers: {
          "Content-Type": "application/json+clicky",
          "X-Execution-Success": "false",
          "X-Exit-Code": "1",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = createOperationsApiClient();
    const response = await client.executeCommand(
      "/api/v1/accounts",
      "GET",
      { company: "missing-tenant" },
      { Accept: "application/clicky+json" },
    );

    expect(response.success).toBe(false);
    expect(response.exit_code).toBe(1);
    expect(response.error).toBe("tenant not found");
    expect(response.contentType).toBe("application/json+clicky");
    expect(response.parsed).toEqual(body);
    expect(response.stdout).toContain("tenant not found");
  });

  it("exposes pagination metadata from execution response headers", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(
        {
          version: 1,
          node: { kind: "table", columns: [], rows: [] },
        },
        {
          headers: {
            "Content-Type": "application/json+clicky",
            "X-Total-Count": "14",
            "X-Page-Limit": "5",
            "X-Page-Offset": "10",
          },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = createOperationsApiClient();
    const response = await client.executeCommand(
      "/api/v1/transactions",
      "GET",
      { limit: "5", offset: "10" },
      { Accept: "application/json+clicky" },
    );

    expect(response.pagination).toEqual({ total: 14, limit: 5, offset: 10 });
    expect(response.responseHeaders).toMatchObject({
      "x-total-count": "14",
      "x-page-limit": "5",
      "x-page-offset": "10",
    });
  });

  // The cursor headers carry the facts a page cannot be inferred from: whether
  // more rows exist, where to resume, whether the total is a count or a bound,
  // and whether the server stopped short of the whole result.
  it("reads the cursor paging headers alongside limit and offset", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(
        { version: 1, node: { kind: "table", columns: [], rows: [] } },
        {
          headers: {
            "Content-Type": "application/json+clicky",
            "X-Total-Count": "10000",
            "X-Total-Relation": "gte",
            "X-Has-More": "true",
            "X-Next-Cursor": "eyJrIjpbMTAwXX0",
            "X-Truncated": "true",
          },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await createOperationsApiClient().executeCommand(
      "/api/v1/transactions",
      "GET",
      {},
      { Accept: "application/json+clicky" },
    );

    expect(response.pagination).toEqual({
      total: 10000,
      totalRelation: "gte",
      hasMore: true,
      nextCursor: "eyJrIjpbMTAwXX0",
      truncated: true,
    });
  });

  // A page that says it is the last one has to be distinguishable from one
  // whose server said nothing — "false" is an answer, absent is not.
  it("keeps an explicit false apart from an absent paging header", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(
        { version: 1, node: { kind: "table", columns: [], rows: [] } },
        {
          headers: {
            "Content-Type": "application/json+clicky",
            "X-Page-Limit": "5",
            "X-Has-More": "false",
          },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await createOperationsApiClient().executeCommand(
      "/api/v1/transactions",
      "GET",
      {},
      { Accept: "application/json+clicky" },
    );

    expect(response.pagination).toEqual({ limit: 5, hasMore: false });
  });

  it("throws non-Clicky non-2xx responses", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({ error: "plain failure" }, { status: 500 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = createOperationsApiClient();

    await expect(
      client.executeCommand("/api/v1/accounts", "GET", {}, { Accept: "application/json" }),
    ).rejects.toMatchObject({
      name: "OperationsApiClientError",
      status: 500,
      message: "plain failure",
    } satisfies Partial<OperationsApiClientError>);
  });

  it("getSchema returns the schema document when served as application/schema+json", async () => {
    const schema = { $schema: "x", type: "object", properties: { name: { type: "string" } } };
    const fetchMock = vi.fn(async () =>
      jsonResponse(schema, { headers: { "Content-Type": "application/schema+json" } }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = createOperationsApiClient();
    const result = await client.getSchema("/api/v1/connection");

    expect(result).toEqual(schema);
    const [, init] = fetchMock.mock.calls[0];
    expect((init!.headers as Headers).get("Accept")).toBe("application/schema+json");
  });

  it("getSchema returns undefined when the resource serves data instead of a schema", async () => {
    // Falls through to the list representation (no schema content type).
    const fetchMock = vi.fn(async () => jsonResponse([{ name: "pg" }]));
    vi.stubGlobal("fetch", fetchMock);

    const client = createOperationsApiClient();
    expect(await client.getSchema("/api/v1/widget")).toBeUndefined();
  });

  it("submitForm sends the nested body verbatim with the chosen method", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: true }, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    const client = createOperationsApiClient();
    const body = { name: "pg", type: "postgres", properties: { sslmode: "disable" } };
    await client.submitForm("/api/v1/connection", "POST", body);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/connection");
    expect(init!.method).toBe("POST");
    expect(JSON.parse(init!.body as string)).toEqual(body);
  });

  it("joins base URLs and paths with long slash runs", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    const client = createOperationsApiClient({
      baseUrl: `https://example.com${"/".repeat(50_000)}`,
    });
    await client.submitForm(`${"/".repeat(50_000)}api/v1/connection`, "POST", {});

    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://example.com/api/v1/connection");
  });

  it("applies path params, default params, and prepared headers", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    const client = createOperationsApiClient({
      prepareHeaders(headers) {
        headers.set("Authorization", "Bearer token");
        return headers;
      },
      defaultParams: ({ params }) => ({ ...params, company: params.company || "all" }),
    });

    await client.executeCommand("/api/v1/accounts/{id}", "GET", { id: "abc 123" }, {
      Accept: "application/json",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/accounts/abc%20123?company=all",
      expect.objectContaining({
        method: "GET",
        headers: expect.any(Headers),
      }),
    );
    const [, init] = fetchMock.mock.calls[0];
    expect(init).toBeDefined();
    const headers = init!.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer token");
    expect(headers.get("Accept")).toBe("application/json");
  });
});
