import { expect, it, vi } from "vitest";
import { exampleLock } from "../link/testing-fixtures.ts";
import { memoryCaches } from "../link/testing-cache.ts";
import { createRouter } from "./router.ts";
import { BASE_PLUGINS } from "./compiler.ts";
import { resolvePage } from "./resolver.ts";
import type { PageLock, RuntimePolicy, RuntimeProfile } from "../schema.ts";

vi.mock("./resolver.ts", async (importOriginal) => {
  const { exampleLock: fresh } = await import("../link/testing-fixtures.ts");
  return { ...await importOriginal<typeof import("./resolver.ts")>(), resolvePage: vi.fn(async (options: { lock?: PageLock }) => options.lock ?? { ...fresh(), versions: { resolved: "yes" } }) };
});

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
  const router = createRouter({ origin, version: "test", profile, caches, plugins: BASE_PLUGINS });
  const request = () => router.route(new Request(`${origin}/src/page.tsx?page=page.tsx`));
  await Promise.all([request(), request(), request()]);
  expect(match).toHaveBeenCalledTimes(1);
  const document = await router.route(new Request(`${origin}/frame/page.tsx`));
  expect(await document.text()).toContain('<link rel="modulepreload" href="/src/page.tsx">');
  await router.update("page.tsx", { type: "sources", files: { "page.tsx": 'export default "after";' } });
  expect(await (await request()).text()).toContain('"after"');
});

const hostPolicy: RuntimePolicy = { dependencies: "any" };
const legacyLock = (): PageLock => ({ ...exampleLock(), lock: 1 } as unknown as PageLock);
const manifest = { dependencies: {} };
const storedPage = async (record: Record<string, unknown>) => {
  const caches = memoryCaches();
  await (await caches.open("page-runtime-test-pages")).put(`${origin}/__runtime/pages/page.tsx`, Response.json({ files: { "page.tsx": 'export default "page";' }, manifest, ...record }));
  return { caches, router: createRouter({ origin, version: "test", profile, caches, plugins: BASE_PLUGINS }) };
};

it("re-resolves a stored page under exactly the policy its host declared, not the served profile policy", async () => {
  vi.mocked(resolvePage).mockClear();
  const { router } = await storedPage({ lock: legacyLock(), policy: hostPolicy });
  const response = await router.route(new Request(`${origin}/src/page.tsx?page=page.tsx`));
  expect(response.headers.get("x-page-runtime-error")).toBeNull();
  expect(vi.mocked(resolvePage).mock.calls.map(([options]) => options.profile.policy)).toEqual([hostPolicy]);
});

it("fails loudly instead of re-resolving a stored page that has no saved policy under the served profile policy", async () => {
  vi.mocked(resolvePage).mockClear();
  const { router } = await storedPage({ lock: legacyLock() });
  const response = await router.route(new Request(`${origin}/src/page.tsx?page=page.tsx`));
  expect(response.headers.get("x-page-runtime-error")).toBe("link");
  const body = await response.text();
  expect(body).toContain("page.tsx was stored without its host policy");
  expect(body).toContain("clear the page runtime cache");
  expect(resolvePage).not.toHaveBeenCalled();
});

it("stores the effective policy on open so a later re-resolution never has to guess it", async () => {
  const { caches, router } = await storedPage({ lock: exampleLock() });
  const open = { type: "open" as const, page: "page.tsx", manifest, lock: exampleLock(), files: { "page.tsx": "export {};" } };
  await router.message(open);
  const read = async () => (await (await (await caches.open("page-runtime-test-pages")).match(`${origin}/__runtime/pages/page.tsx`))!.json()) as { policy?: RuntimePolicy };
  expect((await read()).policy).toEqual(profile.policy);
  await router.message({ ...open, policy: hostPolicy });
  expect((await read()).policy).toEqual(hostPolicy);
});

it("does not reuse the lock of a stored page whose policy was never recorded", async () => {
  vi.mocked(resolvePage).mockClear();
  const { router } = await storedPage({ lock: exampleLock() });
  await router.message({ type: "open", page: "page.tsx", manifest, files: { "page.tsx": "export {};" } });
  expect(vi.mocked(resolvePage).mock.calls.map(([options]) => options.lock)).toEqual([undefined]);
});
