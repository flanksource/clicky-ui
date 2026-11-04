import { useEffect, useState } from "react";
import { fetchCaptainSessions, type CaptainSessionOption } from "./agent-runs-api";

export function useCaptainSessions() {
  const [sessions, setSessions] = useState<CaptainSessionOption[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const next = await fetchCaptainSessions();
        if (active) { setSessions(next); setError(null); }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : String(cause));
      }
    };
    void load();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void load(); }, 10_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  return { sessions, error };
}
