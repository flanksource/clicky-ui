import {
  UNRESOLVED_STATUSES,
  assertPage,
  assertStatus,
  readAll,
  type ListedComment,
  type StoredComment,
} from "./comments-store";

export type CommentFilter = {
  page?: string;
  /** Matched against thread roots; a matching root brings its replies. */
  statuses?: readonly string[];
};

const IMPLICIT_STATUS = "open";

export function parseCommentFilter(params: URLSearchParams): CommentFilter {
  const filter: CommentFilter = {};
  const page = params.get("page");
  if (page !== null) filter.page = assertPage(page);

  const statuses = params
    .getAll("status")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter((value) => value !== "")
    .map(assertStatus);
  const unresolved = params.get("unresolved");
  if (unresolved !== null) {
    if (unresolved !== "true" && unresolved !== "false") {
      throw new Error(
        `"unresolved" must be "true" or "false", got ${JSON.stringify(unresolved)}`,
      );
    }
    if (unresolved === "true") statuses.push(...UNRESOLVED_STATUSES);
  }
  if (statuses.length > 0) filter.statuses = [...new Set(statuses)];
  return filter;
}

function selectThreads(
  list: StoredComment[],
  statuses: readonly string[],
): StoredComment[] {
  const kept = new Set(
    list
      .filter(
        (entry) =>
          !entry.parentId && statuses.includes(entry.status ?? IMPLICIT_STATUS),
      )
      .map((entry) => entry.id),
  );
  for (let grew = true; grew; ) {
    grew = false;
    for (const entry of list) {
      if (entry.parentId && kept.has(entry.parentId) && !kept.has(entry.id)) {
        kept.add(entry.id);
        grew = true;
      }
    }
  }
  return list.filter((entry) => kept.has(entry.id));
}

export function listComments(
  dir: string,
  filter: CommentFilter = {},
): ListedComment[] {
  const data = readAll(dir);
  const pages =
    filter.page === undefined ? Object.keys(data).sort() : [filter.page];
  return pages.flatMap((page) => {
    const list = data[page] ?? [];
    const selected = filter.statuses
      ? selectThreads(list, filter.statuses)
      : list;
    return selected.map((comment) => ({ ...comment, page }));
  });
}
