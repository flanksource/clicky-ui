// @vitest-environment jsdom
import { IDBFactory } from "fake-indexeddb";
import { expect, it, vi } from "vitest";
import { memoryCaches } from "../../link/testing-cache.ts";
import { openRuntimeDb, result } from "../../storage/db.ts";
import { prepareTailwind, type TailwindOptions } from "./runtime.ts";
import { cssCacheKey, libraryKey, tailwindCssUrl } from "./cache.ts";
import { createTailwindStore } from "./store.ts";
import type { LibraryStyles } from "./recipe.ts";

const build = vi.hoisted(() => vi.fn((_candidates: string[]) => ".known{display:block}.dynamic{display:flex}"));
vi.mock("./recipe.ts", () => ({ compileLibraries: async () => ({ build }), transformCss: ({ css }: { css: string }) => css }));

const libraries: LibraryStyles[] = [{ id: "https://runtime.example/npm/lib@1/page-styles.js?page=a.tsx", name: "lib", version: "1.0.0", integrity: "sha384-lib", base: "https://runtime.example/npm/lib@1/", recipe: { name: "lib", layer: "components", base: ["lib/styles.css"], entry: "", theme: "", runtimeDependencies: [] } }];

async function harness(runtimeVersion: string, keep?: number) {
  const root = document.createElement("div"); document.body.append(root);
  const db = openRuntimeDb({ factory: new IDBFactory() });
  const cache = await memoryCaches().open("tailwind");
  const fetchCached = async (url: string | URL | Request) => (await cache.match(String(url))) ?? new Response("missing", { status: 404, headers: { "x-page-runtime-error": "fetch" } });
  const store = createTailwindStore({ db: () => db, cache, origin: location.origin, fetch: fetchCached as typeof fetch, ...(keep ? { keep } : {}) });
  const options: TailwindOptions = { libraries, loaders: { loadStylesheet: vi.fn(), loadModule: vi.fn() }, runtimeVersion, root, candidates: ["known"], store, timeoutMs: 1000, onError: (error: unknown) => { throw error; } };
  const key = await cssCacheKey({ libraryKey: libraryKey(options), candidates: options.candidates });
  const records = async () => result((await db).transaction("tailwind").objectStore("tailwind").getAll());
  return { root, options, cache, store, key, records };
}
const settled = () => new Promise<void>((resolve) => queueMicrotask(resolve));

it("rejects a stored record whose cached stylesheet is missing instead of treating it as a cache miss", async () => {
  const { root, options, cache, key } = await harness("missing-response");
  try {
    const first = await prepareTailwind(options); first.stop();
    await cache.delete(tailwindCssUrl({ key, origin: location.origin }));
    await expect(prepareTailwind(options)).rejects.toThrow(`record ${key} has no cached stylesheet at ${tailwindCssUrl({ key, origin: location.origin })}`);
  } finally { root.remove(); }
});

it("restores discovered DOM classes with cached CSS so remounting does not rebuild the same styles", async () => {
  const { root, options, records, key } = await harness("dom-cache");
  const first = await prepareTailwind(options);
  root.className = "dynamic";
  await settled();
  await first.ready(); first.stop(); root.className = "";
  expect((await records()).map(({ key: stored, candidates, domClasses }) => ({ stored, candidates, domClasses }))).toEqual([{ stored: key, candidates: ["known"], domClasses: ["dynamic"] }]);
  const count = build.mock.calls.length;
  const second = await prepareTailwind(options);
  try {
    root.className = "dynamic";
    await settled();
    await second.ready();
    expect({ warm: second.warm, builds: build.mock.calls.length - count, classes: [...second.candidates].sort() }).toEqual({ warm: true, builds: 0, classes: ["dynamic", "known"] });
  } finally { second.stop(); root.remove(); }
});

it("derives the cache key from source candidates alone, so DOM classes at mount time reuse the same entry", async () => {
  const { root, options, records, key } = await harness("key-from-source");
  root.className = "dynamic";
  const styles = await prepareTailwind(options);
  try {
    await styles.ready();
    expect((await records()).map((record) => record.key)).toEqual([key]);
  } finally { styles.stop(); root.remove(); }
});

it("persists DOM-driven rebuilds once per idle period, not once per mutation batch", async () => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  const { root, options, store } = await harness("debounce");
  const write = vi.spyOn(store, "write");
  const styles = await prepareTailwind(options);
  try {
    expect(write).toHaveBeenCalledTimes(1);
    for (const name of ["a", "b", "c"]) { root.className = name; await settled(); }
    expect(write).toHaveBeenCalledTimes(1);
    await vi.runAllTimersAsync();
    expect(write).toHaveBeenCalledTimes(2);
    expect(write.mock.calls[1]![0].domClasses).toEqual(["a", "b", "c"]);
  } finally { styles.stop(); root.remove(); vi.useRealTimers(); }
});

it("flushes a pending DOM-driven persist when readiness is awaited", async () => {
  const { root, options, records } = await harness("flush-on-ready");
  const styles = await prepareTailwind(options);
  try {
    root.className = "late";
    await settled();
    await styles.ready();
    expect((await records())[0]!.domClasses).toEqual(["late"]);
  } finally { styles.stop(); root.remove(); }
});

it("bounds stored stylesheets per library key and deletes the evicted responses", async () => {
  const { root, options, cache, records } = await harness("bounded", 2);
  try {
    for (const candidates of [["one"], ["two"], ["three"]]) { const styles = await prepareTailwind({ ...options, candidates }); await styles.ready(); styles.stop(); }
    expect({ records: (await records()).map((record) => record.candidates[0]).sort(), responses: (await cache.keys()).length }).toEqual({ records: ["three", "two"], responses: 2 });
  } finally { root.remove(); }
});
