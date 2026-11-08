import { existsSync } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { vocabularyOptions } from "../production-config";
import { vocabularyPages } from "../vocabulary-directories";
import { readStaticExports } from "../static-metadata";
import { readExternalPages } from "../external-pages-store";
import { PAGE_EXTENSIONS, listFolders } from "../pages-store";
import type { ActivityIndex } from "./activity";
import { emptyActivity, humanizeSlug, type ExternalRecord, type PageRecord } from "./tree";

/** The page `meta` fields the sidebar uses; `icon` is the icon component's display name. */
export type PageMetaData = { title?: string; description?: string; icon?: string; navOrder?: number; groupOrder?: number };
export type PageMetaLoader = (file: string) => Promise<unknown>;

/** The file behind `slug`; two files for one slug is the registry's duplicate-slug error. */
export function pageFile(pagesDir: string, slug: string): string {
  const files = PAGE_EXTENSIONS.map((extension) => join(pagesDir, `${slug}${extension}`)).filter((file) => existsSync(file));
  if (files.length !== 1) {
    throw new Error(
      files.length
        ? `src/pages has two pages for slug "${slug}" (${files.join(" and ")}); rename or delete one`
        : `src/pages has no file for page slug "${slug}"`,
    );
  }
  return files[0]!;
}

function optional<T>(file: string, meta: Record<string, unknown>, key: string, type: "string" | "number"): T | undefined {
  const value = meta[key];
  if (value === undefined) return undefined;
  if (typeof value !== type) throw new Error(`${file}: page meta.${key} must be a ${type}`);
  return value as T;
}

function iconName(file: string, icon: unknown): string | undefined {
  if (icon === undefined || typeof icon === "string") return icon;
  if (typeof icon !== "function" && (typeof icon !== "object" || icon === null)) {
    throw new Error(`${file}: page meta.icon must be an icon component or a name`);
  }
  // An anonymous component has no name the client could resolve; it keeps the default icon.
  const { displayName, name } = icon as { displayName?: unknown; name?: unknown };
  const label = displayName ?? name;
  return typeof label === "string" && label ? label : undefined;
}

export function pageMetaData(file: string, value: unknown): PageMetaData {
  if (value === undefined) return {};
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${file}: page meta must be an object`);
  const meta = value as Record<string, unknown>;
  const icon = iconName(file, meta["icon"]);
  const title = optional<string>(file, meta, "title", "string");
  const description = optional<string>(file, meta, "description", "string");
  const navOrder = optional<number>(file, meta, "navOrder", "number");
  const groupOrder = optional<number>(file, meta, "groupOrder", "number");
  return {
    ...(title !== undefined ? { title } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(icon !== undefined ? { icon } : {}),
    ...(navOrder !== undefined ? { navOrder } : {}),
    ...(groupOrder !== undefined ? { groupOrder } : {}),
  };
}

export type PagesSource = {
  records(input: { updates: Record<string, string>; activity: ActivityIndex }): Promise<PageRecord[]>;
  folders(): string[];
  clearMeta(): void;
};

/**
 * Pages come from `src/pages` with the registry's filename rules (the slugs of
 * `pageUpdates`). Only `.tsx` pages declare `meta`; it is read through
 * `loadMeta` and cached per file and mtime.
 */
export function pagesSource({ pagesDir, loadMeta }: { pagesDir: string; loadMeta?: PageMetaLoader | undefined }): PagesSource {
  const cache = new Map<string, PageMetaData>();
  const metaFor = async (file: string, mtime: string): Promise<PageMetaData> => {
    if (!loadMeta || !file.endsWith(".tsx")) return {};
    const key = `${file}\0${mtime}`;
    const cached = cache.get(key);
    if (cached) return cached;
    const meta = pageMetaData(file, await loadMeta(file));
    cache.set(key, meta);
    return meta;
  };
  return {
    records: ({ updates, activity }) =>
      Promise.all(
        Object.entries(updates).map(async ([slug, mtime]): Promise<PageRecord> => {
          const meta = await metaFor(pageFile(pagesDir, slug), mtime);
          return {
            slug,
            title: meta.title ?? humanizeSlug(slug),
            ...(meta.description !== undefined ? { description: meta.description } : {}),
            ...(meta.icon !== undefined ? { icon: meta.icon } : {}),
            ...(meta.navOrder !== undefined ? { navOrder: meta.navOrder } : {}),
            ...(meta.groupOrder !== undefined ? { groupOrder: meta.groupOrder } : {}),
            activity: activity.get(slug) ?? emptyActivity(),
          };
        }),
      ),
    folders: () => listFolders(pagesDir),
    clearMeta: () => cache.clear(),
  };
}

export function externalRecords(dir: string, activity: ActivityIndex): ExternalRecord[] {
  return readExternalPages(dir).map((page) => ({ id: page.id, title: page.title, urls: page.urls, activity: activity.get(page.id) ?? emptyActivity() }));
}

export async function vocabularyRecords(options: { pagesDir: string; activity: ActivityIndex }): Promise<PageRecord[]> {
  const pagesDir = await realpath(options.pagesDir);
  const vocabulary = await vocabularyOptions({ root: dirname(dirname(pagesDir)), pagesDir });
  const pages = (await vocabularyPages(vocabulary)).filter(page => !page.file.startsWith(pagesDir + "/"));
  return Promise.all(pages.map(async page => {
    const meta = pageMetaData(page.file, readStaticExports({ file: page.file, roots: vocabulary.sourceRoots.map(root => root.directory), names: ["meta"] })["meta"]);
    return { ...meta, slug: page.slug, title: meta.title ?? page.alias, activity: { ...(options.activity.get(page.slug) ?? emptyActivity()), updated: (await stat(page.file)).mtimeMs } };
  }));
}
