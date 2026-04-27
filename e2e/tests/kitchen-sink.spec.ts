import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    try {
      window.localStorage.clear();
    } catch {}
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
});

test("renders the kitchen-sink page with Button showcase", async ({ page }) => {
  await page.goto("/?demo=button", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Clicky UI — Kitchen Sink" })).toBeVisible();
  const buttonDemo = page.locator("#button");
  await expect(buttonDemo.getByRole("button", { name: "Destructive", exact: true })).toBeVisible();
  await expect(buttonDemo.getByRole("button", { name: "Outline", exact: true })).toBeVisible();
  await expect(buttonDemo.getByRole("button", { name: "Small", exact: true })).toBeVisible();
  await expect(buttonDemo.getByRole("button", { name: "Large", exact: true })).toBeVisible();
});

test("theme switcher updates <html data-theme> and persists", async ({ page }) => {
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", /light|dark/);

  await page.getByRole("button", { name: "Theme" }).click();
  await page.getByRole("menuitemradio", { name: "dark" }).click();
  await expect(html).toHaveAttribute("data-theme", "dark");

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
});

test("density switcher updates <html data-density> and persists", async ({ page }) => {
  const html = page.locator("html");

  await page.getByRole("button", { name: "Density" }).click();
  await page.getByRole("menuitemradio", { name: "compact" }).click();
  await expect(html).toHaveAttribute("data-density", "compact");

  await page.reload();
  await expect(html).toHaveAttribute("data-density", "compact");
});

test("tree demo shows the large-tree filter and narrows results", async ({ page }) => {
  await page.goto("/?demo=tree", { waitUntil: "domcontentloaded" });

  const filter = page.getByLabel("Filter tree nodes");
  await expect(filter).toBeVisible();

  await filter.fill("ledger");

  await expect(page.getByText("group: billing")).toBeVisible();
  await expect(page.getByText("syncs ledger export")).toBeVisible();
  await expect(page.getByText("my-suite")).toBeVisible();
  await expect(page.getByText("group: auth")).toHaveCount(0);
});
