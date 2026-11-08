import { expect, it, vi } from "vitest";
import { exampleLock } from "../link/testing-fixtures.ts";
import { memoryCaches } from "../link/testing-cache.ts";
import { createRouter } from "./router.ts";
import { facetPlugins } from "./compiler.ts";
import type { RuntimeProfile } from "../schema.ts";

const origin = "https://runtime.example";
const profile: RuntimeProfile = { runtimeDomain: "runtime.example", embedders: ["https://host.example"], packageOrigin: "https://packages.example", registry: "https://registry.example", managed: {}, policy: { dependencies: "strict" }, minReleaseAgeDays: 0, network: { allow: [] }, csp: { add: {} }, links: "deny", sources: ["host"], readinessTimeoutMs: 1000 };

it("loads and validates a persisted page once for concurrent module requests and keeps edits current", async () => {
  const caches = memoryCaches();
  const store = await caches.open("page-runtime-test-pages");
  const lock = exampleLock();
  await store.put(`${origin}/__runtime/pages/page.tsx`, Response.json({ lock, files: { "page.tsx": 'export default "before";' } }));
  const match = vi.spyOn(store, "match");
  const open = caches.open.bind(caches);
  vi.spyOn(caches, "open").mockImplementation(async (name) => name === "page-runtime-test-pages" ? store : open(name));
  const router = createRouter({ origin, version: "test", profile, caches, plugins: facetPlugins(() => () => undefined) });
  const request = () => router.route(new Request(`${origin}/src/page.tsx?page=page.tsx`));
  await Promise.all([request(), request(), request()]);
  expect(match).toHaveBeenCalledTimes(1);
  const document = await router.route(new Request(`${origin}/frame/page.tsx`));
  expect(await document.text()).toContain('<link rel="modulepreload" href="/src/page.tsx">');
  await router.update("page.tsx", { type: "sources", files: { "page.tsx": 'export default "after";' } });
  expect(await (await request()).text()).toContain('"after"');
});
