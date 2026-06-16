import { type ReactElement, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Button } from "../components/button";

// A status-breakdown family: one StatusSegment list rendered either as a single
// horizontal StackedStatusBar (scan a mix at a glance) or as vertical StatusRows
// (each status on its own line with a proportional bar, optional drill-down link
// and retry). Shared by monitor/intake/cycle breakdowns and any panel that shows
// a count mix.

export interface StatusSegment {
  key: string;
  label: string;
  count: number;
  /** Tailwind background class for the swatch/bar fill, e.g. "bg-green-500". */
  className: string;
  /**
   * When set, the row links here (the breakdown points each status at its
   * filtered records/members view). Rendered via the `renderLink` prop so the
   * component stays router-agnostic.
   */
  href?: string;
}

/** Render-prop for a status row's link, so callers supply their router's Link (or a plain <a>). */
export type StatusRenderLink = (args: {
  to: string;
  className?: string;
  title?: string;
  children: ReactNode;
}) => ReactElement;

const defaultRenderLink: StatusRenderLink = ({ to, className, title, children }) => (
  <a href={to} className={className} title={title}>
    {children}
  </a>
);

// StackedStatusBar renders the segments as a single horizontal multi-color bar —
// segments share one track sized proportionally to the visible-segment total.
export function StackedStatusBar({
  segments,
  ariaLabel,
}: {
  segments: StatusSegment[];
  ariaLabel?: string;
}) {
  const visible = segments.filter((s) => s.count > 0);
  const total = visible.reduce((sum, s) => sum + s.count, 0);
  if (visible.length === 0 || total <= 0) {
    return <div className="rounded border border-dashed p-3 text-xs text-muted-foreground">No status data</div>;
  }
  return (
    <div className="flex h-2 overflow-hidden rounded bg-muted" aria-label={ariaLabel}>
      {visible.map((s) => (
        <div
          key={s.key}
          className={s.className}
          title={`${s.label}: ${s.count}`}
          style={{ width: `${Math.max(1, (s.count / total) * 100)}%` }}
        />
      ))}
    </div>
  );
}

// StatusRows renders each status as its own row — a colored swatch + label, the
// count, and a horizontal bar sized proportionally to the visible-segment total.
// The vertical counterpart to StackedStatusBar. An optional onRetry surfaces a
// Retry button per row; callers that omit it get no button. When a segment
// carries an href the whole row links there via renderLink (defaults to a plain
// <a>); the Retry button stops propagation so it stays independently clickable.
export function StatusRows({
  segments,
  ariaLabel,
  onRetry,
  retryingKey,
  isRetryable,
  renderLink = defaultRenderLink,
}: {
  segments: StatusSegment[];
  ariaLabel?: string;
  onRetry?: (segment: StatusSegment) => void;
  retryingKey?: string;
  isRetryable?: (segment: StatusSegment) => boolean;
  renderLink?: StatusRenderLink;
}) {
  const visible = segments.filter((s) => s.count > 0);
  const total = visible.reduce((sum, s) => sum + s.count, 0);
  if (visible.length === 0 || total <= 0) {
    return <div className="rounded border border-dashed p-3 text-xs text-muted-foreground">No status data</div>;
  }
  return (
    <div className="space-y-2" aria-label={ariaLabel}>
      {visible.map((s) => {
        const retryable = !!onRetry && (isRetryable?.(s) ?? false);
        const meta = (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", s.className)} aria-hidden="true" />
            <span className="truncate text-xs">{s.label}</span>
            <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">{s.count}</span>
          </div>
        );
        return (
          <div key={s.key} className="flex items-center gap-3">
            {s.href
              ? renderLink({
                  to: s.href,
                  className: "flex min-w-0 flex-1 rounded hover:bg-accent/40",
                  title: `View ${s.label} records`,
                  children: meta,
                })
              : meta}
            <div className="h-2 w-32 shrink-0 overflow-hidden rounded bg-muted sm:w-48">
              <div className={cn("h-full", s.className)} style={{ width: `${Math.max(1, (s.count / total) * 100)}%` }} />
            </div>
            {retryable ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 shrink-0 px-2 text-[11px]"
                disabled={retryingKey === s.key}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRetry?.(s);
                }}
              >
                {retryingKey === s.key ? "Retrying…" : "Retry"}
              </Button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
