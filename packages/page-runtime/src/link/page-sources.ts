import type { PageLock } from "../schema.ts";
import { validateSourcePath } from "../host/validation.ts";
import { isPageSource } from "../host/agent-source.ts";
import type { LibraryLink } from "./types.ts";
import { linkUrl } from "./validation.ts";

export type PageSourceRoot = { link: string; root: string; prefix: string; editable: boolean };
export type PageSourceLock = PageLock & { pageSources?: PageSourceRoot[] };
export type PageSourceContext = { pageSources?: PageSourceRoot[] };

export function isPageModule(options: { path: string; lock: PageSourceContext }): boolean {
  if (options.path.startsWith("/src/")) return true;
  const link = /^\/link\/([^/]+)\//.exec(options.path)?.[1];
  return link !== undefined && (options.lock.pageSources ?? []).some((root) => root.link === link);
}

export function pageSourceModule(options: { page: string; roots: PageSourceRoot[] }): string | undefined {
  path(options.page); validatePageSources(options.roots);
  const root = options.roots.filter((root) => !root.prefix || options.page.startsWith(`${root.prefix}/`)).sort((a, b) => b.prefix.length - a.prefix.length)[0];
  return root ? linkUrl(root.link, `${root.root}/${root.prefix ? options.page.slice(root.prefix.length + 1) : options.page}`) : undefined;
}

function path(value: string, empty = false): void {
  if (empty && value === "") return;
  validateSourcePath(value);
  if (/%|:/.test(value)) throw new Error(`Noncanonical page source path ${value}`);
}

export function validatePageSources(value: unknown): asserts value is PageSourceRoot[] {
  if (!Array.isArray(value) || value.length > 1000) throw new Error("Invalid page source roots");
  const roots: PageSourceRoot[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Object.keys(item).some((key) => !["link", "root", "prefix", "editable"].includes(key))) throw new Error("Invalid page source root");
    const root = item as PageSourceRoot;
    if (typeof root.link !== "string" || !/^[A-Za-z0-9_-]+$/.test(root.link) || typeof root.root !== "string" || typeof root.prefix !== "string" || typeof root.editable !== "boolean") throw new Error("Invalid page source declaration");
    path(root.root); path(root.prefix, true);
    if (!isPageSource(`${root.root}/page.tsx:1:1`) || !isPageSource(`${root.prefix ? `${root.prefix}/` : ""}page.tsx:1:1`)) throw new Error("Page source root or destination is a library or runtime path");
    for (const previous of roots) {
      if ((previous.link === root.link && overlaps(previous.root, root.root)) || previous.prefix === root.prefix) throw new Error("Page source roots overlap");
    }
    roots.push(root);
  }
}

function overlaps(a: string, b: string): boolean {
  return !a || !b || a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
}

export function pageSourcePath(options: { path: string; roots: PageSourceRoot[] }): string | undefined {
  validatePageSources(options.roots);
  const match = /^\/link\/([^/]+)\/(.+)$/.exec(options.path);
  if (!match) return undefined;
  const relative = decodeURIComponent(match[2]!); path(relative);
  const root = options.roots.find((root) => root.link === match[1] && relative.startsWith(`${root.root}/`));
  if (!root?.editable) return undefined;
  const projected = `${root.prefix ? `${root.prefix}/` : ""}${relative.slice(root.root.length + 1)}`;
  path(projected);
  if (!isPageSource(`${projected}:1:1`)) throw new Error("Projected source is a library or runtime path");
  return projected;
}

export function validatePageSourceLinks(options: { lock: PageSourceLock; links: LibraryLink[] }): void {
  if (options.lock.pageSources === undefined) return;
  validatePageSources(options.lock.pageSources);
  for (const root of options.lock.pageSources) {
    const link = options.links.find((link) => link.id === root.link);
    if (!link?.build.pageSources?.some((declared) => declared.root === root.root && declared.prefix === root.prefix && declared.editable === root.editable)) throw new Error(`Page source ${root.link}/${root.root} has no matching installed link declaration`);
  }
}
