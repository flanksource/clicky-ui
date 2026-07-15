import { useEffect } from "react";
import type { MonacoProviderProps } from "./types";
import { WorkerContext } from "./use-monaco-worker";

export function MonacoProvider({ getWorker, children }: MonacoProviderProps) {
  useEffect(() => {
    const scope = globalThis as unknown as {
      MonacoEnvironment?: { getWorker?: (moduleId: string, label: string) => Worker };
    };
    const previous = scope.MonacoEnvironment;
    scope.MonacoEnvironment = {
      ...previous,
      getWorker: (_moduleId: string, label: string) => getWorker(label),
    };
    return () => {
      if (previous) scope.MonacoEnvironment = previous;
      else delete scope.MonacoEnvironment;
    };
  }, [getWorker]);

  return <WorkerContext.Provider value={getWorker}>{children}</WorkerContext.Provider>;
}
