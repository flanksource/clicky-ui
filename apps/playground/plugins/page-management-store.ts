import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";

import { readAll, writeAll, type CommentsFile } from "./comments-store";
import {
  planPageReferenceUpdates,
  readTypeScriptSources,
  type PageReferenceEdit,
  type PageReferencePlan,
} from "./page-reference-refactor";
import { rewritePageTitle } from "./page-source";
import {
  PageStoreError,
  pagePath,
  readSource,
  sourceExists,
  writeSource,
} from "./pages-store";

export type MovePageOptions = {
  sourceRoot: string;
  pagesDir: string;
  commentsDir: string;
  slug: string;
  nextSlug: string;
  title?: string;
  writeReference?: (file: string, source: string) => void;
};

export type MovePageResult = {
  slug: string;
  movedComments: number;
  updatedReferences: number;
  updatedFiles: number;
};

type CommentMove = {
  comments: CommentsFile;
  movedComments: number;
  changed: boolean;
};

type PreparedMove = {
  source: string;
  comments: CommentsFile;
  commentMove: CommentMove;
  referencePlan: PageReferencePlan;
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
): CommentMove {
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

function rollbackMove(options: {
  pagesDir: string,
  slug: string,
  nextSlug: string,
  source: string,
  commentsDir: string,
  comments: CommentsFile,
  referenceEdits: readonly PageReferenceEdit[],
  writeReference: (file: string, source: string) => void,
}): void {
  const {
    pagesDir,
    slug,
    nextSlug,
    source,
    commentsDir,
    comments,
    referenceEdits,
    writeReference,
  } = options;
  if (slug !== nextSlug && sourceExists(pagesDir, nextSlug)) {
    mkdirSync(dirname(pagePath(pagesDir, slug)), { recursive: true });
    renameSync(pagePath(pagesDir, nextSlug), pagePath(pagesDir, slug));
  }
  writeSource(pagesDir, slug, source);
  for (const edit of referenceEdits) writeReference(edit.file, edit.source);
  writeAll(commentsDir, comments);
}

function writeTextFile(file: string, source: string): void {
  const tmp = `${file}.${randomUUID()}.move.tmp`;
  try {
    writeFileSync(tmp, source, "utf8");
    renameSync(tmp, file);
  } finally {
    if (existsSync(tmp)) unlinkSync(tmp);
  }
}

function prepareMove(options: MovePageOptions): PreparedMove {
  const { sourceRoot, pagesDir, commentsDir, slug, nextSlug, title } = options;
  const source = readSource(pagesDir, slug);
  const nextSource = title === undefined ? source : rewritePageTitle(source, title);
  const oldFile = pagePath(pagesDir, slug);
  const newFile = pagePath(pagesDir, nextSlug);
  const sources = readTypeScriptSources(sourceRoot).map((document) =>
    document.file === oldFile ? { ...document, source: nextSource } : document,
  );
  const referencePlan = planPageReferenceUpdates({
    sources,
    oldFile,
    newFile,
    oldSlug: slug,
    newSlug: nextSlug,
  });
  const comments = readAll(commentsDir);
  const commentMove = commentsAfterMove(comments, slug, nextSlug);
  return { source, comments, commentMove, referencePlan };
}

function applyMove(options: {
  move: MovePageOptions;
  prepared: PreparedMove;
  writeReference: (file: string, source: string) => void;
}): void {
  const { move, prepared, writeReference } = options;
  if (move.slug !== move.nextSlug) {
    mkdirSync(dirname(pagePath(move.pagesDir, move.nextSlug)), { recursive: true });
    renameSync(pagePath(move.pagesDir, move.slug), pagePath(move.pagesDir, move.nextSlug));
  }
  if (prepared.referencePlan.movedSource !== prepared.source) {
    writeSource(move.pagesDir, move.nextSlug, prepared.referencePlan.movedSource);
  }
  for (const edit of prepared.referencePlan.edits) writeReference(edit.file, edit.nextSource);
  if (prepared.commentMove.changed) writeAll(move.commentsDir, prepared.commentMove.comments);
}

export function movePage(options: MovePageOptions): MovePageResult {
  const { pagesDir, slug, nextSlug } = options;
  if (!sourceExists(pagesDir, slug)) {
    throw new PageStoreError(`page "${slug}" does not exist`, 404);
  }
  if (slug !== nextSlug && sourceExists(pagesDir, nextSlug)) {
    throw new PageStoreError(`page "${nextSlug}" already exists`, 409);
  }
  const writeReference = options.writeReference ?? writeTextFile;
  const prepared = prepareMove(options);

  try {
    applyMove({ move: options, prepared, writeReference });
  } catch (cause) {
    try {
      rollbackMove({
        pagesDir,
        slug,
        nextSlug,
        source: prepared.source,
        commentsDir: options.commentsDir,
        comments: prepared.comments,
        referenceEdits: prepared.referencePlan.edits,
        writeReference,
      });
    } catch (rollbackCause) {
      throw new PageStoreError(
        `page move failed (${String(cause)}) and rollback failed (${String(rollbackCause)})`,
        500,
      );
    }
    throw new PageStoreError(`page move failed and was rolled back: ${String(cause)}`, 500);
  }

  return {
    slug: nextSlug,
    movedComments: prepared.commentMove.movedComments,
    updatedReferences: prepared.referencePlan.updatedReferences,
    updatedFiles:
      prepared.referencePlan.edits.length +
      (prepared.referencePlan.movedSource === prepared.source ? 0 : 1),
  };
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
