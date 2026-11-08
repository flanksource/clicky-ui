import { expect, it, vi } from "vitest";
import type { RuntimeProfile } from "../schema.ts";
import { composeLinkOverrides } from "../link/overrides.ts";
import { memoryCaches, memoryLinkStorage } from "../link/testing-cache.ts";
import { exampleLink, exampleLock } from "../link/testing-fixtures.ts";
import { createLinkRoutes } from "./link-route.ts";
import { createRouter, digest } from "./router.ts";
import { facetPlugins } from "./compiler.ts";
import { applyLinkActivity, createRequestActivity } from "./activity.ts";
import type { LinkActivity } from "./link-activity.ts";
import { createLinkStore } from "../link/storage.ts";

vi.mock("../link/storage.ts", () => ({ createLinkStore: vi.fn() }));

const origin = "https://runtime.example";
const profile: RuntimeProfile = { runtimeDomain: "runtime.example", embedders: ["https://host.example"], packageOrigin: "https://packages.example", registry: "https://registry.example", managed: {}, policy: { dependencies: "strict" }, minReleaseAgeDays: 0, network: { allow: [] }, csp: { add: {} }, links: "allow", sources: ["host"], readinessTimeoutMs: 1000 };
const source = 'export const Counter: string = "héllo";';
const sourceBytes = new TextEncoder().encode(source).byteLength;

async function fixture(options: { fetch?: typeof fetch } = {}) {
  const link = exampleLink(); const caches = memoryCaches(); const store = memoryLinkStorage();
  const lock = composeLinkOverrides({ lock: exampleLock(), links: [link], profile, developerOverrides: true });
  const saved = { lock, files: { "page.tsx": 'export default "Page";' } };
  await store.put(link);
  vi.mocked(createLinkStore).mockReturnValue(store);
  await (await caches.open("page-runtime-activity-pages")).put(`${origin}/__runtime/pages/page.tsx`, Response.json(saved));
  const settings = { origin, version: "activity", profile, caches, store, plugins: facetPlugins(() => () => undefined), load: async () => saved, fetch: options.fetch ?? (async () => new Response(source, { headers: { "content-length": "19" } })) };
  return { settings, handler: createLinkRoutes(settings), saved };
}

async function metrics(handler: ReturnType<typeof createLinkRoutes>, path = "/link/checkout/src/Counter.tsx"): Promise<LinkActivity> {
  const response = await handler(new Request(`${origin}${path}?page=page.tsx`));
  if (!response) throw new Error("Missing linked response");
  const record = createRequestActivity(`${origin}${path}?page=page.tsx`);
  expect(applyLinkActivity({ response, record })).toBe(true);
  expect(record.outputBytes).toBe((await response.arrayBuffer()).byteLength);
  return record;
}

it("measures source fetch and compile, then zero work for memory and persistent output hits", async () => {
  const { handler, settings } = await fixture();
  const cold = await metrics(handler);
  expect(cold).toMatchObject({ source: "compiled", cache: "miss", origin: "http://127.0.0.1:9000/src/Counter.tsx", decodedBytes: sourceBytes, transferredBytes: 19, unavailable: [] });
  expect(cold.fetchMs).toBeGreaterThan(0); expect(cold.compileMs).toBeGreaterThan(0); expect(cold.rewriteMs).toBeGreaterThan(0);
  const warm = await metrics(handler);
  const stored = await metrics(createLinkRoutes(settings));
  for (const [record, cache] of [[warm, "memory"], [stored, "storage"]] as const) expect(record).toMatchObject({ source: "cache", cache, decodedBytes: sourceBytes, transferredBytes: 0, fetchMs: 0, integrityMs: 0, compileMs: 0, rewriteMs: 0, unavailable: [] });
});

it("retains the new fetch cost on a content hit after path invalidation", async () => {
  const { handler } = await fixture(); await metrics(handler);
  await handler(new Request(`${origin}/link/_control`, { method: "POST", body: JSON.stringify({ developerOverrides: true, command: { type: "invalidate", id: "checkout", paths: ["src/Counter.tsx"] } }) }));
  const hit = await metrics(handler);
  expect(hit).toMatchObject({ source: "cache", cache: "memory", decodedBytes: sourceBytes, transferredBytes: 19, compileMs: 0, rewriteMs: 0 });
  expect(hit.fetchMs).toBeGreaterThan(0);
});

it("reports unavailable transfer bytes when the source server omits Content-Length", async () => {
  const { handler } = await fixture({ fetch: async () => new Response(source) });
  expect(await metrics(handler)).toMatchObject({ decodedBytes: sourceBytes, transferredBytes: null, unavailable: [] });
  expect(await metrics(handler, "/src/page.tsx")).toMatchObject({ transferredBytes: 0, origin: null, source: "compiled" });
});

it("measures package integrity and generated agent/shim rewrites", async () => {
  const { handler, saved } = await fixture({ fetch: async () => new Response("export default 1;", { headers: { "content-length": "17" } }) });
  saved.lock.integrity["acme@1.0.0/index.js"] = await digest(new TextEncoder().encode("export default 1;"));
  const pkg = await metrics(handler, "/npm/acme@1.0.0/index.js");
  expect(pkg).toMatchObject({ source: "network", decodedBytes: 17, transferredBytes: 17, origin: "https://packages.example/acme@1.0.0/index.js" });
  expect(pkg.integrityMs).toBeGreaterThan(0);
  const agent = await metrics(handler, "/__runtime/page-agent.js");
  expect(agent).toMatchObject({ source: "network", generated: "page agent module", origin: `${origin}/page-agent.js`, transferredBytes: 17 });
  expect(agent.rewriteMs).toBeGreaterThan(0);
  saved.lock.map.imports["react/jsx-dev-runtime"] = saved.lock.map.imports.react!;
  const shim = await metrics(handler, "/__runtime/jsx-dev-runtime.js");
  expect(shim).toMatchObject({ source: "generated", generated: "JSX development shim", origin: null, transferredBytes: 0 });
  expect(shim.rewriteMs).toBeGreaterThan(0);
});

it("caches generated agent rewrites by context and original bytes while retaining each source fetch", async () => {
  let source = "export default 1;";
  const { handler, settings } = await fixture({ fetch: async () => new Response(source, { headers: { "content-length": String(new TextEncoder().encode(source).byteLength) } }) });
  const cold = await metrics(handler, "/__runtime/page-agent.js");
  const warm = await metrics(handler, "/__runtime/page-agent.js");
  const stored = await metrics(createLinkRoutes(settings), "/__runtime/page-agent.js");
  expect(cold.rewriteMs).toBeGreaterThan(0);
  for (const [record, cache] of [[warm, "memory"], [stored, "storage"]] as const) {
    expect(record).toMatchObject({ source: "cache", cache, generated: "page agent module", transferredBytes: 17, decodedBytes: 17, compileMs: 0, rewriteMs: 0 });
    expect(record.fetchMs).toBeGreaterThan(0);
  }
  source = "export default 123;";
  const changed = await metrics(handler, "/__runtime/page-agent.js");
  expect(changed).toMatchObject({ source: "network", cache: "miss", decodedBytes: 19 });
  expect(changed.rewriteMs).toBeGreaterThan(0);
});

it.each(["fetch", "compile", "integrity", "rewrite"] as const)("keeps measured %s costs on linked errors at the router boundary", async (phase) => {
  const bad = phase === "compile" ? "export const Counter = <div>" : phase === "rewrite" ? 'import x from "outside"; export default x;' : "bad integrity";
  const { settings, saved } = await fixture({ fetch: async () => {
    if (phase === "fetch") throw new Error("Source server offline");
    return new Response(bad);
  } });
  const path = phase === "integrity" ? "/npm/acme@1.0.0/index.js" : "/link/checkout/src/Counter.tsx";
  saved.lock.integrity["acme@1.0.0/index.js"] = "sha384-invalid";
  await (await settings.caches.open("page-runtime-activity-pages")).put(`${origin}/__runtime/pages/page.tsx`, Response.json(saved));
  const router = createRouter({ ...settings, onActivity: ({ record }) => {
    expect(record.error?.phase).toBe("link");
    expect(record[`${phase}Ms`]).toBeGreaterThan(0);
    expect(record.origin).not.toBeNull();
  } });
  const response = await router.route(new Request(`${origin}${path}?page=page.tsx`));
  expect(response.headers.get("x-page-runtime-error")).toBe("link");
  expect(response.headers.get("server-timing")).not.toContain("unavailable");
});

it("answers a failed frame navigation with a frame document that carries the runtime error to boot", async () => {
  const { settings } = await fixture({ fetch: async () => { throw new Error("Source server offline"); } });
  const request = new Request(`${origin}/link/checkout/src/Counter.tsx?page=page.tsx`);
  Object.defineProperty(request, "mode", { value: "navigate" });
  const response = await createRouter(settings).route(request);
  const html = await response.text();
  const embedded = /<script type="application\/json" id="page-runtime-error">(.*?)<\/script>/.exec(html)?.[1];
  expect({ status: response.status, type: response.headers.get("content-type"), phase: response.headers.get("x-page-runtime-error"), csp: response.headers.get("content-security-policy") }).toEqual({ status: 500, type: "text/html; charset=utf-8", phase: "link", csp: expect.stringContaining("frame-ancestors https://host.example") });
  expect(html).toContain('src="/boot.js"');
  expect(html).not.toContain("throw Object.assign");
  expect(JSON.parse(embedded!)).toMatchObject({ phase: "link", file: "/link/checkout/src/Counter.tsx", message: expect.stringContaining("Source server offline") });
});
