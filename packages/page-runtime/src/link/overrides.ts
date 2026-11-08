import type { Fragment, RuntimeProfile } from "../schema.ts";
import { BASE_PACKAGES, composeFragments, mergeBarrels, packageName } from "../sw/composition.ts";
import type { LibraryLink } from "./types.ts";
import { assertLinksAllowed, linkUrl, validateLink } from "./validation.ts";
import { mapBarrels } from "./barrels.ts";
import { validatePageSources, type PageSourceLock } from "./page-sources.ts";
import { validateCompilerPlugins } from "../sw/compiler-plugins.ts";

export function mountLinkTarget(link: LibraryLink, target: string): string {
  const path = target.replace(/^\/npm\//, "");
  const prefix = `${link.build.library}@${link.build.version}/`;
  if (path === prefix.slice(0, -1)) return `/link/${link.id}`;
  if (path.startsWith(prefix)) return linkUrl(link.id, path.slice(prefix.length));
  return target.startsWith("/") ? target : `/npm/${path}`;
}

export function composeLinkOverrides(options: { lock: PageSourceLock; links: LibraryLink[]; profile: Pick<RuntimeProfile, "links">; developerOverrides: boolean }): PageSourceLock {
  assertLinksAllowed(options);
  const links = [...options.links].sort((a, b) => Number(b.build.library === "@flanksource/clicky-ui") - Number(a.build.library === "@flanksource/clicky-ui"));
  const names = new Set<string>();
  const ids = new Set<string>();
  for (const link of links) {
    validateLink(link);
    if (names.has(link.build.library) || ids.has(link.id)) throw new Error(`Duplicate linked library or id ${link.build.library}: ${link.id}`);
    names.add(link.build.library);
    ids.add(link.id);
  }
  const lock = structuredClone(options.lock);
  const pageSources = [...(lock.pageSources ?? []).filter((root) => !ids.has(root.link)), ...links.flatMap((link) => (link.build.pageSources ?? []).map((root) => ({ ...root, link: link.id })))];
  if (pageSources.length) { validatePageSources(pageSources); lock.pageSources = pageSources; }
  const linkedBase = links.find((link) => link.build.library === "@flanksource/clicky-ui");
  const inheritedBase: Fragment = { fragment: 1, name: "@flanksource/clicky-ui", imports: Object.fromEntries(Object.entries(lock.map.imports).map(([name, target]) => [name, target.replace(/^\/npm\//, "")])), scopes: {}, remaps: {}, integrity: {}, inherits: [], aliases: {} };
  if (linkedBase) {
    const base = composeFragments({ fragments: [linkedBase.build.fragment] }).map.imports;
    for (const specifier of Object.keys(lock.map.imports).filter((name) => BASE_PACKAGES.includes(packageName(name)))) {
      if (!base[specifier]) throw new Error(`Linked base set is missing ${specifier}`);
      for (const table of Object.values(lock.map.scopes)) {
        if (table[specifier] && table[specifier] !== lock.map.imports[specifier]) throw new Error(`Scope remaps base-set ${specifier}`);
        delete table[specifier];
      }
      delete lock.map.imports[specifier];
    }
  }
  for (const link of links) {
    const base = linkedBase?.build.fragment ?? inheritedBase;
    const composed = composeFragments({ fragments: link === linkedBase ? [link.build.fragment] : [base, link.build.fragment] });
    const mount = (target: string) => mountLinkTarget(links.find((candidate) => target.startsWith(`/npm/${candidate.build.library}@${candidate.build.version}/`) || target === `/npm/${candidate.build.library}@${candidate.build.version}`) ?? link, target);
    for (const key of Object.keys(lock.map.imports)) if (key === link.build.library || key.startsWith(`${link.build.library}/`)) delete lock.map.imports[key];
    for (const scope of Object.keys(lock.map.scopes)) if (scope.startsWith(`/npm/${link.build.library}@`)) delete lock.map.scopes[scope];
    for (const [name, target] of Object.entries(composed.map.imports)) {
      const owner = linkedBase && target.startsWith(`/npm/${linkedBase.build.library}@`) ? linkedBase : link;
      if (BASE_PACKAGES.includes(packageName(name)) && !linkedBase && lock.map.imports[name] !== target) throw new Error(`${link.build.library}: remaps base-set ${name}`);
      lock.map.imports[name] = mountLinkTarget(owner, target);
    }
    for (const [scope, table] of Object.entries(composed.map.scopes)) lock.map.scopes[mount(scope.slice(0, -1)) + "/"] = Object.fromEntries(Object.entries(table).map(([name, target]) => [name, mount(target)]));
    for (const [name, path] of Object.entries(link.build.entries)) lock.map.imports[name] = linkUrl(link.id, path);
    Object.assign(lock.integrity, composed.integrity);
    Object.assign(lock.remaps, composed.remaps);
    lock.versions[link.build.library] = link.build.version;
    if (link.build.fragment.compiler) lock.compiler = { ...lock.compiler, [link.build.library]: validateCompilerPlugins(link.build.fragment.compiler, { library: link.build.library, path: `${link.build.library} checkout fragment compiler` }) };
    else if (lock.compiler?.[link.build.library]) lock.compiler = Object.fromEntries(Object.entries(lock.compiler).filter(([library]) => library !== link.build.library));
    lock.barrels = mergeBarrels([lock.barrels, mapBarrels({ index: link.build.barrels, map: (path) => path.startsWith("/npm/") ? mount(path) : linkUrl(link.id, path) })]);
  }
  return lock;
}

export function linksInLock(lock: PageSourceLock): string[] {
  return [...new Set([...(lock.pageSources ?? []).map((root) => root.link), ...[Object.keys(lock.map.scopes), Object.values(lock.map.imports), ...Object.values(lock.map.scopes).map(Object.values)].flat().flatMap((target) => /^\/link\/([^/]+)\//.exec(target)?.[1] ?? [])])];
}
