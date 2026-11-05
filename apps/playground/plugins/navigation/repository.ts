import type { GavelEndpoint } from "../gavel-launch-server";
import { workspaceJson } from "../repository-folder";
import { containingFolder, directoryCacheKey, revealPaths, type NavigationTarget } from "../../src/documents/repository-navigation";
import type { DirectoryEntry, DocumentRepository, RepositoryFolder } from "../../src/documents/types";
import type { NavigationEntry } from "../../src/navigation/types";
import { directoryActivity, directoryProblems, type ActivityIndex, type RepositoryActivity } from "./activity";
import { documentKey, NavigationRequestError, repositoryKey } from "./keys";
import { emptyActivity, matchesActivity, sortRanked, type Ranked, type ViewOptions } from "./tree";

export const SEARCH_CONCURRENCY = 8;
const MARKDOWN = /\.(md|mdx|markdown)$/i;

export type DirectoryListing = (input: { repository: DocumentRepository; folder: RepositoryFolder; path: string; includeIgnored: boolean }) => Promise<DirectoryEntry[]>;

/**
 * Gavel `workspace/entries` for one directory, exactly as the client's
 * `directoryEntries` asks for it, cached per `directoryCacheKey` for a short
 * time so a search keystroke or a burst of expands walks Gavel once.
 */
export function directoryLister({ endpoint, ttlMs, now = Date.now }: { endpoint: GavelEndpoint; ttlMs: number; now?: () => number }): DirectoryListing {
  const cache = new Map<string, { at: number; entries: Promise<DirectoryEntry[]> }>();
  return ({ repository, folder, path, includeIgnored }) => {
    const key = `${directoryCacheKey({ repositoryId: repository.id, path, folder })}\0${includeIgnored}`;
    const hit = cache.get(key);
    if (hit && now() - hit.at < ttlMs) return hit.entries;
    const entries = workspaceJson<DirectoryEntry[]>({
      endpoint,
      path: "entries",
      body: { root: repository.root, path, overrides: folder.overrides, overrideDirectory: folder.path, includeIgnored },
    }).then((value) => {
      if (!Array.isArray(value)) throw new Error(`Gavel returned an invalid directory listing for ${repository.root}/${path}`);
      return value;
    });
    cache.set(key, { at: now(), entries });
    entries.catch(() => cache.delete(key));
    return entries;
  };
}

export type RepositoryContext = {
  list: DirectoryListing;
  options: ViewOptions;
  activity: ActivityIndex;
  records: readonly RepositoryActivity[];
  problems: ReadonlyMap<string, number>;
  /** The active document or folder when `options.active` is one; its ancestors come back open. */
  target: NavigationTarget | undefined;
};

const leafName = (path: string) => path.split("/").at(-1)!;
const directoryLabel = (repository: DocumentRepository, path: string) => (path === "." ? repository.name : leafName(path));

/** Directories above the active target that must come back open, outermost first. */
function revealChain(ctx: RepositoryContext, repository: DocumentRepository, folder: RepositoryFolder): string[] | undefined {
  const { target } = ctx;
  if (target?.repositoryId !== repository.id) return undefined;
  if (containingFolder(repository.folders, target.path)?.path !== folder.path) return undefined;
  const chain = revealPaths({ folder, target });
  return target.kind === "folder" ? chain.slice(0, -1) : chain;
}

const onActivePath = (ctx: RepositoryContext, path: string) =>
  ctx.target !== undefined && (ctx.target.path === path || ctx.target.path.startsWith(`${path}/`));

type EntryInput = { repository: DocumentRepository; folder: RepositoryFolder; path: string; hidden?: boolean; forced?: boolean };

/** A repository directory entry, or undefined when the filters leave nothing below it (unless `forced`). */
function directoryEntry(ctx: RepositoryContext, { repository, folder, path, hidden = false, forced = false }: EntryInput): Ranked | undefined {
  const { activity, matches } = directoryActivity({ records: ctx.records, repositoryId: repository.id, directory: path, filters: ctx.options.filters });
  if (ctx.options.filters.length && !matches && !forced) return undefined;
  const problems = directoryProblems(ctx.problems, repository.id, path);
  const label = directoryLabel(repository, path);
  return {
    entry: {
      key: repositoryKey({ repositoryId: repository.id, folder: folder.path, path }),
      kind: "folder",
      label: hidden ? `${label} (ignored)` : label,
      slug: `folder:${repository.id}/${path}`,
      source: "repository",
      hasChildren: true,
      activity,
      ...(problems ? { problems } : {}),
      repository: { id: repository.id, folder: folder.path, path },
      ...(hidden ? { hidden: true } : {}),
    },
    order: Number.POSITIVE_INFINITY,
    label,
  };
}

function documentEntry(ctx: RepositoryContext, repository: DocumentRepository, folder: RepositoryFolder, entry: DirectoryEntry): Ranked | undefined {
  const id = `document:${repository.id}/${entry.path}`;
  const activity = ctx.activity.get(id) ?? emptyActivity();
  if (!matchesActivity(activity, ctx.options.filters) && ctx.target?.path !== entry.path) return undefined;
  const problems = ctx.problems.get(id) ?? 0;
  return {
    entry: {
      key: documentKey(id),
      kind: "document",
      label: entry.visible ? entry.name : `${entry.name} (ignored)`,
      slug: id,
      source: "repository",
      hasChildren: false,
      activity,
      ...(problems ? { problems } : {}),
      repository: { id: repository.id, folder: folder.path, path: entry.path },
      ...(entry.visible ? {} : { hidden: true }),
    },
    order: Number.POSITIVE_INFINITY,
    label: entry.name,
  };
}

function open(item: Ranked, children: NavigationEntry[]): Ranked {
  return { ...item, entry: { ...item.entry, open: true, hasChildren: children.length > 0, children } };
}

/** One directory's children, with the directories on the active path opened and inlined. */
export async function listDirectory(ctx: RepositoryContext, repository: DocumentRepository, folder: RepositoryFolder, path: string): Promise<NavigationEntry[]> {
  const chain = revealChain(ctx, repository, folder) ?? [];
  const entries = (await ctx.list({ repository, folder, path, includeIgnored: chain.includes(path) })).filter(
    (entry) => entry.visible || onActivePath(ctx, entry.path),
  );
  const ranked: Ranked[] = [];
  for (const entry of entries) {
    if (!entry.directory) {
      const document = MARKDOWN.test(entry.path) && documentEntry(ctx, repository, folder, entry);
      if (document) ranked.push(document);
      continue;
    }
    const item = directoryEntry(ctx, { repository, folder, path: entry.path, hidden: !entry.visible, forced: onActivePath(ctx, entry.path) });
    if (!item) continue;
    ranked.push(chain.includes(entry.path) ? open(item, await listDirectory(ctx, repository, folder, entry.path)) : item);
  }
  return sortRanked(ranked, ctx.options.sort);
}

/** One entry per repository and configured sidebar folder; the folder holding the active document comes back open. */
export async function repositoryRoots(ctx: RepositoryContext, repositories: readonly DocumentRepository[]): Promise<Ranked[]> {
  const roots: Ranked[] = [];
  for (const repository of repositories) {
    for (const folder of repository.folders) {
      const chain = revealChain(ctx, repository, folder);
      const item = directoryEntry(ctx, { repository, folder, path: folder.path, forced: Boolean(chain) });
      if (!item) continue;
      roots.push(chain?.includes(folder.path) ? open(item, await listDirectory(ctx, repository, folder, folder.path)) : item);
    }
  }
  return roots;
}

/** Breadth-first directory listings from `start`, visible entries only, a few directories at a time. */
async function walk(ctx: RepositoryContext, repository: DocumentRepository, folder: RepositoryFolder, start: string): Promise<Map<string, DirectoryEntry[]>> {
  const listings = new Map<string, DirectoryEntry[]>();
  for (let level = [start]; level.length; ) {
    const next: string[] = [];
    for (let index = 0; index < level.length; index += SEARCH_CONCURRENCY) {
      const batch = level.slice(index, index + SEARCH_CONCURRENCY);
      const results = await Promise.all(batch.map((path) => ctx.list({ repository, folder, path, includeIgnored: false })));
      batch.forEach((path, position) => {
        const visible = results[position]!.filter((entry) => entry.visible);
        listings.set(path, visible);
        next.push(...visible.filter((entry) => entry.directory).map((entry) => entry.path));
      });
    }
    level = next;
  }
  return listings;
}

/**
 * The part of `start`'s subtree that holds a document whose name or path
 * matches `needle`: every directory on the way is open with its children
 * inlined. Undefined when nothing below matches.
 */
async function searchDirectory(ctx: RepositoryContext, repository: DocumentRepository, folder: RepositoryFolder, start: string, needle: string): Promise<Ranked | undefined> {
  const listings = await walk(ctx, repository, folder, start);
  const build = (path: string): Ranked | undefined => {
    const ranked: Ranked[] = [];
    for (const entry of listings.get(path) ?? []) {
      const hit = entry.directory
        ? build(entry.path)
        : MARKDOWN.test(entry.path) && [entry.name, entry.path].some((value) => value.toLowerCase().includes(needle))
          ? documentEntry(ctx, repository, folder, entry)
          : undefined;
      if (hit) ranked.push(hit);
    }
    const item = ranked.length ? directoryEntry(ctx, { repository, folder, path }) : undefined;
    return item && open(item, sortRanked(ranked, ctx.options.sort));
  };
  return build(start);
}

const nameMatches = (repository: DocumentRepository, needle: string) => repository.name.toLowerCase().includes(needle);

/**
 * Search across every repository's configured folders. A repository whose name
 * matches shows its folders closed (their contents load on expand); otherwise
 * only folders holding matching documents come back.
 */
export async function searchRepositories(ctx: RepositoryContext, repositories: readonly DocumentRepository[]): Promise<Ranked[]> {
  const needle = ctx.options.query.trim().toLowerCase();
  const found = await Promise.all(
    repositories.flatMap((repository) =>
      repository.folders.map((folder) =>
        nameMatches(repository, needle)
          ? directoryEntry(ctx, { repository, folder, path: folder.path })
          : searchDirectory(ctx, repository, folder, folder.path, needle),
      ),
    ),
  );
  return found.filter((item) => item !== undefined);
}

/** Children of a repository directory node: its listing, or, while searching, only the matching subtree. */
export async function repositoryChildren(
  ctx: RepositoryContext,
  repositories: readonly DocumentRepository[],
  node: { repositoryId: string; folder: string; path: string },
): Promise<NavigationEntry[]> {
  const repository = repositories.find((candidate) => candidate.id === node.repositoryId);
  if (!repository) throw new NavigationRequestError(`Unknown repository ${node.repositoryId}`);
  const folder = repository.folders.find((candidate) => candidate.path === node.folder);
  if (!folder) throw new NavigationRequestError(`Repository ${repository.name} has no sidebar folder ${node.folder}`);
  const needle = ctx.options.query.trim().toLowerCase();
  if (!needle || nameMatches(repository, needle)) return listDirectory(ctx, repository, folder, node.path);
  return (await searchDirectory(ctx, repository, folder, node.path, needle))?.entry.children ?? [];
}
