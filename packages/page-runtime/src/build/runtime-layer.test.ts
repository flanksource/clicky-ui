import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterEach, expect, it } from "vitest";
import { discoverRuntimeExports, runtimeExportPins } from "./runtime-layer.ts";

const roots: string[] = [];
afterEach(() => roots.splice(0).forEach(root => rmSync(root, { recursive: true, force: true })));

it("discovers public browser exports relative to the owning library", () => {
  const scratch = resolve("../../.tmp");
  mkdirSync(scratch, { recursive: true });
  const root = mkdtempSync(join(scratch, "runtime-exports-"));
  roots.push(root);
  const library = join(root, "node_modules/library");
  const dependency = join(library, "node_modules/widgets");
  mkdirSync(join(library, "dist/runtime"), { recursive: true });
  mkdirSync(join(dependency, "icons"), { recursive: true });
  writeFileSync(join(library, "package.json"), JSON.stringify({ name: "library", version: "1.0.0", exports: "./index.mjs" }));
  writeFileSync(join(library, "index.mjs"), "export const view = true;");
  writeFileSync(join(library, "dist/runtime/importmap.json"), JSON.stringify({ imports: { library: "library@1.0.0/index.mjs" }, scopes: { "library@1.0.0/": { "widgets/mi": "widgets@2.0.0/icons/mi.mjs" } } }));
  writeFileSync(join(dependency, "package.json"), JSON.stringify({ name: "widgets", version: "2.0.0", exports: { "./*": "./icons/*.mjs", "./cli": { node: "./cli.mjs" }, "./private": null } }));
  for (const name of ["mi", "ui", "private"]) writeFileSync(join(dependency, `icons/${name}.mjs`), "export const icon = true;");
  expect(Object.keys(discoverRuntimeExports({ root, library: "library" })).sort()).toEqual(["library", "widgets/mi", "widgets/ui"]);
  expect(runtimeExportPins({ root, library: "library", inherited: {} })).toEqual({});
  writeFileSync(join(library, "dist/runtime/importmap.json"), JSON.stringify({ imports: {}, scopes: { "library@1.0.0/": { "widgets/mi": "widgets@1.0.0/icons/mi.mjs" } } }));
  expect(runtimeExportPins({ root, library: "library", inherited: {} })).toEqual({ widgets: "1.0.0" });
  expect(runtimeExportPins({ root, library: "library", inherited: { widgets: "2.0.0" } })).toEqual({});
});
