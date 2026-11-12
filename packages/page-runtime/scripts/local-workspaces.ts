import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import type { Plugin } from "rolldown";

const packageName = (specifier: string) => specifier.startsWith("@") ? specifier.split("/").slice(0, 2).join("/") : specifier.split("/")[0]!;

function manifestName(dir: string): string | undefined {
  const file = join(dir, "package.json");
  if (!existsSync(file)) return undefined;
  return (JSON.parse(readFileSync(file, "utf8")) as { name?: string }).name;
}

function workspaceDirs(checkout: string): string[] {
  const packages = join(checkout, "packages");
  const nested = existsSync(packages) && statSync(packages).isDirectory() ? readdirSync(packages).map(name => join(packages, name)) : [];
  return [checkout, ...nested];
}

/**
 * Finds sibling checkouts of `workspaceRoot` (and their `packages/*`) that declare one of `names`. When several
 * checkouts declare a package (worktrees), the directory named after the package wins; otherwise it fails loudly.
 */
export function findLocalWorkspaces(options: { workspaceRoot: string; names: string[] }): Map<string, string> {
  const wanted = new Set(options.names);
  const found = new Map<string, string[]>();
  for (const entry of readdirSync(dirname(options.workspaceRoot))) {
    const checkout = join(dirname(options.workspaceRoot), entry);
    // existsSync is false for a dangling symlink, which is not a checkout.
    if (checkout === options.workspaceRoot || !existsSync(checkout) || !statSync(checkout).isDirectory()) continue;
    for (const dir of workspaceDirs(checkout)) {
      const name = manifestName(dir);
      if (name && wanted.has(name)) found.set(name, [...(found.get(name) ?? []), dir]);
    }
  }
  return new Map([...found].map(([name, dirs]) => {
    if (dirs.length === 1) return [name, dirs[0]!];
    const canonical = dirs.filter(dir => basename(dir) === name.split("/").at(-1));
    if (canonical.length !== 1) throw new Error(`${name}: several local checkouts declare it (${dirs.join(", ")}); keep one named ${name.split("/").at(-1)}`);
    return [name, canonical[0]!];
  }));
}

/** Resolves imports of each local package from its checkout, through the checkout's own package.json exports. */
export function localWorkspacesPlugin(workspaces: Map<string, string>): Plugin {
  return {
    name: "page-runtime-local-workspaces",
    async resolveId(id, _importer, extra) {
      const dir = id.startsWith(".") || id.startsWith("/") ? undefined : workspaces.get(packageName(id));
      if (!dir) return null;
      const resolved = await this.resolve(id, join(dir, "package.json"), { ...extra, skipSelf: true });
      if (!resolved) throw new Error(`${id}: not exported by the local checkout ${dir}`);
      return resolved;
    },
  };
}
