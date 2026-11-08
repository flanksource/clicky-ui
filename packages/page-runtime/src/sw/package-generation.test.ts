import { describe, expect, it } from "vitest";
import { exampleLink, exampleLock } from "../link/testing-fixtures.ts";
import { memoryCaches, memoryLinkStorage } from "../link/testing-cache.ts";
import { createRouter, digest } from "./router.ts";
import { facetPlugins } from "./compiler.ts";
import type { RuntimeProfile } from "../schema.ts";
import { createLinkRoutes } from "./link-route.ts";

describe("pinned package origins", () => {
  it.each([false, true])("fetches uncached package modules from the page lock with linked sources %s", async linked => {
    const origin = "https://runtime.example";
    const oldOrigin = "https://packages.example/_generations/first";
    const profile: RuntimeProfile = { runtimeDomain: "runtime.example", embedders: ["https://host.example"], packageOrigin: "https://packages.example/_generations/second", registry: "https://registry.example", managed: {}, policy: { dependencies: "strict" }, minReleaseAgeDays: 0, network: { allow: [] }, csp: { add: {} }, links: "allow", sources: ["host"], readinessTimeoutMs: 1000 };
    const lock = exampleLock();
    lock.packageOrigin = oldOrigin;
    const path = "@flanksource/clicky-ui@1.0.0/index.js";
    const code = "export const generation = 'first';";
    lock.integrity[path] = await digest(new TextEncoder().encode(code));
    if (linked) lock.map.imports["@acme/linked"] = "/link/checkout/src/index.ts";
    const requests: string[] = [];
    const caches = memoryCaches();
    const router = createRouter({ origin, version: "test", profile, caches, plugins: facetPlugins(() => () => undefined), fetch: async input => { requests.push(String(input)); return new Response(code); } });
    await router.message({ type: "open", page: lock.page, lock, manifest: { dependencies: {} }, files: { [lock.page]: 'export default "page";' } });
    const store = memoryLinkStorage(); await store.put(exampleLink());
    const route = linked ? createLinkRoutes({ origin, version: "test", profile, caches, store, load: async () => ({ lock, files: {} }), plugins: facetPlugins(() => () => undefined), fetch: async input => { requests.push(String(input)); return new Response(code); } }) : router.route;
    const response = await route(new Request(`${origin}/npm/${path}?page=${lock.page}`));
    expect(await response?.text()).toContain("first");
    expect(requests).toEqual([`${oldOrigin}/${path}`]);
    const frame = await route(new Request(`${origin}/frame/${lock.page}`));
    expect(frame?.headers.get("content-security-policy")).toContain(oldOrigin);
    expect(await frame?.text()).toContain(`"packageOrigin":"${oldOrigin}"`);
  });
});
