import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { init } from "es-module-lexer";
import { ResolverFactory } from "rolldown/experimental";
import { parseSync } from "rolldown/utils";
import type { Plugin } from "rolldown";
import type { BarrelIndex } from "../schema.ts";
import { guardedBarrels } from "../sw/barrels.ts";
import { mergeBarrels } from "../sw/composition.ts";
import { transformModule } from "../sw/module-transform.ts";
import { packageOf } from "./trace.ts";

export function dependencyBarrels({ target, root }: { target: "node" | "browser"; root: string }): Plugin {
  const resolver = new ResolverFactory({ conditionNames: [target, "import", "default"], mainFields: target === "browser" ? ["browser", "module", "main"] : ["module", "main"], extensions: [".mjs", ".js", ".cjs", ".json"], symlinks: true });
  const loaded = new Set<string>();
  const directories = new Map<string, string>();
  let index: BarrelIndex = { modules: [], barrels: {} };
  const canonical = (path: string) => {
    const pkg = packageOf(path);
    const key = `${pkg.name}@${pkg.version}`;
    directories.set(key, pkg.dir);
    if (!loaded.has(pkg.dir)) {
      loaded.add(pkg.dir);
      const file = join(pkg.dir, "dist/runtime/barrels.json");
      if (existsSync(file)) {
        const manifest = JSON.parse(readFileSync(join(pkg.dir, "package.json"), "utf8")) as { sideEffects?: boolean | string[] };
        index = mergeBarrels([index, guardedBarrels({ index: JSON.parse(readFileSync(file, "utf8")) as BarrelIndex, name: pkg.name, version: pkg.version, ...(manifest.sideEffects === undefined ? {} : { sideEffects: manifest.sideEffects }) })]);
      }
    }
    return `/npm/${key}/${relative(pkg.dir, path).split(sep).join("/")}`;
  };
  const localPath = (url: string) => {
    const match = /^\/npm\/((?:@[^/]+\/)?[^/]+)\/(.+)$/.exec(url);
    const root = match && directories.get(match[1]!);
    if (!match || !root) throw new Error(`Unknown compiled runtime module ${url}`);
    return join(root, match[2]!);
  };
  return {
    name: "dependency-runtime-barrels",
    async buildStart() { await init; },
    resolveId(source) { return source.startsWith("/npm/") ? localPath(source) : null; },
    transform(code, id) {
      const entry = id.startsWith("\0entry:");
      if (!entry && (id.startsWith("\0") || !/\.m?js$/.test(id))) return null;
      const parsed = parseSync(id, code, { lang: "js", sourceType: "unambiguous" });
      if (!parsed.module.hasModuleSyntax) return null;
      const from = entry ? root : dirname(id);
      const url = entry ? "/runtime-entry.js" : canonical(id);
      for (const item of parsed.module.staticImports) {
        const path = resolver.sync(from, item.moduleRequest.value).path;
        if (path) canonical(path);
      }
      return transformModule(code, { url, barrels: index, known: () => false, resolveBare(source) {
        const path = resolver.sync(from, source).path;
        return path ? canonical(path) : null;
      } }).code;
    },
  };
}
