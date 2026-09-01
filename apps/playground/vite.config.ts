import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { playgroundComments } from "./plugins/comments-server";
import { playgroundMarkdown } from "./plugins/markdown-vite-plugin";
import { playgroundSources } from "./plugins/sources-server";
import { playgroundRuntimeProfiles } from "./plugins/runtime-profiles-server";

const root = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(root, "../..");
const uiSrc = resolve(workspaceRoot, "packages/ui/src");
const playgroundDataDir = resolve(root, ".playground");

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    playgroundMarkdown({ sourceRoot: resolve(root, "src") }),
    playgroundComments({ dir: playgroundDataDir }),
    playgroundRuntimeProfiles({
      runtimesURL: "http://localhost:9020/api/chat/runtimes",
      resolveURL: "http://localhost:9020/api/chat/runtime-profiles/resolve",
    }),
    playgroundSources({
      pagesDir: resolve(root, "src/pages"),
      commentsDir: playgroundDataDir,
    }),
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
        find: /^@flanksource\/clicky-ui\/ai\/runtime-profile$/,
        replacement: resolve(uiSrc, "runtime-profile.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/utils$/,
        replacement: resolve(uiSrc, "utils.ts"),
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
    // Bind every interface so the playground is reachable from other devices
    // on the LAN; allowedHosts keeps hostname (.local, tunnel) access working,
    // which Vite otherwise rejects with "Blocked request".
    host: true,
    allowedHosts: true,
    port: 5274,
    strictPort: true,
  },
});
