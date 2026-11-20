import { mkdtemp, mkdir, writeFile, rm, cp, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { afterEach, expect, test, vi } from "vitest";
import { buildDependencyRuntime, buildInstalledDependencyRuntime } from "./dependency-runtime.ts";
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

test("packages a module worker and its imports relative to the compiled browser entry", async () => {
  const root = await fixture();
  const library = join(root, "node_modules/example-lib");
  await writeFile(join(library, "browser.js"), 'export const create = () => new Worker(new URL("echo.worker.js", import.meta.url), { type: "module" });');
  await writeFile(join(library, "echo.worker.js"), 'import { reply } from "./reply.js"; self.onmessage = () => self.postMessage(reply);');
  await writeFile(join(library, "reply.js"), 'export const reply = "worker dependency was bundled";');
  const outDir = join(root, "compiled");
  const runtime = await buildDependencyRuntime({ root, outDir, entries: ["example-lib"], target: "browser" });
  const worker = Object.keys(runtime.integrity).find(file => /^assets\/echo\.worker-.*\.js$/.test(file));
  expect(worker).toBeDefined();
  const self = { onmessage: () => undefined, postMessage: vi.fn() };
  runInNewContext(await readFile(join(outDir, worker!), "utf8"), { self });
  self.onmessage();
  expect(self.postMessage).toHaveBeenCalledWith("worker dependency was bundled");
  expect(Object.keys(runtime.inputs)).toContain(resolve(library, "reply.js"));
  expect(await readFile(join(outDir, runtime.imports["example-lib"]!), "utf8")).toContain(worker!);
});

test("honors explicit browser:false mappings while rejecting undeclared builtins", async () => {
  const root = await fixture();
  await writeFile(join(root, "node_modules/example-lib/package.json"), JSON.stringify({ name: "example-lib", version: "1.0.0", type: "module", main: "./browser.js", browser: { fs: false } }));
  await writeFile(join(root, "node_modules/example-lib/browser.js"), 'import fs from "fs"; export const disabled = Object.keys(fs).length === 0;');
  const runtime = await buildDependencyRuntime({ root, outDir: join(root, "compiled"), entries: ["example-lib"], target: "browser" });
  expect((await import(pathToFileURL(join(process.cwd(), root, "compiled", runtime.imports["example-lib"]!)).href)).disabled).toBe(true);
});

test.each([
  { published: true, target: "node" as const },
  { published: false, target: "node" as const },
  { published: true, target: "browser" as const },
  { published: false, target: "browser" as const },
])("compiles requested barrel bindings without unused optional peers ($target, published index: $published)", async ({ published, target }) => {
  const root = await fixture();
  const library = join(root, "node_modules/example-lib");
  await writeFile(join(library, "package.json"), JSON.stringify({ name: "example-lib", version: "1.0.0", type: "module", sideEffects: false, main: "./browser.js" }));
  if (published) {
    await mkdir(join(library, "dist/runtime"), { recursive: true });
    await writeFile(join(library, "dist/runtime/barrels.json"), JSON.stringify({ modules: ["example-lib@1.0.0/leaf.js"], barrels: { "example-lib@1.0.0/browser.js": { value: 0 } } }));
  }
  await writeFile(join(library, "leaf.js"), 'export const value = "selected export";');
  await writeFile(join(library, "browser.js"), 'export { value } from "./leaf.js"; export { missing } from "missing-optional-peer";');
  const runtime = await buildDependencyRuntime({ root, outDir: join(root, "compiled"), entries: ["example-lib"], target, exports: { "example-lib": ["value"] } });
  expect((await import(pathToFileURL(join(process.cwd(), root, "compiled", runtime.imports["example-lib"]!)).href)).value).toBe("selected export");
});

test("indexes a library's dependencies from the install, not from the versions its published index recorded", async () => {
  const root = await fixture();
  const library = join(root, "node_modules/example-lib");
  const dependency = join(root, "node_modules/shared-dep");
  await mkdir(dependency, { recursive: true });
  await writeFile(join(library, "package.json"), JSON.stringify({ name: "example-lib", version: "1.0.0", type: "module", sideEffects: false, main: "./browser.js" }));
  await mkdir(join(library, "dist/runtime"), { recursive: true });
  // Published from a checkout where shared-dep re-exported from leaf@1.0.0; this install has neither that leaf nor that layout.
  await writeFile(join(library, "dist/runtime/barrels.json"), JSON.stringify({
    modules: ["leaf@1.0.0/index.js", "example-lib@1.0.0/leaf.js"],
    barrels: { "shared-dep@2.0.0/index.js": { value: 0 }, "example-lib@1.0.0/browser.js": { value: 0, local: 1 } },
  }));
  await writeFile(join(library, "leaf.js"), 'export const local = "own module";');
  await writeFile(join(library, "browser.js"), 'export { value } from "shared-dep"; export { local } from "./leaf.js";');
  await writeFile(join(dependency, "package.json"), JSON.stringify({ name: "shared-dep", version: "2.0.0", type: "module", sideEffects: false, main: "./index.js" }));
  await writeFile(join(dependency, "index.js"), 'export { value } from "./value.js";');
  await writeFile(join(dependency, "value.js"), 'export const value = "installed dependency";');
  const outDir = join(root, "compiled");
  const runtime = await buildDependencyRuntime({ root, outDir, entries: ["example-lib"], target: "node", exports: { "example-lib": ["value", "local"] } });
  expect({ ...(await import(pathToFileURL(resolve(outDir, runtime.imports["example-lib"]!)).href)) }).toEqual({ value: "installed dependency", local: "own module" });
});

test("keeps side effects when deriving an unpublished barrel index", async () => {
  const root = await fixture();
  const library = join(root, "node_modules/example-lib");
  await writeFile(join(library, "package.json"), JSON.stringify({ name: "example-lib", version: "1.0.0", type: "module", sideEffects: ["./browser.js"], main: "./browser.js" }));
  await writeFile(join(library, "leaf.js"), 'export const state = { initialized: false };');
  await writeFile(join(library, "browser.js"), 'import { state } from "./leaf.js"; state.initialized = true; export { state };');
  const runtime = await buildDependencyRuntime({ root, outDir: join(root, "compiled"), entries: ["example-lib"], target: "browser", exports: { "example-lib": ["state"] } });
  expect((await import(pathToFileURL(join(process.cwd(), root, "compiled", runtime.imports["example-lib"]!)).href)).state).toEqual({ initialized: true });
});

test("derives project runtime barrels from its installed dependency graph", async () => {
  const root = await fixture();
  const library = join(root, "node_modules/example-lib");
  await writeFile(join(library, "package.json"), JSON.stringify({ name: "example-lib", version: "1.0.0", type: "module", sideEffects: false, main: "./browser.js" }));
  await mkdir(join(library, "dist/runtime"), { recursive: true });
  await writeFile(join(library, "dist/runtime/barrels.json"), JSON.stringify({ modules: ["published-dependency@3.0.0/leaf.js"], barrels: { "example-lib@1.0.0/browser.js": { value: 0 } } }));
  await writeFile(join(library, "leaf.js"), 'export const value = "installed value";');
  await writeFile(join(library, "browser.js"), 'export { value } from "./leaf.js";');
  const outDir = join(root, "compiled");
  const runtime = await buildInstalledDependencyRuntime({ root, outDir, entries: ["example-lib"], target: "node", exports: { "example-lib": ["value"] } });
  expect((await import(pathToFileURL(resolve(outDir, runtime.imports["example-lib"]!)).href)).value).toBe("installed value");
});

test.each(["node", "browser"] as const)("preserves missing optional dynamic imports as runtime failures (%s)", async target => {
  const root = await fixture();
  const library = join(root, "node_modules/example-lib");
  await writeFile(join(library, "package.json"), JSON.stringify({ name: "example-lib", version: "1.0.0", type: "module", main: "./browser.js", peerDependencies: { "optional-highlighter": "*" }, peerDependenciesMeta: { "optional-highlighter": { optional: true } } }));
  await writeFile(join(library, "browser.js"), 'export const load = () => import("optional-highlighter/theme");');
  const runtime = await buildDependencyRuntime({ root, outDir: join(root, "compiled"), entries: ["example-lib"], target });
  const module = await import(pathToFileURL(join(process.cwd(), root, "compiled", runtime.imports["example-lib"]!)).href);
  await expect(module.load()).rejects.toThrow(/optional-highlighter/);
  await writeFile(join(library, "browser.js"), 'export { theme } from "optional-highlighter/theme";');
  await expect(buildDependencyRuntime({ root, outDir: join(root, "static"), entries: ["example-lib"], target })).rejects.toThrow(/optional-highlighter/);
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
