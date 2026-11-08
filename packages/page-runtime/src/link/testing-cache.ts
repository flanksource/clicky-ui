import type { StoredLink } from "./types.ts";
import type { createLinkStore } from "./storage.ts";

export function memoryLinkStorage(): ReturnType<typeof createLinkStore> {
  const links = new Map<string, StoredLink>();
  return { async get(id) { const link = links.get(id); if (!link) throw new Error(`Unknown library link ${id}`); return structuredClone(link); }, async put(link) { links.set(link.id, structuredClone(link)); }, async list() { return [...links.values()].map((link) => structuredClone(link)); }, async remove(id) { links.delete(id); }, async close() {} };
}

export function memoryCaches(): CacheStorage {
  const stores = new Map<string, Map<string, Response>>();
  const address = (key: RequestInfo | URL) => typeof key === "string" ? key : key instanceof URL ? key.href : key.url;
  return {
    async open(name: string) {
      const entries = stores.get(name) ?? new Map<string, Response>(); stores.set(name, entries);
      return { async put(key: RequestInfo | URL, response: Response) { entries.set(address(key), response.clone()); }, async match(key: RequestInfo | URL) { return entries.get(address(key))?.clone(); }, async keys() { return [...entries.keys()].map((key) => new Request(key)); }, async delete(key: RequestInfo | URL) { return entries.delete(address(key)); } };
    },
    async keys() { return [...stores.keys()]; },
    async delete(name: string) { return stores.delete(name); },
  } as unknown as CacheStorage;
}
