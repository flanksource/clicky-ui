import { readFile, realpath, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { relative, resolve } from "node:path";
import { prepareCommonJsSources } from "@flanksource/page-runtime/link/build";
import type { LibraryLink } from "@flanksource/page-runtime/host/link";
import type { Fragment } from "@flanksource/page-runtime/schema";
import type { SourceRoot } from "./source-roots";

type Location = { id: string; directory: string; prefix: string; editable: boolean; path?: string; sourceRoot?: string };
const prepared = new Map<string, ReturnType<typeof prepareCommonJsSources>>();
const artifacts = new Map<string, string>();
const libraries = new Map<string, string>();

export function sourceLocation(options: { root: string; sourceRoots: readonly SourceRoot[]; file: string }): Location & { path: string } {
  const pages = resolve(options.root, "src/pages");
  if (options.file.startsWith(pages + "/")) return { id: "playground-pages", directory: pages, prefix: "", editable: true, path: options.file.slice(1), sourceRoot: pages.slice(1) };
  const root = [...options.sourceRoots].sort((a, b) => b.directory.length - a.directory.length).find(root => options.file === root.directory || options.file.startsWith(root.directory + "/"));
  if (!root) throw new Error(`Source has no declared link root: ${options.file}`);
  const id = `playground-source-${options.sourceRoots.indexOf(root)}`;
  if (root.directory.includes("/node_modules/")) return { id, directory: root.directory, prefix: `_external/${id}`, editable: false, path: relative(root.directory, options.file) };
  return { id: "playground-pages", directory: root.directory, prefix: `_external/${id}`, editable: false, path: options.file.slice(1), sourceRoot: root.directory.slice(1) };
}

export function sourceLink(location: Location): LibraryLink {
  const library = `@playground/${location.id}`;
  const path = location.sourceRoot ? location.path! : `source/${location.path ?? "entry.tsx"}`;
  return { id: location.id, source: { kind: "server", url: `/__playground/page-links/${location.id}/` }, build: {
    link: 1, library, version: "0.0.0", fragment: { fragment: 1, name: library, imports: {}, scopes: {}, remaps: {}, integrity: {}, aliases: {}, inherits: [] },
    entries: { [library]: path }, modules: { [path]: { resolutions: {} } }, barrels: { modules: [], barrels: {} }, defines: {}, generated: {},
    pageSources: [{ root: location.sourceRoot ?? "source", prefix: location.prefix, editable: location.editable }],
  } };
}

export async function prepareSourceAliases(options: { root: string; sourceRoots: readonly SourceRoot[]; links: LibraryLink[] }): Promise<void> {
  for (const link of options.links) {
    if (!link.id.startsWith("playground-source-")) continue;
    const directory = options.sourceRoots[Number(link.id.replace("playground-source-", ""))]?.directory;
    if (!directory?.includes("/node_modules/")) throw new Error(`Missing library source root ${link.id}`);
    const paths = Object.keys(link.build.modules).filter(path => path.startsWith("source/") && path.endsWith(".js")).map(path => path.slice(7)).sort();
    if (!paths.length) throw new Error(`Library source link ${link.id} has no declared JavaScript entries`);
    const hash = createHash("sha256");
    for (const path of paths) hash.update(path).update(await readFile(resolve(directory, path)));
    const key = hash.digest("hex");
    const base = JSON.parse(await readFile(resolve(options.root, "../../packages/ui/dist/runtime/importmap.json"), "utf8")) as Fragment;
    let result = prepared.get(key);
    if (!result) {
      result = prepareCommonJsSources({ libraryDir: directory, outDir: resolve(options.root, ".tmp/production-commonjs", key), runtimePath: "dist/runtime/source-commonjs", paths, base });
      prepared.set(key, result);
    }
    const conversion = await result;
    const manifest = JSON.parse(await readFile(resolve(directory, "package.json"), "utf8")) as { name: string; version: string };
    link.build.library = manifest.name; link.build.version = manifest.version;
    link.build.entries = Object.fromEntries(paths.map(path => [`${manifest.name}/${path.replace(/\/index\.js$/, "")}`, `source/${path}`]));
    link.build.fragment = conversion.fragment;
    const prefix = `${manifest.name}@${manifest.version}/`;
    for (const path of Object.keys(base.integrity).filter(path => path.startsWith(prefix))) link.build.modules[path.slice(prefix.length)] = { resolutions: {} };
    link.build.commonjs = Object.fromEntries(Object.entries(conversion.commonjs).map(([path, value]) => [`source/${path}`, value]));
    delete link.build.pageSources;
    libraries.set(link.id, directory);
    for (const [path, file] of Object.entries(conversion.files)) artifacts.set(`${link.id}/${path}`, file);
  }
}

export async function linkedSourceFile(options: { root: string; sourceRoots: readonly SourceRoot[]; id: string; path: string }): Promise<string> {
  const artifact = artifacts.get(`${options.id}/${options.path}`);
  if (artifact) return artifact;
  const library = libraries.get(options.id);
  if (library && !options.path.startsWith("source/")) {
    const file = await realpath(resolve(library, options.path));
    if (!file.startsWith(library + "/") || !(await stat(file)).isFile()) throw new Error(`Library source escapes its declared directory: ${options.path}`);
    return file;
  }
  if (options.id === "playground-pages") {
    const file = await realpath(`/${options.path}`);
    sourceLocation({ ...options, file });
    const pages = resolve(options.root, "src/pages");
    if (!file.startsWith(pages + "/") && !options.sourceRoots.some(root => root.directory !== resolve(options.root, "src") && file.startsWith(root.directory + "/"))) throw new Error(`File is outside declared page source roots: ${file}`);
    return file;
  }
  const directory = options.sourceRoots[Number(options.id.replace("playground-source-", ""))]?.directory;
  if (!directory || !options.path.startsWith("source/")) throw new Error(`Unknown source link ${options.id}/${options.path}`);
  const file = await realpath(resolve(directory, options.path.slice(7)));
  if (!file.startsWith(directory + "/") || !(await stat(file)).isFile()) throw new Error(`Source link escapes its declared directory: ${options.path}`);
  return file;
}
