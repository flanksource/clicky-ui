import type { ClickyDocument, ClickyRow } from "../data/Clicky";
import { documentOf, findFirstTable, mapFirstTable } from "./executionPages";
import { getClickyRowId } from "./rowNavigation";
import type { ExecutionResponse, OpenAPIParameter, ResolvedOperation } from "./types";

// Parameter roles a follow session's query string mirrors: everything that
// scopes *which* rows the stream serves (locked values, filter chips, search,
// a time window). Paging/sort/cursor describe a fetched page, not a live
// stream that has no pages to walk and appends rows in the order they close.
const FOLLOW_EXCLUDED_ROLES = new Set(["limit", "offset", "cursor", "sort", "order"]);

/**
 * The query-string params a follow session opens with: the same scoping
 * parameters (locked values plus every active filter/search) the list
 * request itself sends, minus paging/sort/cursor. Reusing exactly these,
 * rather than a separate follow-specific filter set, is what keeps a follow
 * session and the page it augments looking at the same rows.
 */
export function followSessionParams(
  listParameters: OpenAPIParameter[],
  effectiveFilters: Record<string, string>,
): Record<string, string> {
  const params: Record<string, string> = {};
  for (const parameter of listParameters) {
    const role = parameter["x-clicky"]?.role ?? "";
    if (FOLLOW_EXCLUDED_ROLES.has(role)) continue;
    const value = effectiveFilters[parameter.name];
    if (value !== undefined && value !== "") params[parameter.name] = value;
  }
  return params;
}

/**
 * Finds the session-start operation the server contract advertises for a
 * followable list operation: `POST <listPath>/sessions` (operationId
 * `start-<name>-session`). Matched on path+method rather than the
 * operationId spelling, because the path is what `useLogTail` actually
 * calls — this is the one fact that has to be right.
 */
export function findSessionStartOperation(
  operations: ResolvedOperation[],
  listEndpoint: ResolvedOperation | undefined,
): ResolvedOperation | undefined {
  if (!listEndpoint) return undefined;
  const sessionsPath = `${listEndpoint.path}/sessions`;
  return operations.find(
    (operation) => operation.method.toLowerCase() === "post" && operation.path === sessionsPath,
  );
}

export type LogTailTarget = { basePath: string; profile: string };

/**
 * Splits a list operation's path into the session API's basePath and profile
 * name. `useLogTail` builds `POST {basePath}/profile/{profile}/sessions`
 * itself, so this only has to find where "/profile/" sits in the operation's
 * own path — e.g. "/api/v1/profile/profile-trace-results-jvm-trace" splits
 * into basePath "/api/v1" and profile "profile-trace-results-jvm-trace".
 */
export function deriveLogTailTarget(path: string): LogTailTarget | undefined {
  const marker = "/profile/";
  const index = path.indexOf(marker);
  if (index < 0) return undefined;
  const profile = path.slice(index + marker.length);
  if (!profile) return undefined;
  return { basePath: path.slice(0, index) || "/", profile };
}

// Result rows carry a unique "seq" column (the recordstore's own sequence)
// even when they have none of the conventional id columns getClickyRowId
// looks for, so follow-row identity falls back to it before giving up.
const SEQ_ID_KEYS = ["seq", "Seq", "sequence", "Sequence"];

/**
 * Row identity for follow-mode dedup, read off the *presented* ClickyRow —
 * the same cells the table itself renders — rather than the raw JSON row's
 * own field names, which need not match a column name at all (a presenter
 * can rename, compute or drop fields). Using the presented row is what keeps
 * dedup correct without follow mode having to know a profile's raw shape.
 */
export function followRowIdentity(row: ClickyRow): string | undefined {
  const id = getClickyRowId(row);
  if (id) return id;
  for (const key of SEQ_ID_KEYS) {
    const plain = row.cells[key]?.plain;
    if (plain) return `${key}:${plain}`;
  }
  return undefined;
}

export type FollowRowOrder = "newest-first" | "oldest-first";

/** The insertion order a follow merge uses, from the catalog's own sort
 *  direction: descending (or no sort at all — the default a live view reads
 *  as "most recent on top") keeps the newest arrival at the head; ascending
 *  keeps the table's oldest-first order and appends at the tail. */
export function followRowOrder(sortDir: "asc" | "desc" | undefined): FollowRowOrder {
  return sortDir === "asc" ? "oldest-first" : "newest-first";
}

export type FollowRowsPartition = {
  /** Presented rows ready to merge into the table, in arrival order. */
  rows: ClickyRow[];
  /**
   * True when at least one buffered row-shaped event arrived with no
   * presented `clickyRow`. OperationCatalog's follow mode only ever targets
   * a tabular list surface, whose per-row events are expected to carry one
   * (see `LogTailEvent.clickyRow`); a row missing it is never guessed at as
   * plain text — it is a stream contract violation to surface as an error.
   */
  missingClickyRow: boolean;
};

/**
 * Pairs `useLogTail`'s raw `rows` with its index-aligned `clickyRows` (both
 * from `UseLogTailResult`) and separates the two things a caller needs:
 * the rows that are ready to merge, and whether any arrived without one.
 */
export function partitionFollowRows(
  rows: Record<string, unknown>[],
  clickyRows: (ClickyRow | undefined)[],
): FollowRowsPartition {
  const presented: ClickyRow[] = [];
  let missingClickyRow = false;
  for (let index = 0; index < rows.length; index += 1) {
    const clickyRow = clickyRows[index];
    if (clickyRow) presented.push(clickyRow);
    else missingClickyRow = true;
  }
  return { rows: presented, missingClickyRow };
}

export type FollowMergeResult = {
  response: ExecutionResponse;
  /** Live rows folded into the table that were not already on the page. */
  addedCount: number;
};

/**
 * Folds a follow session's presented rows into the last list response's
 * table — de-duplicated against whatever the table already shows, including
 * rows a later refetch brought back through the ordinary list query.
 * Recomputed from `response` fresh on every call rather than keeping its own
 * running row list, which is what keeps a refetch from ever duplicating a
 * row this merge already folded in.
 *
 * Returns undefined when there is nothing new to fold in — no response yet,
 * no live rows, or every live row already on the page — so a caller can
 * cheaply keep rendering the unmerged response by identity.
 *
 * Throws when `response` carries no table to merge into: a follow session
 * only ever targets a tabular list surface, so a response with nothing to
 * fold into is a contract violation, not a case to quietly drop rows for.
 */
export function mergeFollowRowsIntoResponse(
  response: ExecutionResponse | null,
  liveRows: ClickyRow[],
  order: FollowRowOrder = "newest-first",
): FollowMergeResult | undefined {
  if (!response || liveRows.length === 0) return undefined;
  const document = documentOf(response);
  if (!document) return undefined;
  const table = findFirstTable(document.node);
  if (!table) {
    throw new Error(
      "OperationCatalog follow mode: the list response carries no table to merge live rows into",
    );
  }

  const existingRows = table.rows ?? [];
  const existingIds = new Set(
    existingRows.map(followRowIdentity).filter((id): id is string => id != null),
  );
  const freshRows = liveRows.filter((row) => {
    const id = followRowIdentity(row);
    return id == null || !existingIds.has(id);
  });
  if (freshRows.length === 0) return undefined;

  // `liveRows` arrives oldest-first (LogTailBuffer's own order); a
  // newest-first merge has to reverse that batch so the freshest arrival ends
  // up first, right at the table's head.
  const ordered = order === "newest-first" ? [...freshRows].reverse() : freshRows;
  const mergedRows =
    order === "newest-first" ? [...ordered, ...existingRows] : [...existingRows, ...ordered];

  const merged: ClickyDocument = {
    version: 1,
    node: mapFirstTable(document.node, (t) => ({ ...t, rows: mergedRows })).node,
  };

  return {
    response: { ...response, parsed: merged, stdout: JSON.stringify(merged) },
    addedCount: freshRows.length,
  };
}
