import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { existsSync } from "node:fs";
import { defineConfig, loadEnv, type Alias, type Plugin } from "vite";

const root = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(root, "../..");
const uiSrc = resolve(workspaceRoot, "packages/ui/src");

// WORKAROUND(unreleased-facet): the facet diagram style demo needs
// DiagramStyleProvider/density/placement, which @flanksource/facet 0.1.74 lacks.
// Set KITCHEN_SINK_FACET_SRC=/abs/facet/src/components in the gitignored .env.local
// to serve a local facet checkout; without it the published package is used.
// Correct fix: release facet with the style API, bump the catalog, drop this alias.
// Ref: discussed with user 2026-11-03
const facetSrc = loadEnv("development", root, "KITCHEN_SINK_").KITCHEN_SINK_FACET_SRC;
if (facetSrc !== undefined && !existsSync(resolve(facetSrc, "index.tsx"))) {
  throw new Error(`KITCHEN_SINK_FACET_SRC: "${facetSrc}" has no index.tsx`);
}
const facetAlias: Alias[] = facetSrc ? [{ find: "@flanksource/facet", replacement: facetSrc }] : [];
// styles.css can only @source the published dist; scan the aliased source too
// so classes that exist only in the local checkout are generated.
const facetSource: Plugin = {
  name: "kitchen-sink-facet-source",
  enforce: "pre",
  transform(code, id) {
    if (!facetSrc || !id.endsWith("/src/styles.css")) return undefined;
    return code.replace('@import "tailwindcss";', `@import "tailwindcss";\n@source "${resolve(facetSrc, "diagram")}/**/*.tsx";`);
  },
};

export default defineConfig({
  plugins: [facetSource, react(), tailwindcss()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      ...facetAlias,
      {
        find: /^@flanksource\/clicky-ui\/styles\.css$/,
        replacement: resolve(uiSrc, "styles.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/icons$/,
        replacement: resolve(uiSrc, "icons.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/monaco$/,
        replacement: resolve(uiSrc, "monaco.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/rpc$/,
        replacement: resolve(uiSrc, "rpc.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/profiles$/,
        replacement: resolve(uiSrc, "profiles.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/chat$/,
        replacement: resolve(uiSrc, "chat.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/ai$/,
        replacement: resolve(uiSrc, "ai.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui$/,
        replacement: resolve(uiSrc, "index.ts"),
      },
    ],
  },
  optimizeDeps: {
    exclude: ["@flanksource/clicky-ui"],
  },
  server: {
    port: 5273,
    strictPort: true,
  },
});
