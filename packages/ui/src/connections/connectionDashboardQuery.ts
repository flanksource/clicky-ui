import { useQuery } from "@tanstack/react-query";
import {
  CONNECTION_DASHBOARD_QUERY_KEY,
  connectionDashboardUrl,
  type ConnectionDashboardResponse,
} from "./connectionDashboardModel";

/**
 * The dashboard listing, cached under one key per URL so the page chrome (Add
 * Connection, read-only views) and the dashboard surface share a single request.
 */
export function useConnectionDashboard({
  apiBase,
  requestUrl,
}: {
  apiBase: string;
  requestUrl?: string;
}) {
  const dashboardUrl = connectionDashboardUrl({
    apiBase,
    ...(requestUrl ? { requestUrl } : {}),
  });
  return useQuery({
    queryKey: [CONNECTION_DASHBOARD_QUERY_KEY, dashboardUrl],
    queryFn: async (): Promise<ConnectionDashboardResponse> => {
      const response = await fetch(dashboardUrl, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        const message = (await response.text()).trim();
        throw new Error(message || `Connection dashboard failed: ${response.status}`);
      }
      const payload = (await response.json()) as Partial<ConnectionDashboardResponse>;
      if (!Array.isArray(payload.connections)) {
        throw new Error("Connection dashboard response is missing connections");
      }
      return payload as ConnectionDashboardResponse;
    },
    staleTime: 10_000,
    retry: 0,
  });
}
