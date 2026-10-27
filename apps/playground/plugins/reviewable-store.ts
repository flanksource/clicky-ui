import { randomUUID } from "node:crypto";

import { readAll, writeAll } from "./comments-store";
import type { StoredComment } from "./comments-store";
import { recordReviewDecision } from "./review-decisions";
import { stageScreenshotRemoval } from "./comments-screenshots";
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

export function persistReviewDecision(
  request: ReviewSourceRequest,
  decision: StoredComment,
): StoredComment {
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
  const previous = readAll(request.commentsDir);
  const comments = recordReviewDecision(previous[request.slug] ?? [], decision);
  try {
    writeSource(request.pagesDir, request.slug, source);
    writeAll(request.commentsDir, { ...previous, [request.slug]: comments });
  } catch (cause) {
    try {
      writeSource(request.pagesDir, request.slug, current);
      writeAll(request.commentsDir, previous);
    } catch (rollbackError) {
      throw new AggregateError(
        [cause, rollbackError],
        "review decision and rollback both failed",
      );
    }
    throw cause;
  }
  const result = comments.at(-1);
  if (!result) throw new Error("review decision was not persisted");
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

export function deleteReviewable(
  request: ReviewSourceRequest & {
    reviewId: string;
    associatedCommentIds: string[];
  },
): { removedComments: number; source: string } {
  const current = currentSource(request);
  const source = deleteReviewableSource(current, request.reviewId);
  const all = readAll(request.commentsDir);
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
  const screenshots = stageScreenshotRemoval(request.commentsDir, doomed);
  try {
    writeSource(request.pagesDir, request.slug, source);
    if (doomed.length > 0) {
      all[request.slug] = next;
      writeAll(request.commentsDir, all);
    }
  } catch (cause) {
    try {
      writeSource(request.pagesDir, request.slug, current);
      if (doomed.length > 0) {
        all[request.slug] = pageComments;
        writeAll(request.commentsDir, all);
      }
      screenshots.rollback();
    } catch (rollbackError) {
      throw new AggregateError(
        [cause, rollbackError],
        "reviewable deletion and rollback both failed",
      );
    }
    throw cause;
  }
  screenshots.commit();
  return { removedComments: doomed.length, source };
}
