import type { RuntimeExports } from "../schema.ts";
import { packageName, type composeFragments } from "./composition.ts";
import { record, validateDependencies } from "./profile.ts";

function packagePath(path: string): boolean {
  return /^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+@[a-z0-9.+_-]+\//i.test(path)
    && !/[\\?#%\s]/.test(path) && !path.split("/").some(part => part === "." || part === "..");
}

export function applyRuntimeExports(value: unknown, composed: ReturnType<typeof composeFragments>, versions: Record<string, string>): RuntimeExports["versions"] {
  const catalog = record(value, "runtime exports");
  const exported = validateDependencies(catalog.versions, "runtime exports versions");
  for (const [path, integrity] of Object.entries(record(catalog.integrity, "runtime exports integrity"))) {
    if (!packagePath(path) || typeof integrity !== "string" || !/^sha384-[A-Za-z\d+/]{64}$/.test(integrity)) throw new Error(`Invalid runtime export integrity for ${path}`);
    if (composed.integrity[path] && composed.integrity[path] !== integrity) throw new Error(`Conflicting runtime export integrity for ${path}`);
    composed.integrity[path] = integrity;
  }
  const url = (target: unknown) => {
    if (typeof target !== "string" || !Object.hasOwn(composed.integrity, target)) throw new Error(`Runtime export target ${String(target)} has no integrity`);
    return `/npm/${target}`;
  };
  for (const [name, target] of Object.entries(record(catalog.imports, "runtime exports imports"))) {
    if (!Object.hasOwn(exported, packageName(name))) throw new Error(`Runtime export ${name} has no version`);
    composed.map.imports[name] ??= url(target);
  }
  for (const [scope, value] of Object.entries(record(catalog.scopes, "runtime exports scopes"))) {
    if (!packagePath(scope) || !scope.endsWith("/")) throw new Error(`Invalid runtime export scope ${scope}`);
    const table = composed.map.scopes[`/npm/${scope}`] ??= {};
    for (const [name, target] of Object.entries(record(value, scope))) table[name] ??= url(target);
  }
  for (const [path, target] of Object.entries(record(catalog.remaps, "runtime exports remaps"))) {
    if (!packagePath(path) || typeof target !== "string") throw new Error(`Invalid runtime export remap ${path}`);
    if (Object.hasOwn(composed.remaps, path)) continue;
    composed.map.imports[`/npm/${path}`] = url(target);
    composed.remaps[path] = target;
  }
  for (const [name, version] of Object.entries(exported)) versions[name] ??= version;
  return exported;
}
