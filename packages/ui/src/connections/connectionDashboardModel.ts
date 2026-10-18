import type { ReactNode } from "react";
import { stripTrailingSlashes } from "../lib/string";

/**
 * The connection dashboard's pure shapes and derivations: what the API returns,
 * how connections group into namespace lanes, and the URLs the dashboard calls
 * under a host's `apiBase` (the path the commons-db connections service is
 * mounted at, e.g. `/api/v1`). Kept apart from the components so the
 * derivations stay directly testable and the component files export
 * components only.
 */

export type ConnectionDashboardHealthState =
  | "healthy"
  | "credentials"
  | "unreachable"
  | "unverifiable"
  | "unknown";

export type ConnectionHealth = {
  state: ConnectionDashboardHealthState;
  detail: string;
  checkedAt: string;
  cached: boolean;
};

export type ConnectionDashboardItem = {
  id: string;
  name: string;
  namespace: string;
  type: string;
  endpoint?: { scheme: string; host: string; path?: string };
  secretCount: number;
  inlineCredential: boolean;
  insecureTLS: boolean;
  // Absent until someone checks: listing reads the database only, so a
  // connection has no health until a check is explicitly requested.
  health?: ConnectionHealth | null;
  profileCount: number;
  updatedAt: string;
  /** A virtual or read-only connection: the service answers 405 to saving or deleting it. */
  readOnly?: boolean;
};

export type ConnectionDashboardResponse = {
  connections: ConnectionDashboardItem[];
  generatedAt: string;
  /** The service has no connection store, so nothing can be created. */
  readOnly?: boolean;
};

export type ConnectionHealthResult = ConnectionHealth & {
  id: string;
  durationMs: number;
};

export type ConnectionHealthResponse = {
  results: ConnectionHealthResult[];
  generatedAt: string;
};

export type ConnectionDashboardLane = {
  namespace: string;
  connections: ConnectionDashboardItem[];
};

/** What a row hands the host to wrap its body in a link to the connection. */
export type ConnectionLinkProps = {
  className: string;
  title?: string;
  children: ReactNode;
};

/**
 * Renders a dashboard row's link. The host owns routing: an EntityExplorerApp
 * host routes through its RouterAdapter's `renderLink`, a host with its own
 * route state renders an anchor that selects the connection.
 */
export type ConnectionLinkRenderer = (
  connection: ConnectionDashboardItem,
  link: ConnectionLinkProps,
) => ReactNode;

/** The react-query key prefix every dashboard listing is cached under. */
export const CONNECTION_DASHBOARD_QUERY_KEY = "connection-dashboard";

export function groupConnectionDashboardLanes(
  connections: ConnectionDashboardItem[],
): ConnectionDashboardLane[] {
  const lanes = new Map<string, ConnectionDashboardItem[]>();
  for (const connection of connections) {
    const lane = lanes.get(connection.namespace);
    if (lane) lane.push(connection);
    else lanes.set(connection.namespace, [connection]);
  }
  return [...lanes]
    .map(([namespace, items]) => ({
      namespace,
      connections: [...items].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => {
      if (a.namespace === "") return 1;
      if (b.namespace === "") return -1;
      return a.namespace.localeCompare(b.namespace);
    });
}

export function connectionHealthUrl(apiBase: string): string {
  return `${stripTrailingSlashes(apiBase)}/connections/health`;
}

/**
 * The dashboard inventory URL. A list request's connection type filters carry
 * over, so a dashboard rendered in place of a filtered list shows the same
 * subset; paging parameters do not, because the dashboard lists the fleet.
 */
export function connectionDashboardUrl({
  apiBase,
  requestUrl,
}: {
  apiBase: string;
  requestUrl?: string;
}): string {
  const search = new URLSearchParams();
  if (requestUrl) {
    const source = new URL(requestUrl, "http://connections.local");
    for (const key of ["type", "types"]) {
      const value = source.searchParams.get(key);
      if (value) search.set(key, value);
    }
  }
  const query = search.toString();
  return `${stripTrailingSlashes(apiBase)}/connections/dashboard${query ? `?${query}` : ""}`;
}
