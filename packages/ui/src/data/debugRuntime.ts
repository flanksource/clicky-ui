import type { ReactNode } from "react";

export type DebugRuntime = {
  id: string; label: string; content: ReactNode; clear: () => void;
  state: { getSnapshot: () => { status: string; error: string | null }; subscribe: (listener: () => void) => () => void };
};
const listeners = new Set<() => void>();
let runtimes: readonly DebugRuntime[] = [];

export const debugRuntimes = () => runtimes;
export function subscribeToDebugRuntimes(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function registerDebugRuntime(runtime: DebugRuntime): () => void {
  if (runtimes.some(item => item.id === runtime.id)) throw new Error(`Debug runtime ${runtime.id} is already registered`);
  let { status, error } = runtime.state.getSnapshot();
  const unsubscribe = runtime.state.subscribe(() => {
    const next = runtime.state.getSnapshot();
    if (status === next.status && error === next.error) return;
    status = next.status;
    error = next.error;
    runtimes = [...runtimes];
    notify();
  });
  runtimes = [...runtimes, runtime];
  notify();
  return () => {
    if (!runtimes.includes(runtime)) return;
    unsubscribe();
    runtimes = runtimes.filter(item => item !== runtime);
    notify();
  };
}
export function clearDebugRuntimes(): void {
  for (const runtime of runtimes) runtime.clear();
}

function notify(): void {
  for (const listener of listeners) listener();
}
