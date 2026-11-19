import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { ResolverFactory } from "rolldown/experimental";
import type { Fragment } from "../schema.ts";
import { BASE_ENTRIES, BASE_PACKAGES } from "./base.ts";
import { createResolver, exportEntries, IMPORT_CONDITIONS, packageName, packageOf } from "./trace.ts";

export interface RuntimeExport {
  browser: string;
  node: string;
  version: string;
}

const browserResolver = createResolver(IMPORT_CONDITIONS);
const nodeResolver = new ResolverFactory({ conditionNames: ["node", "import", "default"], mainFields: ["module", "main"], extensions: [".mjs", ".js", ".cjs", ".json"], symlinks: true });
const javaScript = new Set([".js", ".mjs", ".cjs"]);

function readManifest(root: string): { name: string; version: string; exports?: unknown } {
  return JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
}

function libraryRuntime(root: string, library: string) {
  const dir = realpathSync(join(root, "node_modules", library));
  const { version } = readManifest(dir);
  const fragment: Fragment = JSON.parse(readFileSync(join(dir, "dist/runtime/importmap.json"), "utf8"));
  return { dir, version, fragment, observed: fragment.scopes[`${library}@${version}/`] ?? {} };
}

export function runtimeExportPins(options: { root: string; library: string; inherited: Record<string, string> }): Record<string, string> {
  const { dir, observed } = libraryRuntime(options.root, options.library);
  const pins: Record<string, string> = {};
  for (const [specifier, target] of Object.entries(observed)) {
    const name = packageName(specifier);
    if (name === options.library || BASE_PACKAGES.includes(name) || Object.hasOwn(options.inherited, name)) continue;
    const owner = target.indexOf(`${name}@`);
    if (owner < 0 || (owner > 0 && target[owner - 1] !== "/")) continue;
    const version = target.slice(owner + name.length + 1).split("/")[0]!;
    const browser = browserResolver.sync(dir, specifier).path;
    if (browser && packageOf(browser).version === version) continue;
    if (pins[name] && pins[name] !== version) throw new Error(`${options.library} exposes multiple versions of ${name}`);
    pins[name] = version;
  }
  return pins;
}

function packageExports(options: { dir: string; from: string; observed: string[] }): Record<string, RuntimeExport> {
  const { dir, from, observed } = options;
  const manifest = readManifest(dir);
  const candidates = manifest.exports === undefined ? [manifest.name, ...observed] : exportEntries(dir).map(entry => entry.specifier);
  const result: Record<string, RuntimeExport> = {};
  for (const specifier of new Set(candidates)) {
    const browser = browserResolver.sync(from, specifier).path;
    if (!browser || !javaScript.has(extname(browser))) continue;
    if (packageOf(browser).dir !== dir) continue;
    const node = nodeResolver.sync(from, specifier).path;
    result[specifier] = { browser, node: node && javaScript.has(extname(node)) ? node : browser, version: manifest.version };
  }
  return result;
}

export function discoverRuntimeExports(options: { root: string; library?: string; packages?: string[]; pinnedRoot?: string; pins?: Record<string, string> }): Record<string, RuntimeExport> {
  const { root, library, packages = [], pinnedRoot, pins = {} } = options;
  const result: Record<string, RuntimeExport> = {};
  for (const name of packages) {
    const dir = realpathSync(join(root, "node_modules", name));
    Object.assign(result, packageExports({ dir, from: root, observed: [] }));
  }
  if (!library) return result;
  const { dir, version, fragment, observed } = libraryRuntime(root, library);
  for (const [specifier, target] of Object.entries(fragment.imports)) {
    if (packageName(specifier) !== library || !javaScript.has(extname(target))) continue;
    const browser = browserResolver.sync(root, specifier).path;
    if (!browser) throw new Error(`${library}: cannot resolve public runtime export ${specifier}`);
    result[specifier] = { browser, node: nodeResolver.sync(root, specifier).path ?? browser, version };
  }
  const byOwner = new Map<string, string[]>();
  for (const specifier of Object.keys(observed)) {
    const name = packageName(specifier);
    if (name === library || BASE_PACKAGES.includes(name)) continue;
    const specifiers = byOwner.get(name) ?? [];
    specifiers.push(specifier);
    byOwner.set(name, specifiers);
  }
  for (const [name, specifiers] of byOwner) {
    const from = pins[name] && pinnedRoot ? pinnedRoot : dir;
    const entry = specifiers.map(name => browserResolver.sync(from, name).path).find(path => path && existsSync(path));
    if (!entry) throw new Error(`${library}: cannot resolve runtime dependency ${specifiers.join(", ")}`);
    Object.assign(result, packageExports({ dir: packageOf(entry).dir, from, observed: specifiers }));
  }
  if (library === "@flanksource/clicky-ui") {
    for (const specifier of new Set([...BASE_ENTRIES, ...Object.keys(fragment.imports).filter(name => BASE_PACKAGES.includes(packageName(name)))])) {
      const from = specifier === "scheduler" ? dirname(browserResolver.sync(dir, "react-dom").path!) : dir;
      const browser = browserResolver.sync(from, specifier).path;
      if (!browser) throw new Error(`${library}: cannot resolve shared runtime dependency ${specifier}`);
      result[specifier] = { browser, node: nodeResolver.sync(from, specifier).path ?? browser, version: packageOf(browser).version };
    }
  }
  return result;
}
