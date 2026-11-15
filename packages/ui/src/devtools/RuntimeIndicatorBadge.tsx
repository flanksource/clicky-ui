import { useSyncExternalStore } from "react";
import { Button } from "../components/button";
import { Badge } from "../data/Badge";
import { debugRuntimes, subscribeToDebugRuntimes } from "../data/debugRuntime";
import { debugConsoleAvailable, revealDebugConsole, subscribeToDebugConsole } from "../data/debugConsoleSignal";
import { cn } from "../lib/utils";

export type RuntimeIndicatorBadgeProps = { className?: string };

export function RuntimeIndicatorBadge({ className }: RuntimeIndicatorBadgeProps) {
  const runtimes = useSyncExternalStore(subscribeToDebugRuntimes, debugRuntimes, debugRuntimes);
  const available = useSyncExternalStore(subscribeToDebugConsole, debugConsoleAvailable, () => false);
  if (runtimes.length === 0) return null;
  const states = runtimes.map(runtime => ({ label: runtime.label, ...runtime.state.getSnapshot() }));
  const failed = states.filter(state => state.status === "failed" || state.error);
  const pending = states.filter(state => state.status !== "ready" && state.status !== "failed" && !state.error);
  const label = states.length === 1 ? "Runtime" : `${states.length} runtimes`;
  let value = "ready";
  if (failed.length) value = states.length === 1 ? "failed" : `${failed.length} failed`;
  else if (pending.length) value = states.length === 1 ? states[0]!.status : `${pending.length} loading`;
  return <Button
    size="sm"
    variant="ghost"
    className={cn("h-auto shrink-0 p-0", className)}
    disabled={!available}
    aria-label={`${label}: ${value}. Open runtime diagnostics`}
    title={states.map(state => `${state.label}: ${state.status}${state.error ? ` — ${state.error}` : ""}`).join("\n")}
    onClick={() => revealDebugConsole({ tab: "runtimes" })}
  ><Badge variant="status" size="xs" clickToCopy={false} status={failed.length ? "error" : pending.length ? "warning" : "success"} label={label} value={value} /></Button>;
}
