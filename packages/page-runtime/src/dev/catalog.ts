import { createHash } from "node:crypto";
import { watchFile, unwatchFile } from "node:fs";
import { readFile, realpath } from "node:fs/promises";
import { resolve } from "node:path";
import { atomicJson, publicationRoot, readPublication, type PackageCatalog, type Publication } from "../publication/index.ts";
import { readManifest, type PackageManifest } from "../publication/manifest.ts";
import { BUILD_ID, validateCatalog } from "../publication/schema.ts";

export type LocalPackage = { directory: string; manifest: PackageManifest };
type Catalog = { catalog: PackageCatalog; locals: Map<string, LocalPackage> };
export async function createCatalogStore(options: { packages: string[]; stateDir: string }) {
  const listeners = new Set<(catalog: PackageCatalog) => void>();
  const retained = new Map<string, Catalog>();
  const directories = new Map<string, string>();
  for (const path of options.packages) {
    const publication = await readPublication(path);
    if (directories.has(publication.name)) throw new Error(`Duplicate local package: ${publication.name}`);
    directories.set(publication.name, path);
  }
  let current: Catalog;
  let failure: Error | undefined;
  const load = async () => {
    const entries = await Promise.all([...directories].sort(([a], [b]) => a.localeCompare(b)).map(async ([name, path]) => {
      const publication = await readPublication(path);
      if (publication.name !== name) throw new Error(`${path}: package identity changed; restart the local origin`);
      return publication;
    }));
    const packages = Object.fromEntries(entries.map(({ name, version, build }) => [name, { name, version, build }]));
    const revision = createHash("sha256").update(JSON.stringify(packages)).digest("hex");
    if (current?.catalog.revision === revision) { failure = undefined; return; }
    const catalog = { revision, packages };
    const locals = await localPackages(entries);
    await atomicJson(resolve(options.stateDir, `${revision}.json`), catalog);
    current = { catalog, locals }; failure = undefined;
    retained.set(revision, current);
    listeners.forEach(listener => listener(catalog));
  };
  await load();
  let queue = Promise.resolve();
  const refresh = () => { queue = queue.then(load).catch(error => { failure = error instanceof Error ? error : new Error(String(error)); }); };
  const watchers = options.packages.map(path => {
    const file = resolve(publicationRoot(path), "current.json");
    const listener = () => refresh();
    watchFile(file, { interval: 250, persistent: false }, listener);
    return () => unwatchFile(file, listener);
  });
  // Catch a publication completed between the initial read and watcher setup.
  refresh();
  return {
    current(): PackageCatalog { if (failure) throw failure; return current.catalog; },
    async get(revision?: string): Promise<Catalog> {
      if (!revision) { if (failure) throw failure; return current; }
      if (!BUILD_ID.test(revision)) throw new Error("Invalid package catalog revision");
      const known = retained.get(revision);
      if (known) return known;
      const catalog = validateCatalog(JSON.parse(await readFile(resolve(options.stateDir, `${revision}.json`), "utf8")));
      if (catalog.revision !== revision || createHash("sha256").update(JSON.stringify(catalog.packages)).digest("hex") !== revision) throw new Error("Package catalog integrity mismatch");
      const entries = Object.values(catalog.packages).map(entry => {
        const path = directories.get(entry.name);
        if (!path) throw new Error(`Unconfigured catalog package: ${entry.name}`);
        return { ...entry, directory: resolve(publicationRoot(path), "generations", entry.build, "package") };
      });
      const loaded = { catalog, locals: await localPackages(entries) };
      retained.set(revision, loaded);
      return loaded;
    },
    subscribe(listener: (catalog: PackageCatalog) => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    close() { watchers.forEach(close => close()); listeners.clear(); },
  };
}

async function localPackages(entries: Publication[]): Promise<Map<string, LocalPackage>> {
  return new Map(await Promise.all(entries.map(async entry => {
    const directory = await realpath(entry.directory);
    const manifest = await readManifest(directory);
    if (manifest.name !== entry.name || manifest.version !== entry.version) throw new Error(`Package snapshot identity mismatch: ${entry.name}`);
    return [entry.name, { directory, manifest }] as const;
  })));
}
