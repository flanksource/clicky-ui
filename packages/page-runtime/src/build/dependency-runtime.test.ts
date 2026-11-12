import { mkdtemp, mkdir, writeFile, rm, cp, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import { afterEach, expect, test } from "vitest";
import { buildDependencyRuntime } from "./dependency-runtime.ts";
import { ensureDependencyRuntime } from "./dependency-cache.ts";
import { dependencyRuntimePlugin } from "./dependency-plugin.ts";
import { rolldown } from "rolldown";

const roots: string[] = [];
afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))); });

async function fixture() {
  await mkdir(".tmp", { recursive: true });
  const root = await mkdtemp(".tmp/dependency-runtime-");
  roots.push(root);
  await mkdir(join(root, "node_modules/example-lib"), { recursive: true });
  await writeFile(join(root, "package.json"), JSON.stringify({ type: "module" }));
  await writeFile(join(root, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
  await writeFile(join(root, "node_modules/example-lib/package.json"), JSON.stringify({ name: "example-lib", version: "1.0.0", type: "module", exports: { ".": { browser: "./browser.js", node: "./node.js" }, "./data": "./data.cjs" } }));
  await writeFile(join(root, "node_modules/example-lib/browser.js"), 'export const platform = "browser"; export { default as data } from "./data.cjs";');
  await writeFile(join(root, "node_modules/example-lib/node.js"), 'export const platform = "node"; export { default as data } from "./data.cjs";');
  await writeFile(join(root, "node_modules/example-lib/data.cjs"), 'module.exports = { value: "shared data" };');
  return root;
}

test.each(["node", "browser"] as const)("builds a relocatable %s closure with shared CommonJS identity", async target => {
  const root = await fixture();
  const runtime = await buildDependencyRuntime({ root, outDir: join(root, "compiled"), entries: ["example-lib", "example-lib/data"], target });
  await cp(join(root, "compiled"), join(root, "relocated"), { recursive: true });
  await rm(join(root, "node_modules"), { recursive: true });
  const library = await import(pathToFileURL(join(process.cwd(), root, "relocated", runtime.imports["example-lib"]!)).href);
  const data = await import(pathToFileURL(join(process.cwd(), root, "relocated", runtime.imports["example-lib/data"]!)).href);
  expect({ platform: library.platform, data: library.data, same: library.data === data.default, value: data.value }).toEqual({ platform: target, data: { value: "shared data" }, same: true, value: "shared data" });
  expect(Object.keys(runtime.integrity)).toContain(runtime.imports["example-lib"]);
  expect(JSON.parse(await readFile(join(root, "compiled/runtime.json"), "utf8"))).toEqual(runtime);
});

test("reuses concurrent compilations and publishes a new generation for changed library code", async () => {
  const root = await fixture();
  const options = { root, cacheDir: join(root, "cache"), entries: ["example-lib"], target: "browser" as const };
  const [first, second] = await Promise.all([ensureDependencyRuntime(options), ensureDependencyRuntime(options)]);
  expect(first.root).toBe(second.root);
  await writeFile(join(root, "node_modules/example-lib/browser.js"), 'export const platform = "changed";');
  const changed = await ensureDependencyRuntime(options);
  expect(changed.root).not.toBe(first.root);
  expect((await import(pathToFileURL(join(process.cwd(), changed.root, changed.imports["example-lib"]!)).href)).platform).toBe("changed");
  expect((await import(pathToFileURL(join(process.cwd(), first.root, first.imports["example-lib"]!)).href)).platform).toBe("browser");
});

test("emits imported styles and preserves image assets", async () => {
  const root = await fixture();
  await writeFile(join(root, "node_modules/example-lib/style.css"), '.example { color: red; background: url("./image.svg"); }');
  await writeFile(join(root, "node_modules/example-lib/image.svg"), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  await writeFile(join(root, "node_modules/example-lib/browser.js"), 'import "./style.css"; export const platform = "browser";');
  const runtime = await buildDependencyRuntime({ root, outDir: join(root, "compiled"), entries: ["example-lib"], target: "browser" });
  expect(runtime.styles).toHaveLength(1);
  expect(await readFile(join(root, "compiled", runtime.styles[0]!), "utf8")).toContain("color: red");
  expect(await readFile(join(root, "compiled/assets/example-lib@1.0.0/image.svg"), "utf8")).toContain("<svg");
});

test("relocates assets referenced through import.meta.url", async () => {
  const root = await fixture();
  await writeFile(join(root, "node_modules/example-lib/image.svg"), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  await writeFile(join(root, "node_modules/example-lib/browser.js"), 'export const image = new URL("./image.svg", import.meta.url);');
  const runtime = await buildDependencyRuntime({ root, outDir: join(root, "compiled"), entries: ["example-lib"], target: "browser" });
  await cp(join(root, "compiled"), join(root, "relocated"), { recursive: true });
  await rm(join(root, "node_modules"), { recursive: true });
  const library = await import(pathToFileURL(join(process.cwd(), root, "relocated", runtime.imports["example-lib"]!)).href);
  expect(existsSync(library.image)).toBe(true);
});

test("honors explicit browser:false mappings while rejecting undeclared builtins", async () => {
  const root = await fixture();
  await writeFile(join(root, "node_modules/example-lib/package.json"), JSON.stringify({ name: "example-lib", version: "1.0.0", type: "module", main: "./browser.js", browser: { fs: false } }));
  await writeFile(join(root, "node_modules/example-lib/browser.js"), 'import fs from "fs"; export const disabled = Object.keys(fs).length === 0;');
  const runtime = await buildDependencyRuntime({ root, outDir: join(root, "compiled"), entries: ["example-lib"], target: "browser" });
  expect((await import(pathToFileURL(join(process.cwd(), root, "compiled", runtime.imports["example-lib"]!)).href)).disabled).toBe(true);
});

test("compiles requested barrel bindings without pulling in unused optional peers", async () => {
  const root = await fixture();
  const library = join(root, "node_modules/example-lib");
  await writeFile(join(library, "package.json"), JSON.stringify({ name: "example-lib", version: "1.0.0", type: "module", sideEffects: false, main: "./browser.js" }));
  await mkdir(join(library, "dist/runtime"), { recursive: true });
  await writeFile(join(library, "dist/runtime/barrels.json"), JSON.stringify({ modules: ["example-lib@1.0.0/leaf.js"], barrels: { "example-lib@1.0.0/browser.js": { value: 0 } } }));
  await writeFile(join(library, "leaf.js"), 'export const value = "selected export";');
  await writeFile(join(library, "browser.js"), 'export { value } from "./leaf.js"; export { missing } from "missing-optional-peer";');
  const runtime = await buildDependencyRuntime({ root, outDir: join(root, "compiled"), entries: ["example-lib"], target: "browser", exports: { "example-lib": ["value"] } });
  expect((await import(pathToFileURL(join(process.cwd(), root, "compiled", runtime.imports["example-lib"]!)).href)).value).toBe("selected export");
});

test.each(["node", "browser"] as const)("shares base-module identity across new ESM and CommonJS dependency entries (%s)", async target => {
  const root = resolve(await fixture());
  await mkdir(join(root, "node_modules/shared"));
  await writeFile(join(root, "node_modules/shared/package.json"), JSON.stringify({ name: "shared", version: "1.0.0", type: "module", main: "index.js" }));
  await writeFile(join(root, "node_modules/shared/index.js"), "export const context = {};");
  await writeFile(join(root, "node_modules/example-lib/node.js"), 'import {context} from "shared"; export {context}; export const platform = "node";');
  await writeFile(join(root, "node_modules/example-lib/browser.js"), 'import {context} from "shared"; export {context}; export const platform = "browser";');
  await writeFile(join(root, "node_modules/example-lib/data.cjs"), 'const {context} = require("shared"); module.exports = { context, value: "shared data" };');
  const baseRoot = join(root, "base");
  const base = { ...await buildDependencyRuntime({ root, outDir: baseRoot, entries: ["shared"], target }), root: baseRoot };
  await writeFile(join(root, "template.js"), 'import {context as base} from "shared"; import {context, platform} from "example-lib"; import data from "example-lib/data"; export const result = {same: base === context && base === data.context, platform, data};');
  const bundle = await rolldown({ input: join(root, "template.js"), plugins: [dependencyRuntimePlugin({ root, cacheDir: join(root, "cache"), base })] });
  try {
    await bundle.write({ dir: join(root, "template"), format: "esm", entryFileNames: "entry.mjs" });
    const rendered = await import(pathToFileURL(join(root, "template/entry.mjs")).href);
    expect(rendered.result).toEqual({ same: true, platform: target, data: { context: {}, value: "shared data" } });
    if (target === "node") expect((await readFile(join(root, "template/entry.mjs"), "utf8")).includes("shared data")).toBe(false);
  } finally { await bundle.close(); }
});

test("rejects browser builtins and unresolved imports without publishing metadata", async () => {
  const root = await fixture();
  await writeFile(join(root, "node_modules/example-lib/browser.js"), 'import { readFileSync } from "node:fs"; export { readFileSync };');
  await expect(buildDependencyRuntime({ root, outDir: join(root, "compiled"), entries: ["example-lib"], target: "browser" })).rejects.toThrow(/node:fs/);
  await expect(readFile(join(root, "compiled/runtime.json"))).rejects.toThrow();
  await writeFile(join(root, "node_modules/example-lib/browser.js"), 'export { missing } from "missing-dependency";');
  await expect(buildDependencyRuntime({ root, outDir: join(root, "compiled"), entries: ["example-lib"], target: "browser" })).rejects.toThrow(/missing-dependency/);
});
