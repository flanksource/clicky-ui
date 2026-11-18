import type { LibraryLink } from "./types.ts";
import type { PageLock } from "../schema.ts";

export function exampleLink(): LibraryLink {
  return { id: "checkout", source: { kind: "server", url: "http://127.0.0.1:9000/" }, build: {
    link: 1, library: "@flanksource/clicky-ui", version: "2.0.0",
    fragment: { fragment: 1, name: "@flanksource/clicky-ui", imports: { react: "@flanksource/clicky-ui@2.0.0/dist/runtime/react.js", "@flanksource/clicky-ui": "@flanksource/clicky-ui@2.0.0/dist/index.js" }, scopes: {}, inherits: [], aliases: {}, remaps: {}, integrity: { "@flanksource/clicky-ui@2.0.0/dist/runtime/react.js": "sha384-react" } },
    entries: { "@flanksource/clicky-ui": "src/index.ts" },
    modules: { "src/index.ts": { resolutions: { "./Counter": "src/Counter.tsx" } }, "src/Counter.tsx": { resolutions: {} }, "src/untouched.ts": { resolutions: {} } },
    barrels: { modules: ["src/Counter.tsx"], barrels: { "src/index.ts": { Counter: 0 } } }, defines: { __CHECKOUT__: "local-commit" }, generated: {},
  } };
}

export function exampleLock(): PageLock {
  return { lock: 2, packageOrigin: "https://packages.example", page: "page.tsx", versions: { "@flanksource/clicky-ui": "1.0.0" }, map: { imports: { react: "/npm/react@18/index.js", "@flanksource/clicky-ui": "/npm/@flanksource/clicky-ui@1.0.0/index.js" }, scopes: { "/npm/@acme/facet@1/": { react: "/npm/react@18/index.js" } } }, integrity: {}, remaps: {}, barrels: { modules: [], barrels: {} } };
}
