import { cn } from "../lib/utils";
import { Badge } from "../data/Badge";
import { getRoots, isUnresolved, toneToBadgeTone } from "./comment-utils";
import type { Comment, CommentConfig } from "./comment-types";

export type CommentProgressProps = {
  comments: Comment[];
  config: CommentConfig;
  /** Status whose chip is rendered as selected. */
  activeStatus?: string | null;
  /** Makes the status chips clickable. */
  onStatusClick?: (status: string) => void;
  className?: string;
};

function countByStatus(comments: Comment[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const root of getRoots(comments)) {
    if (!root.status) continue;
    counts.set(root.status, (counts.get(root.status) ?? 0) + 1);
  }
  return counts;
}

/**
 * A compact resolution summary for a comment set: a "resolved of total" bar plus
 * a clickable chip per status. Pure presentation derived from `comments`.
 */
export function CommentProgress({
  comments,
  config,
  activeStatus,
  onStatusClick,
  className,
}: CommentProgressProps) {
  const roots = getRoots(comments);
  const total = roots.length;
  const resolved = roots.filter((r) => !isUnresolved(config, r.status)).length;
  const percent = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const counts = countByStatus(comments);

  if (total === 0) return null;

  return (
    <div
      className={cn("space-y-1.5", className)}
      data-testid="comment-progress"
    >
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {resolved} of {total} resolved
        </span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-1 pt-0.5">
        {config.statuses.map((status) => {
          const count = counts.get(status.value) ?? 0;
          if (count === 0) return null;
          const active = activeStatus === status.value;
          const chip = (
            <Badge
              variant={active ? "solid" : "soft"}
              tone={toneToBadgeTone(status.tone)}
              size="xs"
              {...(status.icon ? { icon: status.icon } : {})}
            >
              {status.label} {count}
            </Badge>
          );
          return onStatusClick ? (
            <button
              key={status.value}
              type="button"
              onClick={() => onStatusClick(status.value)}
            >
              {chip}
            </button>
          ) : (
            <span key={status.value}>{chip}</span>
          );
        })}
      </div>
    </div>
  );
}
