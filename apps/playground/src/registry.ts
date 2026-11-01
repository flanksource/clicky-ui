import type { ComponentType, ReactNode } from "react";
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
  appShellBreadcrumbs?: readonly string[];
  appShellActions?: ReactNode;
};

export type PageModule = {
  default?: ComponentType;
  meta?: PageMeta;
};

export type PageLoader = () => Promise<PageModule>;
export type GuidanceLoader = () => Promise<ExtractedGuidance>;
export type SourceLoader = () => Promise<string>;

type PageEntryBase = {
  slug: string;
  title: string;
  group: string;
  loadGuidance: GuidanceLoader;
};

/** A `.tsx` page: a module whose default export is the artifact. */
export type ComponentPageEntry = PageEntryBase & {
  kind: "component";
  load: PageLoader;
};

/** A `.md`/`.mdx` page: a document the playground renders, lints and edits. */
export type MarkdownPageEntry = PageEntryBase & {
  kind: "markdown";
  /** Path relative to `src/pages/`, e.g. `docs/guide.md`. */
  file: string;
  loadSource: SourceLoader;
};

export type PageEntry = ComponentPageEntry | MarkdownPageEntry;

const PAGES_PREFIX = "./pages/";
const ROOT_GROUP = "Pages";
const PAGE_FILE = /\.(tsx|md|mdx)$/;

export function isPlaygroundPage(key: string): boolean {
  if (!key.startsWith(PAGES_PREFIX) || !PAGE_FILE.test(key)) return false;
  const segments = key.slice(PAGES_PREFIX.length).split("/");
  // `_`-prefixed files and directories are shared helpers, not artifacts.
  if (segments.some((segment) => segment.startsWith("_"))) return false;
  return !/\.(test|stories)\.(tsx|md|mdx)$/.test(
    segments[segments.length - 1] ?? "",
  );
}

export function slugFromGlobKey(key: string): string {
  return key.slice(PAGES_PREFIX.length).replace(PAGE_FILE, "");
}

export function humanizeSlug(slug: string): string {
  const leaf = slug.split("/").pop() ?? slug;
  const words = leaf.replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function groupFromSlug(slug: string): string {
  const parts = slug.split("/");
  return parts.length > 1
    ? humanizeSlug(parts.slice(0, -1).join("/"))
    : ROOT_GROUP;
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

const NO_GUIDANCE: GuidanceLoader = () => Promise.resolve({ blocks: [] });

/**
 * One entry per page file. A `.tsx` and a `.md` that resolve to the same slug
 * would make every slug-keyed path (URL, sources endpoint, comments) ambiguous,
 * so that is an error rather than a silent pick.
 */
export function buildRegistry(
  modules: Record<string, PageLoader>,
  guidanceModules: Record<string, GuidanceLoader> = {},
  markdownSources: Record<string, SourceLoader> = {},
): PageEntry[] {
  const entries: PageEntry[] = [
    ...Object.entries(modules)
      .filter(([key]) => isPlaygroundPage(key))
      .map(([key, load]): ComponentPageEntry => {
        const slug = slugFromGlobKey(key);
        return {
          kind: "component",
          slug,
          title: humanizeSlug(slug),
          group: groupFromSlug(slug),
          load,
          loadGuidance: guidanceModules[key] ?? NO_GUIDANCE,
        };
      }),
    ...Object.entries(markdownSources)
      .filter(([key]) => isPlaygroundPage(key))
      .map(([key, loadSource]): MarkdownPageEntry => {
        const slug = slugFromGlobKey(key);
        return {
          kind: "markdown",
          slug,
          title: humanizeSlug(slug),
          group: groupFromSlug(slug),
          file: key.slice(PAGES_PREFIX.length),
          loadSource,
          loadGuidance: NO_GUIDANCE,
        };
      }),
  ];
  const seen = new Map<string, PageEntry>();
  for (const entry of entries) {
    const clash = seen.get(entry.slug);
    if (clash) {
      throw new Error(
        `src/pages has two pages for slug "${entry.slug}" (${pageFileOf(clash)} and ${pageFileOf(entry)}); rename or delete one`,
      );
    }
    seen.set(entry.slug, entry);
  }
  return entries.sort(compareEntries);
}

function pageFileOf(entry: PageEntry): string {
  return entry.kind === "markdown" ? entry.file : `${entry.slug}.tsx`;
}

function compareEntries(a: PageEntry, b: PageEntry): number {
  if (a.group !== b.group) {
    if (a.group === ROOT_GROUP) return -1;
    if (b.group === ROOT_GROUP) return 1;
    return a.group.localeCompare(b.group);
  }
  return a.title.localeCompare(b.title);
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
  import.meta.glob(
    ["./pages/**/*.{md,mdx}", "!./pages/**/_*/**", "!./pages/**/_*.{md,mdx}"],
    { query: "?raw", import: "default" },
  ) as Record<string, SourceLoader>,
);

const projectedMeta = import.meta.glob(
  [
    "./pages/**/*.tsx",
    "!./pages/**/_*/**",
    "!./pages/**/_*.tsx",
    "!./pages/**/*.test.tsx",
    "!./pages/**/*.stories.tsx",
  ],
  { query: "?playground-meta", import: "default" },
) as Record<string, () => Promise<PageMeta | undefined>>;

export const DEFAULT_PAGE_SLUG = "welcome";
export function fallbackPageSlug(
  entries: readonly PageEntry[],
  excludedSlug?: string,
): string | undefined {
  const available = entries.filter((entry) => entry.slug !== excludedSlug);
  return (
    available.find((entry) => entry.slug === DEFAULT_PAGE_SLUG)?.slug ??
    available[0]?.slug
  );
}

export function findPage(
  slug: string | null | undefined,
): PageEntry | undefined {
  if (!slug) return undefined;
  return pages().find((entry) => entry.slug === slug);
}

/*
 * Optimistic overlay over the glob.
 *
 * A page renamed, moved or deleted through the sources endpoint is already
 * gone from disk while `import.meta.glob` still reports it: the glob is baked
 * into this module at transform time, so it only catches up when the dev
 * server re-evaluates the module. Until then the nav would show a page at a
 * path that no longer exists. These overrides are applied on top of `PAGES`
 * and need no cleanup — the re-evaluation that makes them redundant is also
 * what discards them.
 */
const removedSlugs = new Set<string>();
const movedSlugs = new Map<string, string>();
/**
 * Titles from a rename, which outrank the module's own `meta`: the module at
 * the old path is already in the browser's cache and still reports the title
 * the file had before the rename rewrote it.
 */
const movedTitles = new Map<string, string>();

/** The glob entry currently presenting as `slug`, for a page moved twice. */
function globSlugFor(slug: string): string {
  for (const [from, to] of movedSlugs) if (to === slug) return from;
  return slug;
}

/** Every artifact the app should show right now, newest edits included. */
export function pages(): PageEntry[] {
  if (removedSlugs.size === 0 && movedSlugs.size === 0) return PAGES;
  return PAGES.flatMap((entry) => {
    const slug = movedSlugs.get(entry.slug) ?? entry.slug;
    if (removedSlugs.has(slug)) return [];
    return [
      slug === entry.slug
        ? entry
        : {
            ...entry,
            slug,
            title: humanizeSlug(slug),
            group: groupFromSlug(slug),
          },
    ];
  }).sort(compareEntries);
}

export function applyPageMoved(
  slug: string,
  nextSlug: string,
  title?: string,
): void {
  const origin = globSlugFor(slug);
  if (nextSlug === origin) movedSlugs.delete(origin);
  else movedSlugs.set(origin, nextSlug);
  removedSlugs.delete(nextSlug);

  // Everything keyed by slug has to follow the page to its new one.
  const meta = metaCache.get(slug);
  if (meta !== undefined) cacheMeta(nextSlug, meta);
  const carried = title ?? movedTitles.get(slug);
  movedTitles.delete(slug);
  if (carried !== undefined) movedTitles.set(nextSlug, carried);
  emit();
}

export function applyPageDeleted(slug: string): void {
  removedSlugs.add(slug);
  emit();
}

export function applyFolderDeleted(folder: string): void {
  for (const entry of pages()) {
    if (entry.slug.startsWith(`${folder}/`)) removedSlugs.add(entry.slug);
  }
  emit();
}

/** Un-hides a slug that an earlier delete in this session is still hiding. */
export function applyPageCreated(slug: string): void {
  if (!removedSlugs.delete(slug)) return;
  emit();
}

const metaCache = new Map<string, PageMeta>();
const pendingMeta = new Map<string, Promise<void>>();

export async function loadMetadata(entries: readonly PageEntry[]): Promise<void> {
  await Promise.all(entries.map((entry) => {
    if (entry.kind === "markdown" || metaCache.has(entry.slug)) return;
    const pending = pendingMeta.get(entry.slug);
    if (pending) return pending;
    const loader = projectedMeta[`./pages/${globSlugFor(entry.slug)}.tsx`];
    if (!loader) throw new Error(`Missing metadata loader for ${entry.slug}`);
    const request = loader().then((meta) => cacheMeta(entry.slug, meta)).finally(() => pendingMeta.delete(entry.slug));
    pendingMeta.set(entry.slug, request);
    return request;
  }));
  emit();
}
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
  return (
    movedTitles.get(entry.slug) ??
    metaCache.get(entry.slug)?.title ??
    entry.title
  );
}

export function pageGroup(entry: PageEntry): string {
  return metaCache.get(entry.slug)?.group ?? entry.group;
}

export function pageDescription(entry: PageEntry): string | undefined {
  return metaCache.get(entry.slug)?.description;
}

export function pageMeta(entry: PageEntry): PageMeta | undefined {
  const meta = metaCache.get(entry.slug);
  const title = movedTitles.get(entry.slug);
  if (title === undefined) return meta;
  return { ...meta, title };
}

export async function loadPage(
  entry: ComponentPageEntry,
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
