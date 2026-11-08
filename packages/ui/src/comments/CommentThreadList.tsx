import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { useCommentState } from "./comment-persistence";
import { cn } from "../lib/utils";
import { copyText } from "../components/clipboard";
import { Tabs } from "../layout/Tabs";
import type { DropdownMenuItem } from "../overlay/DropdownMenu";
import { Modal } from "../overlay/Modal";
import { CommentReplyInput } from "./CommentReplyInput";
import type { CommentDetailOptions } from "./comment-detail";
import { CommentCard } from "./CommentCard";
import { buildReplyMap, getRoots, sortReplies } from "./comment-utils";
import type { Comment, CommentAuthor, CommentConfig } from "./comment-types";

export type CommentThreadListProps = CommentDetailOptions & {
  comments: Comment[];
  config: CommentConfig;
  compact?: boolean;
  /** Expand each thread immediately (roots and their replies), exposing actions such as Reply. */
  defaultExpanded?: boolean;
  /** Extra content rendered above each root card (e.g. an anchor label). */
  renderRootMeta?: (comment: Comment) => ReactNode;
  /** Extra content rendered with each root thread, including its maximized view. */
  renderRootDetails?: (comment: Comment) => ReactNode;
  /** Props merged onto each thread wrapper (e.g. for scroll anchoring). */
  getThreadProps?: (comment: Comment) => HTMLAttributes<HTMLDivElement>;
  /** Custom body renderer forwarded to each card. */
  renderBody?: (body: string) => ReactNode;
  /** Serialize a root and its replies for Copy. Render a preview of it through `detailTabs`. */
  threadToMarkdown?: (thread: readonly Comment[]) => string;
  onUpdateStatus?: (id: string, status: string) => void | Promise<void>;
  onClose?: (id: string) => void | Promise<void>;
  onAcknowledge?: (id: string) => void | Promise<void>;
  onAssign?: (
    id: string,
    assignee: CommentAuthor | null,
  ) => void | Promise<void>;
  /** Caller-owned entries appended to each root's "Assign…" submenu. */
  extraAssignItems?: (comment: Comment) => DropdownMenuItem[];
  onChecklistToggle?: (id: string, index: number) => void;
  onDelete?: (id: string) => void;
  /** Submit a reply to `parent`. Presence enables the inline reply affordance. */
  onReply?: (parent: Comment, body: string) => void | Promise<void>;
};

/**
 * Renders a list of threaded comments: each root with its sorted replies and an
 * optional inline reply box. Fully controlled — mutations route through the
 * id-keyed callbacks.
 */
export function CommentThreadList({
  comments,
  config,
  compact = false,
  defaultExpanded = false,
  previewLines,
  detailTabs = [],
  onMaximizedChange,
  renderRootMeta,
  renderRootDetails,
  getThreadProps,
  renderBody,
  threadToMarkdown,
  onUpdateStatus,
  onClose,
  onAcknowledge,
  onAssign,
  extraAssignItems,
  onChecklistToggle,
  onDelete,
  onReply,
}: CommentThreadListProps) {
  const [replyingTo, setReplyingTo] = useCommentState<string | null>(`thread-list:${comments[0]?.anchor ?? "general"}:replying`, null);
  // Maximizing is owned here, not by the card: a thread is the unit a reader
  // wants enlarged, and only this list knows a root's replies.
  const [maximizedRootId, setMaximizedRootId] = useCommentState<string | null>(`thread-list:${comments[0]?.anchor ?? "general"}:maximized`, null);
  const [maximizedTab, setMaximizedTab] = useCommentState<string>(
    `thread-list:${comments[0]?.anchor ?? "general"}:tab`, "thread",
  );
  const replyBar = useRef<HTMLDivElement>(null);
  const roots = getRoots(comments);
  const replyMap = buildReplyMap(comments);
  const maximizedRoot = roots.find((root) => root.id === maximizedRootId);
  const isMaximized = Boolean(maximizedRoot);
  useEffect(() => {
    if (!isMaximized) return;
    onMaximizedChange?.(true);
    return () => onMaximizedChange?.(false);
  }, [isMaximized, onMaximizedChange]);
  if (roots.length === 0) return null;
  const maximizedThread = maximizedRoot
    ? [maximizedRoot, ...sortReplies(replyMap.get(maximizedRoot.id) ?? [])]
    : [];

  function closeMaximized() {
    setMaximizedRootId(null);
    setMaximizedTab("thread");
  }

  function cardHandlers(id: string) {
    return {
      ...(onUpdateStatus
        ? { onUpdateStatus: (status: string) => onUpdateStatus(id, status) }
        : {}),
      ...(onClose ? { onClose: () => onClose(id) } : {}),
      ...(onAcknowledge ? { onAcknowledge: () => onAcknowledge(id) } : {}),
      ...(onAssign
        ? {
            onAssign: (assignee: CommentAuthor | null) =>
              onAssign(id, assignee),
          }
        : {}),
      ...(extraAssignItems ? { extraAssignItems } : {}),
      ...(onChecklistToggle
        ? { onChecklistToggle: (index: number) => onChecklistToggle(id, index) }
        : {}),
      ...(onDelete ? { onDelete: () => onDelete(id) } : {}),
    };
  }

  return (
    <>
      <div className="space-y-2">
        {roots.map((root) => {
          const replies = sortReplies(replyMap.get(root.id) ?? []);
          const thread = [root, ...replies];
          const threadProps = getThreadProps?.(root) ?? {};
          return (
            <div
              key={root.id}
              data-testid="comment-thread-block"
              data-comment-id={root.id}
              {...threadProps}
              className={cn("space-y-1.5 p-1", threadProps.className)}
            >
              {renderRootMeta ? (
                <div className="px-1">{renderRootMeta(root)}</div>
              ) : null}
              <CommentCard
                comment={root}
                config={config}
                compact={compact}
                defaultExpanded={defaultExpanded}
                {...(previewLines !== undefined ? { previewLines } : {})}
                onMaximize={() => setMaximizedRootId(root.id)}
                {...(threadToMarkdown
                  ? { onCopy: () => copyText(threadToMarkdown(thread)) }
                  : {})}
                {...(renderBody ? { renderBody } : {})}
                {...cardHandlers(root.id)}
                {...(onReply ? { onReply: () => setReplyingTo(root.id) } : {})}
              />
              {renderRootDetails?.(root)}
              {replies.length > 0 && (
                <div className="space-y-1.5">
                  {replies.map((reply) => (
                    <CommentCard
                      key={reply.id}
                      comment={reply}
                      config={config}
                      compact={compact}
                      defaultExpanded={defaultExpanded}
                      {...(previewLines !== undefined ? { previewLines } : {})}
                      onMaximize={() => setMaximizedRootId(root.id)}
                      {...(threadToMarkdown
                        ? { onCopy: () => copyText(threadToMarkdown(thread)) }
                        : {})}
                      {...(renderBody ? { renderBody } : {})}
                      {...cardHandlers(reply.id)}
                    />
                  ))}
                </div>
              )}
              {onReply && replyingTo === root.id && (
                <CommentReplyInput
                  parentId={root.id}
                  config={config}
                  onCancel={() => setReplyingTo(null)}
                  onSubmit={async (body) => {
                    await onReply(root, body);
                    setReplyingTo(null);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      {maximizedRoot && (
        <Modal open onClose={closeMaximized} title="Comment thread" size="xl" className="h-[min(800px,90dvh)]"
          subtitle={<Tabs tabs={[{ id: "thread", label: "Thread" }, ...detailTabs.map(({ id, label }) => ({ id, label }))]} value={maximizedTab} onChange={setMaximizedTab} />}
          footer={onReply && <div ref={replyBar}><CommentReplyInput key={maximizedRoot.id} pinned parentId={maximizedRoot.id} config={config} onCancel={() => {}} onSubmit={body => onReply(maximizedRoot, body)} /></div>}
        >
          <div className="space-y-3" data-testid="comment-thread-modal">
            {detailTabs.some(tab => tab.id === maximizedTab) ? (
              detailTabs.find(tab => tab.id === maximizedTab)?.render(maximizedThread)
            ) : (
              <div className="space-y-2">
                {/* No onMaximize inside: the thread is already maximized. */}
                {maximizedThread.map((message) => (
                  <div key={message.id} className="space-y-1.5">
                    <CommentCard
                      comment={message}
                      config={config}
                      defaultExpanded
                      fullBody
                      {...(threadToMarkdown
                        ? {
                            onCopy: () =>
                              copyText(threadToMarkdown(maximizedThread)),
                          }
                        : {})}
                      {...(renderBody ? { renderBody } : {})}
                      {...cardHandlers(message.id)}
                      {...(onReply
                        ? { onReply: () => replyBar.current?.querySelector<HTMLElement>('[role="textbox"]')?.focus() }
                        : {})}
                    />
                    {message.id === maximizedRoot.id &&
                      renderRootDetails?.(maximizedRoot)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
