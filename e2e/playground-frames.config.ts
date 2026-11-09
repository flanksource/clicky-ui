import { defineConfig } from "@playwright/test";
const port = Number(process.env.PLAYGROUND_FRAMES_PORT ?? "5276");

export default defineConfig({
  testDir: "./tests/playground-frames",
  workers: 1,
  fullyParallel: false,
  timeout: 90000,
  reporter: "list",
  projects: [{ name: "playground-frames" }],
  webServer: { command: `pnpm --filter playground playground:prod --no-build --port ${port} --host 127.0.0.1`, url: `http://127.0.0.1:${port}`, reuseExistingServer: false, timeout: 30000 },
});
