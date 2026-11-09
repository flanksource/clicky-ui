import { describe, expect, it, vi } from "vitest";
import type { PageLock, RuntimeProfile } from "../schema.ts";
import { memoryCaches } from "../link/testing-cache.ts";
import { conversionFixture, CONVERTER, PROFILE } from "../../spikes/esm-sh/fixtures.ts";
import { createRouter, contentSecurityPolicy } from "./router.ts";
import { BASE_PLUGINS } from "./compiler.ts";
import { resolvePage } from "./resolver.ts";
import { digest } from "./integrity.ts";
import { createRequestActivity } from "./activity.ts";

const WITHOUT_CONVERTER: RuntimeProfile = Object.fromEntries(Object.entries(PROFILE).filter(([key]) => key !== "convert")) as RuntimeProfile;
const origin = "https://runtime.example";
const entry = "/esm/react-copy-to-clipboard@5.1.1/__entry.mjs";
const module = "/esm/react-copy-to-clipboard@5.1.1/es2022/react-copy-to-clipboard.development.mjs";

async function setup(options: { mutate?: (lock: PageLock, modules: Map<string, string>) => Promise<void>; profile?: RuntimeProfile } = {}) {
  const fixture = await conversionFixture();
  const lock = await resolvePage({ page: "report.tsx", profile: PROFILE, manifest: { dependencies: { "react-copy-to-clipboard": "^5" } }, fetch: fixture.fetcher, now: Date.parse("2026-01-10") });
  await options.mutate?.(lock, fixture.modules);
  const caches = memoryCaches();
  const fetcher = vi.fn(fixture.fetcher);
  const create = () => createRouter({ origin, version: "converted-test", profile: options.profile ?? PROFILE, caches, fetch: fetcher, plugins: BASE_PLUGINS });
  const router = create();
  await router.message({ type: "open", page: lock.page, manifest: { dependencies: {} }, files: { [lock.page]: 'export { default } from "react-copy-to-clipboard";' }, lock });
  fetcher.mockClear();
  return { ...fixture, lock, caches, fetcher, router, create, request: (path: string) => new Request(`${origin}${path}?page=${lock.page}`) };
}

describe("/esm package serving", () => {
  it("verifies raw bytes then rewrites internal paths and scoped bare dependencies with page context", async () => {
    const fixture = await setup();
    const entryResponse = await fixture.router.route(fixture.request(entry));
    expect(entryResponse.headers.get("x-page-integrity")).toBe(fixture.lock.integrity[entry.slice(1)]);
    expect(await entryResponse.text()).toContain(`${module}`);
    const code = await (await fixture.router.route(fixture.request(module))).text();
    expect(code).toContain("/esm/copy-to-clipboard@3.3.3/__entry.mjs");
    expect(code).toContain("/npm/react@18.3.1/index.js");
    expect(code).not.toContain('from"react"');
    const pageCode = await (await fixture.router.route(fixture.request("/src/report.tsx"))).text();
    expect(pageCode).toContain(`${entry}`);
    expect(fixture.fetcher).toHaveBeenCalledWith(`${CONVERTER}/*react-copy-to-clipboard@5.1.1?dev&target=es2022`, { mode: "cors", credentials: "omit", redirect: "error" });
  });

  it("shares request de-duplication and persistent raw-byte cache with the npm serving path", async () => {
    const fixture = await setup();
    const responses = await Promise.all([fixture.router.route(fixture.request(entry)), fixture.router.route(fixture.request(entry))]);
    expect(await responses[0]!.text()).toBe(await responses[1]!.text());
    expect(fixture.fetcher).toHaveBeenCalledTimes(1);
    const warm = await fixture.create().route(fixture.request(entry));
    expect(warm.headers.get("server-timing")).toContain('cache;desc="hit"');
    expect(fixture.fetcher).toHaveBeenCalledTimes(1);
  });

  it.each(["/node/process.mjs", "/*other@1.0.0/es2022/other.mjs"])("rejects a pinned converter module importing %s", async (specifier) => {
    const fixture = await setup({ mutate: async (lock, modules) => {
      const code = `import ${JSON.stringify(specifier)};`;
      modules.set("/*react-copy-to-clipboard@5.1.1?dev&target=es2022", code);
      lock.integrity[entry.slice(1)] = await digest(new TextEncoder().encode(code));
    } });
    const response = await fixture.router.route(fixture.request(entry));
    expect(response.headers.get("x-page-runtime-error")).toBe("fetch");
    expect(await response.text()).toContain("react-copy-to-clipboard@5.1.1");
  });

  it("rejects changed converter output with the lock and fixed-image remedies", async () => {
    const fixture = await setup();
    fixture.modules.set("/*react-copy-to-clipboard@5.1.1?dev&target=es2022", "export default 'changed';");
    const response = await fixture.router.route(fixture.request(entry));
    expect(response.headers.get("x-page-runtime-error")).toBe("fetch");
    expect(await response.text()).toMatch(/react-copy-to-clipboard@5.1.1.*integrity mismatch.*re-resolve.*fixed self-hosted esm.sh image/);
  });

  it("rejects unlocked converted files without fetching them", async () => {
    const fixture = await setup();
    const response = await fixture.router.route(fixture.request("/esm/react-copy-to-clipboard@5.1.1/unlocked.mjs"));
    expect(await response.text()).toContain("not part of the page's library set");
    expect(fixture.fetcher).not.toHaveBeenCalled();
  });

  it("fails when a converted lock is opened under a profile without its converter", async () => {
    const fixture = await setup({ profile: WITHOUT_CONVERTER });
    expect(await (await fixture.router.route(fixture.request(entry))).text()).toContain("converter is not configured");
    expect(fixture.fetcher).not.toHaveBeenCalled();
  });

  it("adds only the configured converter to connect-src and retains npm request diagnostics", () => {
    expect(contentSecurityPolicy(PROFILE, "nonce")).toContain(`connect-src 'self' ${PROFILE.packageOrigin} ${PROFILE.registry} ${CONVERTER}`);
    expect(contentSecurityPolicy(WITHOUT_CONVERTER, "nonce")).not.toContain(CONVERTER);
    expect(createRequestActivity(`${origin}${module}`)).toMatchObject({ kind: "npm", package: { name: "react-copy-to-clipboard", version: "5.1.1", path: "es2022/react-copy-to-clipboard.development.mjs" } });
  });
});
