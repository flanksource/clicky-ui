import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { isBuiltin } from "node:module";
import { dirname, extname, join, relative, sep } from "node:path";
import { ResolverFactory, type ResolveResult } from "rolldown/experimental";
import { parseSync } from "rolldown/utils";
import { specifierKind } from "./module-utils.ts";

export type FileKind = "esm" | "commonjs" | "css" | "json" | "asset";

export type PackageId = { name: string; version: string; dir: string };

export type TracedFile = {
  /** Package-relative URL, `<name>@<version>/<path>`, as the package origin serves it. */
  url: string;
  path: string;
  kind: FileKind;
  integrity: string;
  /** Bare specifiers the file imports, as written. */
  bareImports: string[];
};

/** A CommonJS-only package entry reached from ESM. It is converted into the owning library's runtime set. */
export type CommonJsEntry = { specifier: string; path: string; pkg: PackageId; name: string; url: string };

export type Failure = { name: string; detail: string };

export type FragmentSpec = {
  name: string;
  /** Directory that top-level packages resolve from. */
  resolveFrom: string;
  /**
   * URL prefix of converted CommonJS files, `<library>@<version>/runtime/`. A fragment without one (additional
   * packages) cannot convert, so a CommonJS-only package there is a failure.
   */
  runtimeBase?: string;
  /** Top-level specifiers and the files they map to. */
  entries: Array<{ specifier: string; path: string }>;
  files?: string[];
  /** Packages mapped at the top level wherever they are imported: the base set, in the fragment that provides it. */
  topLevel: string[];
  /** Packages left to other fragments' top-level entries. */
  inherits: string[];
};

export const IMPORT_CONDITIONS = ["browser", "import", "module", "default"];
export const REQUIRE_CONDITIONS = ["browser", "require", "default"];
export const EMPTY_MODULE = "export default {};\n";
const JS_EXTENSIONS = new Set([".js", ".mjs", ".cjs"]);
const NEW_URL = /new URL\(\s*(['"])(\.{1,2}\/[^'"]+)\1\s*,\s*import\.meta\.url\s*\)/g;
// A quoted reference runs to its closing quote: font URLs carry `;` (wght@400;600).
const CSS_IMPORT = /@import\s+(?:url\(\s*)?(?:(['"])(.*?)\1|([^'")\s;]+))/g;
const CSS_URL = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;

export function createResolver(conditionNames: string[]): ResolverFactory {
  return new ResolverFactory({
    conditionNames,
    mainFields: ["browser", "module", "main"],
    aliasFields: [["browser"]],
    extensions: [".mjs", ".js", ".cjs", ".json"],
    symlinks: true,
  });
}

export function resolveBrowser(options: { resolver: ResolverFactory; fromDir: string; specifier: string }): ResolveResult & { empty?: boolean } {
  const pkg = packageOf(join(options.fromDir, "package.json"));
  const manifest = JSON.parse(readFileSync(join(pkg.dir, "package.json"), "utf8")) as { browser?: Record<string, string | false> | string };
  const mapping = typeof manifest.browser === "object" ? manifest.browser[options.specifier] : undefined;
  if (mapping === false) return { empty: true };
  if (typeof mapping === "string" && specifierKind(mapping) === "builtin") {
    return { builtin: { resolved: mapping, isRuntimeModule: mapping.startsWith("node:") } };
  }
  const result = options.resolver.sync(options.fromDir, options.specifier);
  // The native resolver represents browser:false with its Ignored error, not a path or a typed flag.
  if (result.error?.startsWith("Path is ignored ")) return { empty: true };
  if (!result.path && isBuiltin(options.specifier)) return { builtin: { resolved: options.specifier, isRuntimeModule: options.specifier.startsWith("node:") } };
  return result;
}

export function integrityOf(bytes: Uint8Array | string): string {
  return `sha384-${createHash("sha384").update(bytes).digest("base64")}`;
}

export function packageName(specifier: string): string {
  const parts = specifier.split("/");
  return (specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]) ?? specifier;
}

/** The string value of a dynamic import's argument, or null when it is computed. */
function stringLiteral(expression: string): string | null {
  const text = expression.trim();
  const quoted = /^(['"])([^'"\\]*)\1$/.exec(text);
  if (quoted) return quoted[2] ?? null;
  const template = /^`([^`$\\]*)`$/.exec(text);
  return template ? (template[1] ?? null) : null;
}

const formats = new Map<string, { format: "esm" | "commonjs"; code: string; module: ReturnType<typeof parseSync>["module"] }>();

/** Parses a JavaScript file once and classifies it by its syntax, which is what a browser cares about. */
export function moduleFormat(path: string) {
  const code = readFileSync(path, "utf8");
  const known = formats.get(path);
  if (known?.code === code) return known;
  const parsed = parseSync(path, code, { lang: "js", sourceType: "unambiguous" });
  const commonJsSyntax = /\brequire\s*\(|\bmodule\.exports\b|\bexports\.[\w$]+\s*=|\bexports\[/.test(code);
  if (parsed.errors.length > 0) throw new Error(`${path}: ${parsed.errors.map((error) => error.message).join("; ")}`);
  const format = !parsed.module.hasModuleSyntax && commonJsSyntax ? "commonjs" : "esm";
  const result = { format, code, module: parsed.module } as const;
  formats.set(path, result);
  return result;
}

const manifests = new Map<string, PackageId | null>();

function manifestAt(dir: string): PackageId | null {
  if (manifests.has(dir)) return manifests.get(dir) ?? null;
  const file = join(dir, "package.json");
  const manifest = existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as { name?: string; version?: string }) : {};
  const id = manifest.name && manifest.version ? { name: manifest.name, version: manifest.version, dir } : null;
  manifests.set(dir, id);
  return id;
}

/**
 * The package that contains `path`: the nearest directory with a named, versioned package.json. Nested
 * manifests without a version (subpath shims) and dependencies a library bundled into its own dist (no
 * manifest at all) belong to the enclosing package.
 */
export function packageOf(path: string): PackageId {
  for (let dir = dirname(path); dir !== dirname(dir); dir = dirname(dir)) {
    const manifest = manifestAt(dir);
    if (manifest) return manifest;
  }
  throw new Error(`${path} is not inside a package`);
}

function urlOf(pkg: PackageId, path: string): string {
  return `${pkg.name}@${pkg.version}/${relative(pkg.dir, path).split(sep).join("/")}`;
}

/** Picks an `exports` target for the browser, honouring the package's own condition order. */
function exportTarget(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const target = exportTarget(item);
      if (target) return target;
    }
    return null;
  }
  if (value && typeof value === "object") {
    for (const [condition, nested] of Object.entries(value)) {
      if (!IMPORT_CONDITIONS.includes(condition)) continue;
      const target = exportTarget(nested);
      if (target) return target;
    }
  }
  return null;
}

function filesUnder(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .map((entry) => join(dir, entry))
    .filter((path) => statSync(path).isFile());
}

/** Every entry point a package's `exports` declares for the browser, with `*` patterns expanded. */
export function exportEntries(dir: string): Array<{ specifier: string; path: string }> {
  const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as { name: string; exports?: unknown };
  const exportsField = manifest.exports;
  if (!exportsField || typeof exportsField !== "object" || Array.isArray(exportsField)) {
    throw new Error(`${manifest.name} has no subpath exports map`);
  }
  const entries: Array<{ specifier: string; path: string }> = [];
  for (const [key, value] of Object.entries(exportsField)) {
    const target = exportTarget(value);
    if (!target) continue;
    const specifier = key === "." ? manifest.name : `${manifest.name}${key.slice(1)}`;
    if (!key.includes("*")) {
      entries.push({ specifier, path: join(dir, target) });
      continue;
    }
    const [targetPrefix = "", targetSuffix = ""] = target.split("*");
    const base = join(dir, targetPrefix);
    for (const path of filesUnder(dirname(base))) {
      if (!path.startsWith(base) || !path.endsWith(targetSuffix) || path.endsWith(".d.ts")) continue;
      const captured = path.slice(base.length, path.length - targetSuffix.length).split(sep).join("/");
      entries.push({ specifier: specifier.replace("*", captured), path });
    }
  }
  return entries;
}

export function resolveEntry(resolver: ResolverFactory, fromDir: string, specifier: string): { specifier: string; path: string } {
  const result = resolver.sync(fromDir, specifier);
  if (!result.path) throw new Error(`cannot resolve ${specifier} from ${fromDir}: ${result.error}`);
  return { specifier, path: result.path };
}

type Pending = { file: TracedFile; code: string; module: ReturnType<typeof parseSync>["module"]; pkg: PackageId };

/**
 * Traces a fragment's dependency closure: every file a browser loads from the fragment's entries, the bare
 * imports each package needs mapped, and the CommonJS-only entries that must be converted.
 */
export class ClosureTracer {
  readonly imports: Record<string, string> = {};
  readonly scopes: Record<string, Record<string, string>> = {};
  /** URL remaps: CommonJS files that ESM code imports by a relative path, redirected to their converted file. */
  readonly remaps: Record<string, string> = {};
  /** Relative imports without a file name, by package: the runtime rewrites them to canonical URLs. */
  readonly canonicalRewrites = new Map<string, number>();
  readonly inherited = new Map<string, Set<string>>();
  readonly files = new Map<string, TracedFile>();
  readonly packages = new Map<string, string>();
  readonly commonJs = new Map<string, CommonJsEntry>();
  readonly failures: Failure[] = [];
  readonly untraced: Array<{ url: string; expression: string }> = [];
  /** Resources on other origins that traced files load, which the frame's CSP and egress allowlist must permit. */
  readonly external: Array<{ url: string; reference: string }> = [];
  readonly resolver = createResolver(IMPORT_CONDITIONS);
  private readonly targets = new Map<string, string | null>();
  private readonly queue: Pending[] = [];

  constructor(readonly spec: FragmentSpec) {}

  trace(): this {
    for (const entry of this.spec.entries) {
      const url = this.target(entry.path, entry.specifier, "bare");
      if (url) this.mapTopLevel(entry.specifier, url);
    }
    for (const path of this.spec.files ?? []) this.target(path, this.spec.name, "relative");
    this.drain();
    return this;
  }

  traceDependencies(options: { path: string; dependencies: string[] }): void {
    const pkg = packageOf(options.path);
    const file = this.files.get(urlOf(pkg, options.path));
    if (!file) throw new Error(`${options.path}: page-styles must be an ESM module`);
    for (const specifier of options.dependencies) this.follow(specifier, file, pkg);
    this.drain();
  }

  private emptyModule(): string {
    if (!this.spec.runtimeBase) throw new Error(`${this.spec.name}: browser:false requires a library runtime set`);
    const url = `${this.spec.runtimeBase}empty.js`;
    this.files.set(url, { url, path: join(this.spec.resolveFrom, "dist/runtime/empty.js"), kind: "esm", integrity: integrityOf(EMPTY_MODULE), bareImports: [] });
    return url;
  }

  /** Traces files queued after `trace`, such as ESM packages that converted CommonJS code imports. */
  drain(): void {
    for (let next = this.queue.shift(); next; next = this.queue.shift()) this.visit(next);
  }

  fail(name: string, detail: string): void {
    if (!this.failures.some((failure) => failure.name === name && failure.detail === detail)) this.failures.push({ name, detail });
  }

  inherit(specifier: string, importer: string): void {
    const importers = this.inherited.get(specifier) ?? new Set<string>();
    importers.add(importer);
    this.inherited.set(specifier, importers);
  }

  mapTopLevel(specifier: string, url: string): void {
    const existing = this.imports[specifier];
    if (existing && existing !== url) this.fail(specifier, `top-level conflict: ${existing} and ${url}`);
    else this.imports[specifier] = url;
  }

  mapInScope(scope: string, specifier: string, url: string): void {
    const table = (this.scopes[scope] ??= {});
    const existing = table[specifier];
    if (existing && existing !== url) this.fail(packageName(specifier), `scope ${scope} maps ${specifier} to both ${existing} and ${url}`);
    else table[specifier] = url;
  }

  /** Maps a base-set specifier at the top level, resolved from the fragment root so every importer shares one copy. */
  provideTopLevel(specifier: string): string | null {
    const known = this.imports[specifier];
    if (known) return known;
    const resolved = this.resolver.sync(this.spec.resolveFrom, specifier);
    if (!resolved.path) {
      this.fail(packageName(specifier), `cannot resolve base-set specifier ${specifier}: ${resolved.error}`);
      return null;
    }
    const url = this.target(resolved.path, specifier, "bare");
    if (url) this.mapTopLevel(specifier, url);
    return url;
  }

  /**
   * Registers a file and returns the URL an import of it maps to: the file itself, or, for a CommonJS-only
   * package entry, its converted file in the runtime set.
   */
  target(path: string, specifier: string, via: "bare" | "relative"): string | null {
    if (this.targets.has(path)) return this.targets.get(path) ?? null;
    const pkg = packageOf(path);
    this.packages.set(`${pkg.name}@${pkg.version}`, pkg.dir);
    const extension = extname(path);
    let url: string | null = urlOf(pkg, path);
    if (JS_EXTENSIONS.has(extension)) {
      const parsed = moduleFormat(path);
      if (parsed.format === "esm") this.addFile({ url, path, kind: "esm", integrity: integrityOf(parsed.code), bareImports: [] }, parsed, pkg);
      else if (via === "bare") url = this.commonJsEntry(path, specifier, pkg);
      else {
        // An ESM wrapper importing its own CommonJS build: the import map redirects the file's URL to its conversion.
        const converted = this.commonJsEntry(path, `${pkg.name}/${relative(pkg.dir, path).split(sep).join("/")}`, pkg);
        if (converted) this.remaps[url] = converted;
      }
    } else if (extension === ".css") {
      this.addCss(path, url, pkg);
    } else {
      const kind = extension === ".json" ? "json" : "asset";
      this.addFile({ url, path, kind, integrity: integrityOf(readFileSync(path)), bareImports: [] }, null, pkg);
    }
    this.targets.set(path, url);
    return url;
  }

  private commonJsEntry(path: string, specifier: string, pkg: PackageId): string | null {
    if (!this.spec.runtimeBase) {
      this.fail(pkg.name, `${pkg.name}@${pkg.version} is CommonJS-only; additional packages must ship ESM`);
      return null;
    }
    const subpath = specifier === pkg.name ? "index" : specifier.slice(pkg.name.length + 1).replace(/\.(c|m)?js$/, "");
    const name = `${pkg.name}@${pkg.version}/${subpath}`;
    const url = `${this.spec.runtimeBase}${name}.js`;
    this.commonJs.set(name, { specifier, path, pkg, name, url });
    return url;
  }

  private addFile(file: TracedFile, parsed: ReturnType<typeof moduleFormat> | null, pkg: PackageId): void {
    this.files.set(file.url, file);
    if (parsed && file.kind === "esm") this.queue.push({ file, code: parsed.code, module: parsed.module, pkg });
  }

  private addCss(path: string, url: string, pkg: PackageId): void {
    const code = readFileSync(path, "utf8");
    this.files.set(url, { url, path, kind: "css", integrity: integrityOf(code), bareImports: [] });
    const imports = new Set([...code.matchAll(CSS_IMPORT)].map((match) => match[2] ?? match[3] ?? ""));
    for (const reference of imports) {
      if (/^https?:/.test(reference)) this.external.push({ url, reference });
      else this.target(join(dirname(path), reference), reference, "relative");
    }
    for (const match of code.matchAll(CSS_URL)) {
      const value = match[2] ?? "";
      if (imports.has(value) || !value || /^(data:|#|\/)/.test(value)) continue;
      if (/^https?:/.test(value)) {
        this.external.push({ url, reference: value });
        continue;
      }
      const asset = join(dirname(path), value.split(/[?#]/)[0] ?? value);
      if (existsSync(asset)) this.target(asset, value, "relative");
      else this.fail(pkg.name, `${url} references missing asset ${value}`);
    }
  }

  private visit({ file, code, module, pkg }: Pending): void {
    const specifiers = new Set<string>();
    for (const item of module.staticImports) specifiers.add(item.moduleRequest.value);
    for (const item of module.staticExports) {
      for (const entry of item.entries) if (entry.moduleRequest) specifiers.add(entry.moduleRequest.value);
    }
    for (const item of module.dynamicImports) {
      const expression = code.slice(item.moduleRequest.start, item.moduleRequest.end);
      const literal = stringLiteral(expression);
      if (literal === null) this.untraced.push({ url: file.url, expression: expression.replace(/\s+/g, " ").slice(0, 120) });
      else specifiers.add(literal);
    }
    for (const match of code.matchAll(NEW_URL)) if (match[2]) specifiers.add(match[2]);
    for (const specifier of specifiers) this.follow(specifier, file, pkg);
  }

  private follow(specifier: string, file: TracedFile, pkg: PackageId): void {
    const kind = specifierKind(specifier);
    if (kind === "url") return;
    const resolved = resolveBrowser({ resolver: this.resolver, fromDir: dirname(file.path), specifier });
    if (resolved.empty) {
      const url = this.emptyModule();
      if (kind === "relative") this.remaps[urlOf(pkg, join(dirname(file.path), specifier))] = url;
      else {
        file.bareImports.push(specifier);
        this.mapInScope(`${pkg.name}@${pkg.version}/`, specifier, url);
      }
      return;
    }
    if (resolved.builtin || (kind === "builtin" && !resolved.path)) {
      this.fail(pkg.name, `${file.url} imports Node built-in ${resolved.builtin?.resolved ?? specifier}`);
      return;
    }
    if (kind === "relative") {
      if (!resolved.path) {
        this.fail(pkg.name, `${file.url} imports missing ${specifier}`);
        return;
      }
      const written = specifier.split(/[?#]/)[0] ?? specifier;
      if (!resolved.path.endsWith(written.replace(/^(\.{1,2}\/)+/, "").split("/").join(sep))) {
        this.canonicalRewrites.set(pkg.name, (this.canonicalRewrites.get(pkg.name) ?? 0) + 1);
      }
      const url = this.target(resolved.path, specifier, "relative");
      const writtenPath = join(dirname(file.path), written);
      if (url && writtenPath !== resolved.path) this.remaps[urlOf(pkg, writtenPath)] = this.remaps[url] ?? url;
      return;
    }
    file.bareImports.push(specifier);
    const name = packageName(specifier);
    if (this.spec.inherits.includes(name)) {
      this.inherit(specifier, file.url);
      return;
    }
    if (this.spec.topLevel.includes(name)) {
      this.provideTopLevel(specifier);
      return;
    }
    if (!resolved.path) {
      this.fail(name, `${file.url} cannot resolve ${specifier} (${resolved.error})`);
      return;
    }
    const url = this.target(resolved.path, specifier, "bare");
    if (url) this.mapInScope(`${pkg.name}@${pkg.version}/`, specifier, url);
  }
}
