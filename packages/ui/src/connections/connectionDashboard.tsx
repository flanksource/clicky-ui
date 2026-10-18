import { useEffect } from "react";
import { Button } from "../components/button";
import { cn } from "../lib/utils";
import {
  groupConnectionDashboardLanes,
  type ConnectionDashboardItem,
  type ConnectionLinkRenderer,
} from "./connectionDashboardModel";
import { useConnectionDashboard } from "./connectionDashboardQuery";
import {
  ConnectionDashboardRow,
  ConnectionHealthLegend,
} from "./connectionDashboardRow";
import {
  summarizeLaneHealth,
  useConnectionHealth,
  type ConnectionHealthMap,
} from "./connectionHealth";

export type ConnectionDashboardSurfaceProps = {
  /** Where the commons-db connections service is mounted, e.g. `/api/v1`. */
  apiBase: string;
  /** A list request whose connection type filters the dashboard carries over. */
  requestUrl?: string;
  renderConnectionLink: ConnectionLinkRenderer;
};

/**
 * ConnectionDashboardSurface lists the connection fleet from the database only.
 * Health checks dial real backends, so they are opt-in: nothing is probed until
 * the operator clicks a row's dot, a lane's Check button, or Check all.
 */
export function ConnectionDashboardSurface({
  apiBase,
  requestUrl,
  renderConnectionLink,
}: ConnectionDashboardSurfaceProps) {
  const dashboard = useConnectionDashboard({
    apiBase,
    ...(requestUrl ? { requestUrl } : {}),
  });

  const { health, pending, error, seed, check } = useConnectionHealth(apiBase);
  const connections = dashboard.data?.connections;
  useEffect(() => {
    if (connections) seed(connections);
  }, [connections, seed]);

  if (dashboard.isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Loading connections…
      </div>
    );
  }
  if (dashboard.isError) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        <span>
          {dashboard.error instanceof Error
            ? dashboard.error.message
            : "Unable to load connections"}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={() => void dashboard.refetch()}>
          Retry
        </Button>
      </div>
    );
  }
  if (!connections) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        Connection dashboard returned no data.
      </div>
    );
  }
  if (connections.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No connections match the current filters.
      </div>
    );
  }

  const checked = connections.filter(
    (connection) => health[connection.id] && health[connection.id]?.state !== "unknown",
  ).length;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => void dashboard.refetch()}>
          Refresh
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending.size > 0}
          onClick={() =>
            check(
              connections.map((connection) => connection.id),
              { force: checked === connections.length },
            )
          }
        >
          {pending.size > 0 ? "Checking…" : "Check all health"}
        </Button>
        <span className="text-xs text-muted-foreground">
          {checked}/{connections.length} checked
        </span>
        {error ? (
          <span className="text-xs text-destructive" title={error.message}>
            {error.message}
          </span>
        ) : null}
      </div>
      <ConnectionDashboardLanes
        connections={connections}
        health={health}
        pending={pending}
        onCheck={check}
        renderConnectionLink={renderConnectionLink}
      />
    </div>
  );
}

export function ConnectionDashboardLanes({
  connections,
  health = {},
  pending = new Set<string>(),
  onCheck = () => {},
  renderConnectionLink,
}: {
  connections: ConnectionDashboardItem[];
  health?: ConnectionHealthMap;
  pending?: Set<string>;
  onCheck?: (ids: string[], options?: { force?: boolean }) => void;
  renderConnectionLink: ConnectionLinkRenderer;
}) {
  return (
    <div className="space-y-4">
      {groupConnectionDashboardLanes(connections).map((lane) => {
        const summary = summarizeLaneHealth(lane.connections, health);
        const unnamespaced = lane.namespace === "";
        return (
          <section
            key={lane.namespace || "__none__"}
            className={cn(
              "overflow-hidden rounded-lg border",
              unnamespaced ? "border-dashed border-border" : "border-border",
            )}
          >
            <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-muted/40 px-3 py-2">
              <h2
                className={cn(
                  "text-sm font-semibold",
                  unnamespaced && "italic text-muted-foreground",
                )}
              >
                {unnamespaced ? "No namespace" : lane.namespace}
              </h2>
              <span className="rounded bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                {lane.connections.length}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px]"
                onClick={() =>
                  onCheck(
                    lane.connections.map((connection) => connection.id),
                    { force: summary.checked === lane.connections.length },
                  )
                }
              >
                Check
              </Button>
              {summary.failing > 0 ? (
                <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-1.5 py-0.5 text-[11px] text-rose-700 ring-1 ring-inset ring-rose-300/60 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/25">
                  {summary.failing} failing
                </span>
              ) : null}
              <span className="text-[11px] text-muted-foreground">
                {summary.checked}/{lane.connections.length} checked
              </span>
              {summary.unused > 0 ? (
                <span className="text-[11px] text-muted-foreground">{summary.unused} unused</span>
              ) : null}
              {unnamespaced ? (
                <span className="text-xs text-muted-foreground">
                  `namespace` is optional on the model, so these are unplaceable rather than global.
                </span>
              ) : null}
            </header>
            <div className="divide-y divide-border">
              {lane.connections.map((connection) => (
                <ConnectionDashboardRow
                  key={connection.id}
                  connection={connection}
                  health={health[connection.id]}
                  pending={pending.has(connection.id)}
                  onCheck={onCheck}
                  renderConnectionLink={renderConnectionLink}
                />
              ))}
            </div>
          </section>
        );
      })}
      <ConnectionHealthLegend />
    </div>
  );
}
