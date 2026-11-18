import type { BarrelIndex } from "../schema.ts";

export function mapBarrels(options: { index: BarrelIndex; map: (path: string) => string }): BarrelIndex {
  return { modules: options.index.modules.map(options.map), barrels: Object.fromEntries(Object.entries(options.index.barrels).map(([path, entries]) => [options.map(path), entries])) };
}
