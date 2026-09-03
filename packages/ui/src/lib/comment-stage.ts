import type {
  Comment,
  CommentConfig,
  CommentStatusConfig,
  CommentStatusStage,
} from "../comments/comment-types";
import { getRoots, resolveStatusConfig } from "../comments/comment-utils";

/** Resolves a stored status to its lifecycle stage. */
export function resolveCommentStage(
  config: CommentConfig,
  status: string | undefined,
): CommentStatusStage | undefined {
  if (status == null) return "active";
  const resolved = resolveStatusConfig(config, status);
  if (!resolved) return undefined;
  if (resolved.stage) return resolved.stage;
  if (resolved.unresolved) return "active";
  if (
    resolved.value.toLowerCase() === "closed" ||
    resolved.label.toLowerCase() === "closed"
  ) {
    return "closed";
  }
  return "resolved";
}

/** Returns the first configured stored status for a lifecycle stage. */
export function statusForCommentStage(
  config: CommentConfig,
  stage: CommentStatusStage,
): CommentStatusConfig | undefined {
  return config.statuses.find(
    (status) => resolveCommentStage(config, status.value) === stage,
  );
}

/** Selects roots in one lifecycle stage together with every descendant reply. */
export function selectCommentThreadsByStage(
  comments: Comment[],
  config: CommentConfig,
  stage: CommentStatusStage,
): Comment[] {
  const keep = new Set(
    getRoots(comments)
      .filter((root) => resolveCommentStage(config, root.status) === stage)
      .map((root) => String(root.id)),
  );
  return comments.filter((comment) =>
    keep.has(String(comment.parentId ?? comment.id)),
  );
}
