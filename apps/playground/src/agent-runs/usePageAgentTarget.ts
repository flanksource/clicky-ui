import { useCallback, useEffect, useMemo, useState } from "react";
import type { AgentSessionsView, AgentTarget, CaptainSessionOption } from "./agent-runs-api";
import { rememberedAgentTarget, rememberAgentTarget } from "./agent-targets";
import { readPageChoice, rememberPageTarget } from "./page-targets";

export function usePageAgentTarget({ page, projectScope, data, sessions }: { page: string | undefined; projectScope: boolean; data: AgentSessionsView | null; sessions: CaptainSessionOption[] | null }) {
  const [version, setVersion] = useState(0);
  const [storageError, setStorageError] = useState<string | null>(null);
  useEffect(() => {
    const update = () => setVersion(value => value + 1);
    window.addEventListener("storage", update);
    return () => window.removeEventListener("storage", update);
  }, []);
  const remembered = useMemo(() => {
    try {
      return { target: rememberedAgentTarget(), error: null };
    } catch (cause) {
      return { target: null, error: cause instanceof Error ? cause.message : String(cause) };
    }
  }, [version]);
  const available = remembered.target && (
    sessions?.some(session => session.id === remembered.target?.sessionId || session.captainId === remembered.target?.sessionId) ||
    data?.sessions.some(session => session.sessionId === remembered.target?.sessionId && session.state === "running")
  ) ? remembered.target : undefined;
  useEffect(() => {
    if (projectScope || !page || !available || readPageChoice(page) !== undefined) return;
    try {
      rememberPageTarget(page, available);
      setVersion(value => value + 1);
      setStorageError(null);
    } catch (cause) {
      setStorageError(cause instanceof Error ? cause.message : String(cause));
    }
  }, [projectScope, page, available, version]);
  const targetFor = useCallback((page: string): AgentTarget | undefined =>
    readPageChoice(page) ?? available ?? data?.pages[page]?.defaultTarget,
  [available, data, version]);
  const remember = useCallback((page: string, target: AgentTarget) => {
    rememberPageTarget(page, target);
    setVersion(value => value + 1);
    rememberAgentTarget(target);
    setStorageError(null);
  }, []);
  return { targetFor, remember, error: storageError ?? remembered.error };
}
