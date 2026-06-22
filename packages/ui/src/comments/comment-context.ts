import { createContext, useContext, type RefObject } from "react";
import {
  DOCUMENT_ANCHOR,
  type Comment,
  type CommentAnchor,
  type CommentAnchorMeta,
  type CommentCallbacks,
  type CommentConfig,
} from "./comment-types";

export type CommentRailMode = "closed" | "focused" | "all";

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
  contentRef: RefObject<HTMLDivElement | null>;
  highlightAnchor: CommentAnchor | null;
  setHighlightAnchor: (anchor: CommentAnchor | null) => void;
};

export const CommentContext = createContext<CommentContextValue | null>(null);

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
