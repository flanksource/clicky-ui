import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const ui = fileURLToPath(new URL("../../packages/ui/src/", import.meta.url));

export default defineConfig({
  cacheDir: `node_modules/.vite/page-host-${process.env.VITE_PAGE_HOST_PROFILE ?? "default"}`,
  plugins: [react(), tailwindcss()],
  define: { "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development") },
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      { find: /^@flanksource\/clicky-ui\/styles\.css$/, replacement: resolve(ui, "styles.ts") },
      { find: /^@flanksource\/clicky-ui\/monaco$/, replacement: resolve(ui, "monaco.ts") },
      { find: /^@flanksource\/clicky-ui\/comments$/, replacement: resolve(ui, "comments.ts") },
      { find: /^@flanksource\/clicky-ui$/, replacement: resolve(ui, "index.ts") },
    ],
  },
  optimizeDeps: { exclude: ["@flanksource/clicky-ui", "@flanksource/page-runtime"] },
  server: { host: "localhost", port: 5810, strictPort: true },
  preview: { host: "localhost", port: 5810, strictPort: true },
});
