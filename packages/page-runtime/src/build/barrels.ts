import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { parseSync } from "rolldown/utils";
import { resolveSpecifier } from "./fragment.ts";
import type { ImportMap, BarrelIndex } from "../schema.ts";
import { CANONICAL_CANDIDATES, NPM_PREFIX, specifierKind } from "./module-utils.ts";
import { moduleFormat, packageOf, type TracedFile } from "./trace.ts";

type ModuleRecord = ReturnType<typeof parseSync>["module"];

/** What a module imports and exports, reduced to what barrel resolution needs. */
export type ModuleShape = {
  /** Local binding → the module request it comes from and the name imported there (`*` for a namespace). */
  imports: Map<string, { from: string; name: string }>;
  /** Exported name → the request and name it forwards, or only a local name for a binding defined here. */
  exports: Map<string, { from?: string; name: string }>;
  /** Requests of `export * from`. */
  stars: string[];
  /** Requests imported only for their side effects (`import "x"`). */
  sideEffectImports: string[];
};

export type BarrelLocation = { url: string; name: string };

type StaticImportRecord = ModuleRecord["staticImports"][number];
type StaticExportEntryRecord = ModuleRecord["staticExports"][number]["entries"][number];

function importedName(entry: StaticImportRecord["entries"][number]): string {
  const kind = entry.importName.kind;
  return kind === "NamespaceObject" ? "*" : kind === "Default" ? "default" : (entry.importName.name ?? "");
}

/**
 * oxc folds `import X from "m"; export { X as Y }` into an export entry placed at the import statement, and names
 * X's local binding as the imported name. The import entry the export points into gives the name `m` exports.
 */
function forwardedName(entry: StaticExportEntryRecord, declaration: StaticImportRecord | undefined): string {
  if (entry.importName.kind === "All") return "*";
  if (!declaration) return entry.importName.name ?? "";
  const start = entry.importName.start;
  const binding = declaration.entries.find((candidate) => candidate.localName.start === start || candidate.importName.start === start);
  if (!binding) throw new Error(`export ${entry.exportName.name} folded from the import at ${declaration.start} names no binding of that import`);
  return importedName(binding);
}

export function shapeOf(module: ModuleRecord): ModuleShape {
  const imports = new Map<string, { from: string; name: string }>();
  const declarations = new Map<number, StaticImportRecord>();
  const sideEffectImports: string[] = [];
  for (const item of module.staticImports) {
    declarations.set(item.start, item);
    if (item.entries.length === 0) sideEffectImports.push(item.moduleRequest.value);
    for (const entry of item.entries) {
      if (!entry.isType) imports.set(entry.localName.value, { from: item.moduleRequest.value, name: importedName(entry) });
    }
  }
  const exports = new Map<string, { from?: string; name: string }>();
  const stars: string[] = [];
  for (const item of module.staticExports) {
    const declaration = declarations.get(item.start);
    for (const entry of item.entries) {
      if (entry.isType) continue;
      const request = entry.moduleRequest?.value;
      if (entry.importName.kind === "AllButDefault") {
        if (request) stars.push(request);
        continue;
      }
      const exported = entry.exportName.kind === "Default" ? "default" : entry.exportName.name;
      if (!exported) continue;
      // A local export, `export default <expression>` included, is defined here.
      const local = entry.localName.kind === "Name" ? (entry.localName.name ?? "default") : "default";
      exports.set(exported, request ? { from: request, name: forwardedName(entry, declaration) } : { name: local });
    }
  }
  return { imports, exports, stars, sideEffectImports };
}

function forwards(shape: ModuleShape): boolean {
  return shape.stars.length > 0 || [...shape.exports.values()].some((entry) => entry.from !== undefined);
}

export type BarrelIndexInput = {
  /** Candidate barrels. */
  urls: string[];
  shape: (url: string) => ModuleShape | null;
  /** The URL a module request in `url` loads, or null when it leaves the indexed files. */
  resolve: (url: string, specifier: string) => string | null;
  /** Whether the module's package declares it free of side effects, so a page may skip evaluating it. */
  sideEffectFree: (url: string) => boolean;
};

export type BuiltBarrelIndex = {
  index: BarrelIndex;
  /** Modules declared side-effect-free that still cannot be skipped, with the reason. */
  kept: Array<{ url: string; reason: string }>;
  /** Forwarding modules whose package does not declare them side-effect-free. */
  blocked: string[];
  names: number;
};

/**
 * Follows every forwarding module's exports to the module that defines each name, the way a bundler honouring
 * `sideEffects` skips re-export modules. A hop goes through a module only when that module may be skipped. A name the
 * index cannot place exactly (a namespace, an ambiguous or unresolvable `export *`) stops at the module where the
 * browser's own resolution would continue, which is always safe to import from.
 */
export function buildBarrelIndex(input: BarrelIndexInput): BuiltBarrelIndex {
  const kept = new Map<string, string>();
  const blocked = new Set<string>();
  const skippable = (url: string): boolean => {
    const shape = input.shape(url);
    if (!shape) return false;
    if (!input.sideEffectFree(url)) {
      if (forwards(shape)) blocked.add(url);
      return false;
    }
    if (shape.sideEffectImports.length > 0) {
      kept.set(url, `imports ${shape.sideEffectImports.join(", ")} for its side effects`);
      return false;
    }
    return true;
  };

  const memo = new Map<string, BarrelLocation | null>();
  const active = new Set<string>();
  const locate = (url: string, name: string): BarrelLocation | null => {
    const key = `${url}#${name}`;
    if (memo.has(key)) return memo.get(key) ?? null;
    if (active.has(key)) return null;
    active.add(key);
    const location = find(url, name);
    active.delete(key);
    memo.set(key, location);
    return location;
  };
  const find = (url: string, name: string): BarrelLocation | null => {
    const shape = input.shape(url);
    if (!shape) return null;
    const here = { url, name };
    const forward = shape.exports.get(name);
    if (forward) {
      if (forward.from === undefined || forward.name === "*" || !skippable(url)) return here;
      const target = input.resolve(url, forward.from);
      return (target && locate(target, forward.name)) || here;
    }
    if (name === "default" || shape.stars.length === 0) return null;
    const found = new Map<string, BarrelLocation>();
    let unresolved = false;
    for (const star of shape.stars) {
      const target = input.resolve(url, star);
      if (!target || !input.shape(target)) {
        unresolved = true;
        continue;
      }
      const location = locate(target, name);
      if (location) found.set(`${location.url}#${location.name}`, location);
    }
    if (unresolved || found.size > 1) return here;
    const [only] = found.values();
    if (!only) return null;
    return skippable(url) ? only : here;
  };

  const namesMemo = new Map<string, Set<string>>();
  const stack = new Set<string>();
  const exportNames = (url: string): Set<string> => {
    const known = namesMemo.get(url);
    if (known) return known;
    const shape = input.shape(url);
    const names = new Set(shape?.exports.keys() ?? []);
    if (!shape || stack.has(url)) return names;
    stack.add(url);
    for (const star of shape.stars) {
      const target = input.resolve(url, star);
      for (const name of target ? exportNames(target) : []) if (name !== "default") names.add(name);
    }
    stack.delete(url);
    namesMemo.set(url, names);
    return names;
  };

  const index: BarrelIndex = { modules: [], barrels: {} };
  const positions = new Map<string, number>();
  let names = 0;
  for (const url of input.urls) {
    const shape = input.shape(url);
    if (!shape || !forwards(shape) || !skippable(url)) continue;
    const entries: Record<string, number | [number, string]> = {};
    for (const name of exportNames(url)) {
      const location = locate(url, name);
      if (!location || location.url === url) continue;
      let position = positions.get(location.url);
      if (position === undefined) {
        position = index.modules.push(location.url) - 1;
        positions.set(location.url, position);
      }
      entries[name] = location.name === name ? position : [position, location.name];
      names += 1;
    }
    if (Object.keys(entries).length > 0) index.barrels[url] = entries;
  }
  return { index, kept: [...kept].map(([url, reason]) => ({ url, reason })), blocked: [...blocked], names };
}

/** Converts a `sideEffects` glob to a RegExp over package-relative paths, with webpack's matching rules. */
function sideEffectsPattern(pattern: string, id: string): RegExp {
  const glob = pattern.replace(/^\.\//, "");
  const full = glob.includes("/") ? glob : `**/${glob}`;
  let source = "";
  let braces = 0;
  for (let i = 0; i < full.length; i += 1) {
    const char = full[i] ?? "";
    if (char === "*" && full[i + 1] === "*") {
      const slash = full[i + 2] === "/";
      source += slash ? "(?:.*/)?" : ".*";
      i += slash ? 2 : 1;
    } else if (char === "*") source += "[^/]*";
    else if (char === "?") source += "[^/]";
    else if (char === "{") {
      braces += 1;
      source += "(?:";
    } else if (char === "}" && braces > 0) {
      braces -= 1;
      source += ")";
    } else if (char === "," && braces > 0) source += "|";
    else if (char === "[" || char === "]") throw new Error(`${id}: sideEffects pattern ${pattern} uses a character class, which the index does not support`);
    else source += char.replace(/[.+^$()|\\]/g, "\\$&");
  }
  return new RegExp(`^${source}$`);
}

/** Whether a package's `sideEffects` declaration lets a bundler skip the file at a package-relative path. */
export function sideEffectsRule(declaration: unknown, id: string): (path: string) => boolean {
  if (declaration === false) return () => true;
  if (declaration === undefined || declaration === true) return () => false;
  if (Array.isArray(declaration) && declaration.every((item) => typeof item === "string")) {
    const patterns = declaration.map((item: string) => sideEffectsPattern(item, id));
    return (path) => !patterns.some((pattern) => pattern.test(path));
  }
  throw new Error(`${id} declares sideEffects as ${JSON.stringify(declaration)}, which is neither a boolean nor a list of globs`);
}

export type LibraryBarrelOptions = {
  files: Map<string, TracedFile>;
  remapped: Set<string>;
  /** A composed import map; the index never follows a hop into converted runtime files. */
  map: ImportMap;
};

export type LibraryBarrelIndex = BuiltBarrelIndex & {
  /** Forwarding modules each package does not declare side-effect-free, by `name@version`. */
  undeclared: Record<string, number>;
  ms: number;
  bytes: number;
};

/** Builds the barrel index the libraries would publish, over every ESM file of a library set. */
export function libraryBarrelIndex(options: LibraryBarrelOptions): LibraryBarrelIndex {
  const started = performance.now();
  const shapes = new Map<string, ModuleShape | null>();
  const shape = (url: string): ModuleShape | null => {
    if (shapes.has(url)) return shapes.get(url) ?? null;
    const file = options.files.get(url);
    const converted = url.includes("/dist/runtime/");
    const value = file && file.kind === "esm" && !converted ? shapeOf(moduleFormat(file.path).module) : null;
    shapes.set(url, value);
    return value;
  };
  const known = (url: string) => options.files.has(url) || options.remapped.has(url);
  const resolve = (url: string, specifier: string): string | null => {
    const kind = specifierKind(specifier);
    if (kind === "relative") {
      const path = new URL(specifier, `https://runtime.invalid${NPM_PREFIX}${url}`).pathname;
      if (!path.startsWith(NPM_PREFIX)) return null;
      const resolved = path.slice(NPM_PREFIX.length);
      return CANONICAL_CANDIDATES.map((suffix) => `${resolved}${suffix}`).find(known) ?? null;
    }
    if (kind !== "bare") return null;
    const target = resolveSpecifier(options.map, specifier, `${NPM_PREFIX}${url}`);
    return target?.startsWith(NPM_PREFIX) ? target.slice(NPM_PREFIX.length) : null;
  };
  const rules = new Map<string, (path: string) => boolean>();
  const owner = (url: string) => {
    const file = options.files.get(url);
    if (!file) throw new Error(`${url} is not in the library set`);
    return packageOf(file.path);
  };
  const sideEffectFree = (url: string): boolean => {
    const pkg = owner(url);
    let rule = rules.get(pkg.dir);
    if (!rule) {
      const manifest = JSON.parse(readFileSync(join(pkg.dir, "package.json"), "utf8")) as { sideEffects?: unknown };
      rule = sideEffectsRule(manifest.sideEffects, `${pkg.name}@${pkg.version}`);
      rules.set(pkg.dir, rule);
    }
    return rule(url.slice(`${pkg.name}@${pkg.version}/`.length));
  };
  const built = buildBarrelIndex({ urls: [...options.files.keys()].filter((url) => shape(url) !== null), shape, resolve, sideEffectFree });
  const undeclared: Record<string, number> = {};
  for (const url of built.blocked) {
    const pkg = owner(url);
    const id = `${pkg.name}@${pkg.version}`;
    undeclared[id] = (undeclared[id] ?? 0) + 1;
  }
  return { ...built, undeclared, ms: Math.round(performance.now() - started), bytes: Buffer.byteLength(JSON.stringify(built.index)) };
}
