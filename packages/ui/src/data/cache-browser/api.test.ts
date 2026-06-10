import { describe, expect, it, vi } from "vitest";
import { createCacheClient, type CacheFetcher } from "./api";

function clientWithSpy() {
  const fetcher = vi.fn<CacheFetcher>().mockResolvedValue({});
  return { client: createCacheClient({ baseUrl: "/api/v1", fetcher }), fetcher };
}

describe("createCacheClient", () => {
  it("builds tree URLs with encoded prefix and optional max", async () => {
    const { client, fetcher } = clientWithSpy();
    await client.tree("tx:", 50);
    expect(fetcher).toHaveBeenCalledWith("/api/v1/cache/tree?prefix=tx%3A&max=50");

    await client.tree();
    expect(fetcher).toHaveBeenCalledWith("/api/v1/cache/tree");
  });

  it("builds key URLs with slashes and colons encoded", async () => {
    const { client, fetcher } = clientWithSpy();
    await client.key("tx:abc/def");
    expect(fetcher).toHaveBeenCalledWith("/api/v1/cache/key?key=tx%3Aabc%2Fdef");
  });

  it("builds search and stats URLs", async () => {
    const { client, fetcher } = clientWithSpy();
    await client.search("plan", 10);
    expect(fetcher).toHaveBeenCalledWith("/api/v1/cache/search?q=plan&limit=10");

    await client.stats();
    expect(fetcher).toHaveBeenCalledWith("/api/v1/cache/stats");
  });

  it("issues deletes with the DELETE method", async () => {
    const { client, fetcher } = clientWithSpy();
    await client.deleteKey("tx:1");
    expect(fetcher).toHaveBeenCalledWith("/api/v1/cache/key?key=tx%3A1", { method: "DELETE" });

    await client.deletePrefix("tx:");
    expect(fetcher).toHaveBeenCalledWith("/api/v1/cache/prefix?prefix=tx%3A", {
      method: "DELETE",
    });
  });

  it("default fetcher throws on non-2xx responses with the body text", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("cache: key not found\n", { status: 404 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    try {
      const client = createCacheClient({ baseUrl: "/api/v1" });
      await expect(client.key("missing")).rejects.toThrow(
        "cache request failed: 404 cache: key not found",
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
