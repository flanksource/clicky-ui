import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { playgroundComments } from "./plugins/comments-server";
import { playgroundSources } from "./plugins/sources-server";

const root = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(root, "../..");
const uiSrc = resolve(workspaceRoot, "packages/ui/src");

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    playgroundComments({ dir: resolve(root, ".playground") }),
    playgroundSources({ pagesDir: resolve(root, "src/pages") }),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      {
        find: /^@flanksource\/clicky-ui\/styles\.css$/,
        replacement: resolve(uiSrc, "styles.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/icons$/,
        replacement: resolve(uiSrc, "icons.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/comments$/,
        replacement: resolve(uiSrc, "comments.ts"),
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
    port: 5274,
    strictPort: true,
  },
});
