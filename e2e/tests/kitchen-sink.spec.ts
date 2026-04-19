import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    try {
      window.localStorage.clear();
    } catch {}
  });
  await page.goto("/");
});

test("renders the kitchen-sink page with Button showcase", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Clicky UI — Kitchen Sink" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Destructive" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Outline" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Small" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Large" })).toBeVisible();
});

test("theme switcher updates <html data-theme> and persists", async ({ page }) => {
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", /light|dark/);

  await page.getByTestId("theme-select").selectOption("dark");
  await expect(html).toHaveAttribute("data-theme", "dark");

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
});

test("density switcher updates <html data-density> and persists", async ({ page }) => {
  const html = page.locator("html");

  await page.getByTestId("density-select").selectOption("compact");
  await expect(html).toHaveAttribute("data-density", "compact");

  await page.reload();
  await expect(html).toHaveAttribute("data-density", "compact");
});
