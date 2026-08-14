import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      {
        // The package root is the browser bundle and will not load headlessly;
        // the editor API entry is the same surface without the DOM bootstrap.
        // Anchored, or it would also rewrite the deep path it maps to.
        find: /^monaco-editor$/,
        replacement: "monaco-editor/esm/vs/editor/editor.api",
      },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
  },
});
