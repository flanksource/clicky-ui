import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type RefObject,
} from "react";
import {
  DOCUMENT_ANCHOR,
  type Comment,
  type CommentAnchor,
  type CommentAnchorMeta,
  type CommentCallbacks,
  type CommentConfig,
} from "./comment-types";

export type CommentRailMode = "closed" | "focused" | "all";

export type CommentScrollOptions = {
  behavior?: ScrollBehavior;
  block?: "start" | "center";
  offset?: number;
};

/** Resolves a requested anchor to a registered one (or null). */
export type AnchorResolver = (anchor: CommentAnchor, registered: string[]) => string | null;

export type CommentContextValue = {
  comments: Comment[];
  config: CommentConfig;
  callbacks: CommentCallbacks;
  commentCounts: Record<CommentAnchor, number>;
  commentMeta: Record<CommentAnchor, CommentAnchorMeta>;
  railMode: CommentRailMode;
  focusedAnchor: CommentAnchor | null;
  focusAnchor: (anchor: CommentAnchor) => void;
  openCommentList: () => void;
  closeRail: () => void;
  registerAnchor: (anchor: CommentAnchor, el: HTMLElement | null) => void;
  getAnchorTop: (anchor: CommentAnchor) => number | null;
  scrollToAnchor: (anchor: CommentAnchor, options?: CommentScrollOptions) => boolean;
  contentRef: RefObject<HTMLDivElement | null>;
  highlightAnchor: CommentAnchor | null;
  setHighlightAnchor: (anchor: CommentAnchor | null) => void;
};

export const CommentContext = createContext<CommentContextValue | null>(null);

export type CommentAnchorState = {
  meta: CommentAnchorMeta | undefined;
  active: boolean;
  highlighted: boolean;
};

export type CommentAnchorStore = {
  update: (
    commentMeta: Record<CommentAnchor, CommentAnchorMeta>,
    railMode: CommentRailMode,
    focusedAnchor: CommentAnchor | null,
    highlightAnchor: CommentAnchor | null,
  ) => void;
  getSnapshot: (anchor: CommentAnchor) => CommentAnchorState;
  subscribe: (anchor: CommentAnchor, listener: () => void) => () => void;
};

export type CommentAnchorActions = Pick<
  CommentContextValue,
  "focusAnchor" | "registerAnchor" | "scrollToAnchor" | "contentRef"
>;

const EMPTY_ANCHOR_STATE: CommentAnchorState = Object.freeze({
  meta: undefined,
  active: false,
  highlighted: false,
});

function sameMeta(
  first: CommentAnchorMeta | undefined,
  second: CommentAnchorMeta | undefined,
): boolean {
  if (first === second) return true;
  if (!first || !second) return false;
  return (
    first.count === second.count &&
    first.latestStatus === second.latestStatus &&
    first.authors.length === second.authors.length &&
    first.authors.every((author, index) => author === second.authors[index])
  );
}

function sameAnchorState(
  first: CommentAnchorState,
  second: CommentAnchorState,
): boolean {
  return (
    sameMeta(first.meta, second.meta) &&
    first.active === second.active &&
    first.highlighted === second.highlighted
  );
}

export function createCommentAnchorStore(): CommentAnchorStore {
  let meta: Record<CommentAnchor, CommentAnchorMeta> = {};
  let mode: CommentRailMode = "closed";
  let focused: CommentAnchor | null = null;
  let highlighted: CommentAnchor | null = null;
  const snapshots = new Map<CommentAnchor, CommentAnchorState>();
  const listeners = new Map<CommentAnchor, Set<() => void>>();

  function nextSnapshot(anchor: CommentAnchor): CommentAnchorState {
    return {
      meta: meta[anchor],
      active: mode === "focused" && focused === anchor,
      highlighted: highlighted === anchor || (mode === "focused" && focused === anchor),
    };
  }

  return {
    update(nextMeta, nextMode, nextFocused, nextHighlighted) {
      meta = nextMeta;
      mode = nextMode;
      focused = nextFocused;
      highlighted = nextHighlighted;
      for (const [anchor, anchorListeners] of listeners) {
        const current = snapshots.get(anchor) ?? EMPTY_ANCHOR_STATE;
        const next = nextSnapshot(anchor);
        if (sameAnchorState(current, next)) continue;
        snapshots.set(anchor, next);
        for (const listener of anchorListeners) listener();
      }
    },
    getSnapshot(anchor) {
      const current = snapshots.get(anchor) ?? EMPTY_ANCHOR_STATE;
      const next = nextSnapshot(anchor);
      if (sameAnchorState(current, next)) return current;
      snapshots.set(anchor, next);
      return next;
    },
    subscribe(anchor, listener) {
      const anchorListeners = listeners.get(anchor) ?? new Set();
      anchorListeners.add(listener);
      listeners.set(anchor, anchorListeners);
      return () => {
        anchorListeners.delete(listener);
        if (anchorListeners.size === 0) listeners.delete(anchor);
      };
    },
  };
}

export const CommentAnchorStoreContext = createContext<CommentAnchorStore | null>(null);
export const CommentAnchorActionsContext = createContext<CommentAnchorActions | null>(null);

/** Subscribes to metadata and focus state for one anchor only. */
export function useCommentAnchorOptional(
  anchor: CommentAnchor | null | undefined,
): CommentAnchorState | null {
  const contextStore = useContext(CommentAnchorStoreContext);
  const store = contextStore ?? EMPTY_ANCHOR_STORE;
  const subscribe = useCallback(
    (listener: () => void) => (anchor ? store.subscribe(anchor, listener) : () => undefined),
    [anchor, store],
  );
  const getSnapshot = useCallback(
    () => (anchor ? store.getSnapshot(anchor) : EMPTY_ANCHOR_STATE),
    [anchor, store],
  );
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return contextStore && anchor ? snapshot : null;
}

const EMPTY_ANCHOR_STORE = createCommentAnchorStore();

/** Reads stable anchor actions without subscribing to document comment state. */
export function useCommentAnchorActionsOptional(): CommentAnchorActions | null {
  return useContext(CommentAnchorActionsContext);
}

/** Resolver for opaque identities such as URIs: exact match or no match. */
export function strictAnchorResolver(anchor: CommentAnchor, registered: string[]): string | null {
  return registered.includes(anchor) ? anchor : null;
}

/** Default resolver: exact match, else the document anchor if registered. */
export function exactAnchorResolver(anchor: CommentAnchor, registered: string[]): string | null {
  if (registered.includes(anchor)) return anchor;
  if (registered.includes(DOCUMENT_ANCHOR)) return DOCUMENT_ANCHOR;
  return null;
}

/** Resolver for dotted anchor keys: walks up `a.b.c` → `a.b` → `a` → document. */
export function dottedAnchorResolver(anchor: CommentAnchor, registered: string[]): string | null {
  if (registered.includes(anchor)) return anchor;
  let cursor = anchor;
  while (cursor.includes(".")) {
    cursor = cursor.slice(0, cursor.lastIndexOf("."));
    if (registered.includes(cursor)) return cursor;
  }
  return registered.includes(DOCUMENT_ANCHOR) ? DOCUMENT_ANCHOR : null;
}

/** Reads the comment context; throws when used outside a CommentProvider. */
export function useCommentContext(): CommentContextValue {
  const ctx = useContext(CommentContext);
  if (!ctx) throw new Error("useCommentContext must be used within a CommentProvider");
  return ctx;
}

/** Reads the comment context, returning null when no provider is present. */
export function useCommentContextOptional(): CommentContextValue | null {
  return useContext(CommentContext);
}
