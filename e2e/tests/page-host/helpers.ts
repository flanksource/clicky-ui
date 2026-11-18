import { expect, type Page } from "@playwright/test";
import fixture from "./fixture.json" with { type: "json" };
import { readFileSync } from "node:fs";
import { deflateSync, inflateSync } from "node:zlib";

type Project = { format: number; name: string; entry: string; files: Record<string, string>; locks: Record<string, { map: { imports: Record<string, string>; scopes: Record<string, Record<string, string>> } }> };
export const WORKSPACE_VERSIONS: Record<string, string> = Object.fromEntries([
  new URL("../../../packages/ui/package.json", import.meta.url),
  new URL("../../../../facet/package.json", import.meta.url),
].map((path) => {
  const manifest = JSON.parse(readFileSync(path, "utf8")) as { name: string; version: string };
  if (!manifest.name || !manifest.version) throw new Error(`${path}: missing package identity`);
  return [manifest.name, manifest.version];
}));
export const STARTER: Project = { ...fixture, files: { ...fixture.files, "package.json": JSON.stringify({ dependencies: WORKSPACE_VERSIONS }) } };

export function projectHash(project: Project): string {
  return `#page=${deflateSync(new TextEncoder().encode(JSON.stringify(project))).toString("base64url")}`;
}

export async function openProject(page: Page, project: Project = STARTER) {
  await page.goto(`/${projectHash(project)}`);
  await expect(page.getByRole("heading", { name: project.name })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Source editor" })).toBeVisible();
}

export async function ready(page: Page, options: { navigationStartedAfter?: number } = {}) {
  if (options.navigationStartedAfter !== undefined) {
    const frame = page.frameLocator('iframe[title="Page preview"]:visible');
    await expect.poll(() => frame.locator("html").evaluate(() => performance.timeOrigin)).toBeGreaterThan(options.navigationStartedAfter);
    await expect.poll(() => frame.locator("html").evaluate(() => performance.getEntriesByName("page-runtime:ready").length), { timeout: 45_000 }).toBeGreaterThan(0);
  }
  const status = page.locator('[data-testid="preview-status"]:visible');
  await expect(status).toHaveText(/^(ready|error)$/, { timeout: 45_000 });
  await expect(status, await page.getByRole("alert").allTextContents().then((messages) => messages.join("\n"))).toHaveText("ready");
}

export async function replaceSource(page: Page, source: string) {
  const editor = page.getByRole("textbox", { name: "Source editor" });
  await editor.focus();
  await editor.press("Escape");
  const mac = await page.evaluate(() => navigator.userAgent.includes("Macintosh"));
  await editor.press(mac ? "Meta+A" : "Control+A");
  await editor.press("Backspace");
  await page.keyboard.insertText(source);
}

export function fromShareUrl(url: string): Project {
  const encoded = new URLSearchParams(new URL(url).hash.slice(1)).get("page");
  if (!encoded) throw new Error("host did not save a hash project");
  return JSON.parse(inflateSync(Uint8Array.from(Buffer.from(encoded, "base64url"))).toString("utf8")) as Project;
}
