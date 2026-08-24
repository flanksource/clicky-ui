import type { ComponentType } from "react";
import type { StaticIconComponent } from "@flanksource/clicky-ui";
import type { ExtractedGuidance } from "../plugins/markdown-model";

/** Optional per-page presentation metadata layered over filename-derived defaults. */
export type PageMeta = {
  title?: string;
  description?: string;
  group?: string;
  icon?: StaticIconComponent;
  navOrder?: number;
  groupOrder?: number;
};

export type PageModule = {
  default?: ComponentType;
  meta?: PageMeta;
};

export type PageLoader = () => Promise<PageModule>;
export type GuidanceLoader = () => Promise<ExtractedGuidance>;

export type PageEntry = {
  slug: string;
  title: string;
  group: string;
  load: PageLoader;
  loadGuidance: GuidanceLoader;
};

const PAGES_PREFIX = "./pages/";
const ROOT_GROUP = "Pages";

export function isPlaygroundPage(key: string): boolean {
  if (!key.startsWith(PAGES_PREFIX) || !key.endsWith(".tsx")) return false;
  const segments = key.slice(PAGES_PREFIX.length).split("/");
  // `_`-prefixed files and directories are shared helpers, not artifacts.
  if (segments.some((segment) => segment.startsWith("_"))) return false;
  return !/\.(test|stories)\.tsx$/.test(segments[segments.length - 1] ?? "");
}

export function slugFromGlobKey(key: string): string {
  return key.slice(PAGES_PREFIX.length).replace(/\.tsx$/, "");
}

export function humanizeSlug(slug: string): string {
  const leaf = slug.split("/").pop() ?? slug;
  const words = leaf.replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function groupFromSlug(slug: string): string {
  const parts = slug.split("/");
  return parts.length > 1 ? humanizeSlug(parts.slice(0, -1).join("/")) : ROOT_GROUP;
}

export function folderForPage(
  slug: string,
  entries: readonly PageEntry[],
): string | undefined {
  const parts = slug.split("/");
  const folder = parts.length > 1 ? parts.slice(0, -1).join("/") : slug;
  return entries.some((entry) => entry.slug.startsWith(`${folder}/`))
    ? folder
    : undefined;
}

export function buildRegistry(
  modules: Record<string, PageLoader>,
  guidanceModules: Record<string, GuidanceLoader> = {},
): PageEntry[] {
  return Object.entries(modules)
    .filter(([key]) => isPlaygroundPage(key))
    .map(([key, load]) => {
      const slug = slugFromGlobKey(key);
      return {
        slug,
        title: humanizeSlug(slug),
        group: groupFromSlug(slug),
        load,
        loadGuidance: guidanceModules[key] ?? (() => Promise.resolve({ blocks: [] })),
      };
    })
    .sort((a, b) => {
      if (a.group !== b.group) {
        if (a.group === ROOT_GROUP) return -1;
        if (b.group === ROOT_GROUP) return 1;
        return a.group.localeCompare(b.group);
      }
      return a.title.localeCompare(b.title);
    });
}

/**
 * Every artifact under `src/pages/`. Adding a file here is the entire
 * registration step — the glob is HMR-aware, so a new page shows up in the nav
 * without restarting the dev server.
 */
export const PAGES: PageEntry[] = buildRegistry(
  import.meta.glob([
    "./pages/**/*.tsx",
    "!./pages/**/_*/**",
    "!./pages/**/_*.tsx",
    "!./pages/**/*.test.tsx",
    "!./pages/**/*.stories.tsx",
  ]) as Record<string, PageLoader>,
  import.meta.glob(
    [
      "./pages/**/*.tsx",
      "!./pages/**/_*/**",
      "!./pages/**/_*.tsx",
      "!./pages/**/*.test.tsx",
      "!./pages/**/*.stories.tsx",
    ],
    {
      query: "?playground-markdown",
      import: "default",
    },
  ) as Record<string, GuidanceLoader>,
);

export const DEFAULT_PAGE_SLUG = "flanksource";
export function fallbackPageSlug(
  entries: readonly PageEntry[],
  excludedSlug?: string,
): string | undefined {
  const available = entries.filter((entry) => entry.slug !== excludedSlug);
  return available.find((entry) => entry.slug === DEFAULT_PAGE_SLUG)?.slug ??
    available[0]?.slug;
}

export function findPage(slug: string | null | undefined): PageEntry | undefined {
  if (!slug) return undefined;
  return PAGES.find((entry) => entry.slug === slug);
}

/*
 * `meta` is a named export, so it is invisible until a module has been imported.
 * Nav labels therefore start from the filename and settle to `meta.title` once
 * the module has loaded; the store below lets React re-render when that happens.
 */
const metaCache = new Map<string, PageMeta>();
const listeners = new Set<() => void>();
let version = 0;

function emit(): void {
  version += 1;
  for (const listener of listeners) listener();
}

function cacheMeta(slug: string, meta: PageMeta | undefined): void {
  metaCache.set(slug, meta ?? {});
}

export function subscribeMeta(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getMetaVersion(): number {
  return version;
}

export function pageTitle(entry: PageEntry): string {
  return metaCache.get(entry.slug)?.title ?? entry.title;
}

export function pageGroup(entry: PageEntry): string {
  return metaCache.get(entry.slug)?.group ?? entry.group;
}

export function pageDescription(entry: PageEntry): string | undefined {
  return metaCache.get(entry.slug)?.description;
}

export function pageMeta(entry: PageEntry): PageMeta | undefined {
  return metaCache.get(entry.slug);
}

/** Warms `meta` for every page once the browser is idle, so nav labels settle. */
export function preloadMeta(entries: PageEntry[]): void {
  if (typeof window === "undefined") return;
  const pending = entries.filter((entry) => !metaCache.has(entry.slug));
  if (pending.length === 0) return;

  const run = () => {
    void Promise.all(
      pending.map((entry) =>
        entry.load().then(
          (module) => cacheMeta(entry.slug, module.meta),
          (error: unknown) => {
            // The page still renders its own loud error when navigated to; this
            // only degrades the nav label, so report it and keep the rest.
            console.error(`[playground] could not preload ${entry.slug}`, error);
            cacheMeta(entry.slug, undefined);
          },
        ),
      ),
    ).then(emit);
  };

  const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number })
    .requestIdleCallback;
  if (idle) idle(run);
  else window.setTimeout(run, 200);
}

export async function loadPage(
  entry: PageEntry,
): Promise<{ default: ComponentType }> {
  const module = await entry.load();
  cacheMeta(entry.slug, module.meta);
  emit();
  if (typeof module.default !== "function") {
    throw new Error(
      `src/pages/${entry.slug}.tsx has no default export — a playground page must ` +
        "`export default` a React component.",
    );
  }
  return { default: module.default };
}
