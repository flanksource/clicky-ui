import { tailwindCacheName } from "../storage/db.ts";

/**
 * Removes what earlier runtimes kept in Cache Storage: the v2 Tailwind cache, other versions' Tailwind caches (their
 * IndexedDB records are cleared when the current library key first writes), and per-module candidate entries, which
 * now live in IndexedDB.
 */
export async function cleanupLegacyStorage(options: { caches: CacheStorage; origin: string; version: string }): Promise<void> {
  const current = tailwindCacheName(options.version);
  const names = await options.caches.keys();
  await Promise.all(names.map(async (name) => {
    if (name === "page-runtime-tailwind-v2" || (/^page-runtime-.+-tailwind$/.test(name) && name !== current)) { await options.caches.delete(name); return; }
    if (!/^page-runtime-.+-compiled$/.test(name)) return;
    const cache = await options.caches.open(name);
    const legacy = `${options.origin}/__runtime/candidates/`;
    await Promise.all((await cache.keys()).filter((request) => request.url.startsWith(legacy)).map((request) => cache.delete(request)));
  }));
}
