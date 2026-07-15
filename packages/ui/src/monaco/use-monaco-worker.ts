import { createContext, useContext } from "react";
import type { MonacoWorkerFactory } from "./types";

export const WorkerContext = createContext<MonacoWorkerFactory | null>(null);

export function useMonacoWorkerFactory(): MonacoWorkerFactory | null {
  return useContext(WorkerContext);
}
