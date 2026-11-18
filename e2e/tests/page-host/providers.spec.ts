import { test, expect } from "@playwright/test";
import { STARTER, fromShareUrl, openProject, replaceSource } from "./helpers";

test("hash saves unsaved Unicode source and restores it on navigation", async ({ page }) => {
  await openProject(page);
  const source = 'export default () => <h1>שלום 🌍</h1>;';
  await replaceSource(page, source);
  await expect(page.getByText("Unsaved changes", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save to URL", exact: true }).click();
  await expect(page.getByTestId("save-status")).toHaveText("Saved");
  expect(fromShareUrl(page.url()).files[STARTER.entry]).toBe(source);
  await page.reload();
  expect(fromShareUrl(page.url()).files[STARTER.entry]).toBe(source);
  await expect(page.getByRole("textbox", { name: "Source editor" })).toBeVisible();
  expect(fromShareUrl(page.url()).files[STARTER.entry]).toBe(source);
  await page.getByRole("button", { name: "Create share URL" }).click();
  await expect(page.getByRole("button", { name: "Create share URL" })).toBeEnabled();
  expect(fromShareUrl(page.url()).files[STARTER.entry]).toBe(source);
});

test("OPFS source tree saves and reopens source files", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: STARTER.name })).toBeVisible();
  await page.getByRole("button", { name: "Open browser project", exact: true }).click();
  await expect(page.getByText("Browser project (OPFS)", { exact: true })).toBeVisible();
  await replaceSource(page, 'export default () => <h1>Saved in OPFS</h1>;');
  await page.getByRole("button", { name: "Save files", exact: true }).click();
  await expect(page.getByTestId("save-status")).toHaveText("Saved");
  await page.getByRole("button", { name: "Host buffers", exact: true }).click();
  await page.getByRole("button", { name: "Open browser project", exact: true }).click();
  await page.getByRole("button", { name: "Create share URL" }).click();
  await expect(page.getByRole("button", { name: "Create share URL" })).toBeEnabled();
  expect(fromShareUrl(page.url()).files[STARTER.entry]).toContain("Saved in OPFS");
});

test("URL imports a CORS source and saves its browser copy", async ({ page }) => {
  await page.route("**/template.tsx", (route) => route.fulfill({ status: 200, contentType: "text/plain", body: 'export default () => <h1>URL source</h1>;' }));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: STARTER.name })).toBeVisible();
  await page.getByLabel("Source URL", { exact: true }).fill("http://localhost:5810/template.tsx");
  await page.getByRole("button", { name: "Open URL", exact: true }).click();
  await expect(page.getByRole("heading", { name: "template.tsx" })).toBeVisible();
  await replaceSource(page, 'export default () => <h1>Edited URL buffer</h1>;');
  await page.getByRole("button", { name: "Save browser copy", exact: true }).click();
  await page.getByRole("button", { name: "Create share URL" }).click();
  await expect(page.getByRole("button", { name: "Create share URL" })).toBeEnabled();
  expect(fromShareUrl(page.url()).files["template.tsx"]).toContain("Edited URL buffer");
});

test("invalid package.json stays editable with a visible error", async ({ page }) => {
  await openProject(page);
  await page.getByRole("treeitem", { name: "package.json", exact: true }).click();
  await replaceSource(page, "{");
  await expect(page.getByRole("alert").filter({ hasText: "Fix package.json" })).toBeVisible();
  await replaceSource(page, STARTER.files["package.json"]!);
  await expect(page.getByTestId("preview-status")).toBeVisible();
});

for (const viewport of [{ width: 1920, height: 1080 }, { width: 2560, height: 1440 }]) {
  test(`workspace fits ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openProject(page);
    for (const id of ["sources", "editor", "preview"]) await expect(page.getByTestId(`workspace-pane-${id}`)).toBeVisible();
    const frame = await page.locator('iframe[title="Page preview"]').boundingBox();
    expect(frame).not.toBeNull();
    expect(frame!.width).toBeGreaterThan(400);
    expect(frame!.height).toBeGreaterThan(600);
    await expect(page.locator("body")).toHaveJSProperty("scrollWidth", viewport.width);
    await page.screenshot({ path: `results/page-host-${viewport.width}.png`, fullPage: true });
  });
}
