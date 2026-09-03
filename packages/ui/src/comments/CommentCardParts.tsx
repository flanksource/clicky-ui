import { Badge } from "../data/Badge";
import { cn } from "../lib/utils";
import { UiThumbsDown, UiThumbsUp } from "../icons";
import {
  resolveFacetOption,
  resolveStatusConfig,
  toneToBadgeTone,
} from "./comment-utils";
import type { Comment, CommentConfig, CommentRating } from "./comment-types";

export function RatingChip({ rating }: { rating: CommentRating | undefined }) {
  if (!rating) return null;
  const positive = rating === "positive";
  return (
    <Badge
      variant="soft"
      tone={positive ? "success" : "danger"}
      size="xs"
      icon={positive ? UiThumbsUp : UiThumbsDown}
    >
      {positive ? "Positive rating" : "Negative rating"}
    </Badge>
  );
}

export function StatusChip({
  comment,
  config,
}: {
  comment: Comment;
  config: CommentConfig;
}) {
  const status = resolveStatusConfig(config, comment.status);
  if (!status) return null;
  const closedBy = status.stage === "closed" ? comment.closedBy : undefined;
  return (
    <Badge
      variant="soft"
      tone={toneToBadgeTone(status.tone)}
      size="xs"
      {...(status.icon ? { icon: status.icon } : {})}
      {...(comment.closedAt
        ? { title: new Date(comment.closedAt).toLocaleString() }
        : {})}
    >
      {closedBy ? `Closed by ${closedBy.name}` : status.label}
    </Badge>
  );
}

export function FacetBadges({
  comment,
  config,
  compact,
}: {
  comment: Comment;
  config: CommentConfig;
  compact?: boolean;
}) {
  const chips = (config.facets ?? []).flatMap((facet) => {
    const option = resolveFacetOption(facet, comment.facets?.[facet.key]);
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

export function ChecklistChips({
  comment,
  onChecklistToggle,
}: {
  comment: Comment;
  onChecklistToggle?: (index: number) => void;
}) {
  if (!comment.checklist?.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {comment.checklist.map((item, index) => {
        const done = /done|complete|resolved/i.test(item.status);
        const active = /progress|doing/i.test(item.status);
        return (
          <button
            key={index}
            type="button"
            onClick={() => onChecklistToggle?.(index)}
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

export function RefChips({ comment }: { comment: Comment }) {
  if (!comment.refs?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {comment.refs.map((group, index) => (
        <span
          key={index}
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
