import { randomUUID } from "node:crypto";

import { readAll, writeAll, addComment, removeComment } from "./comments-store";
import type { StoredComment } from "./comments-store";
import { recordReviewDecision } from "./review-decisions";
import {
  PageStoreError,
  pagePath,
  readSource,
  writeSource,
} from "./pages-store";
import {
  deleteReviewableSource,
  markReviewableSource,
  setReviewRejectedSource,
} from "./reviewable-source";

export function reviewAnchor(reviewId: string): string {
  return `[data-review-id="${reviewId}"]`;
}

export async function persistReviewDecision(
  request: ReviewSourceRequest,
  decision: StoredComment,
): Promise<StoredComment> {
  const reviewId = /^\[data-review-id="([A-Za-z][A-Za-z0-9:_-]*)"\]$/.exec(
    decision.anchor ?? "",
  )?.[1];
  if (!reviewId) throw new Error("review decision requires a review anchor");
  const current = currentSource(request);
  const source = setReviewRejectedSource(
    current,
    reviewId,
    decision.reviewDecision === "rejected",
  );
  const previous = await readAll(request.commentsDir);
  recordReviewDecision(previous[request.slug] ?? [], decision);
  currentSource(request);
  let stored: StoredComment | undefined;
  try {
    writeSource(request.pagesDir, request.slug, source);
    stored = await addComment(request.commentsDir, request.slug, decision);
    const withStored = {
      ...previous,
      [request.slug]: [...(previous[request.slug] ?? []), stored],
    };
    const comments = recordReviewDecision(previous[request.slug] ?? [], stored);
    await writeAll(
      request.commentsDir,
      { ...previous, [request.slug]: comments },
      withStored,
    );
  } catch (cause) {
    try {
      writeSource(request.pagesDir, request.slug, current);
      if (stored) await removeComment(request.commentsDir, stored.id);
    } catch (rollbackError) {
      throw new AggregateError(
        [cause, rollbackError],
        "review decision and rollback both failed",
      );
    }
    throw cause;
  }
  const result = (await readAll(request.commentsDir))[request.slug]?.find(
    (c) => c.id === stored?.id,
  );
  if (!result) throw new Error("Review decision was not persisted");
  return result;
}

export type ReviewSourceRequest = {
  pagesDir: string;
  commentsDir: string;
  slug: string;
  expectedSource: string;
};

function currentSource(request: ReviewSourceRequest): string {
  const current = readSource(request.pagesDir, request.slug);
  if (current !== request.expectedSource) {
    throw new PageStoreError(
      "page source changed since selection; reload and try again",
      409,
    );
  }
  return current;
}

export function markReviewable(
  request: ReviewSourceRequest & {
    domId?: string;
    sourcePath?: string;
    line?: number;
    column?: number;
  },
): { reviewId: string; source: string } {
  const current = currentSource(request);
  const reviewId = `review-${randomUUID()}`;
  const directSource =
    request.sourcePath === pagePath(request.pagesDir, request.slug);
  const source = markReviewableSource(current, {
    ...(request.domId ? { domId: request.domId } : {}),
    ...(directSource && request.line ? { line: request.line } : {}),
    ...(directSource && request.column ? { column: request.column } : {}),
    reviewId,
  });
  writeSource(request.pagesDir, request.slug, source);
  return { reviewId, source };
}

export async function deleteReviewable(
  request: ReviewSourceRequest & {
    reviewId: string;
    associatedCommentIds: string[];
  },
): Promise<{ removedComments: number; source: string }> {
  const current = currentSource(request);
  const source = deleteReviewableSource(current, request.reviewId);
  const all = await readAll(request.commentsDir);
  const pageComments = all[request.slug] ?? [];
  const requestedIds = new Set(request.associatedCommentIds);
  for (const id of requestedIds) {
    if (
      !pageComments.some((comment) => comment.id === id && !comment.parentId)
    ) {
      throw new PageStoreError(
        `comment ${JSON.stringify(id)} is not a root on this page`,
        400,
      );
    }
  }
  const doomedRoots = new Set(
    pageComments
      .filter(
        (comment) =>
          !comment.parentId &&
          (comment.anchor === reviewAnchor(request.reviewId) ||
            requestedIds.has(comment.id)),
      )
      .map((comment) => comment.id),
  );
  const doomed = pageComments.filter(
    (comment) =>
      doomedRoots.has(comment.id) ||
      (comment.parentId && doomedRoots.has(comment.parentId)),
  );
  const next = pageComments.filter((comment) => !doomed.includes(comment));
  currentSource(request);
  try {
    writeSource(request.pagesDir, request.slug, source);
    if (doomed.length > 0) {
      await writeAll(
        request.commentsDir,
        { ...all, [request.slug]: next },
        all,
      );
    }
  } catch (cause) {
    try {
      writeSource(request.pagesDir, request.slug, current);
    } catch (rollbackError) {
      throw new AggregateError(
        [cause, rollbackError],
        "reviewable deletion and rollback both failed",
      );
    }
    throw cause;
  }
  return { removedComments: doomed.length, source };
}
