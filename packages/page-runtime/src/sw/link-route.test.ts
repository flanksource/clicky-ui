import { describe, expect, it, vi } from "vitest";
import type { RuntimeProfile } from "../schema.ts";
import { exampleLink, exampleLock } from "../link/testing-fixtures.ts";
import { memoryCaches, memoryLinkStorage } from "../link/testing-cache.ts";
import { composeLinkOverrides } from "../link/overrides.ts";
import { createLinkRoutes } from "./link-route.ts";
import { BASE_PLUGINS } from "./compiler.ts";
import { compileLinkModule } from "./link-compiler.ts";
import { PAGE_AGENT_URL } from "./runtime-module.ts";

const profile: RuntimeProfile = { runtimeDomain: "runtime.example", embedders: ["https://host.example"], packageOrigin: "https://packages.example", registry: "https://registry.example", managed: {}, policy: { dependencies: "strict" }, minReleaseAgeDays: 0, network: { allow: [] }, csp: { add: {} }, links: "allow", sources: ["host"], readinessTimeoutMs: 1000 };
const origin = "https://runtime.example";

describe("link route compilation and invalidation", () => {
  it("resolves a published ESM wrapper's CommonJS remap into the checkout runtime", async () => {
    const link = exampleLink();
    link.build.fragment.integrity["@flanksource/clicky-ui@2.0.0/dist/runtime/postcss.js"] = "sha384-postcss";
    link.build.fragment.remaps["postcss@1/postcss.js"] = "@flanksource/clicky-ui@2.0.0/dist/runtime/postcss.js";
    const lock = composeLinkOverrides({ lock: exampleLock(), links: [link], profile, developerOverrides: true });
    const code = await compileLinkModule({ path: "/npm/postcss@1/postcss.mjs", code: 'import postcss from "./postcss.js"; export default postcss;', lock, links: [link], sources: [], query: new URLSearchParams(), plugins: BASE_PLUGINS });
    expect(code).toContain('/link/checkout/dist/runtime/postcss.js');
  });
  it("serves the host relay inside the service worker's frame navigation scope", async () => {
    const handler = createLinkRoutes({ origin, version: "test", profile, caches: memoryCaches(), store: memoryLinkStorage(), plugins: BASE_PLUGINS, load: async () => { throw new Error("relay must not need a page"); } });
    const response = await handler(new Request(`${origin}/frame/__runtime-link-relay`));
    expect(await response?.text()).toContain("Library link connection");
  });
  it("rewrites runtime agent imports with the checkout's barrel and React context", async () => {
    const link = exampleLink();
    const lock = composeLinkOverrides({ lock: exampleLock(), links: [link], profile, developerOverrides: true });
    const store = memoryLinkStorage(); await store.put(link);
    const handler = createLinkRoutes({ origin, version: "test", profile, caches: memoryCaches(), store, plugins: BASE_PLUGINS, load: async () => ({ lock, files: {} }), fetch: async () => new Response('import {Counter} from "@flanksource/clicky-ui"; import React from "react";') });
    const code = await (await handler(new Request(`${origin}${PAGE_AGENT_URL}?page=page.tsx`)))!.text();
    expect([...code.matchAll(/from "([^"]+)"/g)].map((match) => new URL(match[1]!, origin).pathname)).toEqual(["/link/checkout/src/Counter.tsx", "/link/checkout/dist/runtime/react.js"]);
    expect([...code.matchAll(/from "([^"]+)"/g)].map((match) => new URL(match[1]!, origin).search)).toEqual(["", ""]);
  });
  it("uses the composed singleton even when source metadata names an older React", async () => {
    const link = exampleLink();
    link.build.modules["src/Counter.tsx"]!.resolutions.react = "/npm/react@17/index.js";
    const lock = composeLinkOverrides({ lock: exampleLock(), links: [link], profile, developerOverrides: true });
    lock.integrity["react@17/index.js"] = "sha384-old";
    const code = await compileLinkModule({ path: "/link/checkout/src/Counter.tsx", code: 'import React from "react"; export default React;', lock, links: [link], sources: [], query: new URLSearchParams(), plugins: BASE_PLUGINS });
    expect(code).toContain("/link/checkout/dist/runtime/react.js");
    expect(code).not.toContain("react@17");
  });
  it("uses a local dependency's exported source even when consumer metadata names a published version", async () => {
    const consumer = exampleLink();
    consumer.build.modules["src/Counter.tsx"]!.resolutions["@acme/helper"] = "/npm/@acme/helper@1.0.0/index.js";
    const helper = exampleLink(); helper.id = "helper";
    helper.build = { ...helper.build, library: "@acme/helper", version: "2.0.0", entries: { "@acme/helper": "src/index.ts" }, fragment: { ...helper.build.fragment, name: "@acme/helper", imports: { "@acme/helper": "@acme/helper@2.0.0/index.js" }, scopes: {}, inherits: ["@flanksource/clicky-ui"] }, barrels: { modules: [], barrels: {} } };
    const lock = composeLinkOverrides({ lock: exampleLock(), links: [consumer, helper], profile, developerOverrides: true });
    const code = await compileLinkModule({ path: "/link/checkout/src/Counter.tsx", code: 'import helper from "@acme/helper"; export default helper;', lock, links: [consumer, helper], sources: [], query: new URLSearchParams(), plugins: BASE_PLUGINS });
    expect(code).toContain("/link/helper/src/index.ts");
    expect(code).not.toContain("helper@1.0.0");
  });
  it("caches unchanged modules, recompiles exactly the invalidated module and rewrites page barrels", async () => {
    const link = exampleLink();
    const lock = composeLinkOverrides({ lock: exampleLock(), links: [link], profile, developerOverrides: true });
    const store = memoryLinkStorage(); await store.put(link);
    let counter = "before"; let fetches = 0;
    const handler = createLinkRoutes({ origin, version: "test", profile, caches: memoryCaches(), store, plugins: BASE_PLUGINS, load: async () => ({ lock, files: { "page.tsx": 'import {Counter} from "@flanksource/clicky-ui"; export default Counter;' } }), fetch: async () => { fetches++; return new Response(`export const Counter: string = "${counter}";`); } });
    const load = async (path: string) => { const response = await handler(new Request(`${origin}${path}?page=page.tsx`)); if (!response) throw new Error("missing route"); return response; };
    expect(await (await load("/src/page.tsx")).text()).toContain('/link/checkout/src/Counter.tsx"');
    expect((await load("/link/checkout/src/Counter.tsx")).headers.get("x-link-compiled")).toBe("1");
    expect((await load("/link/checkout/src/untouched.ts")).headers.get("x-link-compiled")).toBe("1");
    counter = "after";
    expect((await load("/link/checkout/src/Counter.tsx")).headers.get("x-link-compiled")).toBe("0");
    const invalidated = await handler(new Request(`${origin}/link/_control`, { method: "POST", body: JSON.stringify({ developerOverrides: true, command: { type: "invalidate", id: link.id, paths: ["src/Counter.tsx"] } }) }));
    expect(invalidated?.status).toBe(200);
    expect(await (await load("/link/checkout/src/Counter.tsx")).text()).toContain("after");
    expect((await load("/link/checkout/src/untouched.ts")).headers.get("x-link-compiled")).toBe("0");
    expect(fetches).toBe(3);
  });
  it("keeps linked library modules cached and recompiles only the page source when a page file changes", async () => {
    const link = exampleLink();
    const lock = composeLinkOverrides({ lock: exampleLock(), links: [link], profile, developerOverrides: true });
    const saved = { lock, files: { "page.tsx": 'import {Counter} from "@flanksource/clicky-ui"; export const label = "first"; export default Counter;' } };
    const store = memoryLinkStorage(); await store.put(link);
    let fetches = 0;
    const handler = createLinkRoutes({ origin, version: "test", profile, caches: memoryCaches(), store, plugins: BASE_PLUGINS, load: async () => saved, fetch: async () => { fetches++; return new Response('export const Counter: string = "counter";'); } });
    const load = async (path: string) => { const response = await handler(new Request(`${origin}${path}?page=page.tsx`)); if (!response) throw new Error("missing route"); return response; };
    await load("/src/page.tsx");
    expect((await load("/link/checkout/src/Counter.tsx")).headers.get("x-link-compiled")).toBe("1");
    saved.files["page.tsx"] = saved.files["page.tsx"].replace('"first"', '"second"');
    const page = await load("/src/page.tsx");
    const counter = await load("/link/checkout/src/Counter.tsx");
    expect({ page: page.headers.get("x-link-compiled"), edited: (await page.text()).includes('"second"'), counter: counter.headers.get("x-link-compiled"), fetches }).toEqual({ page: "1", edited: true, counter: "0", fetches: 1 });
  });
  it("compiles a library module once for every page and rewrites its imports through each page's import map", async () => {
    const link = exampleLink();
    const base = composeLinkOverrides({ lock: exampleLock(), links: [link], profile, developerOverrides: true });
    const withAcme = (page: string, version: string, extra: Record<string, string> = {}) => ({ ...base, page, map: { imports: { ...base.map.imports, acme: `/npm/acme@${version}/index.js`, ...extra }, scopes: base.map.scopes }, integrity: { ...base.integrity, [`acme@${version}/index.js`]: "sha384-acme", ...Object.fromEntries(Object.values(extra).map((target) => [target.slice(5), "sha384-extra"])) } });
    const pages: Record<string, { lock: typeof base; files: Record<string, string> }> = {
      "page.tsx": { lock: withAcme("page.tsx", "1.0.0"), files: { "page.tsx": "export default 1;" } },
      "icons.tsx": { lock: withAcme("icons.tsx", "1.0.0", { "@acme/icons": "/npm/@acme/icons@1.0.0/index.js" }), files: { "icons.tsx": "export default 2;", "helper.ts": "export const helper = 1;" } },
      "upgraded.tsx": { lock: withAcme("upgraded.tsx", "2.0.0"), files: { "upgraded.tsx": "export default 3;" } },
    };
    const store = memoryLinkStorage(); await store.put(link);
    let fetches = 0;
    const handler = createLinkRoutes({ origin, version: "test", profile, caches: memoryCaches(), store, plugins: BASE_PLUGINS, load: async (page) => pages[page]!, fetch: async () => { fetches++; return new Response('import { acme } from "acme"; export const Counter: string = acme;'); } });
    const load = async (page: string) => { const response = (await handler(new Request(`${origin}/link/checkout/src/Counter.tsx?page=${page}`)))!; return { compiled: response.headers.get("x-link-compiled"), acme: /from "([^"]+)"/.exec(await response.text())?.[1] }; };
    expect({ first: await load("page.tsx"), extraPackage: await load("icons.tsx"), otherVersion: await load("upgraded.tsx"), fetches }).toEqual({
      first: { compiled: "1", acme: "/npm/acme@1.0.0/index.js" },
      extraPackage: { compiled: "0", acme: "/npm/acme@1.0.0/index.js" },
      otherVersion: { compiled: "0", acme: "/npm/acme@2.0.0/index.js" },
      fetches: 1,
    });
  });
  it.each([false, true])("denies link installation with developer overrides %s on a deny profile", async (developerOverrides) => {
    const handler = createLinkRoutes({ origin, version: "test", profile: { ...profile, links: "deny" }, caches: memoryCaches(), store: memoryLinkStorage(), plugins: BASE_PLUGINS, load: async () => ({ lock: exampleLock(), files: {} }) });
    const response = await handler(new Request(`${origin}/link/_control`, { method: "POST", body: JSON.stringify({ developerOverrides, command: { type: "install", link: exampleLink() } }) }));
    expect(response?.status).toBe(403);
  });
  it("requires a literal developer override grant at the worker boundary", async () => {
    const handler = createLinkRoutes({ origin, version: "test", profile, caches: memoryCaches(), store: memoryLinkStorage(), plugins: BASE_PLUGINS, load: async () => ({ lock: exampleLock(), files: {} }) });
    const response = await handler(new Request(`${origin}/link/_control`, { method: "POST", body: JSON.stringify({ developerOverrides: "true", command: { type: "install", link: exampleLink() } }) }));
    expect(response?.status).toBe(403);
  });
  it("rejects linked requests outside the page override", async () => {
    const handler = createLinkRoutes({ origin, version: "test", profile, caches: memoryCaches(), store: memoryLinkStorage(), plugins: BASE_PLUGINS, load: async () => ({ lock: exampleLock(), files: {} }) });
    await expect(handler(new Request(`${origin}/link/checkout/src/Counter.tsx?page=page.tsx`))).rejects.toMatchObject({ detail: { phase: "link" } });
  });
  it("uses identical React URLs in the frame import map and compiled page", async () => {
    const link = exampleLink();
    const lock = composeLinkOverrides({ lock: exampleLock(), links: [link], profile, developerOverrides: true });
    const saved: { lock: typeof lock; files: Record<string, string> } = { lock, files: { "page.tsx": 'import React from "react"; export default React;' } };
    const caches = memoryCaches();
    await (await caches.open("page-runtime-test-pages")).put(`${origin}/__runtime/pages/page.tsx`, Response.json(saved));
    const store = memoryLinkStorage(); await store.put(link);
    const handler = createLinkRoutes({ origin, version: "test", profile, caches, store, plugins: BASE_PLUGINS, load: async () => saved });
    const hashing = vi.spyOn(crypto.subtle, "digest");
    const document = await (await handler(new Request(`${origin}/frame/page.tsx`)))!.text();
    hashing.mockClear();
    await handler(new Request(`${origin}/frame/page.tsx`));
    expect(hashing).not.toHaveBeenCalled();
    saved.files["page.tsx"] = "export default () => null;";
    await handler(new Request(`${origin}/frame/page.tsx`));
    expect(hashing).not.toHaveBeenCalled();
    saved.files["helper.ts"] = "export const helper = 1;";
    await handler(new Request(`${origin}/frame/page.tsx`));
    expect(hashing).toHaveBeenCalledTimes(1);
    delete saved.files["helper.ts"];
    saved.files["page.tsx"] = 'import React from "react"; export default React;';
    hashing.mockRestore();
    const config = JSON.parse(/id="page-runtime-config">(.*?)<\/script>/.exec(document)![1]!);
    const page = await (await handler(new Request(`${origin}${config.entry}?page=page.tsx`)))!.text();
    expect(page).toContain(JSON.stringify(config.lock.map.imports.react));
    expect(new URL(config.lock.map.imports.react, origin).search).toBe("");
  });
});
