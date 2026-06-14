import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "./Icon";
import type { BadgeTone } from "./Badge";

export type TimelineItem = {
  /** Stable key. */
  id: string | number;
  /** Icon shown in the tone-colored disc. */
  icon?: string | StaticIconComponent;
  /** Semantic color of the disc. Defaults to `neutral`. */
  tone?: BadgeTone;
  /** Actor (rendered bold), e.g. a username. */
  actor?: ReactNode;
  /** What happened, e.g. "approved these changes". */
  action?: ReactNode;
  /** Relative time, e.g. "1d ago". */
  timestamp?: ReactNode;
  /** Optional expanded body (Gavel's threaded comment bubble). */
  body?: ReactNode;
  /** Optional header for the body bubble, e.g. a file anchor + status `Badge`. */
  bodyHeader?: ReactNode;
};

export type TimelineProps = {
  /** Events rendered top to bottom, connected by a rail. */
  items: TimelineItem[];
  /** Classes applied to the list. */
  className?: string;
};

const DISC_TONE: Record<BadgeTone, string> = {
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  danger: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  info: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  neutral: "bg-muted text-muted-foreground",
};

/**
 * Vertical activity feed (the Gavel `TimelineCard`): each event has a
 * tone-colored icon disc joined by a connector rail, an actor/action/time
 * line, and an optional body bubble for threaded detail. Domain-agnostic —
 * callers compose `bodyHeader` (e.g. a file anchor + status `Badge`) and
 * `body` themselves.
 */
export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn("relative", className)}>
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <li key={item.id} className="relative flex gap-density-3 pb-density-4 last:pb-0">
            {!last && (
              <span
                aria-hidden
                className="absolute bottom-0 left-[10px] top-[22px] w-px bg-border"
              />
            )}
            <span
              className={cn(
                "relative z-[1] flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full",
                DISC_TONE[item.tone ?? "neutral"],
              )}
            >
              {item.icon && (
                <Icon
                  {...(typeof item.icon === "string" ? { name: item.icon } : { icon: item.icon })}
                  className="h-3 w-3"
                />
              )}
            </span>
            <div className="min-w-0 flex-1 pt-px">
              <div className="text-sm">
                {item.actor && <span className="font-semibold text-foreground">{item.actor}</span>}
                {item.action && <span className="text-muted-foreground"> {item.action}</span>}
                {item.timestamp && (
                  <span className="ml-1.5 text-xs text-muted-foreground">· {item.timestamp}</span>
                )}
              </div>
              {item.body != null && (
                <div className="mt-1.5 overflow-hidden rounded-md border border-border bg-secondary">
                  {item.bodyHeader != null && (
                    <div className="border-b border-border px-density-3 py-1.5 text-xs">
                      {item.bodyHeader}
                    </div>
                  )}
                  <div className="px-density-3 py-density-2 text-sm leading-relaxed text-foreground">
                    {item.body}
                  </div>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
