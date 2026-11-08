import type { Fragment, ImportMap, PageLock, BarrelIndex } from "../schema.ts";

export const BASE_PACKAGES = ["react", "react-dom", "scheduler", "@tanstack/react-query", "jotai"];
export const packageName = (specifier: string): string => specifier.startsWith("@") ? specifier.split("/").slice(0, 2).join("/") : specifier.split("/")[0]!;
const base = (specifier: string) => BASE_PACKAGES.includes(packageName(specifier));

function lookup(table: Record<string, string>, specifier: string): string | null {
  if (Object.hasOwn(table, specifier)) return table[specifier]!;
  const key = Object.keys(table).filter((k) => k.endsWith("/") && specifier.startsWith(k)).sort((a, b) => b.length - a.length)[0];
  return key ? `${table[key]}${specifier.slice(key.length)}` : null;
}

export function resolveSpecifier(map: ImportMap, specifier: string, referrer: string): string | null {
  for (const scope of Object.keys(map.scopes).filter((s) => referrer.startsWith(s)).sort((a, b) => b.length - a.length)) {
    const found = lookup(map.scopes[scope]!, specifier);
    if (found) return found;
  }
  return lookup(map.imports, specifier);
}

function assign(table: Record<string, string>, key: string, value: string, context: string): void {
  if (table[key] && table[key] !== value) throw new Error(`${context}: remaps ${key}: ${table[key]} versus ${value}`);
  table[key] = value;
}

export function composeFragments(options: { fragments: Fragment[] }): Pick<PageLock, "map" | "integrity" | "remaps"> {
  const map: ImportMap = { imports: {}, scopes: {} }; const integrity: Record<string, string> = {}; const remaps: Record<string, string> = {};
  const url = (s: string) => `/npm/${s}`;
  for (const fragment of options.fragments) {
    const owned = (s: string) => s === fragment.name || s.startsWith(`${fragment.name}/`);
    for (const [specifier, target] of Object.entries(fragment.imports)) {
      if (base(specifier)) {
        if (fragment.name !== "@flanksource/clicky-ui" && map.imports[specifier] !== url(target)) throw new Error(`${fragment.name}: remaps base-set ${specifier} from ${map.imports[specifier]} to ${url(target)}`);
        assign(map.imports, specifier, url(target), fragment.name);
      } else if (owned(specifier)) assign(map.imports, specifier, url(target), fragment.name);
    }
    for (const [scope, table] of Object.entries(fragment.scopes)) {
      const scoped = map.scopes[url(scope)] ??= {};
      for (const [specifier, target] of Object.entries({ ...fragment.imports, ...table })) {
        if (base(specifier)) {
          if (map.imports[specifier] !== url(target)) throw new Error(`${fragment.name} scope ${scope}: remaps base-set ${specifier}`);
        } else assign(scoped, specifier, url(target), `${fragment.name} scope ${scope}`);
      }
    }
    for (const [alias, prefix] of Object.entries(fragment.aliases)) for (const [specifier, target] of Object.entries(map.imports)) {
      if (specifier === prefix || specifier.startsWith(`${prefix}/`)) assign(map.imports, `${alias}${specifier.slice(prefix.length)}`, target, fragment.name);
    }
    for (const [from, to] of Object.entries(fragment.remaps)) {
      assign(remaps, from, to, fragment.name);
      assign(map.imports, url(from), url(to), fragment.name);
    }
    for (const [file, digest] of Object.entries(fragment.integrity)) assign(integrity, file, digest, fragment.name);
  }
  for (const fragment of options.fragments) for (const specifier of fragment.inherits) if (!lookup(map.imports, specifier)) throw new Error(`${fragment.name}: inherited ${specifier} has no base-set mapping`);
  return { map, integrity, remaps };
}

// Libraries that share a dependency version both index its barrels; identical indices coalesce, divergent ones fail.
export function mergeBarrels(indices: BarrelIndex[]): BarrelIndex {
  const result: BarrelIndex = { modules: [], barrels: {} };
  const positions = new Map<string, number>();
  const position = (module: string) => {
    const existing = positions.get(module);
    if (existing !== undefined) return existing;
    positions.set(module, result.modules.push(module) - 1);
    return result.modules.length - 1;
  };
  const describe = (entries: BarrelIndex["barrels"][string], modules: string[]) =>
    JSON.stringify(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)).map(([name, at]) => [name, typeof at === "number" ? modules[at] : [modules[at[0]], at[1]]]));
  for (const index of indices) {
    for (const [path, entries] of Object.entries(index.barrels)) {
      const remapped = Object.fromEntries(Object.entries(entries).map(([name, at]): [string, number | [number, string]] => {
        const module = index.modules[typeof at === "number" ? at : at[0]];
        if (module === undefined) throw new Error(`barrel ${path}: ${name} points outside its module list`);
        return [name, typeof at === "number" ? position(module) : [position(module), at[1]]];
      }));
      const existing = result.barrels[path];
      if (existing && describe(existing, result.modules) !== describe(remapped, result.modules)) throw new Error(`barrel ${path} is indexed differently by two libraries`);
      result.barrels[path] = remapped;
    }
  }
  return result;
}
