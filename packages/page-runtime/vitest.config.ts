import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["fake-indexeddb/auto"],
    // Bundling and jsdom mounts contend for CPU across the suite's workers; 5s fails tests that finish in under a second alone.
    testTimeout: 30_000,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "scripts/**/*.test.ts"],
  },
});
