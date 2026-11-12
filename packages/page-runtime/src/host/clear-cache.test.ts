import { describe, expect, it, vi } from "vitest";
import { memoryCaches } from "../link/testing-cache.ts";
import { openRuntimeDb, RUNTIME_DB } from "../storage/db.ts";
import { clearPageRuntimeCache } from "./clear-cache.ts";

const runtimeOrigin = "https://playground.example";
const registration = (scope: string) => ({ scope, unregister: vi.fn(async () => true) });
const asRegistrations = (items: Array<{ scope: string; unregister: () => Promise<boolean> }>) => items as unknown as ServiceWorkerRegistration[];
const fakeIndexedDb = (outcome: "success" | "error" | "blocked" = "success") => {
  const deleteDatabase = vi.fn((_name: string) => {
    const request = {} as Record<string, unknown>;
    queueMicrotask(() => {
      if (outcome === "error") { Object.defineProperty(request, "error", { value: new DOMException("denied", "InvalidStateError") }); (request.onerror as () => void)(); }
      else if (outcome === "blocked") (request.onblocked as () => void)();
      else (request.onsuccess as () => void)();
    });
    return request as unknown as IDBOpenDBRequest;
  });
  return { factory: { deleteDatabase } as unknown as IDBFactory, deleteDatabase };
};
const seeded = async (names: string[]) => {
  const caches = memoryCaches();
  for (const name of names) await (await caches.open(name)).put(`${runtimeOrigin}/entry`, new Response("x"));
  return caches;
};
const noWorkers = { getRegistrations: async () => [] as ServiceWorkerRegistration[] };

describe("clearPageRuntimeCache", () => {
  it("deletes only page-runtime Cache Storage caches, the runtime database, and the registrations of the frame scope", async () => {
    const pageRuntimeCaches = ["page-runtime-1-pages", "page-runtime-1-compiled", "page-runtime-1-packages", "page-runtime-1-tailwind", "page-runtime-1-links-source-sizes", "page-runtime-tailwind-v2"];
    const caches = await seeded([...pageRuntimeCaches, "playground-assets", "workbox-precache"]);
    const frame = registration(`${runtimeOrigin}/frame/`); const root = registration(`${runtimeOrigin}/`); const foreign = registration("https://other.example/frame/");
    const database = fakeIndexedDb();
    const cleared = await clearPageRuntimeCache({ runtimeOrigin, scope: "/frame/", caches, indexedDB: database.factory, serviceWorker: { getRegistrations: async () => asRegistrations([frame, root, foreign]) } });
    expect({ cleared, remaining: await caches.keys(), unregistered: [frame, root, foreign].map(item => item.unregister.mock.calls.length), databases: database.deleteDatabase.mock.calls.map(([name]) => name) }).toEqual({
      cleared: { caches: pageRuntimeCaches, databases: ["page-runtime"], registrations: [`${runtimeOrigin}/frame/`] },
      remaining: ["playground-assets", "workbox-precache"],
      unregistered: [1, 0, 0],
      databases: ["page-runtime"],
    });
  });

  it("removes the real runtime database even while a connection to it is open", async () => {
    const db = await openRuntimeDb();
    expect(await indexedDB.databases()).toContainEqual(expect.objectContaining({ name: RUNTIME_DB }));
    await clearPageRuntimeCache({ runtimeOrigin, scope: "/frame/", caches: memoryCaches(), serviceWorker: noWorkers });
    expect(await indexedDB.databases()).not.toContainEqual(expect.objectContaining({ name: RUNTIME_DB }));
    db.close();
  });

  it("never touches the host-origin link store that holds the user's linked checkouts", async () => {
    const database = fakeIndexedDb();
    await clearPageRuntimeCache({ runtimeOrigin, scope: "/frame/", caches: memoryCaches(), indexedDB: database.factory, serviceWorker: noWorkers });
    expect(database.deleteDatabase.mock.calls.map(([name]) => name)).toEqual([RUNTIME_DB]);
  });

  it("reports an empty clear when nothing was cached or registered", async () => {
    expect(await clearPageRuntimeCache({ runtimeOrigin, scope: "/frame/", caches: memoryCaches(), indexedDB: fakeIndexedDb().factory, serviceWorker: noWorkers })).toEqual({ caches: [], databases: ["page-runtime"], registrations: [] });
  });

  it("fails when the runtime database cannot be deleted instead of reporting success", async () => {
    const options = { runtimeOrigin, scope: "/frame/", caches: memoryCaches(), serviceWorker: noWorkers };
    await expect(clearPageRuntimeCache({ ...options, indexedDB: fakeIndexedDb("error").factory })).rejects.toThrow(/page-runtime.*denied/);
    await expect(clearPageRuntimeCache({ ...options, indexedDB: fakeIndexedDb("blocked").factory })).rejects.toThrow(/blocked by another open connection/);
  });

  it("fails when a registration cannot be unregistered", async () => {
    const stuck = { scope: `${runtimeOrigin}/frame/`, unregister: vi.fn(async () => false) };
    await expect(clearPageRuntimeCache({ runtimeOrigin, scope: "/frame/", caches: memoryCaches(), indexedDB: fakeIndexedDb().factory, serviceWorker: { getRegistrations: async () => asRegistrations([stuck]) } })).rejects.toThrow(/could not unregister.*\/frame\//);
  });

  it("fails fast when Cache Storage is unavailable", async () => {
    await expect(clearPageRuntimeCache({ runtimeOrigin, scope: "/frame/", indexedDB: fakeIndexedDb().factory, serviceWorker: noWorkers })).rejects.toThrow(/Cache Storage is unavailable/);
  });
});
