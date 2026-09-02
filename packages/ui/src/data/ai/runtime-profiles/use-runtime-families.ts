import { useCallback, useEffect, useState } from "react";
import type { RuntimeFamiliesState, RuntimeProfilesClient } from "./types";

export function useRuntimeFamilies(
  client: RuntimeProfilesClient,
): RuntimeFamiliesState {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<Omit<RuntimeFamiliesState, "retry">>({
    families: [],
    status: client.loadFamilies ? "loading" : "resolved",
  });
  const retry = useCallback(() => setAttempt((current) => current + 1), []);
  const { loadFamilies } = client;

  useEffect(() => {
    if (!loadFamilies) {
      setState({ families: [], status: "resolved" });
      return;
    }
    const controller = new AbortController();
    setState({ families: [], status: "loading" });
    void loadFamilies(controller.signal).then(
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
  }, [attempt, loadFamilies]);

  return { ...state, retry };
}
