import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { deriveAnchorCounts, deriveAnchorMeta } from "./comment-utils";
import {
  CommentContext,
  exactAnchorResolver,
  type AnchorResolver,
  type CommentContextValue,
  type CommentRailMode,
} from "./comment-context";
import { type Comment, type CommentAnchor, type CommentCallbacks, type CommentConfig } from "./comment-types";

export type CommentProviderProps = CommentCallbacks & {
  children: ReactNode;
  /** All comments for the document; counts and metadata are derived from these. */
  comments: Comment[];
  config: CommentConfig;
  /** Strategy to map a requested anchor onto a registered one. Defaults to exact. */
  resolveAnchor?: AnchorResolver;
};

/**
 * Supplies comment state to a document subtree: derived per-anchor counts and
 * metadata, rail open/focus state, and a generic anchor registry (cells call
 * `registerAnchor` so the side panel can scroll-align to them). Owns no
 * fetching — `comments` and the callbacks are controlled by the consumer.
 */
export function CommentProvider({
  children,
  comments,
  config,
  resolveAnchor = exactAnchorResolver,
  onCreate,
  onReply,
  onUpdateStatus,
  onDelete,
  onChecklistToggle,
  onMention,
}: CommentProviderProps) {
  const [railMode, setRailMode] = useState<CommentRailMode>("closed");
  const [focusedAnchor, setFocusedAnchor] = useState<CommentAnchor | null>(null);
  const [highlightAnchor, setHighlightAnchor] = useState<CommentAnchor | null>(null);
  const anchorEls = useRef<Record<string, HTMLElement>>({});
  const contentRef = useRef<HTMLDivElement | null>(null);

  const commentCounts = useMemo(() => deriveAnchorCounts(comments), [comments]);
  const commentMeta = useMemo(() => deriveAnchorMeta(comments), [comments]);

  const focusAnchor = useCallback((anchor: CommentAnchor) => {
    setFocusedAnchor(anchor);
    setRailMode("focused");
  }, []);

  const openCommentList = useCallback(() => {
    setRailMode((prev) => (prev === "all" ? "closed" : "all"));
  }, []);

  const closeRail = useCallback(() => setRailMode("closed"), []);

  const registerAnchor = useCallback((anchor: CommentAnchor, el: HTMLElement | null) => {
    if (el) anchorEls.current[anchor] = el;
    else delete anchorEls.current[anchor];
  }, []);

  const getAnchorTop = useCallback(
    (anchor: CommentAnchor): number | null => {
      const resolved = resolveAnchor(anchor, Object.keys(anchorEls.current));
      const el = resolved ? anchorEls.current[resolved] : null;
      const container = contentRef.current;
      if (!el || !container) return null;
      return el.getBoundingClientRect().top - container.getBoundingClientRect().top;
    },
    [resolveAnchor],
  );

  // A focused rail with no anchor selected has nothing to show.
  useEffect(() => {
    if (railMode === "focused" && !focusedAnchor) setRailMode("closed");
  }, [railMode, focusedAnchor]);

  const callbacks = useMemo<CommentCallbacks>(
    () => ({
      ...(onCreate ? { onCreate } : {}),
      ...(onReply ? { onReply } : {}),
      ...(onUpdateStatus ? { onUpdateStatus } : {}),
      ...(onDelete ? { onDelete } : {}),
      ...(onChecklistToggle ? { onChecklistToggle } : {}),
      ...(onMention ? { onMention } : {}),
    }),
    [onCreate, onReply, onUpdateStatus, onDelete, onChecklistToggle, onMention],
  );

  const value = useMemo<CommentContextValue>(
    () => ({
      comments,
      config,
      callbacks,
      commentCounts,
      commentMeta,
      railMode,
      focusedAnchor,
      focusAnchor,
      openCommentList,
      closeRail,
      registerAnchor,
      getAnchorTop,
      contentRef,
      highlightAnchor,
      setHighlightAnchor,
    }),
    [
      comments,
      config,
      callbacks,
      commentCounts,
      commentMeta,
      railMode,
      focusedAnchor,
      focusAnchor,
      openCommentList,
      closeRail,
      registerAnchor,
      getAnchorTop,
      highlightAnchor,
    ],
  );

  return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>;
}
