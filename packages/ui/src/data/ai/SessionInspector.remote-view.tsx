import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { PinnedComposer } from "./SessionInspector.composer-slot";

/** Loading and error chrome for a SessionInspector fed from a URL. With
 *  `children` (a session already loaded) the error sits above it; without,
 *  it replaces the inspector: a skeleton while loading, the alert on failure.
 *  The `composer` slot is rendered pinned below the status even before there is
 *  a session, so the input never disappears while loading or after a failure
 *  (with `children` the loaded inspector pins the composer itself). */
export function RemoteSessionStatus({
  loading,
  error,
  className,
  composer,
  children,
}: {
  loading: boolean;
  error?: string;
  className?: string;
  composer?: ReactNode;
  children?: ReactNode;
}) {
  const alert = error ? (
    <div
      role="alert"
      className="shrink-0 whitespace-pre-wrap break-words rounded-md border border-destructive/40 bg-destructive/5 px-density-3 py-density-2 text-xs text-destructive"
    >
      {error}
    </div>
  ) : null;
  if (children) {
    return (
      <div className={cn("flex h-full min-h-0 w-full flex-col gap-density-2", className)}>
        {alert}
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    );
  }
  return (
    <div
      aria-busy={loading}
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-border bg-background text-sm shadow-sm",
        className,
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-density-3 overflow-y-auto p-density-4">
        {alert ?? (
          <>
            <p className="text-xs text-muted-foreground">Loading session…</p>
            <div className="h-control-h w-1/3 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </>
        )}
      </div>
      {composer ? <PinnedComposer>{composer}</PinnedComposer> : null}
    </div>
  );
}
