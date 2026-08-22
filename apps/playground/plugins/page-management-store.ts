import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, renameSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";

import { readAll, writeAll, type CommentsFile } from "./comments-store";
import { rewritePageTitle } from "./page-source";
import {
  PageStoreError,
  pagePath,
  readSource,
  sourceExists,
  writeSource,
} from "./pages-store";

export type MovePageOptions = {
  pagesDir: string;
  commentsDir: string;
  slug: string;
  nextSlug: string;
  title?: string;
};

export type DeletePageOptions = {
  pagesDir: string;
  commentsDir: string;
  slug: string;
};

function commentsAfterMove(
  comments: CommentsFile,
  slug: string,
  nextSlug: string,
): { comments: CommentsFile; movedComments: number; changed: boolean } {
  if (slug === nextSlug || !Object.hasOwn(comments, slug)) {
    return { comments, movedComments: 0, changed: false };
  }
  if (Object.hasOwn(comments, nextSlug)) {
    throw new PageStoreError(`feedback already exists for page "${nextSlug}"`, 409);
  }

  const moved = comments[slug];
  if (!moved) throw new Error(`comments for "${slug}" disappeared during move planning`);
  const next = { ...comments, [nextSlug]: moved };
  delete next[slug];
  return { comments: next, movedComments: moved.length, changed: true };
}

function rollbackMove(
  pagesDir: string,
  slug: string,
  nextSlug: string,
  source: string,
  commentsDir: string,
  comments: CommentsFile,
): void {
  if (slug !== nextSlug && sourceExists(pagesDir, nextSlug)) {
    mkdirSync(dirname(pagePath(pagesDir, slug)), { recursive: true });
    renameSync(pagePath(pagesDir, nextSlug), pagePath(pagesDir, slug));
  }
  writeSource(pagesDir, slug, source);
  writeAll(commentsDir, comments);
}

export function movePage(options: MovePageOptions): {
  slug: string;
  movedComments: number;
} {
  const { pagesDir, commentsDir, slug, nextSlug, title } = options;
  if (!sourceExists(pagesDir, slug)) {
    throw new PageStoreError(`page "${slug}" does not exist`, 404);
  }
  if (slug !== nextSlug && sourceExists(pagesDir, nextSlug)) {
    throw new PageStoreError(`page "${nextSlug}" already exists`, 409);
  }

  const source = readSource(pagesDir, slug);
  const nextSource = title === undefined ? source : rewritePageTitle(source, title);
  const comments = readAll(commentsDir);
  const commentMove = commentsAfterMove(comments, slug, nextSlug);

  try {
    if (slug !== nextSlug) {
      mkdirSync(dirname(pagePath(pagesDir, nextSlug)), { recursive: true });
      renameSync(pagePath(pagesDir, slug), pagePath(pagesDir, nextSlug));
    }
    if (nextSource !== source) writeSource(pagesDir, nextSlug, nextSource);
    if (commentMove.changed) writeAll(commentsDir, commentMove.comments);
  } catch (cause) {
    try {
      rollbackMove(pagesDir, slug, nextSlug, source, commentsDir, comments);
    } catch (rollbackCause) {
      throw new PageStoreError(
        `page move failed (${String(cause)}) and rollback failed (${String(rollbackCause)})`,
        500,
      );
    }
    throw new PageStoreError(`page move failed and was rolled back: ${String(cause)}`, 500);
  }

  return { slug: nextSlug, movedComments: commentMove.movedComments };
}

export function deletePage(options: DeletePageOptions): {
  slug: string;
  deletedComments: number;
} {
  const { pagesDir, commentsDir, slug } = options;
  if (!sourceExists(pagesDir, slug)) {
    throw new PageStoreError(`page "${slug}" does not exist`, 404);
  }

  const file = pagePath(pagesDir, slug);
  const backup = `${file}.${randomUUID()}.delete.tmp`;
  const comments = readAll(commentsDir);
  const deletedComments = comments[slug]?.length ?? 0;
  const changed = Object.hasOwn(comments, slug);
  const nextComments = { ...comments };
  delete nextComments[slug];

  renameSync(file, backup);
  try {
    if (changed) writeAll(commentsDir, nextComments);
    unlinkSync(backup);
  } catch (cause) {
    try {
      if (existsSync(backup)) renameSync(backup, file);
      if (changed) writeAll(commentsDir, comments);
    } catch (rollbackCause) {
      throw new PageStoreError(
        `page deletion failed (${String(cause)}) and rollback failed (${String(rollbackCause)})`,
        500,
      );
    }
    throw new PageStoreError(`page deletion failed and was rolled back: ${String(cause)}`, 500);
  }

  return { slug, deletedComments };
}
