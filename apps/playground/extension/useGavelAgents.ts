import { useCallback, useEffect, useRef, useState } from "react";
import type { RuntimeCatalog } from "../src/agent-runs/runtime-families";
import { fetchRuntimeCatalog, pageTargetUri, type AgentSession, type DeliverTarget, type GavelClient, type PageRef, type Route } from "./gavel-client";

const SESSION_POLL_MS = 5000;

function describe(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

/** The live agent sessions threads can be delivered to, refreshed while the panel is visible. */
export function useAgentSessions(client: GavelClient): { sessions: AgentSession[] | undefined; error: string | null } {
  const [sessions, setSessions] = useState<AgentSession[]>();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      client.agentSessions().then(
        next => { if (!cancelled) { setSessions(next); setError(null); } },
        (cause: unknown) => { if (!cancelled) setError(describe(cause)); },
      );
    };
    const update = () => { if (document.visibilityState === "visible") refresh(); };
    refresh();
    const timer = window.setInterval(update, SESSION_POLL_MS);
    window.addEventListener("focus", update);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", update);
    };
  }, [client]);
  return { sessions, error };
}

/** The models and agent runtimes a new session can start with, loaded once from the dashboard. */
export function useRuntimeCatalog(server: string): { catalog: RuntimeCatalog | undefined; error: string | null } {
  const [catalog, setCatalog] = useState<RuntimeCatalog>();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetchRuntimeCatalog({ server }).then(
      next => { if (!cancelled) setCatalog(next); },
      (cause: unknown) => { if (!cancelled) setError(describe(cause)); },
    );
    return () => { cancelled = true; };
  }, [server]);
  return { catalog, error };
}

/**
 * Whether gavel delivers new comments on the current page to an agent
 * automatically: a route whose prefix is the page's target. Turning it off keeps
 * the route disabled so a broader route cannot take over the page. While it is
 * on, changing the delivery target re-points the route.
 */
export function useAutoRoute(options: { client: GavelClient; page: PageRef | undefined; target: DeliverTarget | undefined }) {
  const { client, page, target } = options;
  const prefix = page ? pageTargetUri(client.scope, page) : undefined;
  const targetKey = JSON.stringify(target ?? null);
  const [route, setRoute] = useState<Route>();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const synced = useRef(targetKey);

  useEffect(() => {
    if (prefix === undefined) return;
    let cancelled = false;
    setReady(false);
    setRoute(undefined);
    client.routes().then(
      routes => {
        if (cancelled) return;
        setRoute(routes.find(entry => entry.targetPrefix === prefix));
        setError(null);
        setReady(true);
      },
      (cause: unknown) => { if (!cancelled) setError(describe(cause)); },
    );
    return () => { cancelled = true; };
  }, [client, prefix]);

  const save = useCallback(async (enabled: boolean) => {
    if (!page || !target) throw new Error("The grabber has not reported the page yet");
    try {
      setRoute(await client.saveRoute({ page, target, enabled, ...(route ? { id: route.id } : {}) }));
      setError(null);
    } catch (cause) {
      setError(describe(cause));
    }
  }, [client, page, target, route]);

  useEffect(() => {
    if (synced.current === targetKey) return;
    synced.current = targetKey;
    // After a page change the route is still the previous page's until its own loads.
    if (route?.enabled && route.targetPrefix === prefix) void save(true);
  }, [targetKey]);

  return { enabled: route?.enabled === true, ready, error, set: save };
}
