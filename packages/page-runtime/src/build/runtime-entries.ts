import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BASE_ENTRIES } from "./base.ts";

export function runtimeEntries(options: { root: string; libraries: string[] }): string[] {
  return [...new Set([...BASE_ENTRIES, ...options.libraries.flatMap(name => {
    const fragment = JSON.parse(readFileSync(join(options.root, "node_modules", name, "dist/runtime/importmap.json"), "utf8")) as { imports: Record<string, string> };
    return Object.entries(fragment.imports).filter(([, path]) => /\.m?js$/.test(path)).map(([source]) => source);
  })])];
}
