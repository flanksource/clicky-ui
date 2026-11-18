import { useCallback, useEffect, useRef, useState } from "react";
import type { BackendConnection } from "../plugins/connections-server";
import { request } from "./comments/useComments";

function validConnections(result: { connections: BackendConnection[] }): BackendConnection[] {
  const valid = Array.isArray(result.connections) && result.connections.length === 2 && ["Gavel", "Captain"].every(name => result.connections.some(connection =>
    connection.name === name && typeof connection.url === "string" &&
    ["connected", "incompatible", "disconnected"].includes(connection.status) && (connection.status === "connected" || typeof connection.error === "string")));
  if (!valid) throw new Error("Invalid backend connection status response");
  return result.connections;
}

export function useBackendConnections() {
  const [connections, setConnections] = useState<BackendConnection[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [refreshing, setRefreshing] = useState(false);
  const refreshRef = useRef<() => void>(() => {});
  const retry = useCallback(() => refreshRef.current(), []);
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    const refresh = async () => {
      if (pending || controller.signal.aborted) return;
      pending = true;
      setRefreshing(true);
      try {
        const result = validConnections(await request<{ connections: BackendConnection[] }>("/__playground/connections", { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]) }));
        if (!controller.signal.aborted) {
          setConnections(result);
          setError(null);
        }
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause);
      } finally {
        pending = false;
        if (!controller.signal.aborted) setRefreshing(false);
      }
    };
    refreshRef.current = () => void refresh();
    const visibleRefresh = () => { if (document.visibilityState !== "hidden") void refresh(); };
    visibleRefresh();
    const timer = window.setInterval(visibleRefresh, 10000);
    window.addEventListener("focus", visibleRefresh);
    document.addEventListener("visibilitychange", visibleRefresh);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", visibleRefresh); document.removeEventListener("visibilitychange", visibleRefresh); };
  }, []);
  return { connections, error, refreshing, retry };
}
