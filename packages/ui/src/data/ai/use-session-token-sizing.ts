import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SessionEvent, SessionInput } from "./SessionViewer.model";
import type { SessionTokenRowResult, SessionTokenSizer } from "./session-token-sizing";

export interface RowTokenState extends SessionTokenRowResult { pending?: boolean }
interface TokenSizingContext {
  state: (event: SessionEvent) => RowTokenState | undefined;
  calculate: (rowIds: string[], method: "estimate" | "provider") => void;
}
export const SessionTokenContext = createContext<TokenSizingContext | undefined>(undefined);

export function useSessionTokenSizing(session: SessionInput, events: SessionEvent[], sizeTokens?: SessionTokenSizer) {
  const identity = typeof session === "object" && !Array.isArray(session) && session !== null && "id" in session ? session : undefined;
  const sessionId = identity?.id;
  const revision = identity?.revision;
  const scope = JSON.stringify([sessionId, revision, identity?.model, identity?.modelMode]);
  const keys = useMemo(() => new Map(events.map((event) => [event.id, JSON.stringify([scope, event.id, event.model, event.text, event.toolInput, event.toolResponse, event.file, event.raw])])), [events, scope]);
  const [values, setValues] = useState<Record<string, RowTokenState>>({});
  const current = useRef({ scope, keys });
  current.current = { scope, keys };
  const inFlight = useRef(new Map<string, AbortController>());
  const controllers = useRef(new Set<AbortController>());

  useEffect(() => {
    const valid = new Set(keys.values());
    for (const [key, controller] of inFlight.current) {
      if (!valid.has(key)) { controller.abort(); inFlight.current.delete(key); }
    }
    setValues((old) => Object.keys(old).every((key) => valid.has(key)) ? old : Object.fromEntries(Object.entries(old).filter(([key]) => valid.has(key))));
  }, [keys]);
  useEffect(() => () => { for (const controller of controllers.current) controller.abort(); }, []);

  const calculate = useCallback((rowIds: string[], method: "estimate" | "provider") => {
    if (!sizeTokens || !sessionId) return;
    const requested = rowIds.flatMap((rowId) => {
      const key = keys.get(rowId);
      if (!key || inFlight.current.has(key)) return [];
      const value = values[key];
      if (value?.size && (method === "estimate" || value.size.source !== "local-estimate")) return [];
      return [{ rowId, key }];
    });
    if (requested.length === 0) return;
    const controller = new AbortController();
    controllers.current.add(controller);
    for (const { key } of requested) inFlight.current.set(key, controller);
    setValues((old) => ({ ...old, ...Object.fromEntries(requested.map(({ rowId, key }) => [key, { ...old[key], rowId, attributed: false, pending: true }])) }));
    void (async () => {
      try {
        const result = await sizeTokens({ sessionId, ...(revision !== undefined ? { revision } : {}), rowIds: requested.map(({ rowId }) => rowId), method }, controller.signal);
        if (controller.signal.aborted || current.current.scope !== scope) return;
        if (result.sessionId !== sessionId || (revision !== undefined && result.revision !== revision)) throw new Error("Session changed while calculating tokens; retry on the current transcript.");
        const returned = new Map(result.rows.map((row) => [row.rowId, row]));
        setValues((old) => ({ ...old, ...Object.fromEntries(requested.filter(({ rowId, key }) => current.current.keys.get(rowId) === key).map(({ rowId, key }) => [key, returned.get(rowId) ?? { rowId, attributed: false, error: "No token sizing result returned for this row." }])) }));
      } catch (error) {
        if (controller.signal.aborted || current.current.scope !== scope) return;
        const message = error instanceof Error ? error.message : String(error);
        setValues((old) => ({ ...old, ...Object.fromEntries(requested.filter(({ rowId, key }) => current.current.keys.get(rowId) === key).map(({ rowId, key }) => [key, { rowId, attributed: false, error: message }])) }));
      } finally {
        controllers.current.delete(controller);
        for (const { key } of requested) if (inFlight.current.get(key) === controller) inFlight.current.delete(key);
      }
    })();
  }, [keys, revision, scope, sessionId, sizeTokens, values]);

  const enabled = Boolean(sizeTokens && sessionId);
  return {
    context: enabled ? { state: (event: SessionEvent) => { const key = keys.get(event.id); return key ? values[key] : undefined; }, calculate } : undefined,
    estimateAll: enabled ? () => calculate(events.filter((event) => !event.pending).map((event) => event.id), "estimate") : undefined,
    calculateMissing: enabled ? () => calculate(events.filter((event) => !event.estimatedCost && !event.pending).map((event) => event.id), "provider") : undefined,
    pending: Object.values(values).some((value) => value.pending),
  };
}
