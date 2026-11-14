import { lazy, Suspense } from "react";
import { debugCaptureHeaders, registerDebugRuntime } from "@flanksource/clicky-ui/data";
import { createRuntimeDiagnostics } from "./runtime-diagnostics.ts";

const RuntimeDebugPanel = lazy(() => import("./RuntimeDebugPanel.tsx"));

export function registerPageRuntimeDebug(options: { session: string; page: string; origin: string }) {
  const source = createRuntimeDiagnostics({ capture: () => Boolean(debugCaptureHeaders()["X-Debug-Level"]) });
  const dispose = registerDebugRuntime({
    id: options.session,
    label: options.page,
    clear: source.clear,
    content: <Suspense fallback={<p className="p-density-3 text-sm text-muted-foreground">Loading runtime diagnostics…</p>}><RuntimeDebugPanel source={source} page={options.page} origin={options.origin} /></Suspense>,
  });
  return { ...source, dispose };
}
