import type { StoredLink } from "./types.ts";
import { validateLink } from "./validation.ts";

export function createLinkStore(factory?: IDBFactory) {
  let opened: Promise<IDBDatabase> | undefined;
  function database(): Promise<IDBDatabase> {
    return opened ??= new Promise((resolve, reject) => {
      const request = (factory ?? indexedDB).open("page-runtime-links", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("links", { keyPath: "id" });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error("Link database upgrade is blocked"));
    });
  }
  async function transaction<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await database();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("links", mode);
      const request = action(tx.objectStore("links"));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error("Link transaction aborted"));
    });
  }
  return {
    async put(link: StoredLink) { validateLink(link); await transaction("readwrite", (store) => store.put(link)); },
    async get(id: string): Promise<StoredLink> { const link = await transaction<StoredLink | undefined>("readonly", (store) => store.get(id)); if (!link) throw new Error(`Unknown library link ${id}`); validateLink(link); return link; },
    async list(): Promise<StoredLink[]> { const links = await transaction<StoredLink[]>("readonly", (store) => store.getAll()); links.forEach(validateLink); return links; },
    async remove(id: string) { await transaction("readwrite", (store) => store.delete(id)); },
    async close() { if (opened) (await opened).close(); opened = undefined; },
  };
}
