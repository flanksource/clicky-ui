import { init, parse } from "es-module-lexer";
import type { DocumentSource, PageLock } from "../schema.ts";
import { DEV_SHIM_URL } from "../sw/compile.ts";
import { BASE_PLUGINS, compilePage, rewriteImports } from "../sw/compiler.ts";
import { extensionOf } from "../sw/content-types.ts";
import { resolveSpecifier } from "../sw/composition.ts";
import { stylesheetModule } from "../sw/module-transform.ts";
import { DOCUMENT_ORIGIN, documentAssets, documentSourceURL, replaceMatches, textAsset } from "./document-assets.ts";

export function documentModules(options: { source: DocumentSource; lock: PageLock }) {
  const { source, lock } = options;
  const assets = documentAssets({ files: source.files, lock });
  const sources = Object.keys(source.files).map(path => documentSourceURL(path).slice("/src/".length));
  const modules = new Set<string>();
  const candidates = new Set<string>();
  let active = Promise.resolve();
  let remark: unknown[] = [];

  function resolve(id: string, referrer: string): string {
    const path = new URL(referrer, DOCUMENT_ORIGIN).pathname;
    const linked = resolveSpecifier(lock.map, id, path);
    if (!linked) throw new Error(`${path}: cannot resolve ${id} in the document runtime`);
    return linked;
  }

  async function compile(path: string): Promise<string> {
    const url = new URL(path, DOCUMENT_ORIGIN);
    const extension = extensionOf(url.pathname);
    const rewrite = (code: string) => rewriteImports({ code, path, lock, sources });
    if (url.pathname === DEV_SHIM_URL) return rewrite('export { Fragment, jsxDEV } from "react/jsx-dev-runtime";');
    if (url.searchParams.has("raw")) return `export default ${JSON.stringify(await assets.readText(url.pathname))};`;
    if (url.searchParams.has("url") || !/\.(?:tsx?|jsx?|mjs|mdx?|css|json)$/.test(extension)) {
      return `export default ${JSON.stringify(await assets.url(url.pathname))};`;
    }
    if (extension === ".css") return stylesheetModule(await assets.css(url.pathname), await assets.url(url.pathname));
    const code = await assets.readText(url.pathname);
    if (extension === ".json") return `export default ${JSON.stringify(JSON.parse(code))};`;
    if (url.pathname.startsWith("/npm/")) return rewrite(code);
    const result = await compilePage({ path, code, lock, sources, plugins: BASE_PLUGINS, remark: [...remark, markdownAssets(url.pathname)] });
    for (const candidate of result.candidates) candidates.add(candidate);
    return result.code;
  }

  function markdownAssets(path: string) {
    type Node = { type: string; identifier?: string; url?: string; children?: Node[] };
    return () => async (root: Node) => {
      const nodes: Node[] = [root];
      for (const node of nodes) nodes.push(...(node.children ?? []));
      const definitions = new Set(nodes.filter(node => node.type === "imageReference").map(node => node.identifier));
      for (const node of nodes) {
        const image = node.type === "image" || (node.type === "definition" && definitions.has(node.identifier));
        if (!image || !node.url || /^(?:[a-z][a-z+.-]*:|\/|#)/i.test(node.url)) continue;
        const target = new URL(node.url, DOCUMENT_ORIGIN + path);
        node.url = await assets.url(target.pathname) + target.hash;
      }
    };
  }

  async function load(path: string): Promise<{ code: string; imports: string[] }> {
    const code = await replaceMatches(await compile(path), /(new URL\(\s*)(['"])([^'":?#]+)\2\s*,\s*import\.meta\.url\s*\)/g, async match => {
      const target = new URL(match[3]!, DOCUMENT_ORIGIN + path);
      return `${match[1]}${JSON.stringify(await assets.url(target.pathname))})`;
    });
    const imports: string[] = [];
    let output = code;
    for (const item of [...parse(code)[0]].reverse()) {
      if (item.type === "import-meta") continue;
      if (!item.specifier || !item.specifier.startsWith("/")) throw new Error(`${path}: document module was not linked`);
      imports.push(item.specifier);
      const target = DOCUMENT_ORIGIN + item.specifier;
      const quoted = /^['"`]/.test(code.slice(item.start, item.end));
      output = output.slice(0, item.start) + (quoted ? JSON.stringify(target) : target) + output.slice(item.end);
    }
    return { code: output, imports };
  }

  async function prepare(paths: string[]): Promise<void> {
    await init();
    const imports: Record<string, string> = {};
    let pending = paths;
    while (pending.length) {
      const fresh = [...new Set(pending)].filter(path => !modules.has(path));
      for (const path of fresh) modules.add(path);
      pending = (await Promise.all(fresh.map(async path => {
        const output = await load(path);
        imports[DOCUMENT_ORIGIN + path] = textAsset(output.code, "text/javascript");
        return output.imports;
      }))).flat();
    }
    if (!Object.keys(imports).length) return;
    const map = document.createElement("script");
    map.type = "importmap";
    map.textContent = JSON.stringify({ imports });
    document.head.append(map);
  }

  function importModules(paths: string[]): Promise<Array<Record<string, unknown>>> {
    active = active.then(() => prepare(paths));
    return active.then(() => Promise.all(paths.map(path => import(/* @vite-ignore */ DOCUMENT_ORIGIN + path) as Promise<Record<string, unknown>>)));
  }

  async function enableCompilerPlugins(): Promise<void> {
    const plugins = Object.values(lock.compiler ?? {}).flatMap(group => group.remark);
    const loaded = await importModules(plugins.map(plugin => resolve(plugin.module, documentSourceURL(source.page))));
    remark = plugins.map((plugin, index) => {
      const entry = loaded[index]?.default;
      if (typeof entry !== "function") throw new Error(`${plugin.module}: remark plugin must export a default function`);
      return [entry, plugin.options];
    });
  }

  return { importModules, enableCompilerPlugins, resolve, assets, candidates };
}
