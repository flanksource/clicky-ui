import { useCallback, useEffect, useState } from "react";
import type { SpecRuntimeFamily } from "@flanksource/clicky-ui/ai";
import { loadRuntimeProfileFamilies } from "./client";

export type RuntimeFamiliesState = {
  families: SpecRuntimeFamily[];
  status: "loading" | "resolved" | "error";
  error?: string | undefined;
  retry: () => void;
};

export function useRuntimeFamilies(): RuntimeFamiliesState {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<
    Omit<RuntimeFamiliesState, "retry">
  >({ families: [], status: "loading" });
  const retry = useCallback(() => setAttempt((current) => current + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setState({ families: [], status: "loading" });
    void loadRuntimeProfileFamilies(controller.signal).then(
      (families) => setState({ families, status: "resolved" }),
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          families: [],
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        });
      },
    );
    return () => controller.abort();
  }, [attempt]);

  return { ...state, retry };
}
