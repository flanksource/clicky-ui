import type { ReactNode } from "react";
import type { ResultRenderContext } from "../rpc/OperationResultView";
import { ConnectionDashboardSurface } from "./connectionDashboard";
import type { ConnectionLinkRenderer } from "./connectionDashboardModel";

/**
 * Builds an EntityExplorerApp `resultRenderer` that replaces the `connection`
 * surface's list with the dashboard. The dashboard's identity is its request
 * URL alone. Keying it off the response body instead would mint a fresh query
 * cache entry on nearly every render, which is what made the surface refetch
 * constantly.
 */
export function createConnectionDashboardResultRenderer(options: {
  apiBase: string;
  renderConnectionLink: ConnectionLinkRenderer;
}): (context: ResultRenderContext) => ReactNode {
  return (context) => {
    if (context.surfaceKey !== "connection") return context.defaultView;
    const requestUrl = context.response?.requestUrl;
    return (
      <ConnectionDashboardSurface
        apiBase={options.apiBase}
        renderConnectionLink={options.renderConnectionLink}
        {...(requestUrl ? { requestUrl } : {})}
      />
    );
  };
}
