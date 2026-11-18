import { readFileSync } from "node:fs";
import { join } from "node:path";
import { packageName, packageOf } from "./trace.ts";
import { specifierKind } from "./module-utils.ts";

export function optionalDependency(options: { source: string; importer: string }): boolean {
  if (specifierKind(options.source) !== "bare" || options.importer.startsWith("\0")) return false;
  const pkg = packageOf(options.importer);
  const manifest = JSON.parse(readFileSync(join(pkg.dir, "package.json"), "utf8")) as {
    optionalDependencies?: Record<string, string>;
    peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  };
  const name = packageName(options.source);
  return Object.hasOwn(manifest.optionalDependencies ?? {}, name) || manifest.peerDependenciesMeta?.[name]?.optional === true;
}
