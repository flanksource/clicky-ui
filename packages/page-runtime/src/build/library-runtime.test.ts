import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "rolldown";
import { afterEach, describe, expect, it } from "vitest";
import type { Fragment } from "../schema.ts";
import { buildLibraryRuntime, checkFragment } from "./index.ts";

const roots: string[] = [];
async function fixture(files: Record<string, string>, options: { name?: string; sideEffects?: boolean; exports?: Record<string, string>; pageRuntime?: unknown } = {}) {
  await mkdir(resolve("../../.tmp/A-build"), { recursive: true });
  const root = await mkdtemp(resolve("../../.tmp/A-build/library-"));
  roots.push(root);
  const manifest = { name: options.name ?? "example-library", version: "1.2.3", type: "module", sideEffects: options.sideEffects ?? false, exports: options.exports ?? { ".": "./dist/index.js" }, ...(options.pageRuntime === undefined ? {} : { pageRuntime: options.pageRuntime }) };
  const all = { "package.json": JSON.stringify(manifest), ...files };
  for (const [path, contents] of Object.entries(all)) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), contents);
  }
  return { libraryDir: root, outDir: join(root, "dist/runtime") };
}
afterEach(async () => { await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))); });

describe("buildLibraryRuntime", () => {
  it("traces installed versions, relative files and assets with independent integrity and barrel locations", async () => {
    const source = "export const value = 7;";
    const options = await fixture({
      "dist/index.js": 'export { value } from "./value.js"; export { nested } from "example-dep";',
      "dist/value.js": source,
      "node_modules/example-dep/package.json": JSON.stringify({ name: "example-dep", version: "4.5.6", type: "module", main: "index.js" }),
      "node_modules/example-dep/index.js": 'export const nested = new URL("./data.json", import.meta.url);',
      "node_modules/example-dep/data.json": '{"ok":true}',
    });
    const { fragment, barrels } = await buildLibraryRuntime(options);
    expect(fragment.scopes["example-library@1.2.3/"]).toEqual({ "example-dep": "example-dep@4.5.6/index.js" });
    expect(fragment.integrity["example-library@1.2.3/dist/value.js"]).toBe(`sha384-${createHash("sha384").update(source).digest("base64")}`);
    expect(fragment.integrity["example-dep@4.5.6/data.json"]).toMatch(/^sha384-/);
    expect(barrels.modules).toContain("example-library@1.2.3/dist/value.js");
    expect(JSON.parse(await readFile(join(options.outDir, "importmap.json"), "utf8"))).toEqual(fragment);
    expect(await checkFragment({ libraryDir: options.libraryDir })).toEqual([]);
  });

  describe("compiler plugins", () => {
    const exports = { ".": "./dist/index.js", "./remark/redact": "./remark/redact.mjs" };
    const files = { "dist/index.js": "export const value = 1;", "remark/redact.mjs": "export default function redact() { return () => undefined; }" };
    const plugin = { module: "example-library/remark/redact", options: { allow: {} } };

    it("traces a declared plugin outside dist and publishes the declaration in the fragment", async () => {
      const { fragment } = await buildLibraryRuntime(await fixture(files, { exports, pageRuntime: { compiler: { remark: [plugin] } } }));
      expect({ compiler: fragment.compiler, target: fragment.imports[plugin.module], integrity: fragment.integrity["example-library@1.2.3/remark/redact.mjs"] }).toEqual({ compiler: { remark: [plugin] }, target: "example-library@1.2.3/remark/redact.mjs", integrity: expect.stringMatching(/^sha384-/) });
    });

    it.each([
      ["a module the package does not export", { remark: [{ module: "example-library/remark/missing" }] }, /compiler plugin example-library\/remark\/missing is not in package.json exports/],
      ["another package's module", { remark: [{ module: "other-library/remark/redact" }] }, /expected a example-library\/… module the library exports/],
      ["an empty plugin list", { remark: [] }, /expected a non-empty array/],
      ["an unknown compiler key", { remark: [plugin], rehype: [] }, /pageRuntime\.compiler\.rehype: unknown key/],
    ])("rejects %s", async (_case, compiler, error) => {
      await expect(buildLibraryRuntime(await fixture(files, { exports, pageRuntime: { compiler } }))).rejects.toThrow(error);
    });
  });

  it("sweeps chunks beside exported modules but not classic-script bundles outside the exported directories", async () => {
    const options = await fixture({
      "dist/components/index.js": 'export const load = (name) => import(`./${name}.js`);',
      "dist/components/lazy.js": "export const lazy = true;",
      "dist/playground-form.js": 'var PlaygroundForm=(function(){"use strict";return {};})();',
      "dist/styles.css": "body{margin:0}",
    }, { exports: { ".": "./dist/components/index.js", "./styles.css": "./dist/styles.css" } });
    const { fragment } = await buildLibraryRuntime(options);
    const urls = Object.keys(fragment.integrity);
    expect(urls).toContain("example-library@1.2.3/dist/components/lazy.js");
    expect(urls.filter((url) => url.endsWith("playground-form.js"))).toEqual([]);
    expect(await checkFragment({ libraryDir: options.libraryDir })).toEqual([]);
  });

  it("converts explicit named exports for development and keeps cross-package requires as imports", async () => {
    const options = await fixture({
      "dist/index.js": 'export { answer } from "example-cjs";',
      "node_modules/example-cjs/package.json": JSON.stringify({ name: "example-cjs", version: "2.0.0", main: "index.cjs" }),
      "node_modules/example-cjs/index.cjs": 'const shared = require("example-shared"); exports.answer = shared.value; exports.environment = process.env.NODE_ENV;',
      "node_modules/example-shared/package.json": JSON.stringify({ name: "example-shared", version: "3.0.0", main: "index.cjs" }),
      "node_modules/example-shared/index.cjs": "exports.value = 42;",
    });
    const { fragment } = await buildLibraryRuntime(options);
    const code = await readFile(join(options.outDir, "example-cjs@2.0.0/index.js"), "utf8");
    expect(code).toMatch(/import .* from ["']example-shared["']/);
    expect(code).toMatch(/as answer/);
    expect(code).toContain("development");
    expect(code).not.toMatch(/\b__require\s*\(/);
    expect(fragment.scopes["example-library@1.2.3/dist/runtime/example-cjs@2.0.0/"]?.["example-shared"]).toContain("example-shared@3.0.0/index.js");
    expect(await checkFragment({ libraryDir: options.libraryDir })).toEqual([]);
  });

  it("publishes only development modules and removes stale build variants on rebuild", async () => {
    const options = await fixture({
      "dist/index.js": 'export { environment } from "example-cjs";',
      "node_modules/example-cjs/package.json": JSON.stringify({ name: "example-cjs", version: "1.0.0", main: "index.cjs" }),
      "node_modules/example-cjs/index.cjs": 'module.exports = process.env.NODE_ENV === "production" ? require("./react.production.js") : require("./react.development.js");',
      "node_modules/example-cjs/react.production.js": 'exports.environment = "production";',
      "node_modules/example-cjs/react.development.js": 'exports.environment = "development";',
      "dist/runtime/production/stale.js": "stale build",
      "dist/runtime/development/stale.js": "stale build",
    });
    const { fragment } = await buildLibraryRuntime(options);
    const files = await readdir(options.outDir, { recursive: true });
    expect(files.filter((path) => /^(development|production)(\/|$)/.test(path))).toEqual([]);
    expect(JSON.stringify(fragment)).not.toMatch(/react\.production|\{flavor\}/);
    for (const path of files.filter((path) => path.endsWith(".js"))) {
      expect(await readFile(join(options.outDir, path), "utf8")).not.toMatch(/react\.production|NODE_ENV\s*===?\s*["']production["']/);
    }
    expect(await readFile(join(options.outDir, "example-cjs@1.0.0/index.js"), "utf8")).toContain('"development"');
  });

  it.each([
    { kind: "callable", code: 'function deprecate(value) { return value; } deprecate.label = "shared"; deprecate.identity = {}; module.exports = deprecate;', expression: 'shared("result")', result: "result", type: "function" },
    { kind: "object", code: 'module.exports = { label: "shared", identity: {}, default: "own-default", value: "result" };', expression: "shared.value", result: "result", type: "object" },
  ])("preserves $kind CommonJS exports and identity across package requires", async ({ code, expression, result, type }) => {
    const options = await fixture({
      "dist/index.js": 'export { default as shared, label, identity } from "example-shared"; export { evaluate, same } from "example-consumer";',
      "node_modules/example-shared/package.json": JSON.stringify({ name: "example-shared", version: "1.0.0", main: "index.cjs" }),
      "node_modules/example-shared/index.cjs": code,
      "node_modules/example-consumer/package.json": JSON.stringify({ name: "example-consumer", version: "1.0.0", main: "index.cjs" }),
      "node_modules/example-consumer/index.cjs": `const shared = require("example-shared"); exports.evaluate = () => ${expression}; exports.same = (value) => value === shared;`,
    });
    await buildLibraryRuntime(options);
    const output = join(options.libraryDir, "bundle.mjs");
    await build({ input: join(options.libraryDir, "dist/index.js"), plugins: [{ name: "converted-fixture", resolveId(source) {
      if (["example-shared", "example-consumer"].includes(source)) return join(options.outDir, `${source}@1.0.0/index.js`);
      return null;
    } }], output: { file: output, format: "es" } });
    const converted = await import(pathToFileURL(output).href);
    expect({ result: converted.evaluate(), type: typeof converted.shared, same: converted.same(converted.shared), label: converted.label, property: converted.shared.label, identity: converted.identity === converted.shared.identity }).toEqual({ result, type, same: true, label: "shared", property: "shared", identity: true });
  });

  it.each(["node:fs", "fs", "fs/promises"])("rejects Node built-in %s by name", async (specifier) => {
    const options = await fixture({ "dist/index.js": `import ${JSON.stringify(specifier)};` });
    await expect(buildLibraryRuntime(options)).rejects.toMatchObject({ name: "NodeBuiltinError", message: expect.stringContaining(specifier) });
  });

  it.each(["esm", "commonjs"])("honors false and string browser mappings in %s dependencies", async (format) => {
    const commonjs = format === "commonjs";
    const options = await fixture({
      "dist/index.js": 'export { value } from "browser-dep";',
      "node_modules/browser-dep/package.json": JSON.stringify({ name: "browser-dep", version: "2.0.0", main: commonjs ? "index.cjs" : "index.mjs", browser: { fs: false, "source-map-js": false, path: "./browser.mjs" } }),
      [`node_modules/browser-dep/index.${commonjs ? "cjs" : "mjs"}`]: commonjs
        ? 'const fs = require("fs"); require("source-map-js"); exports.value = require("path").value;'
        : 'import fs from "fs"; import "source-map-js"; export { value } from "path";',
      "node_modules/browser-dep/browser.mjs": "export const value = 7;",
    });
    const { fragment } = await buildLibraryRuntime(options);
    expect(fragment.integrity["browser-dep@2.0.0/browser.mjs"]).toBe(`sha384-${createHash("sha384").update("export const value = 7;").digest("base64")}`);
    if (!commonjs) {
      const scope = fragment.scopes["browser-dep@2.0.0/"]!;
      expect(scope.path).toBe("browser-dep@2.0.0/browser.mjs");
      expect(scope.fs).toBe(scope["source-map-js"]);
      expect(fragment.integrity[scope.fs!]).toMatch(/^sha384-/);
      expect(await readFile(join(options.outDir, "empty.js"), "utf8")).toBe("export default {};\n");
    }
    expect(await checkFragment({ libraryDir: options.libraryDir })).toEqual([]);
  });

  it("still rejects a built-in reached through a browser mapping", async () => {
    const options = await fixture({
      "dist/index.js": 'import "browser-dep";',
      "node_modules/browser-dep/package.json": JSON.stringify({ name: "browser-dep", version: "2.0.0", type: "module", main: "index.js", browser: { fs: "node:path" } }),
      "node_modules/browser-dep/index.js": 'import "fs";',
    });
    await expect(buildLibraryRuntime(options)).rejects.toMatchObject({ name: "NodeBuiltinError", message: expect.stringContaining("path") });
  });

  it("remaps browser-disabled relative files to an empty module", async () => {
    const options = await fixture({
      "dist/index.js": 'export { default as value } from "browser-dep";',
      "node_modules/browser-dep/package.json": JSON.stringify({ name: "browser-dep", version: "2.0.0", type: "module", main: "index.js", browser: { "./server.js": false } }),
      "node_modules/browser-dep/index.js": 'export { default } from "./server.js";',
      "node_modules/browser-dep/server.js": 'import "fs"; export default {};',
    });
    const { fragment } = await buildLibraryRuntime(options);
    expect(fragment.remaps["browser-dep@2.0.0/server.js"]).toBe("example-library@1.2.3/dist/runtime/empty.js");
    expect(fragment.integrity).not.toHaveProperty("browser-dep@2.0.0/server.js");
    expect(await checkFragment({ libraryDir: options.libraryDir })).toEqual([]);
  });

  it("remaps relative browser strings to the shipped browser file", async () => {
    const options = await fixture({
      "dist/index.js": 'export { value } from "browser-dep";',
      "node_modules/browser-dep/package.json": JSON.stringify({ name: "browser-dep", version: "2.0.0", type: "module", main: "index.js", browser: { "./server.js": "./browser.js" } }),
      "node_modules/browser-dep/index.js": 'export { value } from "./server.js";',
      "node_modules/browser-dep/server.js": 'import "fs"; export const value = 0;',
      "node_modules/browser-dep/browser.js": "export const value = 7;",
    });
    const { fragment } = await buildLibraryRuntime(options);
    expect(fragment.remaps["browser-dep@2.0.0/server.js"]).toBe("browser-dep@2.0.0/browser.js");
    expect(fragment.integrity).not.toHaveProperty("browser-dep@2.0.0/server.js");
    expect(await checkFragment({ libraryDir: options.libraryDir })).toEqual([]);
  });

  it.each([
    { runtimeDependencies: undefined },
    { runtimeDependencies: [""] },
    { runtimeDependencies: ["https://example.com/styles.css"] },
    { runtimeDependencies: [42] },
  ])("rejects invalid recipe dependency declarations: %j", async ({ runtimeDependencies }) => {
    const options = await fixture({
      "package.json": JSON.stringify({ name: "example-library", version: "1.2.3", type: "module", exports: { "./page-styles": "./dist/page-styles.js" } }),
      "dist/page-styles.js": `export default ${JSON.stringify({ runtimeDependencies })};`,
    });
    await expect(buildLibraryRuntime(options)).rejects.toThrow(/page-styles: runtimeDependencies/);
  });

  it("traces declared recipe assets and plugins with scoped mappings and integrity", async () => {
    const theme = "@import './preflight.css';";
    const preflight = "html { margin: 0; }";
    const plugin = "module.exports = function typography() {};";
    const stylesheet = ".page { color: blue; }";
    const options = await fixture({
      "package.json": JSON.stringify({ name: "example-library", version: "1.2.3", type: "module", exports: { ".": "./dist/index.js", "./page-styles": "./dist/page-styles.js" } }),
      "dist/index.js": "export const value = 1;",
      "dist/page-styles.js": 'export default { runtimeDependencies: ["example-css/theme.css", "example-plugin", "./page.css"] };',
      "dist/page.css": stylesheet,
      "node_modules/example-css/package.json": JSON.stringify({ name: "example-css", version: "4.0.0", exports: { "./theme.css": "./theme.css" } }),
      "node_modules/example-css/theme.css": theme,
      "node_modules/example-css/preflight.css": preflight,
      "node_modules/example-plugin/package.json": JSON.stringify({ name: "example-plugin", version: "1.0.0", main: "index.cjs" }),
      "node_modules/example-plugin/index.cjs": plugin,
    });
    const { fragment } = await buildLibraryRuntime(options);
    expect(fragment.scopes["example-library@1.2.3/"]).toEqual({ "example-css/theme.css": "example-css@4.0.0/theme.css", "example-plugin": "example-library@1.2.3/dist/runtime/example-plugin@1.0.0/index.js" });
    for (const [url, bytes] of [["example-css@4.0.0/theme.css", theme], ["example-css@4.0.0/preflight.css", preflight], ["example-library@1.2.3/dist/page.css", stylesheet]]) {
      expect(fragment.integrity[url!]).toBe(`sha384-${createHash("sha384").update(bytes!).digest("base64")}`);
    }
    expect(await checkFragment({ libraryDir: options.libraryDir })).toEqual([]);
    await writeFile(join(options.libraryDir, "dist/page.css"), ".page { color: red; }");
    expect((await checkFragment({ libraryDir: options.libraryDir })).join("\n")).toContain("dist/page.css: missing or mismatched integrity");
  });

  it("rejects an unconvertible CommonJS module by package name", async () => {
    const options = await fixture({
      "dist/index.js": 'import "broken-cjs";',
      "node_modules/broken-cjs/package.json": JSON.stringify({ name: "broken-cjs", version: "1.0.0", main: "index.cjs" }),
      "node_modules/broken-cjs/index.cjs": 'throw new Error("cannot load"); module.exports = {};',
    });
    await expect(buildLibraryRuntime(options)).rejects.toMatchObject({ name: "CommonJsConversionError", message: expect.stringContaining("broken-cjs") });
  });

  it("rejects a Node built-in required from CommonJS by name", async () => {
    const options = await fixture({
      "dist/index.js": 'import "node-cjs";',
      "node_modules/node-cjs/package.json": JSON.stringify({ name: "node-cjs", version: "1.0.0", main: "index.cjs" }),
      "node_modules/node-cjs/index.cjs": 'exports.read = require("fs").readFileSync;',
    });
    await expect(buildLibraryRuntime(options)).rejects.toMatchObject({ name: "NodeBuiltinError", message: expect.stringContaining("fs") });
  });

  it("records URL remaps and integrity for an ESM wrapper's relative CommonJS file", async () => {
    const options = await fixture({
      "dist/index.js": 'export { default as wrapped } from "./wrapped.cjs";',
      "dist/wrapped.cjs": 'module.exports = { value: 5 };',
    });
    const { fragment } = await buildLibraryRuntime(options);
    expect(fragment.remaps["example-library@1.2.3/dist/wrapped.cjs"]).toBe("example-library@1.2.3/dist/runtime/example-library@1.2.3/dist/wrapped.js");
    const path = `example-library@1.2.3/dist/wrapped.js`;
    expect(fragment.integrity[`example-library@1.2.3/dist/runtime/${path}`]).toBe(`sha384-${createHash("sha384").update(await readFile(join(options.outDir, path))).digest("base64")}`);
    expect(await checkFragment({ libraryDir: options.libraryDir })).toEqual([]);
  });

  it("rejects an unmapped import in a dist module outside the entry barrel", async () => {
    const options = await fixture({ "dist/index.js": "export const value = 1;", "dist/orphan.js": 'import "node:fs";' });
    await expect(buildLibraryRuntime(options)).rejects.toMatchObject({ name: "NodeBuiltinError" });
  });

  it("keeps nested installed versions in the importing package's scope", async () => {
    const options = await fixture({
      "dist/index.js": 'export { value } from "example-dep"; export { other } from "example-other";',
      "node_modules/example-dep/package.json": JSON.stringify({ name: "example-dep", version: "1.0.0", type: "module", main: "index.js" }),
      "node_modules/example-dep/index.js": "export const value = 1;",
      "node_modules/example-other/package.json": JSON.stringify({ name: "example-other", version: "1.0.0", type: "module", main: "index.js" }),
      "node_modules/example-other/index.js": 'export { value as other } from "example-dep";',
      "node_modules/example-other/node_modules/example-dep/package.json": JSON.stringify({ name: "example-dep", version: "2.0.0", type: "module", main: "index.js" }),
      "node_modules/example-other/node_modules/example-dep/index.js": "export const value = 2;",
    });
    const { fragment } = await buildLibraryRuntime(options);
    expect(fragment.scopes).toEqual({ "example-library@1.2.3/": { "example-dep": "example-dep@1.0.0/index.js", "example-other": "example-other@1.0.0/index.js" }, "example-other@1.0.0/": { "example-dep": "example-dep@2.0.0/index.js" } });
  });

  it("keeps nested CommonJS versions scoped to the converted importing package", async () => {
    const options = await fixture({
      "dist/index.js": 'export { value } from "example-a"; export { other } from "example-b";',
      "node_modules/example-a/package.json": JSON.stringify({ name: "example-a", version: "1.0.0", main: "index.cjs" }),
      "node_modules/example-a/index.cjs": 'exports.value = require("example-dep").value;',
      "node_modules/example-b/package.json": JSON.stringify({ name: "example-b", version: "1.0.0", main: "index.cjs" }),
      "node_modules/example-b/index.cjs": 'exports.other = require("example-dep").value;',
      "node_modules/example-dep/package.json": JSON.stringify({ name: "example-dep", version: "1.0.0", main: "index.cjs" }),
      "node_modules/example-dep/index.cjs": "exports.value = 1;",
      "node_modules/example-b/node_modules/example-dep/package.json": JSON.stringify({ name: "example-dep", version: "2.0.0", main: "index.cjs" }),
      "node_modules/example-b/node_modules/example-dep/index.cjs": "exports.value = 2;",
    });
    const { fragment } = await buildLibraryRuntime(options);
    expect(fragment.scopes["example-library@1.2.3/dist/runtime/example-a@1.0.0/"]?.["example-dep"]).toContain("example-dep@1.0.0/index.js");
    expect(fragment.scopes["example-library@1.2.3/dist/runtime/example-b@1.0.0/"]?.["example-dep"]).toContain("example-dep@2.0.0/index.js");
  });

  it("inherits base specifiers and preserves aliases without tracing another singleton", async () => {
    const options = await fixture({ "dist/index.js": 'export { useState } from "react";' });
    const base: Fragment = { fragment: 1, name: "base", imports: { react: "base@1/runtime/react.js" }, scopes: {}, remaps: {}, aliases: {}, inherits: [], integrity: {} };
    const { fragment } = await buildLibraryRuntime({ ...options, base, aliases: { "@example": "example-library" } });
    expect(fragment.inherits).toEqual(["react"]);
    expect(fragment.imports).not.toHaveProperty("react");
    expect(fragment.scopes).toEqual({});
    expect(fragment.aliases).toEqual({ "@example": "example-library" });
    expect(await checkFragment({ libraryDir: options.libraryDir, base })).toEqual([]);
    expect(await checkFragment({ libraryDir: options.libraryDir })).toEqual([]);
  });

  it("rejects an entry or alias that remaps a base specifier", async () => {
    const options = await fixture({ "dist/index.js": "export const value = 1;" }, { name: "react" });
    const base: Fragment = { fragment: 1, name: "base", imports: { react: "react@18/index.js" }, scopes: {}, remaps: {}, aliases: {}, inherits: [], integrity: {} };
    await expect(buildLibraryRuntime({ ...options, base })).rejects.toMatchObject({ name: "BaseSetRemapError" });
    const other = await fixture({ "dist/index.js": "export const value = 1;" });
    await expect(buildLibraryRuntime({ ...other, base, aliases: { react: "example-library" } })).rejects.toMatchObject({ name: "BaseSetRemapError" });
  });

  it("rejects a URL remap that converts an inherited singleton through a relative wrapper", async () => {
    const options = await fixture({
      "dist/index.js": 'export { default as wrapped } from "example-wrapper";',
      "node_modules/example-wrapper/package.json": JSON.stringify({ name: "example-wrapper", version: "1.0.0", type: "module", main: "index.js" }),
      "node_modules/example-wrapper/index.js": 'export { default } from "../react/index.cjs";',
      "node_modules/react/package.json": JSON.stringify({ name: "react", version: "18.0.0", main: "index.cjs" }),
      "node_modules/react/index.cjs": 'exports.version = "18.0.0";',
    });
    const base: Fragment = { fragment: 1, name: "base", imports: { react: "react@18/index.js" }, scopes: {}, remaps: {}, aliases: {}, inherits: [], integrity: {} };
    await expect(buildLibraryRuntime({ ...options, base })).rejects.toMatchObject({ name: "BaseSetRemapError" });
  });

  it("checks written mappings and integrity rather than trusting a fresh trace", async () => {
    const options = await fixture({ "dist/index.js": 'export { value } from "./value.js";', "dist/value.js": "export const value = 1;" });
    await buildLibraryRuntime(options);
    await writeFile(join(options.libraryDir, "dist/value.js"), 'import "unmapped-package"; export const value = 2;');
    expect((await checkFragment({ libraryDir: options.libraryDir })).join("\n")).toMatch(/unmapped-package|integrity/);
  });
});
