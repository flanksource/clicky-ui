/**
 * Wire contract of `GET /__playground/navigation`, shared by the dev-server
 * plugin (apps/playground/plugins/navigation*) and the sidebar client.
 * Keep it free of React and runtime imports: plugins load it in Node.
 *
 * One endpoint serves every node of the sidebar tree. The request is
 * `?node=<key>&sort=&filters=&age=&q=&active=<slug>`:
 *
 * - `node` empty or absent returns the root; otherwise the children of that
 *   entry key (`hasChildren` entries that came back without `children`).
 * - `sort`, `filters`, `age` and `q` use the sidebar vocabulary below. They are
 *   applied on the server to every source (pages, repositories, external).
 * - `active` is the slug of the open page. Its ancestors come back `open` with
 *   `children` inlined, and it bypasses the `age` window.
 * - With `q`, the response is a pruned tree: every folder on the way to a hit
 *   is `open` with `children` inlined, so one round trip renders the result.
 *
 * Root responses (empty `node`) carry `olderCount`.
 */

/** `none` is "Latest activity": rank by the later of source edit and last comment. */
export type NavigationSort = "none" | "updated" | "commented" | "resolved";
/** Selected filters are OR-ed: an entry needs any matching open/resolved thread. */
export type NavigationFilter = "open" | "resolved";
/** `recent` hides entries untouched for 7 days (the active entry and any query bypass it). */
export type NavigationAge = "recent" | "all";

export type NavigationQuery = {
  node: string;
  sort: NavigationSort;
  filters: readonly NavigationFilter[];
  age: NavigationAge;
  q: string;
  active?: string;
};

/**
 * Timestamps are epoch milliseconds (0 = never). Folders aggregate the visible
 * entries below them: latest timestamps, summed counts, union of `waitingOn`.
 */
export type NavigationActivity = {
  updated: number;
  commented: number;
  resolved: number;
  openCount: number;
  resolvedCount: number;
  waitingOn?: string[];
};

/**
 * Where a repository entry lives: the repository id, the configured sidebar
 * folder that owns the subtree (its `path`, also the ignore-override base) and
 * the directory or document path relative to the repository root.
 */
export type NavigationRepositoryRef = { id: string; folder: string; path: string };

export type NavigationEntry = {
  /**
   * Unique across the tree:
   * `page:<folderPath>` | `page-item:<slug>` | `repo:<uuid>:<folder>:<dirPath>`
   * | `doc:<document id>` | `external` | `external:<uuid>`.
   * `:` and `%` inside repository paths are percent-encoded.
   */
  key: string;
  kind: "folder" | "page" | "document" | "external";
  label: string;
  /**
   * Route slug: page slug, `document:<uuid>/<path>`, `folder:<uuid>/<path>`
   * or `external:<uuid>`. A page folder only has one when a page shares its slug.
   */
  slug?: string;
  /** Icon component name from page meta (for example `UiFileCode`); absent means the client default. */
  icon?: string;
  description?: string;
  source: "pages" | "repository" | "external";
  /** True for a folder whose children exist (unknown, hence true, for an unlisted repository directory). */
  hasChildren: boolean;
  /** On the active path or a search hit; `children` is inlined. */
  open?: boolean;
  children?: NavigationEntry[];
  activity: NavigationActivity;
  /** Lint violations on a document, summed on repository folders; omitted when zero. */
  problems?: number;
  /** Page folders: path relative to src/pages (New page / Move / drag targets). */
  folderPath?: string;
  /** Repository folders and documents. */
  repository?: NavigationRepositoryRef;
  /** An ignored repository entry shown only because it is on the active path (its label ends in "(ignored)"). */
  hidden?: boolean;
};

export type NavigationResponse = {
  children: NavigationEntry[];
  /**
   * Root only: pages and external pages that `age=recent` hides (not active,
   * not recent, matching the filters). Repository entries are never age-hidden
   * because repository documents carry no source timestamp.
   */
  olderCount?: number;
  /**
   * Root and repository nodes: repository lint counts could not be loaded, so
   * no entry carries `problems`. The tree is still served; the client shows
   * this message and marks repository rows instead of counts.
   */
  problemsError?: string;
};

export const NAVIGATION_ROUTE = "/__playground/navigation";

export function navigationSearch(query: NavigationQuery): string {
  const params = new URLSearchParams({ node: query.node, sort: query.sort, filters: query.filters.join(","), age: query.age, q: query.q });
  if (query.active) params.set("active", query.active);
  return params.toString();
}
