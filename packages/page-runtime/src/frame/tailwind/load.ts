import type { FrameConfig } from "../../schema.ts";
import { orderLibraries, validateRecipe, type CompilerLoaders, type LibraryStyles } from "./recipe.ts";

export type ImportModule = (url: string) => Promise<Record<string, unknown>>;
const importModule: ImportModule = (url) => import(/* @vite-ignore */ url) as Promise<Record<string, unknown>>;

export function resolveStyleImport(options: { id: string; base: string; config: FrameConfig }): string {
  const { id, config } = options;
  let target: string | undefined;
  if (/^(?:[./]|https?:)/.test(id)) target = new URL(id, options.base).href;
  else {
    const scopes = Object.entries(config.lock.map.scopes).filter(([scope]) => options.base.startsWith(new URL(scope, location.origin).href)).sort(([a], [b]) => b.length - a.length);
    for (const table of [...scopes.map(([, table]) => table), config.lock.map.imports]) {
      target = table[id];
      if (!target) {
        const prefix = Object.keys(table).filter((key) => key.endsWith("/") && id.startsWith(key)).sort((a, b) => b.length - a.length)[0];
        if (prefix) target = table[prefix]! + id.slice(prefix.length);
      }
      if (target) break;
    }
  }
  if (!target) throw new Error(`${options.base}: unmapped page-style import ${id}`);
  const url = new URL(target, location.origin);
  const packageRoute = url.pathname.startsWith("/npm/") || (config.profile.links === "allow" && url.pathname.startsWith("/link/"));
  if (url.origin !== location.origin || !packageRoute) throw new Error(`${id}: page styles must load through the runtime package route: ${url.href}`);
  url.searchParams.set("page", config.page);
  return url.href;
}

/** The lock's integrity entry for a package-route URL, which is absent for linked modules. */
function lockedIntegrity(url: string, config: FrameConfig): string | undefined {
  const { pathname } = new URL(url);
  const path = pathname.startsWith("/npm/") ? decodeURIComponent(pathname.slice("/npm/".length)) : pathname.startsWith("/esm/") ? decodeURIComponent(pathname.slice(1)) : undefined;
  return path === undefined ? undefined : config.lock.integrity[path];
}

/** Every library's published base stylesheets, in library order, resolved through the integrity-checked package route. */
export function baseStylesheetUrls(options: { libraries: LibraryStyles[]; config: FrameConfig }): string[] {
  return [...new Set(options.libraries.flatMap((library) => library.recipe.base.map((id) => resolveStyleImport({ id, base: library.base, config: options.config }))))];
}

export async function loadLibraries(options: { config: FrameConfig; importModule?: ImportModule }): Promise<{ libraries: LibraryStyles[]; loaders: CompilerLoaders }> {
  const importer = options.importModule ?? importModule;
  const libraries: LibraryStyles[] = await Promise.all(Object.keys(options.config.profile.managed).map(async (name) => {
    const version = options.config.lock.versions[name];
    if (!version) throw new Error(`${name}: managed library has no version in the page lock`);
    const url = resolveStyleImport({ id: `${name}/page-styles`, base: location.href, config: options.config });
    const loaded = await importer(url);
    const recipe = validateRecipe(loaded.pageStyles ?? loaded.default, name);
    const integrity = lockedIntegrity(url, options.config);
    return { id: url, name, version, ...(integrity ? { integrity } : {}), base: new URL(".", url).href, recipe };
  }));
  return { libraries: orderLibraries(libraries), loaders: {
    loadStylesheet: async (id, base) => {
      const url = resolveStyleImport({ id, base, config: options.config });
      const response = await fetch(url);
      if (!response.ok || response.headers.has("x-page-runtime-error")) throw new Error(`${url}: stylesheet fetch failed (HTTP ${response.status})`);
      return { path: url, base: new URL(".", url).href, content: await response.text() };
    },
    loadModule: async (id, base) => {
      const url = resolveStyleImport({ id, base, config: options.config });
      const loaded = await importer(url);
      return { path: url, base: new URL(".", url).href, module: loaded.default ?? loaded };
    },
  } };
}
