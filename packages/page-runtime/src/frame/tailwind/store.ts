import { committed, result, type TailwindRecord } from "../../storage/db.ts";
import { tailwindCssUrl } from "./cache.ts";

/** Generated stylesheets kept per library key; the least recently used beyond this are evicted. */
export const TAILWIND_ENTRIES_PER_LIBRARY = 32;
export type TailwindWrite = { key: string; libraryKey: string; candidates: string[]; domClasses: string[]; css: string };
export type TailwindStoreOptions = { db: () => Promise<IDBDatabase>; cache: Cache; origin: string; fetch: typeof fetch; keep?: number; now?: () => number };
export type TailwindStore = ReturnType<typeof createTailwindStore>;

/**
 * Generated CSS is a plain `text/css` response in Cache Storage, served by the worker at `/__runtime/tailwind/<key>.css`.
 * The IndexedDB record is the commit point: it is written after the response, and a record whose response is missing
 * is an invariant violation, not a miss.
 */
export function createTailwindStore(options: TailwindStoreOptions) {
  const keep = options.keep ?? TAILWIND_ENTRIES_PER_LIBRARY;
  let last = 0;
  // Strictly increasing, so records written within one millisecond still order by recency.
  const now = options.now ?? (() => last = Math.max(Date.now(), last + 1));

  /** The record and its CSS, or undefined when nothing was stored for the key. Counts as a use for eviction. */
  async function read(key: string): Promise<{ record: TailwindRecord; css: string } | undefined> {
    const tx = (await options.db()).transaction("tailwind", "readwrite");
    const store = tx.objectStore("tailwind");
    const record = await result<TailwindRecord | undefined>(store.get(key));
    if (record) store.put({ ...record, lastUsedAt: now() });
    await committed(tx);
    if (!record) return undefined;
    const response = await options.fetch(record.url);
    if (!response.ok || response.headers.has("x-page-runtime-error")) throw new Error(`runtime Tailwind: record ${key} has no cached stylesheet at ${record.url} (HTTP ${response.status}); its Cache Storage entry was removed while the IndexedDB record remained`);
    return { record, css: await response.text() };
  }

  async function write(input: TailwindWrite): Promise<void> {
    const url = tailwindCssUrl({ key: input.key, origin: options.origin });
    const bytes = new TextEncoder().encode(input.css).byteLength;
    await options.cache.put(url, new Response(input.css, { headers: { "content-type": "text/css; charset=utf-8", "content-length": String(bytes), "x-tailwind-library-key": encodeURIComponent(input.libraryKey) } }));
    const tx = (await options.db()).transaction("tailwind", "readwrite");
    const store = tx.objectStore("tailwind");
    const own = IDBKeyRange.bound([input.libraryKey, 0], [input.libraryKey, Infinity]);
    const index = store.index("libraryKey+lastUsedAt");
    const [previous, known] = await Promise.all([result<TailwindRecord | undefined>(store.get(input.key)), result(index.count(own))]);
    const time = now();
    store.put({ key: input.key, libraryKey: input.libraryKey, candidates: input.candidates, domClasses: input.domClasses, bytes, url, createdAt: previous?.createdAt ?? time, lastUsedAt: time } satisfies TailwindRecord);
    const evicted: TailwindRecord[] = [];
    if (known === 0) evicted.push(...(await result<TailwindRecord[]>(store.getAll())).filter((record) => record.libraryKey !== input.libraryKey));
    const others = (await result<TailwindRecord[]>(index.getAll(own))).filter((record) => record.key !== input.key);
    evicted.push(...others.slice(0, Math.max(0, others.length - (keep - 1))));
    for (const record of evicted) store.delete(record.key);
    await committed(tx);
    await Promise.all(evicted.map((record) => options.cache.delete(record.url)));
  }

  return { read, write };
}
