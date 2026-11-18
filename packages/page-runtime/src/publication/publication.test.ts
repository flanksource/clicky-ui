import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { publishPackage, runPackageBuild } from "./index.ts";
import { withPackageLock } from "./lock.ts";
import { fileURLToPath } from "node:url";

describe("package publication", { timeout: 30000 }, () => {
let root: string;
const source = "export const version = 'first';";
const manifest = { name: "@acme/ui", version: "1.2.3", type: "module", files: ["dist"], exports: { ".": "./dist/index.js", "./runtime/*": "./dist/runtime/*" } };
async function runtime(code: string) {
  await writeFile(resolve(root, "dist/index.js"), code);
  await writeFile(resolve(root, "dist/runtime/importmap.json"), JSON.stringify({ fragment: 1, name: manifest.name, imports: { [manifest.name]: "@acme/ui@1.2.3/dist/index.js" }, scopes: {}, remaps: {}, aliases: {}, inherits: [], integrity: { "@acme/ui@1.2.3/dist/index.js": `sha384-${createHash("sha384").update(code).digest("base64")}` } }));
  await writeFile(resolve(root, "dist/runtime/barrels.json"), JSON.stringify({ modules: ["/npm/@acme/ui@1.2.3/dist/index.js"], barrels: {} }));
}
beforeEach(async () => {
  await mkdir(resolve(".tmp/publication"), { recursive: true });
  root = await mkdtemp(resolve(".tmp/publication/package-"));
  await mkdir(resolve(root, "dist/runtime"), { recursive: true });
  await writeFile(resolve(root, "package.json"), JSON.stringify(manifest));
  await runtime(source);
});
afterEach(async () => { await rm(root, { recursive: true, force: true }); });

it("keeps the published package readable after the live build directory is deleted", async () => {
  const published = await publishPackage({ libraryDir: root });
  await rm(resolve(root, "dist"), { recursive: true });
  expect(await readFile(resolve(published.directory, "dist/index.js"), "utf8")).toBe(source);
  expect(JSON.parse(await readFile(resolve(root, ".tmp/package-publications/current.json"), "utf8"))).toMatchObject({ build: published.build });
});

it("publishes packages whose temporary directory is a filesystem link", async () => {
  await mkdir(resolve(root, "cache"));
  await symlink("cache", resolve(root, ".tmp"));
  const publication = await publishPackage({ libraryDir: root });
  expect(await readFile(resolve(publication.directory, "dist/index.js"), "utf8")).toBe(source);
});

it("deduplicates identical builds and retains immutable earlier generations", async () => {
  const first = await publishPackage({ libraryDir: root });
  expect(await publishPackage({ libraryDir: root })).toEqual(first);
  const next = "export const version = 'second';";
  await runtime(next);
  const second = await publishPackage({ libraryDir: root });
  expect(second.build).not.toBe(first.build);
  expect(await readFile(resolve(first.directory, "dist/index.js"), "utf8")).toBe(source);
  expect(await readFile(resolve(second.directory, "dist/index.js"), "utf8")).toBe(next);
});

it("rejects incomplete or inconsistent runtime output without replacing the current publication", async () => {
  const first = await publishPackage({ libraryDir: root });
  await writeFile(resolve(root, "dist/index.js"), "export const broken = true;");
  await expect(publishPackage({ libraryDir: root })).rejects.toThrow(/integrity/);
  expect(JSON.parse(await readFile(resolve(root, ".tmp/package-publications/current.json"), "utf8"))).toMatchObject({ build: first.build });
  await rm(resolve(root, "dist/runtime/barrels.json"));
  await expect(publishPackage({ libraryDir: root })).rejects.toThrow(/barrels/);
});

it("uses the native publishable file list with lifecycle scripts disabled", async () => {
  await writeFile(resolve(root, "private.txt"), "not published");
  await writeFile(resolve(root, "package.json"), JSON.stringify({ ...manifest, scripts: { prepack: "exit 19" } }));
  const published = await publishPackage({ libraryDir: root });
  await expect(readFile(resolve(published.directory, "private.txt"))).rejects.toMatchObject({ code: "ENOENT" });
  expect(JSON.parse(await readFile(resolve(published.directory, "package.json"), "utf8"))).toMatchObject({ name: manifest.name, version: manifest.version });
});

it.each(["fail", "interrupt"])("keeps the last successful publication when a build ends with %s", async mode => {
  const first = await publishPackage({ libraryDir: root });
  await expect(runPackageBuild({ libraryDir: root, command: process.execPath, args: [fileURLToPath(new URL("./fixtures/build.mjs", import.meta.url)), mode] })).rejects.toThrow(/Package build failed/);
  expect(JSON.parse(await readFile(resolve(root, ".tmp/package-publications/current.json"), "utf8"))).toMatchObject({ build: first.build });
  expect(await publishPackage({ libraryDir: root })).toEqual(first);
});

it("serializes concurrent builds and publications for the same package", async () => {
  const events: string[] = [];
  let release!: () => void;
  let entered!: () => void;
  const started = new Promise<void>(resolve => { entered = resolve; });
  const gate = new Promise<void>(resolve => { release = resolve; });
  const first = withPackageLock({ libraryDir: root, run: async () => { events.push("first started"); entered(); await gate; events.push("first complete"); } });
  await started;
  const second = withPackageLock({ libraryDir: root, run: async () => { events.push("second started"); } });
  release();
  await Promise.all([first, second]);
  expect(events).toEqual(["first started", "first complete", "second started"]);
});
});
