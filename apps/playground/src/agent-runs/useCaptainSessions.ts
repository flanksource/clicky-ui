import { useEffect, useState } from "react";
import { fetchCaptainSessions, type CaptainSessionOption } from "./agent-runs-api";

export function useCaptainSessions(page?: string) {
  const [sessions, setSessions] = useState<CaptainSessionOption[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setSessions(null);
    setError(null);
    const load = async () => {
      try {
        const next = await fetchCaptainSessions(page);
        if (active) { setSessions(next); setError(null); }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : String(cause));
      }
    };
    void load();
    const onFocus = () => { void load(); };
    window.addEventListener("focus", onFocus);
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void load(); }, 10_000);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener("focus", onFocus); };
  }, [page]);
  return { sessions, error };
}
