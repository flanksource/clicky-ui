import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { publishPackage } from "../publication/index.ts";
import { validateProfile } from "../sw/profile.ts";
import { serveRuntime, type RuntimeOriginOptions } from "./runtime-origin.ts";

let root: string;
let options: RuntimeOriginOptions;
let runtime: Awaited<ReturnType<typeof serveRuntime>> | undefined;

beforeEach(async () => {
  await mkdir(".tmp/runtime-origin", { recursive: true });
  root = await mkdtemp(resolve(".tmp/runtime-origin/example-"));
  await mkdir(resolve(root, "dist"));
  await writeFile(resolve(root, "package.json"), JSON.stringify({ name: "@acme/ui", version: "1.2.3", files: ["dist"], exports: { ".": "./dist/index.js" } }));
  await writeFile(resolve(root, "dist/index.js"), "export const example = true;");
  await publishPackage({ libraryDir: root });
  const assetsDir = resolve(root, "assets");
  await mkdir(assetsDir);
  for (const file of ["bootstrap.html", "sw.js", "boot.js", "page-agent.js", "editing.js", "export-compiler.js", "devtools-hook.js"]) {
    await writeFile(resolve(assetsDir, file), file === "bootstrap.html" ? "<html>runtime</html>" : "export {};");
  }
  options = { hostOrigin: "http://localhost:5270", packages: [root], stateDir: resolve(root, "origin"), assetsDir, upstreamRegistry: "https://registry.npmjs.org", upstreamOrigin: "https://unpkg.com" };
});

afterEach(async () => {
  await runtime?.close();
  runtime = undefined;
  await rm(root, { recursive: true, force: true });
});

it("serves an isolated runtime with the exact embedder and immutable local packages", async () => {
  runtime = await serveRuntime(options);
  expect(runtime.origin).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
  expect(runtime.dependencies).toEqual({ "@acme/ui": "1.2.3" });
  const profile = validateProfile(await (await fetch(`${runtime.origin}/profile.json`)).json());
  expect(profile).toMatchObject({ embedders: [options.hostOrigin], managed: runtime.dependencies, registry: profile.packageOrigin, sources: ["host"] });
  expect(profile.packageOrigin).toMatch(new RegExp(`^${runtime.origin}/_generations/[a-f0-9]+$`));
  expect(await (await fetch(`${profile.packageOrigin}/@acme/ui@1.2.3/dist/index.js`)).text()).toBe("export const example = true;");
  expect(await (await fetch(`${runtime.origin}/frame/__form/entry.tsx`)).text()).toBe("<html>runtime</html>");
  const worker = await fetch(`${runtime.origin}/sw.js`, { method: "HEAD" });
  expect([worker.status, worker.headers.get("service-worker-allowed"), worker.headers.get("content-type"), await worker.text()]).toEqual([200, "/frame/", "text/javascript; charset=utf-8", ""]);
  expect((await fetch(`${runtime.origin}/package.json`)).status).toBe(404);
  expect((await fetch(`${runtime.origin}/profile.json`, { method: "POST" })).status).toBe(405);
});

it.each(["https://app.example", "http://localhost:5270/path", "file:///localhost", "http://localhost:5270?query"])("rejects a non-exact or remote embedder %s", async (hostOrigin) => {
  await expect(serveRuntime({ ...options, hostOrigin })).rejects.toThrow(/exact loopback origin/);
});

it("fails before listening when the runtime assets are missing", async () => {
  await expect(serveRuntime({ ...options, assetsDir: resolve(root, "missing") })).rejects.toThrow(/ENOENT/);
});

it("reports a broken publication as an HTTP error", async () => {
  runtime = await serveRuntime(options);
  await writeFile(resolve(root, "package.json"), JSON.stringify({ name: "@acme/renamed", version: "1.2.3", files: ["dist"], exports: { ".": "./dist/index.js" } }));
  await publishPackage({ libraryDir: root });
  await vi.waitFor(() => expect(() => runtime!.dependencies).toThrow(/identity changed/));
  const response = await fetch(`${runtime.origin}/profile.json`, { signal: AbortSignal.timeout(1000) });
  expect(response.status).toBe(500);
  expect(await response.text()).toContain("package identity changed");
});
