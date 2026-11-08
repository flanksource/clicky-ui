import { expect, it } from "vitest";
import { exampleLock } from "../link/testing-fixtures.ts";
import { memoryCaches } from "../link/testing-cache.ts";
import { createRouter } from "./router.ts";
import { facetPlugins } from "./compiler.ts";
import type { RuntimeProfile } from "../schema.ts";
import { PAGE_AGENT_URL } from "./runtime-module.ts";

const origin = "https://runtime.example";
const profile: RuntimeProfile = { runtimeDomain: "runtime.example", embedders: ["https://host.example"], packageOrigin: "https://packages.example", registry: "https://registry.example", managed: {}, policy: { dependencies: "strict" }, minReleaseAgeDays: 0, network: { allow: [] }, csp: { add: {} }, links: "deny", sources: ["host"], readinessTimeoutMs: 1000 };

it("rewrites the page agent's named imports through the page's barrel index", async () => {
  const lock = exampleLock();
  lock.map.imports["@flanksource/clicky-ui/comments"] = "/npm/@flanksource/clicky-ui@1.0.0/comments.js";
  lock.integrity = { "@flanksource/clicky-ui@1.0.0/comments.js": "sha384-test", "@flanksource/clicky-ui@1.0.0/CommentProvider.js": "sha384-test" };
  lock.barrels = { modules: ["@flanksource/clicky-ui@1.0.0/CommentProvider.js"], barrels: { "@flanksource/clicky-ui@1.0.0/comments.js": { CommentProvider: 0 } } };
  const caches = memoryCaches();
  await (await caches.open("page-runtime-test-pages")).put(`${origin}/__runtime/pages/page.tsx`, Response.json({ lock, files: {} }));
  const requests: string[] = [];
  const router = createRouter({ origin, version: "test", profile, caches, plugins: facetPlugins(() => () => undefined), fetch: async (input) => {
    requests.push(String(input));
    return new Response('import { CommentProvider } from "@flanksource/clicky-ui/comments"; export { CommentProvider };');
  } });
  const response = await router.route(new Request(`${origin}${PAGE_AGENT_URL}?page=page.tsx`));
  expect({ target: /from "([^"]+)"/.exec(await response.text())?.[1], requests }).toEqual({ target: "/npm/@flanksource/clicky-ui@1.0.0/CommentProvider.js", requests: [`${origin}/page-agent.js`] });
});
