import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

const root = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(root, "../..");
const uiSrc = resolve(workspaceRoot, "packages/ui/src");
const preactPath = (sub: string) => resolve(root, "node_modules/preact", sub);

export default defineConfig({
  plugins: [preact({ reactAliasesEnabled: false })],
  resolve: {
    alias: [
      { find: /^@flanksource\/clicky-ui\/styles\.css$/, replacement: resolve(uiSrc, "styles.ts") },
      {
        find: /^@flanksource\/clicky-ui\/api-explorer$/,
        replacement: resolve(uiSrc, "api-explorer.ts"),
      },
      { find: /^@flanksource\/clicky-ui$/, replacement: resolve(uiSrc, "index.ts") },
      { find: /^preact$/, replacement: preactPath("dist/preact.module.js") },
      { find: /^preact\/jsx-runtime$/, replacement: preactPath("jsx-runtime") },
      { find: /^react\/jsx-runtime$/, replacement: preactPath("jsx-runtime") },
      { find: /^react\/jsx-dev-runtime$/, replacement: preactPath("jsx-runtime") },
      { find: /^react-dom\/test-utils$/, replacement: preactPath("test-utils") },
      { find: /^react-dom$/, replacement: preactPath("compat") },
      { find: /^react$/, replacement: preactPath("compat") },
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
