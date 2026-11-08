import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:5801";
const PAGE_HOST = process.env.E2E_PAGE_HOST === "1";
const PAGE_HOST_URL = process.env.PAGE_HOST_URL ?? "http://localhost:5810";

export default defineConfig({
  testDir: "./tests",
  ...(PAGE_HOST ? { outputDir: "../.tmp/T-host-e2e/playwright" } : {}),
  testIgnore: ["**/responsive.spec.ts", ...(PAGE_HOST ? [] : ["**/page-host/**"])],
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  // Default to chromium driven by the system Chrome install (`channel: "chrome"`)
  // so no `playwright install` download is needed — this is what both the CI
  // e2e job and gavel's auto-discovered `playwright test` run. Set
  // E2E_ALL_BROWSERS=1 to additionally exercise firefox/webkit (requires
  // `playwright install`).
  projects: PAGE_HOST ? [{
    name: "page-host", testMatch: "**/page-host/**/*.spec.ts",
    use: { ...devices["Desktop Chrome"], channel: "chrome", baseURL: PAGE_HOST_URL, viewport: { width: 1920, height: 1080 } },
  }] : [
    { name: "chromium", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    ...(process.env.E2E_ALL_BROWSERS
      ? [
          { name: "firefox", use: { ...devices["Desktop Firefox"] } },
          { name: "webkit", use: { ...devices["Desktop Safari"] } },
        ]
      : []),
  ],
  webServer: PAGE_HOST ? [
    { command: "pnpm --filter page-host dev", url: PAGE_HOST_URL, reuseExistingServer: !process.env.CI, timeout: 120_000 },
    { command: "pnpm --filter page-host dev:runtime", url: "http://localhost:5811/profile.json", reuseExistingServer: !process.env.CI, timeout: 30_000 },
  ] : {
    command: process.env.CI
      ? "pnpm --filter kitchen-sink exec vite preview --port 5801 --strictPort"
      : "pnpm --filter kitchen-sink dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
