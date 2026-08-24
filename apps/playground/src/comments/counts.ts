import {
  isUnresolved,
  type CommentConfig,
} from "@flanksource/clicky-ui/comments";

import type { PageComment } from "./useComments";

export function countOpenCommentsByPage(
  comments: readonly PageComment[],
  config: CommentConfig,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const comment of comments) {
    if (comment.parentId || !isUnresolved(config, comment.status)) continue;
    counts.set(comment.page, (counts.get(comment.page) ?? 0) + 1);
  }
  return counts;
}
