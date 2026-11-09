import { readFileSync, realpathSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, sep } from "node:path";
import { init, parse } from "es-module-lexer";
import { ResolverFactory } from "rolldown/experimental";
import { parseSync } from "rolldown/utils";
import type { Fragment } from "../schema.ts";
import { buildLibraryRuntime } from "../build/library-runtime.ts";
import { buildBarrelIndex, shapeOf, sideEffectsRule } from "../build/barrels.ts";
import { resolveSpecifier } from "../sw/composition.ts";
import { composeFragments, mergeBarrels } from "../sw/composition.ts";
import { compileScript } from "../sw/compile.ts";
import type { LinkBuild } from "./types.ts";
import { validateLink, missingLinkFile } from "./validation.ts";
import { validateSourcePath } from "../host/validation.ts";
import { mapBarrels } from "./barrels.ts";
import { prepareCommonJsSources } from "./commonjs.ts";
import { moduleFormat } from "../build/trace.ts";
export { prepareCommonJsSources } from "./commonjs.ts";
export type { CommonJsSourcesOptions } from "./commonjs.ts";

export type LinkBuildOptions = { libraryDir: string; outDir: string; entries: Record<string, string>; base?: Fragment; defines: LinkBuild["defines"]; generated?: Record<string, string>; pageSources?: LinkBuild["pageSources"] };

export async function buildLinkRuntime(options: LinkBuildOptions): Promise<LinkBuild> {
  const directory = realpathSync(options.libraryDir);
  const manifest = JSON.parse(readFileSync(join(directory, "package.json"), "utf8")) as { name: string; version: string; sideEffects: unknown; dependencies?: Record<string, string>; peerDependencies?: Record<string, string> };
  for (const [name, path] of Object.entries(options.entries)) {
    if (name !== manifest.name && !name.startsWith(`${manifest.name}/`)) throw new Error(`Source entry ${name} is outside ${manifest.name}`);
    validateSourcePath(path);
  }
  const generated = { ...(manifest.name === "@flanksource/clicky-ui" ? { "src/icons/components/UiClose.tsx": "pnpm --filter @flanksource/clicky-ui build:icons" } : {}), ...options.generated };
  for (const [path, command] of Object.entries(generated)) {
    try { readFileSync(join(directory, path)); } catch (error) { throw new Error(`${manifest.name}: missing generated file ${path}; run \`${command}\``, { cause: error }); }
  }
  const { fragment, barrels } = await buildLibraryRuntime(options);
  const build: LinkBuild = { link: 1, library: manifest.name, version: manifest.version, fragment, entries: options.entries, modules: {}, barrels: { modules: [], barrels: {} }, defines: options.defines, generated };
  build.package = { ...(manifest.dependencies ? { dependencies: manifest.dependencies } : {}), ...(manifest.peerDependencies ? { peerDependencies: manifest.peerDependencies } : {}) };
  if (options.pageSources) build.pageSources = options.pageSources;
  const link = { id: "build", source: { kind: "folder" as const }, build };
  const resolver = new ResolverFactory({ conditionNames: ["browser", "import", "module", "default"], extensions: [".tsx", ".ts", ".jsx", ".js", ".cjs", ".json"], symlinks: true });
  const map = composeFragments({ fragments: options.base ? [options.base, fragment] : [fragment] }).map;
  const compiled = new Map<string, string>();
  const source = (path: string): string => {
    let code = compiled.get(path);
    if (code === undefined) {
      const file = realpathSync(join(directory, path));
      if (relative(directory, file).startsWith("../")) throw new Error(`Source ${path} escapes the checkout`);
      const text = readFileSync(file, "utf8");
      code = [".ts", ".tsx", ".jsx"].includes(extname(path)) ? compileScript({ path, extension: extname(path), code: text }) : text;
      compiled.set(path, code);
    }
    return code;
  };
  const resolve = (path: string, specifier: string): string => {
    const entry = options.entries[specifier];
    if (entry) return entry;
    if (!specifier.startsWith(".")) {
      const target = resolveSpecifier(map, specifier, `/npm/${manifest.name}@${manifest.version}/dist/${path.slice(4).replace(/\.tsx?$/, ".js")}`);
      if (!target) throw new Error(`${path}: ${specifier} is missing from the checkout runtime fragment; rebuildLibraryRuntime with this dependency`);
      return target;
    }
    const resolved = resolver.sync(dirname(join(directory, path)), specifier.split("?")[0]!);
    if (!resolved.path) throw missingLinkFile(link, relative(directory, join(dirname(join(directory, path)), specifier)));
    const local = relative(directory, realpathSync(resolved.path));
    if (local.startsWith("../") || local.startsWith("/")) throw new Error(`${path}: import ${specifier} escapes the checkout`);
    return local;
  };
  await init();
  const pending = Object.values(options.entries);
  const commonjs: string[] = [];
  for (let path = pending.shift(); path; path = pending.shift()) {
    if (build.modules[path]) continue;
    const resolutions: Record<string, string> = {};
    build.modules[path] = { resolutions };
    if (/\.(?:js|cjs)$/.test(path) && moduleFormat(join(directory, path)).format === "commonjs") { commonjs.push(path); continue; }
    if (!/\.(tsx?|jsx?|mjs)$/.test(path)) continue;
    for (const item of parse(source(path))[0]) {
      if (item.type === "import-meta") continue;
      if (!item.specifier) throw new Error(`${path}: dynamic imports must name a literal module`);
      resolutions[item.specifier] = resolve(path, item.specifier);
      if (!resolutions[item.specifier]!.startsWith("/npm/")) pending.push(resolutions[item.specifier]!);
    }
  }
  const sideEffects = sideEffectsRule(manifest.sideEffects, manifest.name);
  if (commonjs.length) {
    const runtimePath = relative(directory, join(realpathSync(options.outDir), "source-commonjs")).split(sep).join("/");
    validateSourcePath(runtimePath);
    const prepared = await prepareCommonJsSources({ libraryDir: directory, outDir: join(options.outDir, "source-commonjs"), runtimePath, paths: commonjs, base: options.base ?? fragment });
    const merged = composeFragments({ fragments: [fragment, prepared.fragment] });
    build.fragment = { ...fragment, imports: Object.fromEntries(Object.entries(merged.map.imports).map(([key, value]) => [key, value.replace(/^\/npm\//, "")])), scopes: Object.fromEntries(Object.entries(merged.map.scopes).map(([scope, table]) => [scope.replace(/^\/npm\//, ""), Object.fromEntries(Object.entries(table).map(([key, value]) => [key, value.replace(/^\/npm\//, "")]))])), integrity: merged.integrity, remaps: merged.remaps, inherits: [...new Set([...fragment.inherits, ...prepared.fragment.inherits])] };
    build.commonjs = prepared.commonjs;
  }
  build.barrels = buildBarrelIndex({ urls: Object.keys(build.modules).filter((path) => /\.(tsx?|jsx?|mjs)$/.test(path)), shape: (path) => Object.hasOwn(build.modules, path) && /\.(tsx?|jsx?|mjs)$/.test(path) ? shapeOf(parseSync("module.js", source(path)).module) : null, resolve, sideEffectFree: (path) => !path.startsWith("/npm/") && sideEffects(path) }).index;
  const prefix = `${manifest.name}@${manifest.version}/`;
  build.barrels = mergeBarrels([mapBarrels({ index: barrels, map: (path) => path.startsWith(prefix) ? path.slice(prefix.length) : `/npm/${path}` }), build.barrels]);
  validateLink(link);
  await writeFile(join(options.outDir, "link.json"), `${JSON.stringify(build, null, 2)}\n`);
  return build;
}
