import { compile } from "@mdx-js/mdx";
import { init, parse } from "es-module-lexer";
import rehypeRaw from "rehype-raw";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";
import type { PageLock } from "../schema.ts";
import { compileSource, DEV_SHIM_URL, type MdxPlugins } from "./compile.ts";
import { CANONICAL_CANDIDATES, defineNodeEnv, specifierKind, stylesheetModule, transformModule } from "./module-transform.ts";
import { resolveSpecifier } from "./composition.ts";
import { RuntimeFailure } from "./errors.ts";
import { sourceCandidates } from "./candidates.ts";
import type { WorkerActivity } from "../activity-schema.ts";

export type CompilerOptions = { path: string; code: string; lock: PageLock; sources: string[]; plugins: MdxPlugins; activity?: WorkerActivity };
export const facetPlugins = (facetRedact: unknown): MdxPlugins => ({ remarkFrontmatter, remarkGfm, remarkAlert, rehypeRaw, facetRedact });
export const moduleUrl = (url: string): string => {
  const parsed = new URL(url, "https://runtime.invalid");
  return `${parsed.pathname}${parsed.search}`;
};

// The URL a module is imported by: the page and link context the worker added from the requesting client are removed.
export const requestModuleUrl = (url: URL): string => {
  const module = new URL(url);
  module.searchParams.delete("page"); module.searchParams.delete("link-context");
  return `${module.pathname}${module.search}`;
};

function canonical(specifier: string, options: { path: string; lock: PageLock; sources: string[]; line: number }): string {
  const kind = specifierKind(specifier);
  let target = kind === "bare" ? resolveSpecifier(options.lock.map, specifier, options.path) : new URL(specifier, `https://runtime.invalid${options.path}`).pathname;
  if (kind === "builtin" || kind === "url" || !target) throw new RuntimeFailure({ phase: "link", file: options.path, line: options.line, message: `${options.path}:${options.line}: import ${specifier} is outside the library set; allowed packages: ${Object.keys(options.lock.versions).join(", ")}` });
  const parsed = new URL(target, "https://runtime.invalid");
  const source = parsed.pathname.startsWith("/src/");
  const converted = parsed.pathname.startsWith("/esm/");
  const prefix = source ? "/src/" : converted ? "/esm/" : "/npm/";
  if (parsed.pathname === DEV_SHIM_URL) return target;
  if (!parsed.pathname.startsWith(prefix)) throw new Error(`${options.path}: unsupported module URL ${target}`);
  const relative = parsed.pathname.slice(prefix.length);
  const listing = source ? options.sources : Object.keys(options.lock.integrity);
  const candidates = source ? ["", ".tsx", ".ts", ".jsx", ".js", ".mdx", ".md", "/index.tsx", "/index.ts", "/index.js"] : CANONICAL_CANDIDATES;
  const found = candidates.map((suffix) => `${relative}${suffix}`).find((file) => listing.includes(converted ? `esm/${file}` : file) || (!source && !converted && options.lock.remaps[file] !== undefined));
  if (!found) throw new RuntimeFailure({ phase: "link", file: options.path, line: options.line, message: `${options.path}:${options.line}: cannot resolve ${specifier} to a canonical file` });
  target = `${prefix}${source || converted ? found : options.lock.remaps[found] ?? found}`;
  const query = new URL(specifier, "https://runtime.invalid").searchParams;
  if (query.has("raw")) target += "?raw";
  else if (query.has("url")) target += "?url";
  else if (/\.(css|json)$/.test(found)) target += "?module";
  return target;
}

export async function rewriteImports(options: { code: string; path: string; lock: PageLock; sources: string[]; activity?: WorkerActivity }): Promise<string> {
  const started = performance.now();
  try {
    await init();
    let code = transformModule(options.code, { url: options.path, known: (p) => Object.hasOwn(options.lock.integrity, p), resolveBare: (s, r) => resolveSpecifier(options.lock.map, s, r), barrels: options.path.startsWith("/esm/") ? null : options.lock.barrels }).code;
    const [imports] = parse(code);
    for (const item of [...imports].reverse()) {
      if (item.type === "import-meta") continue;
      if (item.specifier === undefined) throw new RuntimeFailure({ phase: "link", file: options.path, line: code.slice(0, item.start).split("\n").length, message: `${options.path}: dynamic imports must name a literal module` });
      const target = canonical(item.specifier, { ...options, line: code.slice(0, item.start).split("\n").length });
      const quoted = /^['"`]/.test(code.slice(item.start, item.end));
      const text = moduleUrl(target);
      code = `${code.slice(0, item.start)}${quoted ? JSON.stringify(text) : text}${code.slice(item.end)}`;
    }
    return defineNodeEnv(code).code;
  } finally { if (options.activity) options.activity.rewriteMs += performance.now() - started; }
}

export async function compilePage(options: CompilerOptions): Promise<{ code: string; candidates: string[] }> {
  const url = new URL(options.path, "https://runtime.invalid");
  const extension = url.pathname.slice(url.pathname.lastIndexOf("."));
  let code: string;
  if (url.searchParams.has("raw")) code = `export default ${JSON.stringify(options.code)};`;
  else if (url.searchParams.has("url")) code = `export default ${JSON.stringify(moduleUrl(url.pathname))};`;
  else if (extension === ".json") code = `export default ${JSON.stringify(JSON.parse(options.code))};`;
  else if (extension === ".css") code = stylesheetModule(options.code, moduleUrl(url.pathname));
  else if ([".ts", ".tsx", ".jsx", ".mdx", ".md"].includes(extension)) {
    const started = performance.now();
    try { code = await compileSource({ path: url.pathname.slice("/src/".length), extension, code: options.code }, { compile, plugins: options.plugins }); }
    finally { if (options.activity) options.activity.compileMs += performance.now() - started; }
  } else if ([".js", ".mjs"].includes(extension)) code = options.code;
  else throw new Error(`${options.path}: unsupported source extension ${extension}`);
  return { code: await rewriteImports({ code, path: url.pathname, lock: options.lock, sources: options.sources, ...(options.activity ? { activity: options.activity } : {}) }), candidates: sourceCandidates({ path: url.pathname, code: options.code }) };
}
