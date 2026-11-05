import { commentActivity } from "../comment-activity";
import { listComments } from "../comments-query";
import type { DocumentProblems } from "../document-problems";
import { pageUpdates } from "../page-activity";
import type { NavigationActivity, NavigationFilter } from "../../src/navigation/types";
import { emptyActivity, matchesActivity, mergeActivities } from "./tree";

/** Activity by page id: page slug, `document:<uuid>/<path>`, `folder:<uuid>/<path>` or `external:<uuid>`. */
export type ActivityIndex = Map<string, NavigationActivity>;

function timestamp(value: string): number {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) throw new Error(`Invalid page update timestamp: ${value}`);
  return time;
}

/** Comment activity joined with page file mtimes (`updated`), as the sidebar did in the browser. */
export async function loadActivity({ dir, pagesDir }: { dir: string; pagesDir: string }): Promise<{ index: ActivityIndex; updates: Record<string, string> }> {
  const index: ActivityIndex = new Map();
  const updates = pageUpdates(pagesDir);
  for (const [id, { updated, commented, resolved, openCount, resolvedCount, waitingOn }] of Object.entries(commentActivity(await listComments(dir)))) {
    index.set(id, { updated, commented, resolved, openCount, resolvedCount, ...(waitingOn.length ? { waitingOn } : {}) });
  }
  for (const [slug, date] of Object.entries(updates)) {
    index.set(slug, { ...(index.get(slug) ?? emptyActivity()), updated: timestamp(date) });
  }
  return { index, updates };
}

/** A repository document (or a comment thread on a folder) with the activity recorded against it. */
export type RepositoryActivity = { repositoryId: string; path: string; folder: boolean; activity: NavigationActivity };

const REPOSITORY_ID = /^(document|folder):([\da-f-]{36})\/(.+)$/;

export function repositoryActivity(index: ActivityIndex): RepositoryActivity[] {
  const records: RepositoryActivity[] = [];
  for (const [id, activity] of index) {
    if (!id.startsWith("document:") && !id.startsWith("folder:")) continue;
    const match = REPOSITORY_ID.exec(id);
    if (!match?.[2] || !match[3]) throw new Error(`Invalid repository activity identity: ${id}`);
    records.push({ repositoryId: match[2], path: match[3], folder: match[1] === "folder", activity });
  }
  return records;
}

const contains = (directory: string, path: string, includeSelf: boolean) =>
  directory === "." || (includeSelf && path === directory) || path.startsWith(`${directory}/`);

/**
 * Activity below a repository directory, from the activity index alone (no
 * directory walk). Only records matching the filters count, so `matches` is
 * zero exactly when a filtered view has nothing to show there.
 */
export function directoryActivity({
  records,
  repositoryId,
  directory,
  filters,
}: {
  records: readonly RepositoryActivity[];
  repositoryId: string;
  directory: string;
  filters: readonly NavigationFilter[];
}): { activity: NavigationActivity; matches: number } {
  const below = records.filter(
    (record) => record.repositoryId === repositoryId && contains(directory, record.path, record.folder) && matchesActivity(record.activity, filters),
  );
  return { activity: mergeActivities(below.map((record) => record.activity)), matches: below.length };
}

/** Lint violations per document id. */
export function problemCounts(problems: DocumentProblems): Map<string, number> {
  return new Map(
    Object.entries(problems).map(([id, findings]) => [
      id,
      [...findings.plain, ...findings.prompt].reduce((sum, lint) => sum + (lint.violations?.length ?? 0), 0),
    ]),
  );
}

export function directoryProblems(counts: ReadonlyMap<string, number>, repositoryId: string, directory: string): number {
  const prefix = directory === "." ? `document:${repositoryId}/` : `document:${repositoryId}/${directory}/`;
  let total = 0;
  for (const [id, count] of counts) if (id.startsWith(prefix)) total += count;
  return total;
}
