// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FrameConfig } from "../schema.ts";

const fixture = vi.hoisted(() => ({
  loadLibraries: vi.fn(), baseStylesheetUrls: vi.fn(), loadTailwind: vi.fn(), prepareTailwind: vi.fn(), createTailwindStore: vi.fn(), lazyRuntimeDb: vi.fn(),
}));
vi.mock("./tailwind/load.ts", () => ({ loadLibraries: fixture.loadLibraries, baseStylesheetUrls: fixture.baseStylesheetUrls }));
vi.mock("./tailwind/runtime.ts", () => ({ loadTailwind: fixture.loadTailwind, prepareTailwind: fixture.prepareTailwind }));
vi.mock("./tailwind/store.ts", () => ({ createTailwindStore: fixture.createTailwindStore }));
vi.mock("../storage/db.ts", () => ({ lazyRuntimeDb: fixture.lazyRuntimeDb, tailwindCacheName: (version: string) => `tailwind-${version}` }));
import { loadPageStyles, pageTailwind, preparePageStyles } from "./boot-styles.ts";

const config = { page: "report.tsx", runtimeVersion: "v1", profile: { readinessTimeoutMs: 500 } } as FrameConfig;
const libraries = [{ name: "clicky" }, { name: "facet" }];
const urls = ["https://runtime.example/npm/clicky@1/styles.css?page=report.tsx", "https://runtime.example/npm/facet@1/styles.css?page=report.tsx"];
const links = () => [...document.head.querySelectorAll<HTMLLinkElement>("link[rel=stylesheet]")];
const settle = (event: "load" | "error") => links().forEach((link) => link.dispatchEvent(new Event(event)));

beforeEach(() => {
  document.head.innerHTML = ""; document.body.innerHTML = '<div id="root"></div>';
  fixture.loadLibraries.mockResolvedValue({ libraries, loaders: { loadStylesheet: vi.fn(), loadModule: vi.fn() } });
  fixture.baseStylesheetUrls.mockReturnValue(urls);
  fixture.loadTailwind.mockResolvedValue({});
  fixture.prepareTailwind.mockResolvedValue({ warm: false, candidates: new Set(), ready: async () => {}, stop: vi.fn() });
  fixture.lazyRuntimeDb.mockReturnValue(() => Promise.resolve({}));
  fixture.createTailwindStore.mockReturnValue({ read: vi.fn(), write: vi.fn() });
  vi.stubGlobal("caches", { open: vi.fn(async () => ({})) });
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ["flex"] })));
});
afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals(); });

describe("base stylesheets", () => {
  it("links every library's base stylesheet in library order and resolves once they have all loaded", async () => {
    const loading = loadPageStyles(config);
    await vi.waitFor(() => expect(links()).toHaveLength(2));
    expect(links().map((link) => link.href)).toEqual(urls);
    let done = false; void loading.then(() => { done = true; });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(done).toBe(false);
    settle("load");
    expect((await loading).libraries).toBe(libraries);
  });

  it("fails loudly naming the stylesheet that did not load", async () => {
    const loading = loadPageStyles(config);
    await vi.waitFor(() => expect(links()).toHaveLength(2));
    links()[1]!.dispatchEvent(new Event("error"));
    await expect(loading).rejects.toThrow(`${urls[1]}: base stylesheet failed to load`);
  });
});

describe("dynamic Tailwind opt-in", () => {
  const styles = async () => { const loading = loadPageStyles(config); await vi.waitFor(() => expect(links()).toHaveLength(2)); settle("load"); return loading; };
  const prepare = async (module: { meta?: unknown }) => preparePageStyles({ config, styles: await styles(), module, onError: vi.fn() });

  it("never loads the compiler, fetches candidates or opens storage for a page without meta.tailwind", async () => {
    for (const module of [{}, { meta: {} }, { meta: { tailwind: undefined } }]) {
      const prepared = await prepare(module);
      await prepared.ready();
      prepared.stop();
    }
    expect({ compiled: fixture.loadTailwind.mock.calls.length, prepared: fixture.prepareTailwind.mock.calls.length, fetched: vi.mocked(fetch).mock.calls.length, stores: fixture.createTailwindStore.mock.calls.length, opened: fixture.lazyRuntimeDb.mock.calls.length }).toEqual({ compiled: 0, prepared: 0, fetched: 0, stores: 0, opened: 0 });
  });

  it("keeps a non-opted page's base stylesheets linked until stop", async () => {
    const prepared = await prepare({});
    expect(links()).toHaveLength(2);
    prepared.stop();
    expect(links()).toHaveLength(0);
  });

  it.each([["static"], ["Dynamic"], [true], [null], [1]])("rejects meta.tailwind %j naming the page", async (tailwind) => {
    await expect(prepare({ meta: { tailwind } })).rejects.toThrow(`report.tsx: meta.tailwind must be "dynamic" or omitted, received ${JSON.stringify(tailwind)}`);
    expect(fixture.loadTailwind).not.toHaveBeenCalled();
  });

  it.each([[null], ["dynamic"], [[]]])("rejects a meta export that is not an object: %j", async (meta) => {
    await expect(prepare({ meta })).rejects.toThrow("report.tsx: meta must be an object");
  });

  it("loads the compiler, source candidates and storage for a page that opts in", async () => {
    const onError = vi.fn();
    const prepared = await preparePageStyles({ config, styles: await styles(), module: { meta: { tailwind: "dynamic" } }, onError });
    expect(fixture.loadTailwind).toHaveBeenCalledWith(expect.objectContaining({ libraries, runtimeVersion: "v1" }));
    expect(fetch).toHaveBeenCalledWith("/__runtime/candidates?page=report.tsx");
    expect(fixture.prepareTailwind).toHaveBeenCalledWith(expect.objectContaining({ libraries, candidates: ["flex"], runtimeVersion: "v1", onError, store: fixture.createTailwindStore.mock.results[0]!.value }));
    expect(fixture.createTailwindStore).toHaveBeenCalledWith(expect.objectContaining({ origin: location.origin }));
    expect(vi.mocked(caches.open)).toHaveBeenCalledWith("tailwind-v1");
    prepared.stop();
    expect(links()).toHaveLength(0);
  });

  it("fails when the candidates request fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 500 } as Response);
    await expect(prepare({ meta: { tailwind: "dynamic" } })).rejects.toThrow("source candidates: HTTP 500");
  });

  it("recognizes only an exact dynamic opt-in", () => {
    expect([pageTailwind({ module: {}, page: "p" }), pageTailwind({ module: { meta: { tailwind: "dynamic" } }, page: "p" })]).toEqual([false, true]);
  });
});
