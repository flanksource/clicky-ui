import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({ cacheDir: fileURLToPath(new URL("../../../../../.tmp/E/vite", import.meta.url)), test: {
  environment: "node", include: ["src/frame/tailwind/*.browser.ts"],
  testTimeout: 120_000, hookTimeout: 120_000, fileParallelism: false,
} });
