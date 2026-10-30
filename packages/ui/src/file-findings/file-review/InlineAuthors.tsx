import { useLayoutEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { CommentAuthorAvatar } from "../../comments/CommentAuthor";
import type { Comment } from "../../comments/comment-types";
import { getRoots } from "../../comments/comment-utils";

import { QUOTE_PREFIX, parseQuoteAnchor, resolveQuote } from "./quote-anchor";

export function InlineAuthors({
  markdown,
  comments,
  focused,
  onFocus,
}: {
  markdown: RefObject<HTMLDivElement | null>;
  comments: Comment[];
  focused: string | null;
  onFocus: (anchor: string) => void;
}) {
  const [hosts, setHosts] = useState(new Map<string, HTMLElement>());
  useLayoutEffect(() => {
    const root = markdown.current;
    if (!root) return;
    const mounted = new Map<string, HTMLElement>();
    const sync = () => {
      let changed = false;
      for (const comment of getRoots(comments)) {
        const anchor = comment.anchor;
        if (!anchor?.startsWith(QUOTE_PREFIX) || mounted.get(comment.id)?.isConnected) continue;
        const range = resolveQuote(root, parseQuoteAnchor(anchor));
        if (!range) continue;
        const host = document.createElement("span");
        host.dataset.commentAuthor = comment.id;
        host.className = "ml-1 inline-flex align-middle leading-none";
        host.contentEditable = "false";
        range.collapse(false);
        range.insertNode(host);
        mounted.set(comment.id, host);
        changed = true;
      }
      if (changed) setHosts(new Map(mounted));
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      for (const host of mounted.values()) host.remove();
    };
  }, [markdown, comments]);

  return getRoots(comments).map((comment) => {
    const host = hosts.get(comment.id);
    const anchor = comment.anchor;
    if (!host || !anchor) return null;
    return createPortal(
      <button
        type="button"
        aria-label={`Open comment by ${comment.author?.name ?? "Anonymous"}`}
        aria-pressed={focused === anchor}
        className="inline-flex rounded-full ring-offset-background hover:ring-2 hover:ring-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => onFocus(anchor)}
      >
        <CommentAuthorAvatar author={comment.author ?? null} size="xs" bare />
      </button>,
      host,
      comment.id,
    );
  });
}
