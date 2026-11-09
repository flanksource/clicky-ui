import { existsSync, globSync, mkdirSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { builtinModules } from "node:module";
import { dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadEnv } from "vite";
import { BASE_ENTRIES } from "../../../packages/page-runtime/src/build/library-runtime.ts";
import { IMPORT_CONDITIONS } from "../../../packages/page-runtime/src/build/trace.ts";
import { analyzeCss, analyzeMdx, analyzeScript, type Analysis, type Dependency, type Observation } from "./browser-mode-census-analysis";
import { catalog, renderMarkdown, summarize, summaryLine, type Census, type Issue, type PageCensus } from "./browser-mode-census-catalog";
import { readPageDependencies } from "../src/browser-mode/dependencies";

export type CensusOptions = { root: string; externalRoots?: string[]; aliases?: Record<string, string>; libraryImports?: string[] };
const DEFAULT_IMPORTS = ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime", "@flanksource/clicky-ui", "@flanksource/facet", "@flanksource/react-grab"];
const BUILTINS = new Set(builtinModules.map((name) => name.replace(/^node:/, "")));
const suffixes = ["", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".mdx", ".json", "/index.tsx", "/index.ts", "/index.js"];
const posix = (path: string): string => path.split(sep).join("/");
const inside = (path: string, root: string): boolean => path === root || path.startsWith(`${root}${sep}`);
const packageName = (specifier: string): string => specifier.split("/").slice(0, specifier.startsWith("@") ? 2 : 1).join("/");
const isTest = (path: string): boolean => /\.(test|spec|stories)\.[^.]+$/.test(path) || ["__tests__", "test", "testing"].some((part) => posix(path).split("/").includes(part));
const emptyAnalysis = (): Analysis => ({ dependencies: [], observations: [], sources: [] });

function existing(path: string): string | undefined {
  return suffixes.map((suffix) => path + suffix).find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
}

function configuredPath(name: string, path: string): string {
  if (!isAbsolute(path) || !existsSync(path)) throw new Error(`${name}: ${path} must be an existing absolute path`);
  return realpathSync(path);
}

function pageFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) return [];
    const file = resolve(root, entry.name);
    if (entry.isDirectory()) return pageFiles(file);
    return entry.isFile() && /\.(tsx|mdx?)$/.test(entry.name) && !isTest(file) ? [file] : [];
  }).sort();
}

type Context = { root: string; pagesRoot: string; roots: string[]; aliases: Record<string, string>; libraryImports: Set<string>; packages?: string[] };
type Resolved = { target?: string; raw: boolean; observations: Observation[] };
/** Shell source is everything under src/ and plugins/ except the page roots: src/pages and the local vocabulary pages in src/vocabularies. */
const shellSource = (file: string, context: Context): boolean => (inside(file, resolve(context.root, "src")) && !inside(file, context.pagesRoot) && !inside(file, resolve(context.root, "src/vocabularies"))) || inside(file, resolve(context.root, "plugins"));

function resolveDependency(dependency: Dependency, file: string, context: Context): Resolved {
  const { specifier, line } = dependency;
  const [name = "", query = ""] = specifier.split("?");
  const params = new URLSearchParams(query);
  const raw = params.has("raw") || params.has("url");
  const observations: Observation[] = [];
  const note = (issueClass: Observation["class"], blocking: boolean, reason: string): void => { observations.push({ class: issueClass, line, specifier, blocking, reason }); };
  if (name.startsWith("node:") || BUILTINS.has(name)) note("node-builtin", true, "Node built-ins are unavailable in a browser frame.");
  else if (["vitest", "@vitest", "@testing-library", "@playwright", "playwright"].some((prefix) => name === prefix || name.startsWith(`${prefix}/`))) note("test-only", true, "A runtime page dependency imports a test-only package.");
  else if (name === "playground-runtime" || name.startsWith("playground-runtime/")) return { raw, observations };
  else if (context.libraryImports.has(name)) return { raw, observations };
  else if (context.packages?.includes(packageName(name))) { note("external-package", false, "Resolved by a page dependency or browser-local override."); return { raw, observations }; }
  else if (extname(file) === ".css" && /^tailwindcss(?:\/|$)/.test(name)) return { raw, observations };
  else {
    const alias = Object.keys(context.aliases).sort((a, b) => b.length - a.length).find((key) => name === key || name.startsWith(`${key}/`));
    let target: string | undefined;
    if (alias) {
      target = existing(context.aliases[alias]! + name.slice(alias.length));
      note("unpublished-alias", !target, target ? `Declared source alias ${alias} resolves to a source-provider module.` : `Declared source alias ${alias} does not resolve this import.`);
    } else if (name.startsWith(".") || isAbsolute(name)) {
      const path = isAbsolute(name) ? name : resolve(dirname(file), name);
      target = existing(path);
      const real = target ? realpathSync(target) : path;
      if (shellSource(real, context)) note("app-internal", true, "This import leaves src/pages and depends on the playground shell's source.");
      else if (!inside(real, context.pagesRoot)) {
        const declared = context.roots.some((root) => inside(real, root));
        if (!context.roots.some((root) => !inside(root, context.pagesRoot) && inside(file, root) && inside(real, root))) note("sibling-checkout", !declared || !target, declared ? "This sibling source is under a declared read-only page root." : "This sibling source is outside the declared read-only page roots.");
      }
      if (!target) note("unresolved-import", true, "No source file resolves this import (including supported extension and index candidates).");
    } else note(name.startsWith("@mc-oipa/") ? "unpublished-alias" : "external-package", true, `${packageName(name)} is absent from the library import map and declared source aliases.`);
    if (target) {
      target = realpathSync(target);
      if (alias && shellSource(target, context)) note("app-internal", true, "This alias depends on the playground shell's source rather than the allowed runtime module.");
      if (isTest(target)) note("test-only", true, "A page imports test support as a runtime dependency.");
      if (raw) note("raw-url", false, "The worker serves this asset without compiling its contents as page code.");
      else if (extname(target) === ".json") note("json", false, "The worker serves this JSON dependency as an ESM default export.");
      const authorized = context.roots.some((root) => inside(target!, root));
      if (authorized && !observations.some((observation) => observation.class === "app-internal")) return { target, raw, observations };
    }
  }
  return { raw, observations };
}

async function analyze(file: string): Promise<Analysis> {
  const code = readFileSync(file, "utf8");
  try {
    if (extname(file) === ".json") { JSON.parse(code); return emptyAnalysis(); }
    if (extname(file) === ".css") return analyzeCss({ file, code });
    if (extname(file) === ".md") return emptyAnalysis();
    if (extname(file) === ".mdx") return await analyzeMdx({ file, code });
    if ([".ts", ".tsx", ".js", ".jsx", ".mjs"].includes(extname(file))) return await analyzeScript({ file, code });
    throw new Error(`Unsupported module extension ${extname(file)}; use ?raw or ?url for assets`);
  } catch (error) {
    return { ...emptyAnalysis(), observations: [{ class: "invalid-source", line: 1, specifier: posix(file), blocking: true, reason: error instanceof Error ? error.message : String(error) }] };
  }
}

async function pageTree(options: { file: string; context: Context; cache: Map<string, Promise<Analysis>> }): Promise<PageCensus> {
  const { context } = options;
  const files = new Set<string>();
  const pending = [{ file: options.file, raw: false }];
  const analyzed = new Set<string>();
  const issues: Issue[] = [];
  const display = (file: string): string => posix(relative(context.root, file));
  const add = (file: string, observation: Observation): void => { issues.push({ ...observation, file: display(file), fix: catalog[observation.class].fix }); };
  for (let index = 0; index < pending.length; index += 1) {
    const { file, raw } = pending[index]!;
    files.add(file);
    if (raw || analyzed.has(file)) continue;
    analyzed.add(file);
    if (!options.cache.has(file)) options.cache.set(file, analyze(file));
    const result = await options.cache.get(file)!;
    const dependencies = result.dependencies.flatMap((dependency) => dependency.glob ? globSync(dependency.specifier, { cwd: dirname(file), exclude: dependency.glob.exclude }).filter((match) => statSync(resolve(dirname(file), match)).isFile()).sort().map((match) => ({ specifier: resolve(dirname(file), match) + dependency.glob!.query, line: dependency.line })) : [dependency]);
    for (const dependency of dependencies) {
      const resolved = resolveDependency(dependency, file, context);
      for (const observation of resolved.observations) add(file, observation);
      if (resolved.target) pending.push({ file: resolved.target, raw: resolved.raw });
    }
    for (const observation of result.observations) add(file, observation);
    for (const source of result.sources) {
      const prefix = source.specifier.split(/[*?{[!]/)[0]!;
      const path = resolve(dirname(file), prefix);
      const canonical = existsSync(path) ? realpathSync(path) : path;
      if (!context.roots.some((root) => inside(canonical, root))) add(file, { class: "css-source", line: source.line, specifier: source.specifier, blocking: true, reason: `${display(file)}:${source.line}: CSS @source resolves outside declared page roots (${source.specifier}).` });
    }
  }
  return { slug: posix(relative(context.pagesRoot, options.file)).replace(/\.(tsx|mdx?)$/, ""), file: display(options.file), compatible: !issues.some((issue) => issue.blocking), files: [...files].map(display).sort(), issues };
}

export async function inspectPage(options: CensusOptions & { file: string; packages?: string[] }): Promise<PageCensus> {
  const root = realpathSync(options.root);
  const dependencies = readPageDependencies({ file: options.file, source: readFileSync(options.file, "utf8") });
  return pageTree({ file: options.file, cache: new Map(), context: {
    root, pagesRoot: resolve(root, "src/pages"), roots: [resolve(root, "src/pages"), ...(options.externalRoots ?? [])].map(path => realpathSync(path)),
    aliases: Object.fromEntries(Object.entries(options.aliases ?? {}).map(([name, path]) => [name, resolve(root, path)])),
    libraryImports: new Set([...DEFAULT_IMPORTS, ...(options.libraryImports ?? [])]), packages: [...Object.keys(dependencies), ...(options.packages ?? [])],
  } });
}

export async function census(options: CensusOptions): Promise<Census> {
  const root = realpathSync(options.root);
  const pagesRoot = realpathSync(resolve(root, "src/pages"));
  const externalRoots = (options.externalRoots ?? []).map((path) => configuredPath("external root", path));
  for (const path of externalRoots) if (!statSync(path).isDirectory()) throw new Error(`external root: ${path} must be a directory`);
  const aliases = Object.fromEntries(Object.entries(options.aliases ?? {}).sort(([a], [b]) => a.localeCompare(b)).map(([name, path]) => [name, configuredPath(`alias ${name}`, path)]));
  const roots = [...new Set([pagesRoot, ...externalRoots, ...Object.values(aliases).map((path) => statSync(path).isDirectory() ? path : dirname(path))])];
  const libraryImports = new Set(options.libraryImports ?? DEFAULT_IMPORTS);
  const context: Context = { root, pagesRoot, roots, aliases, libraryImports };
  const cache = new Map<string, Promise<Analysis>>();
  const pages: PageCensus[] = [];
  for (const file of pageFiles(pagesRoot)) {
    const dependencies = readPageDependencies({ file, source: readFileSync(file, "utf8") });
    pages.push(await pageTree({ file, context: { ...context, packages: Object.keys(dependencies) }, cache }));
  }
  return { version: 1, configuration: { externalRoots: externalRoots.map((path) => posix(relative(root, path))).sort(), aliases: Object.fromEntries(Object.entries(aliases).map(([name, path]) => [name, posix(relative(root, path))])), libraryImports: [...libraryImports].sort() }, pages, summary: summarize(pages) };
}

export function catalogDiff(options: { path: string; actual: string; expected: string }): string {
  if (options.actual === options.expected) return "";
  const actual = options.actual.split("\n");
  const expected = options.expected.split("\n");
  let start = 0;
  while (start < actual.length && start < expected.length && actual[start] === expected[start]) start += 1;
  let end = 0;
  while (end < actual.length - start && end < expected.length - start && actual.at(-end - 1) === expected.at(-end - 1)) end += 1;
  return [`--- ${options.path}`, `+++ ${options.path} (regenerated)`, `@@ -${start + 1},${actual.length - start - end} +${start + 1},${expected.length - start - end} @@`, ...actual.slice(start, actual.length - end).map((line) => `-${line}`), ...expected.slice(start, expected.length - end).map((line) => `+${line}`)].join("\n");
}

export function writeCatalog(options: { root: string; result: Census; check: boolean }): boolean {
  const documents = { "browser-mode-compatibility.md": renderMarkdown(options.result), "browser-mode-compatibility.json": `${JSON.stringify(options.result, null, 2)}\n` };
  let current = true;
  for (const [name, expected] of Object.entries(documents)) {
    const path = resolve(options.root, "docs", name);
    if (options.check) {
      const actual = existsSync(path) ? readFileSync(path, "utf8") : "";
      const diff = catalogDiff({ path, actual, expected });
      if (diff) { process.stderr.write(`${diff}\n`); current = false; }
    } else { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, expected); }
  }
  return current;
}

export function loadConfiguration(root: string): CensusOptions {
  const env = loadEnv("development", root, "PLAYGROUND_");
  const list = (key: string): string[] => (env[key] ?? "").split(",").map((entry) => entry.trim()).filter(Boolean);
  const aliases = Object.fromEntries(list("PLAYGROUND_EXTERNAL_ALIASES").map((entry) => {
    const separator = entry.indexOf("=");
    if (separator <= 0) throw new Error(`PLAYGROUND_EXTERNAL_ALIASES: ${entry} must be <package>=<absolute path>`);
    return [entry.slice(0, separator), entry.slice(separator + 1)];
  }));
  const libraryImports = new Set(BASE_ENTRIES);
  const manifests = { "@flanksource/clicky-ui": "../../packages/ui/package.json", "@flanksource/react-grab": "../../packages/react-grab/package.json", "@flanksource/facet": "node_modules/@flanksource/facet/package.json" };
  for (const [name, path] of Object.entries(manifests)) {
    const manifest = JSON.parse(readFileSync(resolve(root, path), "utf8")) as { exports: Record<string, unknown> };
    if (!manifest.exports || typeof manifest.exports !== "object") throw new Error(`${name} must declare browser exports`);
    for (const [key, value] of Object.entries(manifest.exports)) {
      const target = exportTarget(value);
      if (!key.includes("*") && target?.startsWith("./dist/") && !target.startsWith("./dist/runtime/")) libraryImports.add(key === "." ? name : `${name}${key.slice(1)}`);
    }
  }
  return { root, externalRoots: list("PLAYGROUND_EXTERNAL_ROOTS"), aliases, libraryImports: [...libraryImports] };
}

function exportTarget(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const entry of value) { const target = exportTarget(entry); if (target) return target; }
  } else if (value && typeof value === "object") {
    for (const [condition, entry] of Object.entries(value)) {
      if (!IMPORT_CONDITIONS.includes(condition)) continue;
      const target = exportTarget(entry);
      if (target) return target;
    }
  }
  return undefined;
}

async function main(): Promise<void> {
  if (process.argv.slice(2).some((argument) => argument !== "--check")) throw new Error("Usage: tsx scripts/browser-mode-census.ts [--check]");
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const result = await census(loadConfiguration(root));
  const current = writeCatalog({ root, result, check: process.argv.includes("--check") });
  process.stdout.write(`${summaryLine(result)}\n`);
  if (!current) process.exitCode = 1;
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await main();
