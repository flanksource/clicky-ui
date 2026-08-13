import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildQueryInfoUrl,
  fetchQueryInfo,
  QUERY_INFO_CONTENT_TYPE,
} from "./queryInfo";

function stubFetch(response: {
  ok: boolean;
  status?: number;
  statusText?: string;
  body: string;
}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status ?? (response.ok ? 200 : 400),
    statusText: response.statusText ?? "",
    text: async () => response.body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("buildQueryInfoUrl", () => {
  it.each([
    ["/api/v1/profile/orders", "/api/v1/profile/orders?__info=true"],
    [
      "/api/v1/profile/orders?limit=25&filter.state=open",
      "/api/v1/profile/orders?limit=25&filter.state=open&__info=true",
    ],
    ["/orders?limit=25#rows", "/orders?limit=25&__info=true#rows"],
  ])("marks %s as a question about itself", (url, expected) => {
    expect(buildQueryInfoUrl(url)).toBe(expected);
  });

  it("leaves a URL that already asks the question alone", () => {
    expect(buildQueryInfoUrl("/orders?__info=true")).toBe(
      "/orders?__info=true",
    );
  });
});

describe("fetchQueryInfo", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("negotiates the info media type and returns the details", async () => {
    const fetchMock = stubFetch({
      ok: true,
      body: JSON.stringify({
        profile: "orders",
        provider: "postgres",
        rows: 25,
        diagnostics: { provider: "postgres", request: { query: "SELECT 1" } },
      }),
    });

    const info = await fetchQueryInfo("/api/v1/profile/orders?limit=25");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/profile/orders?limit=25&__info=true",
      { headers: { Accept: QUERY_INFO_CONTENT_TYPE } },
    );
    expect(info.profile).toBe("orders");
    expect(info.diagnostics?.request.query).toBe("SELECT 1");
  });

  it("keeps the query a failed execution reports rather than throwing it away", async () => {
    stubFetch({
      ok: false,
      status: 400,
      body: JSON.stringify({
        code: "query_failed",
        message: 'relation "orders" does not exist',
        diagnostics: {
          provider: "postgres",
          request: { query: "SELECT * FROM orders" },
        },
      }),
    });

    const info = await fetchQueryInfo("/api/v1/profile/orders");

    expect(info.error).toBe('relation "orders" does not exist');
    expect(info.diagnostics?.request.query).toBe("SELECT * FROM orders");
  });

  it("throws when the response carries no details at all", async () => {
    stubFetch({ ok: false, status: 502, statusText: "Bad Gateway", body: "" });

    await expect(fetchQueryInfo("/api/v1/profile/orders")).rejects.toThrow(
      "502 Bad Gateway",
    );
  });
});
