import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";

const execute = promisify(execFile);
const session = `playground-frames-${process.pid}`;
const origin = `http://127.0.0.1:${process.env.PLAYGROUND_FRAMES_PORT ?? "5276"}`;
const browser = async (...args: string[]) => (await execute("agent-browser", ["--engine", "chrome", "--session", session, ...args], { timeout: 60000, maxBuffer: 2000000 })).stdout.trim();
const catalog = JSON.parse(await readFile(new URL("../../../apps/playground/docs/browser-mode-compatibility.json", import.meta.url), "utf8")) as { pages: { slug: string; compatible: boolean; issues: { blocking: boolean; reason: string; fix: string }[] }[] };
let launched = false;
test.beforeAll(async () => { await browser("set", "viewport", "1920", "1080"); launched = true; });
test.afterAll(async () => { if (launched) await browser("close"); });

for (const page of catalog.pages.filter(page => page.compatible)) test(`compatible page ${page.slug} reaches readiness in a frame`, async () => {
  if (launched) await browser("network", "requests", "--clear", "--filter", "/@vite");
  await browser("open", `${origin}/?${new URLSearchParams({ page: page.slug })}`); launched = true;
  await browser("wait", "--fn", 'document.querySelector("[data-testid=playground-frame-status]")?.textContent === "ready" || Boolean(document.querySelector("[aria-label=\\\"Page error\\\"]"))');
  const body = await browser("get", "text", "body");
  expect(body, `${page.slug}: ${body}`).not.toContain("This playground page failed");
  expect(await browser("get", "text", "[data-testid=playground-frame-status]")).toBe("ready");
  expect(await browser("get", "attr", "iframe[title^=\"Page:\"]", "src")).toContain("/frame/");
  for (const pattern of ["/@vite", "/@fs", "?t=", "&t="]) {
    const result = JSON.parse(await browser("network", "requests", "--filter", pattern, "--json")) as { data: { requests: unknown[] } };
    expect(result.data.requests, `Forbidden production request ${pattern}`).toEqual([]);
  }
});

test("an incompatible page shows its census reasons and fixes", async () => {
  const page = catalog.pages.find(page => !page.compatible);
  if (!page) throw new Error("Census has no incompatible page to verify");
  await browser("open", `${origin}/?${new URLSearchParams({ page: page.slug })}`); launched = true;
  await browser("wait", "--text", "This page needs changes for browser mode");
  const content = await browser("get", "text", "[aria-label=\"Browser-mode incompatibility\"]");
  for (const issue of page.issues.filter(issue => issue.blocking)) { expect(content).toContain(issue.reason); expect(content).toContain(issue.fix); }
});
