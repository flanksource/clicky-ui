import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { conditions: ["browser"] },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
