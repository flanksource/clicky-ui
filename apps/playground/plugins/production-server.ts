import { realpathSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import { liveRegistry } from "./production-registry";

export function playgroundProduction(options: { root: string }): Plugin {
  const root = realpathSync(options.root);
  return {
    name: "playground-browser-shell",
    enforce: "pre",
    async transform(code, id) {
      if (id === resolve(root, "src/registry.ts")) return { code: liveRegistry(code), map: null };
      if (id === resolve(root, "src/main.tsx")) return { code: code.replace('import("./App")', 'import("./browser-mode/BrowserApp")').replace('if (!bookmarklet) void import("@flanksource/react-grab");', ''), map: null };
      if (id === resolve(root, "src/App.tsx")) return { code: code.replace('from "./comments/useComments"', 'from "./browser-mode/comments"'), map: null };
      return;
    },
    configureServer() { throw new Error("Browser-only playground requires scripts/playground-prod.mjs, not a Vite server"); },
  };
}
