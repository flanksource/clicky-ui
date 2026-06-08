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
      ...(init.headers ?? {}),
    },
  });
}

describe("createOperationsApiClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
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
    expect((init?.headers as Headers).get("Authorization")).toBe("Bearer token");
    expect((init?.headers as Headers).get("Accept")).toBe("application/json");
  });
});
