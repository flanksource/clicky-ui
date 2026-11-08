import type { BarrelIndex } from "../schema.ts";

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

export function guardedBarrels(options: { index: BarrelIndex; name: string; version: string; sideEffects?: boolean | string[] }): BarrelIndex {
  const root = `${options.name}@${options.version}/`;
  const free = sideEffectsRule(options.sideEffects, root);
  return { modules: options.index.modules, barrels: Object.fromEntries(Object.entries(options.index.barrels).filter(([url]) => !url.startsWith(root) || free(url.slice(root.length)))) };
}
