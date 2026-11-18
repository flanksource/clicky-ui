import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it } from "vitest";
import { memoryCaches } from "../../link/testing-cache.ts";
import { openRuntimeDb, result, type TailwindRecord } from "../../storage/db.ts";
import { tailwindCssUrl } from "./cache.ts";
import { createTailwindStore, TAILWIND_ENTRIES_PER_LIBRARY } from "./store.ts";

const origin = "https://runtime.example";
const hex = (index: number) => index.toString(16).padStart(64, "0");

async function setup(options: { keep?: number } = {}) {
  const db = openRuntimeDb({ factory: new IDBFactory() });
  const cache = await memoryCaches().open("tailwind");
  let clock = 1000;
  const fetchCached = async (url: string | URL | Request) => (await cache.match(String(url))) ?? new Response("missing", { status: 404, headers: { "x-page-runtime-error": "fetch" } });
  const store = createTailwindStore({ db: () => db, cache, origin, fetch: fetchCached as typeof fetch, now: () => ++clock, ...options });
  const write = (index: number, extra: { libraryKey?: string; css?: string } = {}) => store.write({ key: hex(index), libraryKey: extra.libraryKey ?? "library-a", candidates: ["block"], domClasses: [], css: extra.css ?? `.u${index}{display:block}` });
  const records = async (): Promise<TailwindRecord[]> => (await result((await db).transaction("tailwind").objectStore("tailwind").getAll())).sort((a, b) => a.key.localeCompare(b.key));
  const cached = async () => (await cache.keys()).map((request) => request.url).sort();
  return { store, cache, write, records, cached, db };
}

describe("tailwind store", () => {
  it("writes a text/css response and an IndexedDB record that agree on the byte size", async () => {
    const { store, cache, records } = await setup();
    const css = ".ünï{content:'日本語'}";
    await store.write({ key: hex(1), libraryKey: "library-a", candidates: ["b", "a"], domClasses: ["dom"], css });
    const [record] = await records();
    const response = (await cache.match(tailwindCssUrl({ key: hex(1), origin })))!;
    const body = new Uint8Array(await response.arrayBuffer());
    expect({ type: response.headers.get("content-type"), length: Number(response.headers.get("content-length")), body: body.byteLength, bytes: record!.bytes, text: new TextDecoder().decode(body) })
      .toEqual({ type: "text/css; charset=utf-8", length: new TextEncoder().encode(css).byteLength, body: new TextEncoder().encode(css).byteLength, bytes: new TextEncoder().encode(css).byteLength, text: css });
    expect(record).toMatchObject({ key: hex(1), libraryKey: "library-a", candidates: ["b", "a"], domClasses: ["dom"], url: tailwindCssUrl({ key: hex(1), origin }) });
  });

  it("reads a record's CSS back through its URL and returns nothing for an unknown key", async () => {
    const { store, write } = await setup();
    await write(1, { css: ".one{display:block}" });
    expect((await store.read(hex(1)))?.css).toBe(".one{display:block}");
    expect(await store.read(hex(2))).toBeUndefined();
  });

  it("throws naming the key and URL when a record's cached response is missing", async () => {
    const { store, cache, write } = await setup();
    await write(1);
    await cache.delete(tailwindCssUrl({ key: hex(1), origin }));
    await expect(store.read(hex(1))).rejects.toThrow(`record ${hex(1)} has no cached stylesheet at ${tailwindCssUrl({ key: hex(1), origin })} (HTTP 404)`);
  });

  it("caches the response before it commits the record, and leaves no record when caching fails", async () => {
    const { store, cache, records, db } = await setup();
    const events: string[] = [];
    const put = cache.put.bind(cache);
    cache.put = async (...args: Parameters<Cache["put"]>) => { events.push("cache.put"); await put(...args); };
    const database = await db;
    const transaction = database.transaction.bind(database);
    database.transaction = ((...args: Parameters<IDBDatabase["transaction"]>) => { events.push("idb.transaction"); return transaction(...args); }) as IDBDatabase["transaction"];
    await store.write({ key: hex(1), libraryKey: "library-a", candidates: [], domClasses: [], css: ".a{}" });
    expect(events).toEqual(["cache.put", "idb.transaction"]);
    cache.put = async () => { throw new Error("quota exceeded"); };
    await expect(store.write({ key: hex(2), libraryKey: "library-a", candidates: [], domClasses: [], css: ".b{}" })).rejects.toThrow("quota exceeded");
    database.transaction = transaction;
    expect((await records()).map((record) => record.key)).toEqual([hex(1)]);
  });

  it("keeps the newest N records per library key and deletes the evicted responses", async () => {
    const { write, records, cached } = await setup({ keep: 3 });
    for (let index = 1; index <= 5; index++) await write(index);
    expect((await records()).map((record) => record.key)).toEqual([hex(3), hex(4), hex(5)]);
    expect(await cached()).toEqual([3, 4, 5].map((index) => tailwindCssUrl({ key: hex(index), origin })));
  });

  it("treats a read as a use when choosing what to evict", async () => {
    const { store, write, records } = await setup({ keep: 2 });
    await write(1); await write(2);
    await store.read(hex(1));
    await write(3);
    expect((await records()).map((record) => record.key)).toEqual([hex(1), hex(3)]);
  });

  it("clears every record and response of a stale library key on the first write of a new one, but not on later writes", async () => {
    const { write, records, cached } = await setup();
    await write(1, { libraryKey: "library-a" }); await write(2, { libraryKey: "library-a" });
    await write(3, { libraryKey: "library-b" });
    expect((await records()).map((record) => [record.key, record.libraryKey])).toEqual([[hex(3), "library-b"]]);
    expect(await cached()).toEqual([tailwindCssUrl({ key: hex(3), origin })]);
    await write(4, { libraryKey: "library-b" });
    expect((await records()).map((record) => record.key)).toEqual([hex(3), hex(4)]);
  });

  it("rewriting a key replaces its CSS and domClasses but keeps createdAt", async () => {
    const { store, records } = await setup();
    await store.write({ key: hex(1), libraryKey: "library-a", candidates: ["a"], domClasses: [], css: ".a{}" });
    const [first] = await records();
    await store.write({ key: hex(1), libraryKey: "library-a", candidates: ["a"], domClasses: ["dom"], css: ".a{}.dom{}" });
    const [second] = await records();
    expect({ dom: second!.domClasses, bytes: second!.bytes, created: second!.createdAt, used: second!.lastUsedAt > first!.lastUsedAt }).toEqual({ dom: ["dom"], bytes: 10, created: first!.createdAt, used: true });
    expect((await store.read(hex(1)))?.css).toBe(".a{}.dom{}");
  });

  it("bounds each library key at 32 entries by default", () => {
    expect(TAILWIND_ENTRIES_PER_LIBRARY).toBe(32);
  });
});
