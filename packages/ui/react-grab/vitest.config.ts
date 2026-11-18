import { defineConfig } from "vitest/config";

export default defineConfig({
  root: import.meta.dirname,
  resolve: { conditions: ["browser"] },
  test: {
    name: "react-grab",
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
