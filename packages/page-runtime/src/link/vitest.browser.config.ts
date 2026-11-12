import { defineConfig } from "vitest/config";

export default defineConfig({ test: { name: "link-chromium", environment: "node", include: ["src/link/link.browser.ts"], testTimeout: 120000, hookTimeout: 120000, fileParallelism: false } });
