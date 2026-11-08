import type { BarrelIndex, DependencyPolicy, FolderManifest, Fragment, PageLock, RuntimePolicy, RuntimeProfile } from "../schema.ts";
import { BASE_PACKAGES, composeFragments, mergeBarrels, packageName } from "./composition.ts";
import { chooseVersion, satisfiesVersion } from "./versions.ts";
import { validateProfile } from "./profile.ts";
import { guardedBarrels } from "./barrels.ts";
import { digest } from "./integrity.ts";
import { CONVERTED_ENTRY, crawlConvertedPackage } from "./converted.ts";
import type { LibraryLink } from "../link/types.ts";
import { assertLinksAllowed, validateLink } from "../link/validation.ts";
import { composeLinkOverrides } from "../link/overrides.ts";

export type PackageManifest = { name: string; version: string; type?: string; main?: string; module?: string; exports?: unknown; dependencies?: Record<string, string>; peerDependencies?: Record<string, string>; sideEffects?: boolean | string[] };
type Metadata = { versions: Record<string, PackageManifest>; time: Record<string, string> };
export type ResolveOptions = { page: string; profile: RuntimeProfile; manifest: FolderManifest; lock?: PageLock; fetch?: typeof fetch; now?: number; links?: readonly LibraryLink[]; developerOverrides?: boolean };
class CommonJsOnlyError extends Error {}

export async function fetchJson<T>(fetcher: typeof fetch, url: string): Promise<T> {
  const response = await fetcher(url, { credentials: "omit", mode: "cors" });
  if (!response.ok) throw new Error(`fetch ${url}: HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

export function checkPeers(options: { manifest: PackageManifest; versions: Record<string, string>; declaration: string }): void {
  for (const [name, range] of Object.entries(options.manifest.peerDependencies ?? {})) {
    if (!BASE_PACKAGES.includes(name)) continue;
    const chosen = options.versions[name];
    if (!chosen || !satisfiesVersion(chosen, range)) throw new Error(`${options.manifest.name}@${options.manifest.version} peer ${name} ${range} (package.json) rejects ${chosen ?? "missing"} (${options.declaration})`);
  }
}

export function esmEntries(manifest: PackageManifest): Record<string, string> {
  const target = (value: unknown): string | null => {
    if (typeof value === "string") return value;
    if (value === null) return null;
    if (Array.isArray(value)) throw new Error(`${manifest.name}: export arrays are not supported`);
    if (typeof value !== "object") throw new Error(`${manifest.name}: invalid exports target`);
    for (const [condition, item] of Object.entries(value)) if (["browser", "import", "default"].includes(condition)) return target(item);
    return null;
  };
  const entries: Record<string, string> = {};
  if (manifest.exports !== undefined) {
    const subpaths = typeof manifest.exports === "object" && manifest.exports !== null && Object.keys(manifest.exports).some((k) => k.startsWith("."));
    for (const [key, value] of Object.entries(subpaths ? manifest.exports as Record<string, unknown> : { ".": manifest.exports })) {
      const path = target(value);
      if (path) entries[`${manifest.name}${key.slice(1)}`] = path;
    }
  } else if (manifest.module || manifest.type === "module") entries[manifest.name] = manifest.module ?? manifest.main ?? "./index.js";
  else throw new CommonJsOnlyError(`${manifest.name}@${manifest.version} is CommonJS-only; additional packages must ship ESM`);
  if (!Object.keys(entries).length) throw new Error(`${manifest.name}: no browser ESM exports`);
  return entries;
}

/**
 * Node's rule per entry: `.mjs` is ESM, `.cjs` is CommonJS, and `.js` follows the nearest package.json `type`
 * at or above the file (yaml@2 marks its `browser/` build with a nested `{"type":"module"}`). A `module` field or an
 * `import` export condition is the bundler convention that also marks ESM.
 */
export async function assertEsmEntries(options: { manifest: PackageManifest; entries: Record<string, string>; files: ReadonlySet<string>; readType: (dir: string) => Promise<string | undefined> }): Promise<void> {
  const { manifest } = options;
  const bundlerEsm = Boolean(manifest.module) || JSON.stringify(manifest.exports ?? null).includes('"import"');
  const nearestType = async (file: string): Promise<string | undefined> => {
    const dirs = file.split("/").slice(0, -1);
    for (let depth = dirs.length; depth > 0; depth--) {
      const dir = dirs.slice(0, depth).join("/");
      if (options.files.has(`/${dir}/package.json`)) return options.readType(dir);
    }
    return manifest.type;
  };
  for (const path of Object.values(options.entries)) {
    const file = path.replace(/^\.\//, "").split("*")[0]!;
    // JSON and CSS entries (e.g. "./package.json") are served as JSON and stylesheet modules, not judged as scripts.
    if (path.endsWith(".mjs") || /\.(json|css)$/.test(path)) continue;
    if (!path.endsWith(".cjs") && (bundlerEsm || await nearestType(file) === "module")) continue;
    throw new CommonJsOnlyError(`${manifest.name}: ${path} is CommonJS-only; additional packages must ship ESM`);
  }
}

/** A declared package that `policy` rejects; `package` and `policy` let hosts offer a fix. */
export class DependencyPolicyError extends Error {
  constructor(readonly page: string, readonly package_: string, readonly policy: DependencyPolicy) {
    super(`${page}: package ${package_} is not allowed by dependency policy ${policy}`);
  }
}

export function allowsDependency(policy: RuntimePolicy, name: string): boolean {
  return policy.dependencies === "any" || (policy.allow ?? []).some((pattern) => new RegExp(`^${pattern.split("*").map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`).test(name));
}

export async function resolvePage(options: ResolveOptions): Promise<PageLock> {
  const profile = validateProfile(options.profile);
  const links = [...(options.links ?? [])];
  if (links.length) {
    assertLinksAllowed({ profile, developerOverrides: options.developerOverrides === true });
    for (const link of links) validateLink(link);
    if (new Set(links.map(link => link.build.library)).size !== links.length) throw new Error("Duplicate local package overrides");
  }
  if (options.lock) {
    if (options.lock.lock !== 2 || options.lock.page !== options.page) throw new Error(`${options.page}: lock does not match page`);
    return options.lock;
  }
  const fetcher = options.fetch ?? fetch; const now = options.now ?? Date.now();
  const requests = { ...profile.managed, ...profile.dependencies, ...options.manifest.dependencies, ...options.manifest.pageRuntime?.pages?.[options.page] };
  const versions: Record<string, string> = {}; const manifests: PackageManifest[] = []; const fragments: Fragment[] = []; const indices: BarrelIndex[] = [];
  for (const name of ["@flanksource/clicky-ui", "@flanksource/facet"]) {
    if (!requests[name]) throw new Error(`${options.page}: missing managed range for ${name}`);
    const local = links.find(link => link.build.library === name);
    if (local) {
      versions[name] = local.build.version;
      manifests.push({ name, version: local.build.version, ...local.build.package });
      fragments.push(local.build.fragment); indices.push(local.build.barrels);
      continue;
    }
    const metadata = await fetchJson<Metadata>(fetcher, `${profile.registry.replace(/\/$/, "")}/${encodeURIComponent(name)}`);
    const chosen = chooseVersion({ name, range: requests[name], times: metadata.time, ageDays: profile.minReleaseAgeDays, now });
    const manifest = metadata.versions[chosen];
    if (!manifest) throw new Error(`${name}: metadata missing ${chosen}`);
    versions[name] = chosen; manifests.push(manifest);
    fragments.push(await fetchJson<Fragment>(fetcher, `${profile.packageOrigin.replace(/\/$/, "")}/${name}@${chosen}/dist/runtime/importmap.json`));
    const index = await fetchJson<BarrelIndex>(fetcher, `${profile.packageOrigin.replace(/\/$/, "")}/${name}@${chosen}/dist/runtime/barrels.json`);
    indices.push(guardedBarrels({ index, name, version: chosen, ...(manifest.sideEffects !== undefined ? { sideEffects: manifest.sideEffects } : {}) }));
  }
  const composed = composeFragments({ fragments });
  for (const name of BASE_PACKAGES) {
    const mapped = composed.map.imports[name];
    const found = mapped?.match(new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}@([^/]+)/`));
    if (found?.[1]) versions[name] = found[1];
  }
  const facet = manifests[1]!;
  const facetRange = facet.dependencies?.["@flanksource/clicky-ui"] ?? facet.peerDependencies?.["@flanksource/clicky-ui"];
  if (!facetRange || !satisfiesVersion(versions["@flanksource/clicky-ui"]!, facetRange)) throw new Error(`${facet.name}@${facet.version} declares @flanksource/clicky-ui ${facetRange ?? "missing"} (package.json), rejects ${versions["@flanksource/clicky-ui"]} (folder/page override)`);
  const additional = Object.entries(requests).filter(([name]) => !Object.hasOwn(profile.managed, name) && !manifests.some((m) => m.name === name) && !links.some(link => link.build.library === name));
  const listings: Record<string, string> = {};
  for (const [name, range] of additional) {
    if (BASE_PACKAGES.includes(name)) throw new Error(`${options.page}: ${name} is part of the shared runtime set and cannot be declared as a dependency`);
    if (!allowsDependency(profile.policy, name)) throw new DependencyPolicyError(options.page, name, profile.policy.dependencies);
    const imports = await addEsmPackage({ name, range, profile, now, fetcher, versions, composed, listings, visiting: new Set(), links });
    Object.assign(composed.map.imports, imports);
  }
  const lock: PageLock = { lock: 2, packageOrigin: profile.packageOrigin, page: options.page, versions, ...composed, barrels: mergeBarrels(indices), ...(additional.length ? { listings } : {}) };
  for (const link of links) checkPeers({ manifest: { name: link.build.library, version: link.build.version, ...link.build.package }, versions, declaration: "local checkout" });
  return links.length ? composeLinkOverrides({ lock, links, profile, developerOverrides: true }) : lock;
}

type AdditionalOptions = { name: string; range: string; profile: RuntimeProfile; now: number; fetcher: typeof fetch; versions: Record<string, string>; composed: ReturnType<typeof composeFragments>; listings: Record<string, string>; visiting: Set<string>; links: LibraryLink[] };

async function addEsmPackage(options: AdditionalOptions): Promise<Record<string, string>> {
  const { name, range, profile, fetcher, versions, composed, now } = options;
  const local = options.links.find(link => link.build.library === name);
  if (local) {
    versions[name] = local.build.version;
    return Object.fromEntries(Object.entries(local.build.entries).map(([specifier, path]) => [specifier, `/link/${local.id}/${path}`]));
  }
  const metadata = await fetchJson<Metadata>(fetcher, `${profile.registry.replace(/\/$/, "")}/${encodeURIComponent(name)}`);
  const chosen = chooseVersion({ name, range, times: metadata.time, ageDays: profile.minReleaseAgeDays, now });
  const manifest = metadata.versions[chosen];
  if (!manifest) throw new Error(`${name}: missing manifest ${chosen}`);
  const root = `${name}@${chosen}`;
  const origin = `${profile.packageOrigin.replace(/\/$/, "")}/${root}`;
  const convertOrThrow = (error: unknown) => {
    if (!(error instanceof CommonJsOnlyError) || !profile.convert) throw error;
    checkPeers({ manifest, versions, declaration: "composed base set" });
    return addConvertedPackage({ ...options, manifest });
  };
  let entries: Record<string, string>;
  try { entries = esmEntries(manifest); }
  catch (error) { return convertOrThrow(error); }
  checkPeers({ manifest, versions, declaration: "composed base set" });
  const listing = await fetchJson<{ files: Array<{ path: string; integrity: string }> }>(fetcher, `${origin}/?meta`);
  try { await assertEsmEntries({ manifest, entries, files: new Set(listing.files.map(file => file.path)), readType: async dir => (await fetchJson<{ type?: string }>(fetcher, `${origin}/${dir}/package.json`)).type }); }
  catch (error) { return convertOrThrow(error); }
  options.listings[root] = await digest(new TextEncoder().encode(JSON.stringify(listing)));
  for (const file of listing.files) {
    if (!file.integrity) throw new Error(`${root}${file.path}: file listing has no integrity`);
    composed.integrity[`${root}/${file.path.replace(/^\//, "")}`] = file.integrity;
  }
  const paths = Object.keys(composed.integrity).filter((p) => p.startsWith(`${root}/`));
  const imports: Record<string, string> = {};
  for (const [specifier, path] of Object.entries(entries)) {
    if (specifier.includes("*")) {
      const [prefix, suffix = ""] = path.replace(/^\.\//, "").split("*");
      for (const file of paths) {
        const relative = file.slice(root.length + 1);
        if (relative.startsWith(prefix!) && relative.endsWith(suffix)) imports[specifier.replace("*", relative.slice(prefix!.length, relative.length - suffix.length))] = `/npm/${file}`;
      }
    } else imports[specifier] = `/npm/${root}/${path.replace(/^\.\//, "")}`;
  }
  // Without an exports field every file is importable (icon sets import "<pkg>/<icon>"); the compiler finishes extensionless targets against the listing.
  if (manifest.exports === undefined) imports[`${name}/`] = `/npm/${root}/`;
  return addPackageDependencies({ ...options, manifest, imports, prefix: `/npm/${root}/` });
}

async function addConvertedPackage(options: AdditionalOptions & { manifest: PackageManifest }): Promise<Record<string, string>> {
  const { manifest, profile, composed, visiting } = options;
  const root = `${manifest.name}@${manifest.version}`;
  const imports = { [manifest.name]: `/esm/${root}/${CONVERTED_ENTRY}` };
  if (!profile.convert) throw new Error(`${root}: converter is not configured`);
  if (!visiting.has(root) && !Object.hasOwn(options.listings, `esm/${root}`)) {
    const result = await crawlConvertedPackage({ origin: profile.convert.origin, root, fetcher: options.fetcher });
    Object.assign(composed.integrity, result.integrity);
    options.listings[`esm/${root}`] = result.listing;
  }
  return addPackageDependencies({ ...options, imports, prefix: `/esm/${root}/` });
}

async function addPackageDependencies(options: AdditionalOptions & { manifest: PackageManifest; imports: Record<string, string>; prefix: string }): Promise<Record<string, string>> {
  const { manifest, versions, composed, visiting, imports } = options;
  const root = `${manifest.name}@${manifest.version}`;
  if (visiting.has(root)) return imports;
  visiting.add(root);
  const scope = composed.map.scopes[options.prefix] ??= {};
  Object.assign(scope, imports);
  for (const [dependency, dependencyRange] of Object.entries(manifest.dependencies ?? {})) {
    if (BASE_PACKAGES.includes(packageName(dependency))) {
      if (!composed.map.imports[dependency]) throw new Error(`${root}: unmapped base-set dependency ${dependency}`);
      if (!satisfiesVersion(versions[dependency]!, dependencyRange)) throw new Error(`${root}: dependency ${dependency} ${dependencyRange} rejects base-set ${versions[dependency]}`);
    } else Object.assign(scope, await addEsmPackage({ ...options, name: dependency, range: dependencyRange }));
  }
  if (!versions[manifest.name]) versions[manifest.name] = manifest.version;
  return imports;
}
