import { compile } from "@mdx-js/mdx";
import { init, parse } from "es-module-lexer";
import type { StoredLink } from "../link/types.ts";
import { linkUrl } from "../link/validation.ts";
import { mountLinkTarget } from "../link/overrides.ts";
import { compileSource, compileCommonJsSource, DEV_SHIM_URL, type MdxPlugins } from "./compile.ts";
import { BASE_PACKAGES, packageName, resolveSpecifier } from "./composition.ts";
import { CANONICAL_CANDIDATES, defineNodeEnv, parseClause, stylesheetModule } from "./module-transform.ts";
import { moduleUrl } from "./compiler.ts";
import { pageSourceModule, pageSourcePath, validatePageSourceLinks, type PageSourceLock } from "../link/page-sources.ts";
import type { LinkActivity } from "./link-activity.ts";

type Context = { path: string; lock: PageSourceLock; links: StoredLink[]; sources: string[] };
const SOURCE_SUFFIXES = ["", ".tsx", ".ts", ".jsx", ".js", ".mdx", ".md", "/index.tsx", "/index.ts", "/index.js"];

function resolveLinked(specifier: string, options: Context): string {
  const owner = options.links.find((link) => options.path.startsWith(`/link/${link.id}/`));
  const path = owner ? decodeURIComponent(options.path.slice(`/link/${owner.id}/`.length)) : undefined;
  const resolution = path ? owner?.build.modules[path]?.resolutions[specifier] : undefined;
  const replacement = options.links.find(link => link.build.library === packageName(specifier));
  if (replacement && !Object.hasOwn(replacement.build.entries, specifier)) throw new Error(`${replacement.build.library}: local checkout does not expose ${specifier}; rebuild link metadata`);
  let target = replacement ? linkUrl(replacement.id, replacement.build.entries[specifier]!) : BASE_PACKAGES.includes(packageName(specifier)) ? resolveSpecifier({ imports: options.lock.map.imports, scopes: {} }, specifier, options.path) : resolution ? (resolution.startsWith("/npm/") ? mountLinkTarget(owner!, resolution) : linkUrl(owner!.id, resolution)) : specifier.startsWith(".") || specifier.startsWith("/") ? new URL(specifier, `https://runtime.invalid${options.path}`).pathname : resolveSpecifier(options.lock.map, specifier, options.path);
  if (!target || /^(?:node:|https?:|data:|blob:)/.test(target)) throw new Error(`${options.path}: import ${specifier} is outside the library set; allowed packages: ${Object.keys(options.lock.versions).join(", ")}`);
  if (target.startsWith("/src/") && options.lock.pageSources) target = pageSourceModule({ page: decodeURIComponent(target.slice(5)), roots: options.lock.pageSources }) ?? target;
  if (target === DEV_SHIM_URL) return target;
  const parsed = new URL(target, "https://runtime.invalid");
  const linked = options.links.find((link) => parsed.pathname.startsWith(`/link/${link.id}/`));
  const prefix = linked ? `/link/${linked.id}/` : parsed.pathname.startsWith("/src/") ? "/src/" : "/npm/";
  if (!parsed.pathname.startsWith(prefix)) throw new Error(`${options.path}: unsupported module URL ${target}`);
  const relative = decodeURIComponent(parsed.pathname.slice(prefix.length));
  const listing = linked ? Object.keys(linked.build.modules).concat(Object.keys(linked.build.generated), Object.keys(linked.build.fragment.integrity).filter((key) => key.startsWith(`${linked.build.library}@${linked.build.version}/`)).map((key) => key.slice(`${linked.build.library}@${linked.build.version}/`.length))) : prefix === "/src/" ? options.sources : Object.keys(options.lock.integrity);
  const found = (prefix === "/npm/" ? CANONICAL_CANDIDATES : SOURCE_SUFFIXES).map((suffix) => relative + suffix).find((candidate) => listing.includes(candidate) || (prefix === "/npm/" && options.lock.remaps[candidate] !== undefined));
  if (!found) throw new Error(`${options.path}: cannot resolve ${specifier}; rebuild link metadata with buildLinkRuntime when adding imports`);
  target = linked ? linkUrl(linked.id, found) : `${prefix}${prefix === "/npm/" ? options.lock.remaps[found] ?? found : found}`;
  if (target.startsWith("/npm/")) for (const link of options.links) target = mountLinkTarget(link, target);
  const query = new URL(specifier, "https://runtime.invalid").searchParams;
  if (query.has("raw")) target += "?raw";
  else if (query.has("url")) target += "?url";
  else if (/\.(css|json)$/.test(found)) target += "?module";
  return moduleUrl(target);
}

export async function rewriteLinkImports(options: Context & { code: string }): Promise<string> {
  await init();
  let output = options.code;
  for (const item of [...parse(options.code)[0]].reverse()) {
    if (item.type === "import-meta") continue;
    if (!item.specifier) throw new Error(`${options.path}: dynamic imports must name a literal module`);
    const target = resolveLinked(item.specifier, options);
    const key = new URL(target, "https://runtime.invalid").pathname;
    const entries = options.lock.barrels.barrels[key] ?? options.lock.barrels.barrels[key.replace(/^\/npm\//, "")];
    const head = item.type === "static" ? /^import\s+([\s\S]+?)\s+from\s*$/.exec(options.code.slice(item.importStart, item.start - 1)) : null;
    const clause = head ? parseClause(head[1] ?? "") : null;
    if (entries && clause && !clause.namespace && clause.bindings.every((binding) => entries[binding.imported] !== undefined)) {
      const statements = clause.bindings.map((binding) => {
        const entry = entries[binding.imported]!;
        const [position, name] = typeof entry === "number" ? [entry, binding.imported] : entry;
        const location = options.lock.barrels.modules[position];
        if (!location) throw new Error(`Missing barrel module ${position}`);
        const url = resolveLinked(location.startsWith("/") ? location : `/npm/${location}`, options);
        return `import { ${name}${name === binding.local ? "" : ` as ${binding.local}`} } from ${JSON.stringify(url)};`;
      });
      const end = options.code[item.importEnd] === ";" ? item.importEnd + 1 : item.importEnd;
      output = `${output.slice(0, item.importStart)}${statements.join(" ")}${output.slice(end)}`;
    } else {
      const quoted = /^["'`]/.test(options.code.slice(item.start, item.end));
      output = `${output.slice(0, item.start)}${quoted ? JSON.stringify(target) : target}${output.slice(item.end)}`;
    }
  }
  return defineNodeEnv(output).code;
}

type LinkCompileOptions = Context & { code: string; query: URLSearchParams; plugins: MdxPlugins; metrics?: LinkActivity };

export async function compileLinkModule(options: LinkCompileOptions): Promise<string> {
  const compiled = await compileLinkSource(options);
  return compiled.imports ? await rewriteLinkModule({ ...options, code: compiled.code }) : compiled.code;
}

export async function rewriteLinkModule(options: Context & { code: string; metrics?: LinkActivity }): Promise<string> {
  const start = performance.now();
  try { return await rewriteLinkImports(options); }
  finally { if (options.metrics) options.metrics.rewriteMs += performance.now() - start; }
}

/**
 * Compiles a linked module up to, but not including, the rewrite of its imports. For a library module the
 * result does not depend on the page, so it can be cached for every page; `imports` says whether the
 * result still needs rewriteLinkModule.
 */
export async function compileLinkSource(options: LinkCompileOptions): Promise<{ code: string; imports: boolean }> {
  validatePageSourceLinks(options);
  const sourcePath = pageSourcePath({ path: options.path, roots: options.lock.pageSources ?? [] });
  const extension = options.path.slice(options.path.lastIndexOf("."));
  if (options.query.has("raw")) return { code: `export default ${JSON.stringify(options.code)};`, imports: false };
  if (options.query.has("url")) return { code: `export default ${JSON.stringify(moduleUrl(options.path))};`, imports: false };
  if (extension === ".json") return { code: `export default ${JSON.stringify(JSON.parse(options.code))};`, imports: false };
  if (extension === ".css") return { code: stylesheetModule(options.code, moduleUrl(options.path)), imports: false };
  const owner = options.links.find((link) => options.path.startsWith(`/link/${link.id}/`));
  const commonjs = owner?.build.commonjs?.[decodeURIComponent(options.path.slice(`/link/${owner.id}/`.length))];
  let code = options.code;
  if (commonjs || [".ts", ".tsx", ".jsx", ".mdx", ".md"].includes(extension)) {
    const start = performance.now();
    if (options.metrics) options.metrics.source = "compiled";
    try {
      code = commonjs ? compileCommonJsSource({ path: options.path, code, conversion: { ...commonjs, target: linkUrl(owner!.id, commonjs.target) } }) : await compileSource({ path: options.path, extension, code, ...(sourcePath ? { sourcePath } : {}) }, { compile, plugins: options.plugins });
    } finally { if (options.metrics) options.metrics.compileMs += performance.now() - start; }
  }
  if (owner && !commonjs && Object.hasOwn(owner.build.modules, decodeURIComponent(options.path.slice(`/link/${owner.id}/`.length)))) code = Object.entries(owner.build.defines).map(([name, value]) => `const ${name} = ${JSON.stringify(value)};`).join("\n") + "\n" + code;
  return { code, imports: true };
}
