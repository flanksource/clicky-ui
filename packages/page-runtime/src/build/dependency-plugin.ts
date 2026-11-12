import { isBuiltin } from "node:module";
import { isAbsolute, join } from "node:path";
import type { Plugin } from "rolldown";
import { parseSync } from "rolldown/utils";
import { ensureDependencyRuntime, type CachedDependencyRuntime } from "./dependency-cache.ts";
import { moduleFormat } from "./trace.ts";

export function dependencyRuntimePlugin(options: { root: string; cacheDir: string; base: CachedDependencyRuntime }): Plugin {
  const modules = new Map<string, { path: string; styles: string[] }>();
  const external = Object.fromEntries(Object.entries(options.base.imports).map(([source, path]) => [source, join(options.base.root, path)]));
  const pinned = new Set(Object.values(external));
  const prefix = "\0page-runtime:";
  const bindings = new Map<string, Map<string, Set<string> | null>>();
  return {
    name: "page-runtime-dependencies",
    transform(code, id) {
      if (id.startsWith("\0") || !/\.[cm]?[jt]sx?$/.test(id)) return null;
      const lang = id.endsWith(".tsx") ? "tsx" : id.endsWith(".ts") ? "ts" : id.endsWith(".jsx") ? "jsx" : "js";
      const parsed = parseSync(id, code, { lang, sourceType: "unambiguous" });
      if (parsed.errors.length) throw new Error(`${id}: ${parsed.errors.map(error => error.message).join("\n")}`);
      const imported = new Map<string, Set<string> | null>();
      for (const item of parsed.module.staticImports) {
        const source = item.moduleRequest.value;
        if (imported.get(source) === null) continue;
        const names = imported.get(source) ?? new Set<string>();
        for (const entry of item.entries) {
          if (entry.isType) continue;
          if (entry.importName.kind === "NamespaceObject") { imported.set(source, null); break; }
          names.add(entry.importName.kind === "Default" ? "default" : entry.importName.name!);
        }
        if (!imported.has(source) || imported.get(source) !== null) imported.set(source, names);
      }
      bindings.set(id, imported);
      return null;
    },
    async resolveId(source, importer) {
      if (source.startsWith(prefix)) return source;
      if (pinned.has(source)) return { id: source, external: options.base.target === "node" };
      if (!importer || source.startsWith(".") || source.startsWith("\0") || isAbsolute(source) || isBuiltin(source) || /^[a-z][a-z0-9+.-]*:/i.test(source) || /[?#]|\.(css|json)$/.test(source)) return null;
      const names = bindings.get(importer)?.get(source);
      const key = JSON.stringify([source, names ? [...names].sort() : null]);
      if (!modules.has(key)) {
        const runtime = external[source] ? options.base : await ensureDependencyRuntime({ root: options.root, cacheDir: options.cacheDir, entries: [source], target: options.base.target, external, ...(names?.size ? { exports: { [source]: [...names].sort() } } : {}) });
        const path = join(runtime.root, runtime.imports[source]!);
        pinned.add(path);
        modules.set(key, { path, styles: runtime.styles.map(style => join(runtime.root, style)) });
      }
      return `${prefix}${key}`;
    },
    load(id) {
      if (!id.startsWith(prefix)) return null;
      const module = modules.get(id.slice(prefix.length));
      if (!module) throw new Error(`Missing dependency runtime module ${id}`);
      const hasDefault = moduleFormat(module.path).module.staticExports.some(item => item.entries.some(entry => entry.exportName.kind === "Default" || entry.exportName.name === "default"));
      return [...module.styles.map(style => `import ${JSON.stringify(style)};`), `export * from ${JSON.stringify(module.path)};`, ...(hasDefault ? [`export { default } from ${JSON.stringify(module.path)};`] : [])].join("\n");
    },
  };
}
