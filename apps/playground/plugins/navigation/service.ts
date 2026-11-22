import type { GavelEndpoint } from "../gavel-launch-server";
import { RepositoryDocuments } from "../repository-documents";
import { navigationTarget } from "../../src/documents/repository-navigation";
import type { NavigationFilter, NavigationQuery, NavigationResponse, NavigationSort } from "../../src/navigation/types";
import { loadActivity, repositoryActivity } from "./activity";
import { NavigationRequestError, pageFolderKey, parseNodeKey } from "./keys";
import { directoryLister, repositoryChildren, repositoryRoots, searchRepositories, type RepositoryContext } from "./repository";
import { externalRecords, pagesSource, vocabularyRecords, type PageMetaLoader } from "./sources";
import {
  countOlder,
  externalFolder,
  findEntry,
  pageEntries,
  selectExternal,
  selectPages,
  shapeOpen,
  sortRanked,
  type ViewOptions,
} from "./tree";

const SORTS: readonly NavigationSort[] = ["none", "updated", "commented", "resolved"];
const FILTERS: readonly NavigationFilter[] = ["open", "resolved"];

/** Parses `?node=&sort=&filters=&age=&q=&active=` with the sidebar vocabulary; anything else is a 400. */
export function parseNavigationQuery(params: URLSearchParams): NavigationQuery {
  const sort = params.get("sort") || "none";
  const age = params.get("age") || "recent";
  const filters = (params.get("filters") ?? "").split(",").filter(Boolean);
  if (!SORTS.includes(sort as NavigationSort)) throw new NavigationRequestError(`Invalid sidebar sort: ${sort}`);
  if (age !== "recent" && age !== "all") throw new NavigationRequestError(`Invalid sidebar age: ${age}`);
  const invalid = filters.find((filter) => !FILTERS.includes(filter as NavigationFilter));
  if (invalid !== undefined) throw new NavigationRequestError(`Invalid sidebar filter: ${invalid}`);
  const active = params.get("active");
  return {
    node: params.get("node") ?? "",
    sort: sort as NavigationSort,
    filters: filters as NavigationFilter[],
    age,
    q: params.get("q") ?? "",
    ...(active ? { active } : {}),
  };
}

export type NavigationDeps = {
  dir: string;
  pagesDir: string;
  endpoint: GavelEndpoint;
  /** Evaluates a page file's `meta`; without it pages are labelled from their slug. */
  loadMeta?: PageMetaLoader | undefined;
  now?: () => number;
  /** How long a Gavel directory listing is reused (default 5s). */
  directoryTtlMs?: number;
};

function activeTarget(active: string | undefined) {
  try {
    return navigationTarget(active);
  } catch (cause) {
    throw new NavigationRequestError(`Invalid active page: ${cause instanceof Error ? cause.message : String(cause)}`);
  }
}

export function createNavigation(deps: NavigationDeps) {
  const now = deps.now ?? Date.now;
  const pages = pagesSource({ pagesDir: deps.pagesDir, loadMeta: deps.loadMeta });
  const list = directoryLister({ endpoint: deps.endpoint, ttlMs: deps.directoryTtlMs ?? 5000, now });
  const repositories = new RepositoryDocuments(deps.dir);

  async function children(query: NavigationQuery): Promise<NavigationResponse> {
    const key = parseNodeKey(query.node);
    const options: ViewOptions = { sort: query.sort, filters: query.filters, age: query.age, query: query.q, active: query.active, now: now() };
    const needle = query.q.trim();
    const target = activeTarget(query.active);
    const { index, updates } = await loadActivity(deps);
    const repos = key.kind === "root" || key.kind === "repository" ? repositories.all() : [];
    const context = (): RepositoryContext => ({
      list,
      options,
      activity: index,
      records: repositoryActivity(index),
      target: needle ? undefined : target,
    });
    const external = () => externalRecords(deps.dir, index);

    if (key.kind === "repository") return { children: shapeOpen(await repositoryChildren(context(), repos, key)) };
    if (key.kind === "external") {
      const folder = externalFolder(selectExternal(external(), options), options);
      if (!folder) throw new NavigationRequestError("Unknown navigation node: external");
      return { children: shapeOpen(folder.children ?? []) };
    }

    const vocabularies = await vocabularyRecords({ pagesDir: deps.pagesDir, activity: index });
    const records = [...await pages.records({ updates, activity: index }), ...vocabularies];
    const folders = [...pages.folders(), ...(vocabularies.length ? ["vocabularies"] : [])];
    const pageRanked = pageEntries(selectPages(records, folders, options), options);
    const vocabularyFolder = pageRanked.find(({ entry }) => entry.key === "page:vocabularies");
    if (vocabularies.length && vocabularyFolder) vocabularyFolder.entry.icon = "UiLedger";
    if (key.kind === "page-folder") {
      const folder = findEntry(sortRanked(pageRanked, options.sort), pageFolderKey(key.folder));
      if (!folder) throw new NavigationRequestError(`Unknown navigation node: ${query.node}`);
      return { children: shapeOpen(folder.children ?? []) };
    }

    const repositoryContext = context();
    const repositoryRanked = needle ? await searchRepositories(repositoryContext, repos) : await repositoryRoots(repositoryContext, repos);
    const externalPages = external();
    const folder = externalFolder(selectExternal(externalPages, options), options);
    return {
      children: shapeOpen([...sortRanked([...pageRanked, ...repositoryRanked], options.sort), ...(folder ? [folder] : [])]),
      olderCount: countOlder([...records, ...externalPages.map((page) => ({ slug: page.id, activity: page.activity }))], options),
    };
  }

  return { children, clearMeta: pages.clearMeta };
}

export type Navigation = ReturnType<typeof createNavigation>;
