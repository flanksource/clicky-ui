import { describe, expect, it } from "vitest";
import { exampleLock } from "../link/testing-fixtures.ts";
import { memoryCaches } from "../link/testing-cache.ts";
import { createRouter } from "./router.ts";
import { BASE_PLUGINS } from "./compiler.ts";
import type { RuntimeProfile } from "../schema.ts";
import { PAGE_AGENT_URL } from "./runtime-module.ts";

const origin = "https://runtime.example";
const profile: RuntimeProfile = { runtimeDomain: "runtime.example", embedders: ["https://host.example"], packageOrigin: "https://packages.example", registry: "https://registry.example", managed: {}, policy: { dependencies: "strict" }, minReleaseAgeDays: 0, network: { allow: [] }, csp: { add: {} }, links: "deny", sources: ["host"], readinessTimeoutMs: 1000 };

describe("export modules", () => {
  async function exportRouter() {
    const lock = { ...exampleLock(), page: "report.md" };
    const caches = memoryCaches();
    await (await caches.open("page-runtime-test-pages")).put(`${origin}/__runtime/pages/report.md`, Response.json({ lock, files: { "report.md": "# Report", "data.json": "{}" } }));
    return createRouter({ origin, version: "test", profile, caches, plugins: BASE_PLUGINS });
  }

  it("serves the registered export compile at ?export, linked against the page's sources", async () => {
    const router = await exportRouter();
    await router.exportModule("report.md", { type: "export-module", path: "report.md", code: 'import data from "./data.json"; export default () => data;' });
    const response = await router.route(new Request(`${origin}/src/report.md?export=1&page=report.md`));
    expect(/from "([^"]+)"/.exec(await response.text())?.[1]).toBe("/src/data.json?module");
  });

  it.each([
    ["a source that is not Markdown", { type: "export-module", path: "data.json", code: "" }, "export-module: data.json is not a Markdown source"],
    ["a Markdown path the page does not have", { type: "export-module", path: "other.md", code: "" }, "source other.md does not exist"],
    ["an unknown field", { type: "export-module", path: "report.md", code: "", extra: true }, "export-module.extra: unknown key"],
  ])("rejects registering %s", async (_case, message, error) => {
    await expect((await exportRouter()).exportModule("report.md", message)).rejects.toThrow(error);
  });

  it("fails an ?export request with no registered compile instead of serving the live compile", async () => {
    const body = await (await (await exportRouter()).route(new Request(`${origin}/src/report.md?export=1&page=report.md`))).text();
    expect(body).toContain("no export compile is registered for report.md; export the page again");
  });
});

it("rewrites the page agent's named imports through the page's barrel index", async () => {
  const lock = exampleLock();
  lock.map.imports["@flanksource/clicky-ui/comments"] = "/npm/@flanksource/clicky-ui@1.0.0/comments.js";
  lock.integrity = { "@flanksource/clicky-ui@1.0.0/comments.js": "sha384-test", "@flanksource/clicky-ui@1.0.0/CommentProvider.js": "sha384-test" };
  lock.barrels = { modules: ["@flanksource/clicky-ui@1.0.0/CommentProvider.js"], barrels: { "@flanksource/clicky-ui@1.0.0/comments.js": { CommentProvider: 0 } } };
  const caches = memoryCaches();
  await (await caches.open("page-runtime-test-pages")).put(`${origin}/__runtime/pages/page.tsx`, Response.json({ lock, files: {} }));
  const requests: string[] = [];
  const router = createRouter({ origin, version: "test", profile, caches, plugins: BASE_PLUGINS, fetch: async (input) => {
    requests.push(String(input));
    return new Response('import { CommentProvider } from "@flanksource/clicky-ui/comments"; export { CommentProvider };');
  } });
  const response = await router.route(new Request(`${origin}${PAGE_AGENT_URL}?page=page.tsx`));
  expect({ target: /from "([^"]+)"/.exec(await response.text())?.[1], requests }).toEqual({ target: "/npm/@flanksource/clicky-ui@1.0.0/CommentProvider.js", requests: [`${origin}/page-agent.js`] });
});
