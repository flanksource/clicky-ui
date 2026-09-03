import { useCallback, useEffect, useMemo } from "react";
import {
  DOCUMENT_ANCHOR,
  type CommentContextValue,
} from "@flanksource/clicky-ui";

import type { PageComment } from "./useComments";
import {
  resolvedReviewQueue,
  type ResolvedReviewItem,
} from "./PlaygroundCommentReview";

export function useResolvedCommentReview(options: {
  allComments: PageComment[];
  activeSlug: string | undefined;
  selectedId: string | undefined;
  active: boolean;
  pinsVersion: number;
  context: CommentContextValue;
  onNavigate: (page: string, comment?: string) => void;
}) {
  const queue = useMemo(
    () => resolvedReviewQueue(options.allComments),
    [options.allComments],
  );
  const item = queue.find((comment) => comment.id === options.selectedId);
  const selectItem = useCallback(
    (next: ResolvedReviewItem | undefined) =>
      options.onNavigate(next?.page ?? options.activeSlug ?? "", next?.id),
    [options.activeSlug, options.onNavigate],
  );

  useEffect(() => {
    if (!options.active) return;
    const fallback =
      queue.find((comment) => comment.page === options.activeSlug) ?? queue[0];
    if (item && item.page === options.activeSlug) return;
    if (fallback) {
      options.onNavigate(fallback.page, fallback.id);
    } else if (options.selectedId) {
      options.onNavigate(options.activeSlug ?? "");
    }
  }, [
    item,
    options.active,
    options.activeSlug,
    options.onNavigate,
    options.selectedId,
    queue,
  ]);

  useEffect(() => {
    if (!options.active || !item) return;
    const anchor = item.anchor ?? DOCUMENT_ANCHOR;
    options.context.setHighlightAnchor(anchor);
    if (anchor === DOCUMENT_ANCHOR) {
      options.context.contentRef.current?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      options.context.scrollToAnchor(anchor, {
        behavior: "smooth",
        block: "center",
      });
    }
    return () => options.context.setHighlightAnchor(null);
  }, [item, options.active, options.context, options.pinsVersion]);

  return { queue, item, selectItem };
}
