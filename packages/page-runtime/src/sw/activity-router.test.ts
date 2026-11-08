import { expect, it } from "vitest";
import { exampleLock } from "../link/testing-fixtures.ts";
import { memoryCaches } from "../link/testing-cache.ts";
import { createRouter, digest } from "./router.ts";
import { facetPlugins } from "./compiler.ts";
import { validateActivity, type WorkerActivity } from "../activity-schema.ts";
import type { RuntimeProfile } from "../schema.ts";

const origin = "https://runtime.example";
const profile: RuntimeProfile = { runtimeDomain: "runtime.example", embedders: ["https://host.example"], packageOrigin: "https://packages.example", registry: "https://registry.example", managed: {}, policy: { dependencies: "strict" }, minReleaseAgeDays: 0, network: { allow: [] }, csp: { add: {} }, links: "deny", sources: ["host"], readinessTimeoutMs: 1000 };

it("records actual compile, network, transformed-memory and Cache Storage paths with response timing headers", async () => {
  const caches = memoryCaches(); const lock = exampleLock();
  const code = 'export const greeting = "héllo";'; const path = "@acme/widgets@1.2.3/index.js";
  lock.integrity[path] = await digest(new TextEncoder().encode(code));
  await (await caches.open("page-runtime-activity-pages")).put(`${origin}/__runtime/pages/page.tsx`, Response.json({ lock, files: { "page.tsx": 'export default "Page";' } }));
  const records: WorkerActivity[] = [];
  const routerOptions = { origin, version: "activity", profile, caches, plugins: facetPlugins(() => () => undefined), fetch: async () => new Response(code, { headers: { "content-length": String(new TextEncoder().encode(code).byteLength), "cache-control": "immutable" } }), onActivity: ({ record }: { record: WorkerActivity }) => { records.push(record); } };
  let router = createRouter(routerOptions);
  const request = async (path: string) => {
    const response = await router.route(new Request(`${origin}${path}`));
    expect(response.headers.get("server-timing")).toMatch(/fetch;dur=\d+\.\d+, integrity;dur=/);
    return response;
  };
  await request("/frame/page.tsx");
  await request("/src/page.tsx?page=page.tsx"); await request("/src/page.tsx?page=page.tsx");
  await request(`/npm/${path}?page=page.tsx`); await request(`/npm/${path}?page=page.tsx`);
  router = createRouter(routerOptions); await request(`/npm/${path}?page=page.tsx`);
  expect(records.map((r) => [r.kind, r.source, r.cache])).toEqual([["frame", "generated", "miss"], ["src", "compiled", "miss"], ["src", "cache", "storage"], ["npm", "network", "miss"], ["npm", "cache", "memory"], ["npm", "cache", "storage"]]);
  expect(records[0]?.generated).toContain("import map");
  expect(records[3]).toMatchObject({ origin: `https://packages.example/${path}`, decodedBytes: 33, transferredBytes: 33, outputBytes: 33, headers: { "cache-control": "immutable", "x-page-integrity": lock.integrity[path] } });
  for (const record of records) expect(validateActivity({ type: "activity", load: "test", navigationStart: 0, records: [record], timeline: [], tailwind: [] }).records).toEqual([record]);
});

it("records compiler and integrity errors with their phase", async () => {
  const caches = memoryCaches(); const lock = exampleLock(); lock.integrity["acme@1.0.0/index.js"] = "sha384-invalid";
  await (await caches.open("page-runtime-activity-pages")).put(`${origin}/__runtime/pages/page.tsx`, Response.json({ lock, files: { "page.tsx": "export default <div>" } }));
  const records: WorkerActivity[] = [];
  const router = createRouter({ origin, version: "activity", profile, caches, plugins: facetPlugins(() => () => undefined), fetch: async () => new Response("broken integrity"), onActivity: ({ record }) => { records.push(record); } });
  for (const path of ["/src/page.tsx", "/npm/acme@1.0.0/index.js"]) await router.route(new Request(`${origin}${path}?page=page.tsx`));
  expect(records.map((r) => r.error?.phase)).toEqual(["compile", "fetch"]);
  expect(records[0]!.compileMs).toBeGreaterThan(0);
  expect(records[1]!.integrityMs).toBeGreaterThan(0);
  expect(records[1]!.decodedBytes).toBe(16);
});

it("preserves opaque allowed-egress responses and records unavailable sizes without reconstructing them", async () => {
  const opaque = Response.error(); Object.defineProperty(opaque, "type", { value: "opaque" });
  const records: WorkerActivity[] = [];
  const router = createRouter({ origin, version: "activity", profile: { ...profile, network: { allow: ["https://assets.example/*"] } }, caches: memoryCaches(), plugins: facetPlugins(() => () => undefined), fetch: async () => opaque, onActivity: ({ record }) => { records.push(record); } });
  expect(await router.route(new Request("https://assets.example/photo.png"))).toBe(opaque);
  expect(records[0]).toMatchObject({ source: "network", status: 0, transferredBytes: null, decodedBytes: null, outputBytes: null });
});
