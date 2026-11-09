import { defineConfig } from "vitest/config";

export default defineConfig({ test: { environment: "node", include: ["src/activity.browser.ts"], testTimeout: 120000, hookTimeout: 120000, fileParallelism: false } });
