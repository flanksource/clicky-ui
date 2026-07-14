import { createContext, useContext, useEffect } from "react";
import type { MonacoProviderProps, MonacoWorkerFactory } from "./types";

const WorkerContext = createContext<MonacoWorkerFactory | null>(null);

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

export function useMonacoWorkerFactory(): MonacoWorkerFactory | null {
  return useContext(WorkerContext);
}
