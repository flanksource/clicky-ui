import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { expect } from "@playwright/test";
import { test } from "./timing";
import { STARTER, WORKSPACE_VERSIONS, fromShareUrl, openProject, ready, replaceSource } from "./helpers";

test("workspace facet diagram reaches full readiness", async ({ page }) => {
  await openProject(page);
  await ready(page);
  const frame = page.frameLocator('iframe[title="Page preview"]:visible');
  await expect(frame.getByRole("heading", { name: "Deployment path" })).toBeVisible();
  await expect(frame.locator("svg").first()).toBeVisible();
  await page.getByRole("button", { name: "Save to URL", exact: true }).click();
  expect(fromShareUrl(page.url()).locks[STARTER.entry]).toMatchObject({ versions: WORKSPACE_VERSIONS });
});

test("unsaved and saved edits reach the frame within the latency budgets", async ({ page, timing }) => {
  await rm("results/page-host-latency.json", { force: true });
  await openProject(page);
  await ready(page);
  const frame = page.frameLocator('iframe[title="Page preview"]:visible');
  const samples: number[] = [];
  const driverSamples: number[] = [];
  for (let index = 0; index < 7; index++) {
    const title = `Deployment edit ${index}`;
    const started = performance.now();
    await replaceSource(page, STARTER.files["diagram.tsx"]!.replace("Deployment path", title));
    await expect(frame.getByRole("heading", { name: title })).toBeVisible();
    driverSamples.push(performance.now() - started);
    await expect.poll(() => timing.find((event) => event.name === `visible:${title}`)).toBeDefined();
    const visible = timing.find((event) => event.name === `visible:${title}`)!;
    const input = timing.findLast((event) => event.name === "editor-input" && event.at < visible.at);
    if (!input) throw new Error(`${title}: source input timestamp is missing`);
    samples.push(visible.at - input.at);
    await ready(page);
  }
  await expect(page.getByText("Unsaved changes", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save to URL", exact: true }).click();
  expect(fromShareUrl(page.url()).files["diagram.tsx"]).toContain("Deployment edit 6");
  const started = performance.now();
  await page.getByRole("combobox", { name: "Preview page" }).selectOption("notes.tsx");
  await ready(page);
  const warmStarted = performance.now();
  await page.getByRole("combobox", { name: "Preview page" }).selectOption("diagram.tsx");
  await ready(page);
  await expect(frame.getByRole("heading", { name: "Deployment edit 6" })).toBeVisible();
  const warmOpenMs = performance.now() - warmStarted;
  const sorted = [...samples].sort((a, b) => a - b);
  const report = { editToVisibleP50Ms: sorted[Math.floor(sorted.length / 2)]!, warmOpenMs, editToVisibleSamplesMs: samples, driverEditSamplesMs: driverSamples, sequenceMs: performance.now() - started };
  await mkdir("results", { recursive: true });
  await writeFile("results/page-host-latency.json", `${JSON.stringify(report, null, 2)}\n`);
  expect(report.editToVisibleP50Ms).toBeLessThanOrEqual(300);
  expect(report.warmOpenMs).toBeLessThanOrEqual(400);
});

test("per-page clicky-ui switch changes its React map and preserves the other page", async ({ page, request }) => {
  const current = WORKSPACE_VERSIONS["@flanksource/clicky-ui"]!;
  const alternate = process.env.PAGE_HOST_CLICKY_VERSION_ALT ?? "0.3.41";
  const response = await request.get("http://localhost:5811/profile.json");
  expect(response.ok()).toBe(true);
  const profile = await response.json() as { packageOrigin: string };
  const artifacts = await Promise.all([current, alternate].map(async (version) => {
    const fragment = await request.get(`${profile.packageOrigin}/@flanksource/clicky-ui@${version}/dist/runtime/importmap.json`);
    return fragment.ok();
  }));
  expect(current !== alternate && artifacts.every(Boolean), `Version switching requires two distinct clicky-ui versions shipping runtime sets: ${current} and ${alternate}. Build/publish both runtime sets and configure PAGE_HOST_CLICKY_VERSION_ALT; the workspace origin serves only its real local version.`).toBe(true);
  await openProject(page);
  await ready(page);
  await page.getByRole("combobox", { name: "Preview page" }).selectOption("notes.tsx");
  await ready(page);
  await page.getByRole("button", { name: "Save to URL", exact: true }).click();
  const before = fromShareUrl(page.url());
  const other = before.locks["notes.tsx"]!;
  await page.getByRole("combobox", { name: "Preview page" }).selectOption("diagram.tsx");
  await ready(page);
  await page.getByRole("tab", { name: "Libraries", exact: true }).click();
  await page.getByLabel("clicky-ui version").fill(alternate);
  await page.getByRole("button", { name: "Apply page versions" }).click();
  await ready(page);
  await page.getByRole("button", { name: "Save to URL", exact: true }).click();
  const after = fromShareUrl(page.url());
  expect(after.locks["diagram.tsx"]!.map.imports.react).not.toEqual(before.locks["diagram.tsx"]!.map.imports.react);
  expect(after.locks["notes.tsx"]).toEqual(other);
  expect(JSON.parse(after.files["package.json"]!).pageRuntime.pages["diagram.tsx"]["@flanksource/clicky-ui"]).toBe(alternate);
});

test("HTML export is a styled snapshot without runtime scripts", async ({ page }) => {
  await openProject(page);
  await ready(page);
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export HTML", exact: true }).click();
  const download = await downloaded;
  const path = await download.path();
  if (!path) throw new Error("HTML export did not produce a file");
  const html = await readFile(path, "utf8");
  expect(html).toContain("Deployment path");
  expect(html).toContain("<style");
  expect(html).not.toMatch(/<script\b|<link[^>]*rel="stylesheet"/i);
  expect(html).toContain("@media print");
});

test("print asks the preview frame to print with print styles", async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => { document.documentElement.dataset.printRequested = "true"; };
  });
  await openProject(page);
  await ready(page);
  const frame = page.frameLocator('iframe[title="Page preview"]:visible');
  await page.emulateMedia({ media: "print" });
  await page.getByRole("button", { name: "Print", exact: true }).click();
  await expect(frame.locator("html")).toHaveAttribute("data-print-requested", "true");
  await expect(frame.locator("main")).toHaveCSS("break-inside", "avoid");
});

