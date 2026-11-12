import { Badge } from "../data/Badge";
import { Icon, type StaticIconComponent } from "../data/Icon";
import { cn } from "../lib/utils";
import { UiCheck, UiChecks, UiClock, UiRobotAi, UiThumbsDown, UiThumbsUp, UiWarningTriangle } from "../icons";
import { agentDeliveryStage, agentGlyph, type AgentDeliveryStage } from "./agent-delivery";
import {
  resolveFacetOption,
  resolveStatusConfig,
  toneToBadgeTone,
} from "./comment-utils";
import { resolveCommentStage } from "../lib/comment-stage";
import type {
  Comment,
  CommentAgentRun,
  CommentAuthor,
  CommentConfig,
  CommentRating,
  CommentReviewDecision,
} from "./comment-types";

export function ReviewDecisionChip({
  decision,
}: {
  decision: CommentReviewDecision | undefined;
}) {
  if (!decision) return null;
  const label =
    decision === "approved"
      ? "Approved"
      : decision === "rejected"
        ? "Rejected"
        : "Revision requested";
  return (
    <Badge
      variant="soft"
      tone={
        decision === "approved"
          ? "success"
          : decision === "rejected"
            ? "danger"
            : "warning"
      }
      size="xs"
    >
      {label}
    </Badge>
  );
}

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

const DELIVERY_TICK: Record<AgentDeliveryStage, { icon: StaticIconComponent; className: string; label: string }> = {
  queued: { icon: UiClock, className: "text-muted-foreground", label: "Queued" },
  sent: { icon: UiCheck, className: "text-muted-foreground", label: "Sent" },
  replied: { icon: UiChecks, className: "text-primary", label: "Replied" },
  failed: { icon: UiWarningTriangle, className: "text-destructive", label: "Hand-off failed" },
};

function deliveryTitle(stage: AgentDeliveryStage, run: CommentAgentRun, label: string): string {
  const at = (iso: string) => new Date(iso).toLocaleString();
  if (stage === "failed") return `Hand-off to ${label} failed: ${run.error ?? "no reason recorded"}`;
  if (stage === "replied") return run.repliedAt ? `${label} replied ${at(run.repliedAt)}` : `${label} handled this thread`;
  if (stage === "sent") return `Sent to ${label} ${at(run.requestedAt)}`;
  return `Queued for ${label} since ${at(run.requestedAt)}`;
}

/** An agent's hold on a thread: its provider's glyph, where the thread went, and a chat-style delivery tick. */
function AgentDeliveryChip({ assignee, run }: { assignee: CommentAuthor; run: CommentAgentRun }) {
  const stage = agentDeliveryStage(run);
  const glyph = agentGlyph(assignee.model ?? assignee.name);
  const tick = DELIVERY_TICK[stage];
  const label = run.target?.label ?? assignee.name;
  return (
    <Badge
      variant="soft"
      tone={stage === "failed" ? "danger" : "neutral"}
      size="xs"
    >
      <span data-testid="agent-delivery" data-delivery={stage} title={deliveryTitle(stage, run, label)} className="inline-flex min-w-0 items-center gap-1">
        <Icon icon={glyph.icon} className={cn("size-3 shrink-0", glyph.className)} />
        <span className="max-w-40 truncate">{label}</span>
        <span role="img" aria-label={tick.label} className="inline-flex shrink-0">
          <Icon icon={tick.icon} className={cn("size-3.5", tick.className)} />
        </span>
      </span>
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
  const stage = resolveCommentStage(config, comment.status);
  const closedBy = stage === "closed" ? comment.closedBy : undefined;
  const assignee = stage === "active" ? comment.assignee : undefined;
  if (assignee?.kind === "agent" && comment.agentRun)
    return <AgentDeliveryChip assignee={assignee} run={comment.agentRun} />;
  const icon = assignee?.kind === "agent" ? UiRobotAi : status.icon;
  const title = assignee
    ? comment.acknowledgedAt
      ? `Acknowledged ${new Date(comment.acknowledgedAt).toLocaleString()}`
      : "Assigned, not yet acknowledged"
    : comment.closedAt
      ? new Date(comment.closedAt).toLocaleString()
      : undefined;
  return (
    <Badge
      variant="soft"
      tone={toneToBadgeTone(status.tone)}
      size="xs"
      {...(icon ? { icon } : {})}
      {...(title ? { title } : {})}
    >
      {assignee
        ? `Assigned to ${assignee.name}`
        : closedBy
          ? `Closed by ${closedBy.name}`
          : status.label}
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
