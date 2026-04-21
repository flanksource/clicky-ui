import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

const root = dirname(fileURLToPath(import.meta.url));
const preactPath = (sub: string) => resolve(root, "node_modules/preact", sub);

export default defineConfig({
  plugins: [preact({ reactAliasesEnabled: false })],
  resolve: {
    alias: [
      { find: /^react\/jsx-runtime$/, replacement: preactPath("jsx-runtime") },
      { find: /^react-dom\/test-utils$/, replacement: preactPath("test-utils") },
      { find: /^react-dom$/, replacement: preactPath("compat") },
      { find: /^react$/, replacement: preactPath("compat") },
    ],
  },
  optimizeDeps: {
    exclude: ["@flanksource/clicky-ui"],
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
