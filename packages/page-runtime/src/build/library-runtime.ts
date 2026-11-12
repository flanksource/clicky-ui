import { readFileSync, readdirSync, realpathSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import type { BarrelIndex, Fragment } from "../schema.ts";
import { libraryBarrelIndex } from "./barrels.ts";
import { convertCommonJs } from "./convert-commonjs.ts";
import { BaseSetRemapError, CommonJsConversionError, NodeBuiltinError } from "./errors.ts";
import { composeImportMap, fragmentOf } from "./fragment.ts";
import { traceRecipeDependencies } from "./recipe-dependencies.ts";
import { validateCompilerPlugins } from "../sw/compiler-plugins.ts";
import { ClosureTracer, createResolver, EMPTY_MODULE, exportEntries, IMPORT_CONDITIONS, packageName, resolveEntry, type FragmentSpec } from "./trace.ts";

import { BASE_PACKAGES, BASE_ENTRIES } from "./base.ts";
export { BASE_PACKAGES, BASE_ENTRIES } from "./base.ts";
export type LibraryRuntimeOptions = { libraryDir: string; outDir: string; base?: Fragment; aliases?: Record<string, string> };
export type BuiltLibraryRuntime = { fragment: Fragment; barrels: BarrelIndex };

export function librarySpec(options: { libraryDir: string; base?: Fragment }): FragmentSpec {
  const dir = realpathSync(options.libraryDir);
  const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as { name?: string; version?: string; pageRuntime?: { compiler?: unknown } };
  if (!manifest.name || !manifest.version) throw new Error(`${dir}/package.json must declare name and version`);
  const exported = exportEntries(dir);
  const compiler = manifest.pageRuntime?.compiler === undefined ? undefined : validateCompilerPlugins(manifest.pageRuntime.compiler, { library: manifest.name, path: `${manifest.name} package.json pageRuntime.compiler` });
  const entries = exported.filter(({ path }) => path.startsWith(`${join(dir, "dist")}${sep}`) && !path.startsWith(`${join(dir, "dist/runtime")}${sep}`));
  if (!entries.length) throw new Error(`${manifest.name}: no browser exports in dist; build the library first`);
  for (const plugin of compiler?.remark ?? []) {
    const entry = exported.find(({ specifier }) => specifier === plugin.module);
    if (!entry) throw new Error(`${manifest.name}: compiler plugin ${plugin.module} is not in package.json exports`);
    if (!entries.some(({ specifier }) => specifier === entry.specifier)) entries.push(entry);
  }
  // Sweep only directories the package exports into: computed dynamic imports load chunks next to exported modules,
  // while other dist artifacts (a CLI's inlined classic-script bundle) are never served as modules.
  const exportedDirs = [...new Set(entries.filter(({ path }) => /\.m?js$/.test(path)).map(({ path }) => dirname(path)))];
  const files = readdirSync(join(dir, "dist"), { recursive: true, encoding: "utf8" })
    .filter((path) => !path.startsWith(`runtime${sep}`) && /\.(m?js)$/.test(path))
    .map((path) => join(dir, "dist", path))
    .filter((path) => exportedDirs.some((exported) => path.startsWith(`${exported}${sep}`)));
  const providesBase = !options.base && manifest.name === "@flanksource/clicky-ui";
  if (providesBase) {
    const resolver = createResolver(IMPORT_CONDITIONS);
    for (const specifier of BASE_ENTRIES) {
      // scheduler is a react-dom dependency and may not be hoisted by pnpm.
      const from = specifier === "scheduler" ? realpathSync(join(dir, "node_modules/react-dom")) : dir;
      entries.push(resolveEntry(resolver, from, specifier));
    }
  }
  return { name: manifest.name, resolveFrom: dir, runtimeBase: `${manifest.name}@${manifest.version}/dist/runtime/`, entries, files, topLevel: providesBase ? BASE_PACKAGES : [], inherits: options.base ? [...new Set(Object.keys(options.base.imports).map(packageName))] : [], ...(compiler ? { compiler } : {}) };
}

export function assertTrace(tracer: ClosureTracer): void {
  if (!tracer.failures.length) return;
  const message = tracer.failures.map(({ name, detail }) => `${name}: ${detail}`).join("\n");
  if (/Node built-in|requires node:/.test(message)) throw new NodeBuiltinError(message);
  if (/still calls require/.test(message)) throw new CommonJsConversionError(message);
  throw new Error(message);
}

function assertBase(options: LibraryRuntimeOptions, fragment: Fragment): void {
  if (!options.base) return;
  const inherited = new Set(Object.keys(options.base.imports).map(packageName));
  for (const table of [fragment.imports, ...Object.values(fragment.scopes), fragment.aliases]) {
    for (const specifier of Object.keys(table)) {
      if (inherited.has(packageName(specifier))) throw new BaseSetRemapError(`${fragment.name} remaps base-set specifier ${specifier} from ${options.base.name}`);
    }
  }
  for (const url of Object.keys(fragment.remaps)) {
    if ([...inherited].some((name) => url.startsWith(`${name}@`))) throw new BaseSetRemapError(`${fragment.name} remaps base-set URL ${url} from ${options.base.name}`);
  }
  for (const specifier of fragment.inherits) {
    if (!options.base.imports[specifier]) throw new BaseSetRemapError(`${fragment.name} inherits ${specifier}, which ${options.base.name} does not provide`);
  }
}

export async function buildLibraryRuntime(options: LibraryRuntimeOptions): Promise<BuiltLibraryRuntime> {
  const tracer = new ClosureTracer(librarySpec(options)).trace();
  await traceRecipeDependencies(tracer);
  assertTrace(tracer);
  assertBase(options, fragmentOf(tracer, options.aliases));
  await rm(options.outDir, { recursive: true, force: true });
  await mkdir(options.outDir, { recursive: true });
  try {
    await convertCommonJs(tracer, resolve(options.outDir));
  } catch (cause) {
    assertTrace(tracer);
    if (cause instanceof CommonJsConversionError) throw cause;
    throw new CommonJsConversionError(`${tracer.spec.name}: converting ${[...tracer.commonJs.values()].map((entry) => entry.specifier).join(", ")}: ${String(cause)}`, { cause });
  }
  assertTrace(tracer);
  const fragment = fragmentOf(tracer, options.aliases);
  if (fragment.integrity[`${tracer.spec.runtimeBase}empty.js`]) await writeFile(join(options.outDir, "empty.js"), EMPTY_MODULE);
  assertBase(options, fragment);
  const composed = composeImportMap(options.base ? [options.base, fragment] : [fragment], "/npm/");
  if (composed.failures.length) throw new BaseSetRemapError(composed.failures.map((failure) => failure.detail).join("\n"));
  const barrels = libraryBarrelIndex({ files: tracer.files, remapped: new Set(Object.keys(fragment.remaps)), map: composed.map }).index;
  await writeFile(join(options.outDir, "importmap.json"), `${JSON.stringify(fragment, null, 2)}\n`);
  await writeFile(join(options.outDir, "barrels.json"), `${JSON.stringify(barrels, null, 2)}\n`);
  return { fragment, barrels };
}
