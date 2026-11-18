import { mkdir, rm, writeFile } from "node:fs/promises";
import { expect } from "@playwright/test";
import { test } from "./timing";
import { STARTER, fromShareUrl, openProject, projectHash, ready, replaceSource } from "./helpers";
import { linkFixture } from "./link-fixture";

test("link attempts are rejected under the default host profile", async ({ page }) => {
  await openProject(page);
  await page.getByText("Library links · Default profile", { exact: true }).click();
  await page.getByLabel("Checkout file-server URL", { exact: true }).fill("http://127.0.0.1:8790/");
  await page.getByRole("button", { name: "Link server", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "developer overrides are disabled" })).toBeVisible();
});

test("link server edits reach the reference frame within budgets using checkout React", async ({ page, timing }) => {
  test.setTimeout(180000);
  await rm("results/page-host-link.json", { force: true });
  const fixture = await linkFixture();
  try {
    const source = 'import * as React from "react"; import {Version} from "@flanksource/clicky-ui/data"; export default function LinkedPage() { const [count,setCount] = React.useState(0); return <main className="p-8"><h1>Linked checkout</h1><Version/><button onClick={() => setCount(count+1)}>Count {count}</button></main>; }';
    const project = { ...STARTER, files: { ...STARTER.files, [STARTER.entry]: source } };
    await page.goto(`http://localhost:5820/${projectHash(project)}`);
    await ready(page);
    await page.getByRole("button", { name: "Save to URL", exact: true }).click();
    const published = fromShareUrl(page.url()).locks[STARTER.entry]!;
    await page.getByText("Library links · Developer profile", { exact: true }).click();
    await page.getByLabel("Checkout file-server URL", { exact: true }).fill(fixture.source);
    const started = performance.now();
    await page.getByRole("button", { name: "Link server", exact: true }).click();
    const frame = page.frameLocator('iframe[title="Page preview"]');
    await expect(frame.locator("[data-link-edit]")).toHaveText("revision-0", { timeout: 15000 });
    await ready(page);
    const coldMs = performance.now() - started;
    const cachedModule = page.waitForResponse((response) => response.url().includes("/link/checkout/src/data/Version.tsx") && response.headers()["x-link-compiled"] === "0");
    const warmStarted = await frame.locator("html").evaluate(() => { const at = performance.timeOrigin + performance.now(); location.reload(); return at; });
    await cachedModule;
    await ready(page, { navigationStartedAfter: warmStarted });
    const warmReady = timing.findLast((event) => event.message === "status" && event.state === "ready" && event.at > warmStarted);
    if (!warmReady) throw new Error("Warm linked reload is missing its ready timestamp");
    const warmMs = warmReady.at - warmStarted;
    await replaceSource(page, source.replace("{Version}", "{Version,linkedReact}").replace('<main className="p-8">', '<main className="p-8" data-single-react={React === linkedReact}>'));
    await ready(page);
    await expect(frame.locator("main")).toHaveAttribute("data-single-react", "true");
    await frame.getByRole("button", { name: "Count 0", exact: true }).click();
    await expect(frame.getByRole("button", { name: "Count 1", exact: true })).toBeVisible();
    const requests: string[] = [];
    page.on("request", (request) => { if (request.url().includes("/link/checkout/")) requests.push(request.url()); });
    const samples: number[] = [];
    for (let revision = 1; revision <= 12; revision++) {
      const at = await fixture.edit(revision);
      await expect(frame.locator("[data-link-edit]")).toHaveText(`revision-${revision}`);
      await expect.poll(() => timing.find((event) => event.name === `visible:revision-${revision}`)).toBeDefined();
      samples.push(timing.find((event) => event.name === `visible:revision-${revision}`)!.at - at);
      await ready(page);
    }
    expect(requests.some((url) => /\/link\/checkout\/dist\/runtime\/react@/.test(decodeURIComponent(new URL(url).pathname)))).toBe(true);
    await page.getByRole("button", { name: "Save to URL", exact: true }).click();
    expect(fromShareUrl(page.url()).locks[STARTER.entry]).toEqual(published);
    await page.goto(`http://localhost:5810/${projectHash(project)}`);
    await page.getByText("Library links · Default profile", { exact: true }).click();
    await page.getByLabel("Checkout file-server URL", { exact: true }).fill(fixture.source);
    await page.getByRole("button", { name: "Link server", exact: true }).click();
    await expect(page.getByRole("alert").filter({ hasText: "developer overrides are disabled" })).toBeVisible();
    const deniedWithoutOverrides = true;
    const sorted = [...samples].sort((a, b) => a - b);
    const report = { editP50Ms: sorted[Math.floor(sorted.length / 2)]!, coldMs, warmMs, cached: true, deniedWithoutOverrides, editSamplesMs: samples, checkout: fixture.checkout };
    await mkdir("results", { recursive: true }); await writeFile("results/page-host-link.json", `${JSON.stringify(report, null, 2)}\n`);
    expect(report.editP50Ms).toBeLessThanOrEqual(300); expect(coldMs).toBeLessThanOrEqual(15000); expect(deniedWithoutOverrides).toBe(true);
    expect(warmMs).toBeLessThan(1000); expect(samples[0]).toBeLessThan(1000); expect(samples[1]).toBeLessThan(1000);
  } finally { await fixture.close(); }
});
