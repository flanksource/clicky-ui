import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { deriveAnchorCounts, deriveAnchorMeta } from "./comment-utils";
import {
  CommentContext,
  CommentAnchorActionsContext,
  CommentAnchorStoreContext,
  createCommentAnchorStore,
  exactAnchorResolver,
  type AnchorResolver,
  type CommentAnchorActions,
  type CommentContextValue,
  type CommentRailMode,
  type CommentScrollOptions,
} from "./comment-context";
import {
  type Comment,
  type CommentAnchor,
  type CommentCallbacks,
  type CommentConfig,
} from "./comment-types";

export type CommentProviderProps = CommentCallbacks & {
  children: ReactNode;
  /** All comments for the document; counts and metadata are derived from these. */
  comments: Comment[];
  config: CommentConfig;
  /** Strategy to map a requested anchor onto a registered one. Defaults to exact. */
  resolveAnchor?: AnchorResolver;
  /** Reports rail actions so a host can synchronize external visibility state. */
  onRailModeChange?: (mode: CommentRailMode) => void;
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
  onRailModeChange,
  onCreate,
  onReply,
  onUpdateStatus,
  onDelete,
  onChecklistToggle,
  onMention,
}: CommentProviderProps) {
  const [railMode, setRailMode] = useState<CommentRailMode>("closed");
  const [focusedAnchor, setFocusedAnchor] = useState<CommentAnchor | null>(
    null,
  );
  const [highlightAnchor, setHighlightAnchor] = useState<CommentAnchor | null>(
    null,
  );
  const railModeRef = useRef<CommentRailMode>("closed");
  const onRailModeChangeRef = useRef(onRailModeChange);
  const resolveAnchorRef = useRef(resolveAnchor);
  const anchorEls = useRef<Record<string, HTMLElement>>({});
  const contentRef = useRef<HTMLDivElement | null>(null);

  const commentCounts = useMemo(() => deriveAnchorCounts(comments), [comments]);
  const commentMeta = useMemo(() => deriveAnchorMeta(comments), [comments]);
  const [anchorStore] = useState(createCommentAnchorStore);

  useLayoutEffect(() => {
    onRailModeChangeRef.current = onRailModeChange;
    resolveAnchorRef.current = resolveAnchor;
  }, [onRailModeChange, resolveAnchor]);

  const focusAnchor = useCallback((anchor: CommentAnchor) => {
    setFocusedAnchor(anchor);
    railModeRef.current = "focused";
    setRailMode("focused");
    onRailModeChangeRef.current?.("focused");
  }, []);

  const openCommentList = useCallback(() => {
    const next = railModeRef.current === "all" ? "closed" : "all";
    railModeRef.current = next;
    setRailMode(next);
    onRailModeChangeRef.current?.(next);
  }, []);

  const closeRail = useCallback(() => {
    railModeRef.current = "closed";
    setRailMode("closed");
    onRailModeChangeRef.current?.("closed");
  }, []);

  const registerAnchor = useCallback(
    (anchor: CommentAnchor, el: HTMLElement | null) => {
      if (!el) {
        delete anchorEls.current[anchor];
        return;
      }
      const registered = anchorEls.current[anchor];
      if (registered && registered !== el) {
        throw new Error(
          `Comment anchor "${anchor}" is registered by multiple elements`,
        );
      }
      anchorEls.current[anchor] = el;
    },
    [],
  );

  const getAnchorTop = useCallback(
    (anchor: CommentAnchor): number | null => {
      const resolved = resolveAnchorRef.current(
        anchor,
        Object.keys(anchorEls.current),
      );
      const el = resolved ? anchorEls.current[resolved] : null;
      const container = contentRef.current;
      if (!el || !container) return null;
      return (
        el.getBoundingClientRect().top - container.getBoundingClientRect().top
      );
    },
    [],
  );

  const scrollToAnchor = useCallback(
    (anchor: CommentAnchor, options: CommentScrollOptions = {}): boolean => {
      const resolved = resolveAnchorRef.current(
        anchor,
        Object.keys(anchorEls.current),
      );
      const el = resolved ? anchorEls.current[resolved] : null;
      const container = contentRef.current;
      if (!el || !container) return false;
      const containerRect = container.getBoundingClientRect();
      const anchorRect = el.getBoundingClientRect();
      const offset = options.offset ?? 0;
      const top =
        options.block === "center"
          ? container.scrollTop +
            anchorRect.top -
            containerRect.top +
            anchorRect.height / 2 -
            container.clientHeight / 2 -
            offset
          : container.scrollTop + anchorRect.top - containerRect.top - offset;
      container.scrollTo({
        top: Math.max(0, top),
        behavior: options.behavior ?? "smooth",
      });
      return true;
    },
    [],
  );

  // A focused rail with no anchor selected has nothing to show.
  useEffect(() => {
    if (railMode === "focused" && !focusedAnchor) closeRail();
  }, [closeRail, railMode, focusedAnchor]);

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

  useLayoutEffect(() => {
    anchorStore.update(commentMeta, railMode, focusedAnchor, highlightAnchor);
  }, [anchorStore, commentMeta, railMode, focusedAnchor, highlightAnchor]);

  const [anchorActions] = useState<CommentAnchorActions>(() => ({
    focusAnchor,
    registerAnchor,
    scrollToAnchor,
    contentRef,
  }));

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
      scrollToAnchor,
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
      scrollToAnchor,
      highlightAnchor,
    ],
  );

  return (
    <CommentAnchorStoreContext.Provider value={anchorStore}>
      <CommentAnchorActionsContext.Provider value={anchorActions}>
        <CommentContext.Provider value={value}>{children}</CommentContext.Provider>
      </CommentAnchorActionsContext.Provider>
    </CommentAnchorStoreContext.Provider>
  );
}
