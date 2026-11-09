import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it, vi } from "vitest";
import type { RuntimeProfile } from "../schema.ts";
import { exampleLink, exampleLock } from "../link/testing-fixtures.ts";
import { memoryCaches, memoryLinkStorage } from "../link/testing-cache.ts";
import { composeLinkOverrides } from "../link/overrides.ts";
import { candidatesForPage, openRuntimeDb } from "../storage/db.ts";
import { createLinkRoutes } from "./link-route.ts";
import { createRouter } from "./router.ts";
import { BASE_PLUGINS } from "./compiler.ts";
import { cleanupLegacyStorage } from "./legacy-storage.ts";

const origin = "https://runtime.example";
const profile: RuntimeProfile = { runtimeDomain: "runtime.example", embedders: ["https://host.example"], packageOrigin: "https://packages.example", registry: "https://registry.example", managed: {}, policy: { dependencies: "strict" }, minReleaseAgeDays: 0, network: { allow: [] }, csp: { add: {} }, links: "allow", sources: ["host"], readinessTimeoutMs: 1000 };
const plugins = BASE_PLUGINS;
const key = "a".repeat(64);

async function seededRouter(files: Record<string, string>) {
  const caches = memoryCaches();
  const factory = new IDBFactory();
  await (await caches.open("page-runtime-test-pages")).put(`${origin}/__runtime/pages/page.tsx`, Response.json({ lock: exampleLock(), files }));
  const keys = vi.fn();
  const open = caches.open.bind(caches);
  caches.open = async (name) => {
    const cache = await open(name);
    const original = cache.keys.bind(cache);
    cache.keys = async (...args) => { keys(name); return original(...args); };
    return cache;
  };
  const router = createRouter({ origin, version: "test", profile: { ...profile, links: "deny" }, caches, plugins, indexedDB: factory });
  return { router, caches, factory, keys, get: (path: string) => router.route(new Request(`${origin}${path}`)) };
}

describe("runtime candidates in IndexedDB", () => {
  it("records each compiled module's candidates and serves a page's candidates through the page index without listing any cache", async () => {
    const { get, factory, keys } = await seededRouter({ "page.tsx": 'export default "flex p-4 hover:bg-red-500";', "helper.ts": 'export default "grid grid-cols-3";' });
    expect((await get("/src/page.tsx?page=page.tsx")).status).toBe(200);
    expect((await get("/src/helper.ts?page=page.tsx")).status).toBe(200);
    const response = await get("/__runtime/candidates?page=page.tsx");
    expect(await response.json()).toEqual(expect.arrayContaining(["flex", "p-4", "hover:bg-red-500", "grid", "grid-cols-3"]));
    expect(keys).not.toHaveBeenCalled();
    const records = await candidatesForPage(await openRuntimeDb({ factory }), "page.tsx");
    expect(records.map(({ page, module, sourceHash }) => ({ page, module, hashed: sourceHash.startsWith("sha384-") })).sort((a, b) => a.module.localeCompare(b.module))).toEqual([
      { page: "page.tsx", module: "/src/helper.ts", hashed: true }, { page: "page.tsx", module: "/src/page.tsx", hashed: true },
    ]);
  });

  it("keeps candidates of other pages out of a page's response", async () => {
    const { get, factory } = await seededRouter({ "page.tsx": 'export default "flex";' });
    const db = await openRuntimeDb({ factory });
    const tx = db.transaction("candidates", "readwrite");
    tx.objectStore("candidates").put({ page: "other.tsx", module: "/src/other.tsx", sourceHash: "h", candidates: ["only-other"] });
    await new Promise((resolve) => { tx.oncomplete = resolve; });
    await get("/src/page.tsx?page=page.tsx");
    const candidates = await (await get("/__runtime/candidates?page=page.tsx")).json() as string[];
    expect(candidates).toContain("flex");
    expect(candidates).not.toContain("only-other");
  });

  it("writes link-compiled page candidates to IndexedDB instead of Cache Storage", async () => {
    const link = exampleLink();
    const lock = composeLinkOverrides({ lock: exampleLock(), links: [link], profile, developerOverrides: true });
    const store = memoryLinkStorage(); await store.put(link);
    const caches = memoryCaches(); const factory = new IDBFactory();
    const handler = createLinkRoutes({ origin, version: "test", profile, caches, store, plugins, indexedDB: factory, load: async () => ({ lock, files: { "page.tsx": 'import {Counter} from "@flanksource/clicky-ui"; export const label = "text-2xl font-bold"; export default Counter;' } }), fetch: async () => new Response('export const Counter: string = "counter";') });
    expect((await handler(new Request(`${origin}/src/page.tsx?page=page.tsx`)))?.status).toBe(200);
    const [record] = await candidatesForPage(await openRuntimeDb({ factory }), "page.tsx");
    expect({ module: record!.module, candidates: record!.candidates.filter((name) => ["text-2xl", "font-bold"].includes(name)).sort() }).toEqual({ module: "/src/page.tsx", candidates: ["font-bold", "text-2xl"] });
    expect(await (await caches.open("page-runtime-test-compiled")).keys()).toEqual([]);
  });
});

describe("generated Tailwind stylesheets", () => {
  it("serves a stored stylesheet as text/css from the version's tailwind cache without a page context", async () => {
    const { get, caches } = await seededRouter({ "page.tsx": "export default 1;" });
    await (await caches.open("page-runtime-test-tailwind")).put(`${origin}/__runtime/tailwind/${key}.css`, new Response(".a{display:block}", { headers: { "content-type": "text/css; charset=utf-8" } }));
    const response = await get(`/__runtime/tailwind/${key}.css`);
    expect({ status: response.status, type: response.headers.get("content-type"), body: await response.text() }).toEqual({ status: 200, type: "text/css; charset=utf-8", body: ".a{display:block}" });
    expect((await get(`/__runtime/tailwind/${key}.css?page=page.tsx`)).status).toBe(200);
  });

  it("answers a missing stylesheet with 404 and x-page-runtime-error rather than an empty stylesheet", async () => {
    const { get } = await seededRouter({ "page.tsx": "export default 1;" });
    const response = await get(`/__runtime/tailwind/${"b".repeat(64)}.css?page=page.tsx`);
    expect({ status: response.status, error: response.headers.get("x-page-runtime-error") }).toEqual({ status: 404, error: "fetch" });
    expect(await response.text()).toContain(`${"b".repeat(64)}`);
  });
});

describe("legacy storage cleanup", () => {
  it("deletes the v2 tailwind cache, other versions' tailwind caches and old candidate entries, and keeps everything else", async () => {
    const caches = memoryCaches();
    const put = async (name: string, url: string) => (await caches.open(name)).put(url, new Response("x"));
    await put("page-runtime-tailwind-v2", `${origin}/__runtime/tailwind/old`);
    await put("page-runtime-old-tailwind", `${origin}/__runtime/tailwind/${key}.css`);
    await put("page-runtime-new-tailwind", `${origin}/__runtime/tailwind/${key}.css`);
    await put("page-runtime-new-compiled", `${origin}/__runtime/candidates/page.tsx/%2Fsrc%2Fpage.tsx`);
    await put("page-runtime-new-compiled", `${origin}/__runtime/compiled/hash`);
    await put("page-runtime-old-compiled", `${origin}/__runtime/candidates/page.tsx/page.tsx`);
    await put("page-runtime-new-packages", `${origin}/__runtime/package/x`);
    await cleanupLegacyStorage({ caches, origin, version: "new" });
    expect(await caches.keys()).toEqual(expect.arrayContaining(["page-runtime-new-tailwind", "page-runtime-new-compiled", "page-runtime-new-packages", "page-runtime-old-compiled"]));
    expect(await caches.keys()).not.toEqual(expect.arrayContaining(["page-runtime-tailwind-v2"]));
    expect(await caches.keys()).not.toContain("page-runtime-old-tailwind");
    expect((await (await caches.open("page-runtime-new-compiled")).keys()).map((request) => request.url)).toEqual([`${origin}/__runtime/compiled/hash`]);
    expect((await (await caches.open("page-runtime-old-compiled")).keys()).map((request) => request.url)).toEqual([]);
  });
});
