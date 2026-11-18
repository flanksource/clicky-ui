import { describe, expect, it, vi } from "vitest";
import { fetchSource } from "./source-provider.ts";

describe("scoped HTTP sources", () => {
  const provider = { url: "http://127.0.0.1:1234/sources/token", paths: ["components/title.jsx", "image.png"] };
  it("preserves binary assets", async () => {
    const bytes = new Uint8Array([137, 80, 78, 71, 255]);
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(bytes));
    const response = await fetchSource({ provider, path: "image.png", fetch: fetcher });
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes);
    expect(fetcher).toHaveBeenCalledWith(`${provider.url}/image.png`, { credentials: "omit", redirect: "error" });
  });
  it("calls native fetch without binding the options object as its receiver", async () => {
    const fetcher: typeof fetch = function (this: unknown) {
      expect(this).toBeUndefined();
      return Promise.resolve(new Response("source"));
    };
    await fetchSource({ provider, path: "image.png", fetch: fetcher });
  });
  it.each(["../secret", "secret.env", "/absolute"])('rejects unapproved path %s before fetching', async (path) => {
    const fetcher = vi.fn<typeof fetch>();
    await expect(fetchSource({ provider, path, fetch: fetcher })).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
