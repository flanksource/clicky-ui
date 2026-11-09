import { useCallback, useEffect, useRef, useState } from "react";
import type { BackendConnection } from "../plugins/connections-server";
import { request } from "./comments/useComments";

export const restartEndpoint = (name: BackendConnection["name"]) => `/__playground/connections/${name.toLowerCase()}/restart`;
/** A backend the playground runs is restarted; one it would start on demand is started. */
export const restartVerb = (connection: BackendConnection) => connection.management === "playground" ? "Restart" as const : "Start" as const;
export type RestartAttempt = { name: BackendConnection["name"]; verb: ReturnType<typeof restartVerb> };

function validConnections(result: { connections: BackendConnection[] }): BackendConnection[] {
  const valid = Array.isArray(result.connections) && result.connections.length === 2 && ["Gavel", "Captain"].every(name => result.connections.some(connection =>
    connection.name === name && typeof connection.url === "string" &&
    ["connected", "incompatible", "disconnected"].includes(connection.status) && (connection.status === "connected" || typeof connection.error === "string") &&
    ["playground", "on-demand", "external"].includes(connection.management) && (connection.management !== "playground" || Number.isInteger(connection.pid))));
  if (!valid) throw new Error("Invalid backend connection status response");
  return result.connections;
}

export function useBackendConnections() {
  const [connections, setConnections] = useState<BackendConnection[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [restarting, setRestarting] = useState<RestartAttempt | null>(null);
  const [restartError, setRestartError] = useState<(RestartAttempt & { error: unknown }) | null>(null);
  const refreshRef = useRef<() => void>(() => {});
  const retry = useCallback(() => {
    setRestartError(null);
    refreshRef.current();
  }, []);
  /** Starts the backend again through the playground; the response carries the status after the restart. */
  const restart = useCallback(async (connection: BackendConnection) => {
    const attempt: RestartAttempt = { name: connection.name, verb: restartVerb(connection) };
    setRestarting(attempt);
    setRestartError(null);
    try {
      setConnections(validConnections(await request<{ connections: BackendConnection[] }>(restartEndpoint(connection.name), { method: "POST" })));
      setError(null);
    } catch (cause) {
      setRestartError({ ...attempt, error: cause });
    } finally {
      setRestarting(null);
    }
  }, []);
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
  return { connections, error, refreshing, retry, restarting, restartError, restart };
}
