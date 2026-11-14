import { readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { buildBarrelIndex, shapeOf } from "./barrels.ts";
import { sideEffectsRule } from "../sw/barrels.ts";
import { moduleFormat, packageOf } from "./trace.ts";

export function dependencyBarrelIndex(options: {
  path: string;
  canonical: (path: string) => string;
  resolve: (from: string, source: string) => string | undefined;
}) {
  const paths = new Map<string, string>();
  const rules = new Map<string, (path: string) => boolean>();
  const canonical = (path: string) => {
    const url = options.canonical(path).slice("/npm/".length);
    paths.set(url, path);
    return url;
  };
  const pathOf = (url: string) => {
    const path = paths.get(url);
    if (!path) throw new Error(`Unknown dependency barrel module ${url}`);
    return path;
  };
  return buildBarrelIndex({
    urls: [canonical(options.path)],
    shape(url) {
      const path = pathOf(url);
      if (!/\.m?js$/.test(path)) return null;
      const module = moduleFormat(path);
      return module.format === "esm" ? shapeOf(module.module) : null;
    },
    resolve(url, source) {
      const path = options.resolve(dirname(pathOf(url)), source);
      return path ? canonical(path) : null;
    },
    sideEffectFree(url) {
      const path = pathOf(url);
      const pkg = packageOf(path);
      let rule = rules.get(pkg.dir);
      if (!rule) {
        const manifest = JSON.parse(readFileSync(join(pkg.dir, "package.json"), "utf8")) as { sideEffects?: unknown };
        rule = sideEffectsRule(manifest.sideEffects, pkg.name);
        rules.set(pkg.dir, rule);
      }
      return rule(relative(pkg.dir, path).replaceAll("\\", "/"));
    },
  }).index;
}
