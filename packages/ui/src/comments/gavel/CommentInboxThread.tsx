import { CommentThreadList } from "../CommentThreadList";
import type { CommentConfig } from "../comment-types";
import { projectNative } from "./gavel-projection";
import type { InboxItem } from "./inbox-model";

/** What a host does with the inbox's threads. Each handler gets the thread with where it lives, so a host spanning scopes knows which to act on. */
export type CommentInboxActions = {
  onReply?: (item: InboxItem, body: string) => void | Promise<void>;
  onUpdateStatus?: (item: InboxItem, status: string) => void | Promise<void>;
  /** A human closing resolved work. */
  onClose?: (item: InboxItem) => void | Promise<void>;
  onAcknowledge?: (item: InboxItem) => void | Promise<void>;
  /** Marks every thread on a target read for the caller (gavel `markRead`). */
  onMarkRead?: (target: { scope: string; uri: string }) => void | Promise<void>;
};

/** One thread and its replies, acting through the host's handlers. */
export function CommentInboxThread({ item, config, actions }: { item: InboxItem; config: CommentConfig; actions: CommentInboxActions }) {
  const { onReply, onUpdateStatus, onClose, onAcknowledge } = actions;
  return (
    <CommentThreadList
      comments={projectNative(item.thread)}
      config={config}
      compact
      defaultExpanded
      {...(onReply ? { onReply: (_parent: unknown, body: string) => onReply(item, body) } : {})}
      {...(onUpdateStatus ? { onUpdateStatus: (_id: string, status: string) => onUpdateStatus(item, status) } : {})}
      {...(onClose ? { onClose: () => onClose(item) } : {})}
      {...(onAcknowledge ? { onAcknowledge: () => onAcknowledge(item) } : {})}
    />
  );
}
