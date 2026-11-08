import { defineConfig } from "vitest/config";

export default defineConfig({ test: {
  name: "agent-chromium", environment: "node", include: ["src/frame/agent/agent.browser.ts", "src/frame/agent/vocabulary.browser.ts"],
  testTimeout: 120_000, hookTimeout: 120_000, fileParallelism: false,
} });
