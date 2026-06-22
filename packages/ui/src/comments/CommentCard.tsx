import { useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Badge } from "../data/Badge";
import { Icon } from "../data/Icon";
import { Modal } from "../overlay/Modal";
import { DropdownMenu, type DropdownMenuItem } from "../overlay/DropdownMenu";
import {
  parseTimestamp,
  formatRelativeTime,
} from "../data/cells/timestamp-format";
import { UiClose, UiDotsVertical, UiFullscreen, UiTrash } from "../icons";
import { CommentAuthorAvatar } from "./CommentAuthor";
import { CommentMarkdown } from "./CommentMarkdown";
import {
  resolveFacetOption,
  resolveStatusConfig,
  toneToBadgeTone,
  truncatePlain,
} from "./comment-utils";
import type { Comment, CommentConfig } from "./comment-types";

export type CommentCardProps = {
  comment: Comment;
  config: CommentConfig;
  /** Tighter padding for dense rails. */
  compact?: boolean;
  /** Render expanded on first mount. */
  defaultExpanded?: boolean;
  /** Custom body renderer; defaults to the lightweight CommentMarkdown. */
  renderBody?: (body: string) => ReactNode;
  /** Change this comment's status (roots only). */
  onUpdateStatus?: (status: string) => void;
  /** Delete this comment. */
  onDelete?: () => void;
  /** Begin a reply to this comment. */
  onReply?: () => void;
  /** Advance the checklist item at `index` to its next status. */
  onChecklistToggle?: (index: number) => void;
};

function StatusChip({
  status,
  config,
  showLabel,
}: {
  status: string | undefined;
  config: CommentConfig;
  showLabel?: boolean;
}) {
  const cfg = resolveStatusConfig(config, status);
  if (!cfg) return null;
  return (
    <Badge
      variant="soft"
      tone={toneToBadgeTone(cfg.tone)}
      size="xs"
      {...(cfg.icon ? { icon: cfg.icon } : {})}
    >
      {showLabel ? cfg.label : null}
    </Badge>
  );
}

function FacetBadges({
  comment,
  config,
  compact,
}: {
  comment: Comment;
  config: CommentConfig;
  compact?: boolean;
}) {
  const facets = config.facets ?? [];
  const chips = facets.flatMap((facet) => {
    const value = comment.facets?.[facet.key];
    const option = resolveFacetOption(facet, value);
    if (!option) return [];
    return [
      <Badge
        key={facet.key}
        variant="soft"
        tone={toneToBadgeTone(option.tone)}
        size="xs"
      >
        {compact ? (option.short ?? option.label) : option.label}
      </Badge>,
    ];
  });
  return chips.length > 0 ? <>{chips}</> : null;
}

function ChecklistChips({
  comment,
  onChecklistToggle,
}: {
  comment: Comment;
  onChecklistToggle?: (index: number) => void;
}) {
  if (!comment.checklist || comment.checklist.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {comment.checklist.map((item, i) => {
        const done = /done|complete|resolved/i.test(item.status);
        const active = /progress|doing/i.test(item.status);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChecklistToggle?.(i)}
            disabled={!onChecklistToggle}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] transition-opacity",
              onChecklistToggle && "cursor-pointer hover:opacity-80",
              done
                ? "bg-green-100 text-green-800 line-through dark:bg-green-500/20 dark:text-green-300"
                : active
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function RefChips({ comment }: { comment: Comment }) {
  if (!comment.refs || comment.refs.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {comment.refs.map((group, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
        >
          <span className="font-medium">{group.label}:</span>
          <span className={group.mono ? "font-mono" : undefined}>
            {group.items.join(", ")}
          </span>
        </span>
      ))}
    </div>
  );
}

function statusMenuItems(
  comment: Comment,
  config: CommentConfig,
  isReply: boolean,
  opts: {
    onUpdateStatus?: (status: string) => void;
    onDelete?: () => void;
    onCollapse?: () => void;
  },
): DropdownMenuItem[] {
  const items: DropdownMenuItem[] = [];
  if (opts.onCollapse) {
    items.push({ label: "Collapse", icon: UiClose, onSelect: opts.onCollapse });
  }
  if (!isReply && opts.onUpdateStatus) {
    for (const status of config.statuses) {
      const current = status.value === comment.status;
      items.push({
        label: (
          <span
            className={cn(
              "inline-flex items-center gap-1.5",
              current && "font-semibold",
            )}
          >
            <StatusChip status={status.value} config={config} />
            {status.label}
          </span>
        ),
        onSelect: () => opts.onUpdateStatus?.(status.value),
      });
    }
  }
  if (opts.onDelete) {
    items.push({ label: "Delete", icon: UiTrash, onSelect: opts.onDelete });
  }
  return items;
}

function IconAction({
  icon,
  label,
  onClick,
}: {
  icon: typeof UiClose;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded p-1 text-muted-foreground opacity-70 hover:bg-muted hover:opacity-100"
    >
      <Icon icon={icon} className="text-xs" />
    </button>
  );
}

function CommentBody({
  comment,
  config,
  renderBody,
  onUpdateStatus,
  onDelete,
  onReply,
  onChecklistToggle,
  onCollapse,
  onMaximize,
}: CommentCardProps & { onCollapse?: () => void; onMaximize?: () => void }) {
  const isReply = Boolean(comment.parentId);
  const date = parseTimestamp(comment.createdAt);
  const menuItems = statusMenuItems(comment, config, isReply, {
    ...(onUpdateStatus ? { onUpdateStatus } : {}),
    ...(onDelete ? { onDelete } : {}),
    ...(onCollapse ? { onCollapse } : {}),
  });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <CommentAuthorAvatar author={comment.author} />
        {!isReply && (
          <StatusChip status={comment.status} config={config} showLabel />
        )}
        {!isReply && <FacetBadges comment={comment} config={config} />}
        <div className="ml-auto flex items-center gap-1">
          {date && (
            <span
              title={date.toLocaleString()}
              className="text-[10px] text-muted-foreground"
            >
              {formatRelativeTime(date)}
            </span>
          )}
          {onReply && (
            <button
              type="button"
              onClick={onReply}
              className="rounded px-1.5 py-1 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Reply
            </button>
          )}
          {onMaximize && (
            <IconAction
              icon={UiFullscreen}
              label="Maximize"
              onClick={onMaximize}
            />
          )}
          {menuItems.length > 0 && (
            <DropdownMenu
              align="right"
              menuClassName="min-w-[150px]"
              trigger={
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Comment actions"
                  className="rounded p-1 text-muted-foreground opacity-70 hover:bg-muted hover:opacity-100"
                >
                  <Icon icon={UiDotsVertical} className="text-sm" />
                </span>
              }
              items={menuItems}
            />
          )}
        </div>
      </div>
      <div className="text-[13px] leading-6">
        {renderBody ? (
          renderBody(comment.body)
        ) : (
          <CommentMarkdown text={comment.body} />
        )}
      </div>
      {!isReply && (
        <ChecklistChips
          comment={comment}
          {...(onChecklistToggle ? { onChecklistToggle } : {})}
        />
      )}
      {!isReply && <RefChips comment={comment} />}
    </div>
  );
}

/**
 * A single comment, collapsible between a compact one-line preview and a full
 * card. The full view can be maximized into a modal. Fully controlled — all
 * mutations are delegated to the supplied callbacks.
 */
export function CommentCard(props: CommentCardProps) {
  const { comment, config, compact, defaultExpanded } = props;
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);
  const [maximized, setMaximized] = useState(false);
  const isReply = Boolean(comment.parentId);

  const body = (
    <CommentBody
      {...props}
      onMaximize={() => setMaximized(true)}
      {...(expanded ? { onCollapse: () => setExpanded(false) } : {})}
    />
  );

  const modal = (
    <Modal
      open={maximized}
      onClose={() => setMaximized(false)}
      title="Comment"
      size="lg"
    >
      <CommentBody {...props} />
    </Modal>
  );

  if (!expanded) {
    return (
      <>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setExpanded(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setExpanded(true);
            }
          }}
          data-testid="comment-card"
          data-comment-kind={isReply ? "reply" : "root"}
          data-comment-id={comment.id}
          className={cn(
            "group/comment flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/50",
            !isReply && "border border-border bg-background shadow-sm",
            isReply && "ml-4 border-l-2 border-l-border bg-muted/30",
          )}
        >
          <CommentAuthorAvatar author={comment.author} bare />
          {!isReply && <StatusChip status={comment.status} config={config} />}
          {!isReply && (
            <FacetBadges comment={comment} config={config} compact />
          )}
          <span className="min-w-0 flex-1 truncate text-[12px] text-foreground/80">
            {truncatePlain(comment.body)}
          </span>
          <span
            role="presentation"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <DropdownMenu
              align="right"
              trigger={
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Comment actions"
                  className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:opacity-100 group-hover/comment:opacity-70"
                >
                  <Icon icon={UiDotsVertical} className="text-sm" />
                </span>
              }
              items={[
                { label: "Expand", onSelect: () => setExpanded(true) },
                {
                  label: "Maximize",
                  icon: UiFullscreen,
                  onSelect: () => setMaximized(true),
                },
              ]}
            />
          </span>
        </div>
        {modal}
      </>
    );
  }

  return (
    <>
      <div
        data-testid="comment-card"
        data-comment-kind={isReply ? "reply" : "root"}
        data-comment-id={comment.id}
        className={cn(
          "group/comment rounded-xl bg-background px-3 py-3 text-xs",
          !isReply && "border border-border shadow-sm",
          compact && "px-2.5 py-2.5",
          isReply && "ml-4 border-l-2 border-l-border bg-muted/30 shadow-none",
        )}
      >
        {body}
      </div>
      {modal}
    </>
  );
}
