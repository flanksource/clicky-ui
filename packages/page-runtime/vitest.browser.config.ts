import { defineConfig } from "vitest/config";

// agent-browser owns Chromium; the Node test process holds Gavel's test slot for its lifetime.
export default defineConfig({ test: { name: "runtime-chromium", environment: "node", include: ["src/**/*.browser.ts"], testTimeout: 120_000, hookTimeout: 120_000, fileParallelism: false } });
