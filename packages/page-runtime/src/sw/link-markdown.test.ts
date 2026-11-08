import { expect, it } from "vitest";
import { exampleLink, exampleLock } from "../link/testing-fixtures.ts";
import { composeLinkOverrides } from "../link/overrides.ts";
import { memoryCaches, memoryLinkStorage } from "../link/testing-cache.ts";
import { createLinkRoutes } from "./link-route.ts";
import { facetPlugins } from "./compiler.ts";
import type { RuntimeProfile } from "../schema.ts";
import { parse } from "es-module-lexer";
import { createRouter } from "./router.ts";

const origin = "https://runtime.example";
const profile: RuntimeProfile = { runtimeDomain: "runtime.example", embedders: ["https://host.example"], packageOrigin: "https://packages.example", registry: "https://registry.example", managed: {}, policy: { dependencies: "strict" }, minReleaseAgeDays: 0, network: { allow: [] }, csp: { add: {} }, links: "allow", sources: ["host"], readinessTimeoutMs: 1000 };

it("serves host-buffer Markdown through the same compiler as linked Markdown", async () => {
  const caches = memoryCaches();
  const lock = { ...exampleLock(), page: "report.md" };
  await (await caches.open("page-runtime-markdown-pages")).put(`${origin}/__runtime/pages/report.md`, Response.json({ lock, files: { "report.md": "# Revenue" } }));
  const router = createRouter({ origin, version: "markdown", profile, caches, plugins: facetPlugins(() => () => undefined) });
  const response = await router.route(new Request(`${origin}/src/report.md?page=report.md`));
  expect(response.headers.get("content-type")).toBe("text/javascript; charset=utf-8");
  expect(response.headers.has("x-page-runtime-error")).toBe(false);
  expect(await response.text()).toContain('fileName: "report.md"');
});

it("serves linked Markdown as ESM, resolves extensionless imports and serves its image bytes", async () => {
  const link = exampleLink();
  link.build.modules["src/pages/report.md"] = { resolutions: {} };
  link.build.modules["src/pages/index.tsx"] = { resolutions: {} };
  link.build.pageSources = [{ root: "src/pages", prefix: "", editable: true }];
  const lock = composeLinkOverrides({ lock: { ...exampleLock(), page: "report.md", pageSources: [{ link: link.id, ...link.build.pageSources[0]! }] }, links: [link], profile, developerOverrides: true });
  const source = ['---', 'title: Revenue', '---', '', '# Revenue', '', '```js', 'const total = 3;', '```', '', '![Chart](/src/pages/chart.svg)'].join("\n");
  const image = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>';
  const store = memoryLinkStorage(); await store.put(link);
  const routes = createLinkRoutes({ origin, version: "markdown", profile, store, caches: memoryCaches(), plugins: facetPlugins(() => () => undefined), load: async () => ({ lock, files: {} }), fetch: async (input) => {
    const path = new URL(String(input)).pathname;
    if (path.endsWith("/report.md")) return new Response(source);
    if (path.endsWith("/index.tsx")) return new Response('export { default } from "./report";');
    if (path.endsWith("/chart.svg")) return new Response(image);
    throw new Error(`Unexpected fixture request ${input}`);
  } });
  const markdown = await routes(new Request(`${origin}/link/checkout/src/pages/report.md?page=report.md`));
  expect(markdown?.headers.get("content-type")).toBe("text/javascript; charset=utf-8");
  const compiled = await markdown!.text();
  expect(compiled).toContain('fileName: "report.md"');
  expect(compiled).toContain('src: "/src/pages/chart.svg"');
  expect(parse(compiled)[0].map(item => item.specifier)).toContain("/__runtime/jsx-dev-runtime.js");
  const entry = await routes(new Request(`${origin}/link/checkout/src/pages/index.tsx?page=report.md`));
  expect(await entry!.text()).toContain('"/link/checkout/src/pages/report.md"');
  const asset = await routes(new Request(`${origin}/link/checkout/src/pages/chart.svg?page=report.md`));
  expect(asset?.headers.get("content-type")).toBe("image/svg+xml");
  expect(await asset!.text()).toBe(image);
});
