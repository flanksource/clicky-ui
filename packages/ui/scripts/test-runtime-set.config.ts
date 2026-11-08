import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [fileURLToPath(new URL("./test-runtime-set.test.mjs", import.meta.url))],
    testTimeout: 30_000,
  },
});
