import { RUNTIME_DB } from "../storage/db.ts";

/** Every Cache Storage cache the runtime creates (pages, compiled, packages, tailwind, link sizes, legacy tailwind) is named with this prefix. */
export const PAGE_RUNTIME_CACHE_PREFIX = "page-runtime-";

export type ClearPageRuntimeCacheOptions = {
  /** Origin the runtime service worker is registered on. */
  runtimeOrigin: string;
  /** Scope the host registered the runtime worker with, for example `/frame/`. Resolved against `runtimeOrigin`. */
  scope: string;
  /** Defaults to the global `caches`. */
  caches?: CacheStorage;
  /** Defaults to the global `indexedDB`. */
  indexedDB?: IDBFactory;
  /** Defaults to `navigator.serviceWorker`. */
  serviceWorker?: Pick<ServiceWorkerContainer, "getRegistrations">;
};

export type ClearedPageRuntimeCache = {
  /** Names of the deleted Cache Storage caches. */
  caches: string[];
  /** Names of the deleted IndexedDB databases. */
  databases: string[];
  /** Scopes of the unregistered service worker registrations. */
  registrations: string[];
};

function deleteDatabase(options: { factory: IDBFactory; name: string }): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = options.factory.deleteDatabase(options.name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`${options.name} database could not be deleted: ${request.error?.message ?? "unknown IndexedDB error"}`));
    request.onblocked = () => reject(new Error(`${options.name} database deletion is blocked by another open connection; close other tabs of this runtime`));
  });
}

/**
 * Wipes everything the page runtime stored in the browser so the next open resolves, compiles and fetches from scratch:
 * the registrations of the runtime worker for `scope`, every `page-runtime-*` Cache Storage cache, and the `page-runtime`
 * IndexedDB database (candidates and Tailwind records). Host-side state, including `localStorage` overrides and the
 * host-origin `page-runtime-links` store of linked checkouts, is left alone. The host reopens its pages afterwards, which
 * registers the worker again and writes fresh page records. Any browser API that is unavailable or refuses is an error.
 */
export async function clearPageRuntimeCache(options: ClearPageRuntimeCacheOptions): Promise<ClearedPageRuntimeCache> {
  const storage = options.caches ?? (typeof caches === "undefined" ? undefined : caches);
  if (!storage) throw new Error("Cache Storage is unavailable; the page runtime cache cannot be cleared");
  const factory = options.indexedDB ?? (typeof indexedDB === "undefined" ? undefined : indexedDB);
  if (!factory) throw new Error("IndexedDB is unavailable; the page runtime cache cannot be cleared");
  const workers = options.serviceWorker ?? (typeof navigator === "undefined" ? undefined : navigator.serviceWorker);
  if (!workers) throw new Error("Service workers are unavailable; the page runtime cache cannot be cleared");
  const scope = new URL(options.scope, options.runtimeOrigin).href;
  const registrations: string[] = [];
  for (const registration of await workers.getRegistrations()) {
    if (registration.scope !== scope) continue;
    if (!await registration.unregister()) throw new Error(`The browser could not unregister the runtime service worker for ${registration.scope}`);
    registrations.push(registration.scope);
  }
  const cleared: string[] = [];
  for (const name of await storage.keys()) {
    if (!name.startsWith(PAGE_RUNTIME_CACHE_PREFIX)) continue;
    if (!await storage.delete(name)) throw new Error(`Cache Storage did not delete ${name}`);
    cleared.push(name);
  }
  await deleteDatabase({ factory, name: RUNTIME_DB });
  return { caches: cleared, databases: [RUNTIME_DB], registrations };
}
