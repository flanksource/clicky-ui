import { init, parse } from "es-module-lexer";
import { digest } from "./integrity.ts";
import { specifierKind } from "./module-transform.ts";

export const CONVERTED_ENTRY = "__entry.mjs";

export function convertedFile(path: string): { root: string; path: string } {
  const match = /^esm\/((?:@[^/]+\/)?[^/@]+@[^/]+)\/(.+)$/.exec(path);
  if (!match || /[?#\\]/.test(path) || Array.from(path).some((character) => character.charCodeAt(0) <= 0x20) || path.split("/").some((segment) => ["", ".", ".."].includes(segment))) throw new Error(`invalid converted package file ${path}`);
  return { root: match[1]!, path: match[2]! };
}

export function converterUrl(options: { origin: string; root: string; path: string }): string {
  return `${options.origin.replace(/\/$/, "")}/*${options.root}${options.path === CONVERTED_ENTRY ? "?dev&target=es2022" : `/${options.path}`}`;
}

function internalPath(options: { root: string; path: string; specifier: string }): string | null {
  const { root, path, specifier } = options;
  if (specifier.startsWith("/node/") || specifier.startsWith("node:")) throw new Error(`${root}: converter module ${path} imports Node polyfill ${specifier}`);
  if (specifierKind(specifier) === "bare") return null;
  if (specifierKind(specifier) !== "relative") throw new Error(`${root}: converter import ${specifier} in ${path} is outside the package's own /*${root}/ path`);
  const url = new URL(specifier, `https://converter.invalid/*${root}/${path}`);
  const prefix = `/*${root}/`;
  const decoded = decodeURIComponent(url.pathname);
  if (url.origin !== "https://converter.invalid" || !decoded.startsWith(prefix) || url.search || url.hash || decoded.includes("\\")) throw new Error(`${root}: converter import ${specifier} in ${path} is outside the package's own ${prefix} path`);
  const result = decoded.slice(prefix.length);
  if (!result || result === CONVERTED_ENTRY || result.split("/").some((part) => ["", ".", ".."].includes(part))) throw new Error(`${root}: invalid converter module path ${specifier}`);
  return result;
}

export async function crawlConvertedPackage(options: { origin: string; root: string; fetcher: typeof fetch }): Promise<{ integrity: Record<string, string>; listing: string }> {
  await init();
  const pending = [CONVERTED_ENTRY]; const integrity: Record<string, string> = {};
  const { fetcher } = options;
  for (let index = 0; index < pending.length; index++) {
    const path = pending[index]!;
    const url = converterUrl({ ...options, path });
    const response = await fetcher(url, { mode: "cors", credentials: "omit", redirect: "error" });
    if (!response.ok) throw new Error(`${options.root}: converter returned HTTP ${response.status} for ${url}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    integrity[`esm/${options.root}/${path}`] = await digest(bytes);
    for (const item of parse(new TextDecoder().decode(bytes))[0]) {
      if (item.type === "import-meta") continue;
      if (item.specifier === undefined) throw new Error(`${options.root}: converter module ${path} has a non-literal dynamic import`);
      const internal = internalPath({ root: options.root, path, specifier: item.specifier });
      if (internal !== null && !pending.includes(internal)) pending.push(internal);
    }
  }
  return { integrity, listing: await digest(new TextEncoder().encode(JSON.stringify(Object.entries(integrity).sort(([a], [b]) => a.localeCompare(b))))) };
}

export async function rewriteConvertedImports(options: { code: string; root: string; path: string }): Promise<string> {
  await init();
  let code = options.code;
  for (const item of [...parse(code)[0]].reverse()) {
    if (item.type === "import-meta") continue;
    if (item.specifier === undefined) throw new Error(`${options.root}: converter module ${options.path} has a non-literal dynamic import`);
    const path = internalPath({ ...options, specifier: item.specifier });
    if (path === null) continue;
    const target = `/esm/${options.root}/${path}`;
    code = `${code.slice(0, item.start)}${/^['"`]/.test(code.slice(item.start, item.end)) ? JSON.stringify(target) : target}${code.slice(item.end)}`;
  }
  return code;
}
