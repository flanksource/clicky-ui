import type { Fragment, ImportMap } from "../schema.ts";
import type { ClosureTracer, Failure } from "./trace.ts";

function sorted<T>(record: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)));
}

export function fragmentOf(tracer: ClosureTracer, aliases: Record<string, string> = {}): Fragment {
  return {
    fragment: 1,
    name: tracer.spec.name,
    imports: sorted(tracer.imports),
    scopes: sorted(Object.fromEntries(Object.entries(tracer.scopes).map(([key, table]) => [key, sorted(table)]))),
    remaps: sorted(tracer.remaps),
    aliases,
    inherits: [...tracer.inherited.keys()].sort(),
    integrity: sorted(Object.fromEntries([...tracer.files.values()].map((file) => [file.url, file.integrity]))),
  };
}

function lookup(table: Record<string, string>, specifier: string): string | null {
  const exact = table[specifier];
  if (exact) return exact;
  let best: string | null = null;
  for (const key of Object.keys(table)) {
    if (key.endsWith("/") && specifier.startsWith(key) && (!best || key.length > best.length)) best = key;
  }
  return best ? `${table[best]}${specifier.slice(best.length)}` : null;
}

/** Resolves a bare specifier the way a browser applies an import map: most specific scope first, then the top level. */
export function resolveSpecifier(map: ImportMap, specifier: string, referrer: string): string | null {
  const scopes = Object.keys(map.scopes)
    .filter((scope) => referrer.startsWith(scope))
    .sort((a, b) => b.length - a.length);
  for (const scope of scopes) {
    const table = map.scopes[scope];
    const resolved = table ? lookup(table, specifier) : null;
    if (resolved) return resolved;
  }
  return lookup(map.imports, specifier);
}

/**
 * Composes fragments into one page import map. Fragments are applied in order; a later fragment
 * remapping a specifier or a scope entry is an error, and so is an inherited specifier nobody maps.
 */
export function composeImportMap(fragments: Fragment[], base: string): { map: ImportMap; failures: Failure[] } {
  const failures: Failure[] = [];
  const url = (value: string) => `${base}${value}`;
  const map: ImportMap = { imports: {}, scopes: {} };
  for (const fragment of fragments) {
    const owned: string[] = [];
    for (const [specifier, target] of Object.entries(fragment.imports)) {
      const existing = map.imports[specifier];
      if (existing && existing !== url(target)) failures.push({ name: fragment.name, detail: `remaps ${specifier}: ${existing} → ${url(target)}` });
      else map.imports[specifier] = url(target);
      owned.push(specifier);
    }
    for (const [from, to] of Object.entries(fragment.remaps)) {
      const existing = map.imports[url(from)];
      if (existing && existing !== url(to)) failures.push({ name: fragment.name, detail: `remaps ${from} twice: ${existing} and ${url(to)}` });
      else map.imports[url(from)] = url(to);
    }
    for (const [alias, prefix] of Object.entries(fragment.aliases)) {
      for (const specifier of owned) {
        if (specifier !== prefix && !specifier.startsWith(`${prefix}/`)) continue;
        const target = map.imports[specifier];
        if (target) map.imports[`${alias}${specifier.slice(prefix.length)}`] = target;
      }
    }
    for (const [scope, table] of Object.entries(fragment.scopes)) {
      const merged = (map.scopes[url(scope)] ??= {});
      for (const [specifier, target] of Object.entries(table)) {
        const existing = merged[specifier];
        if (existing && existing !== url(target)) {
          failures.push({ name: fragment.name, detail: `scope ${scope} maps ${specifier} to both ${existing} and ${url(target)}` });
        } else merged[specifier] = url(target);
      }
    }
  }
  for (const fragment of fragments) {
    for (const specifier of fragment.inherits) {
      if (!lookup(map.imports, specifier)) failures.push({ name: fragment.name, detail: `imports ${specifier}, which no fragment maps at the top level` });
    }
  }
  return { map, failures };
}
