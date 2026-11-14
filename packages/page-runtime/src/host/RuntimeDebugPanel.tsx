import { useState, useSyncExternalStore } from "react";
import { Tabs } from "@flanksource/clicky-ui";
import { RuntimeActivity } from "./RuntimeActivity.tsx";
import { BuildLog } from "./BuildLog.tsx";
import { buildLog } from "./build-log.ts";
import type { RuntimeDiagnosticsSource } from "./runtime-diagnostics.ts";

export default function RuntimeDebugPanel({ source, page, origin }: { source: RuntimeDiagnosticsSource; page: string; origin: string }) {
  const state = useSyncExternalStore(source.subscribe, source.getSnapshot, source.getSnapshot);
  const [tab, setTab] = useState("activity");
  return <section aria-label={`Runtime diagnostics: ${page}`} className="flex min-h-0 flex-1 flex-col overflow-hidden">
    <div className="flex flex-wrap items-center gap-density-2 border-b border-border px-density-3 py-density-2 text-xs"><strong>{page}</strong><span>{state.status}</span><span className="break-all text-muted-foreground">{origin}</span></div>
    {state.error && <p role="alert" className="shrink-0 px-density-3 py-density-2 text-sm text-destructive">{state.error}</p>}
    {state.dropped > 0 && <p className="px-density-3 text-xs text-muted-foreground">{state.dropped} older requests dropped from this capture.</p>}
    <Tabs tabs={[{ id: "activity", label: "Activity" }, { id: "build", label: "Build log" }]} value={tab} onChange={setTab} />
    {tab === "activity" ? <RuntimeActivity activity={state.activity} className="min-h-0 flex-1" /> : <div className="min-h-0 flex-1 overflow-auto p-density-3"><BuildLog entries={buildLog({ steps: state.steps, load: state.activity.current })} live={!["ready", "failed"].includes(state.status)} {...(state.steps[0] ? { startedAt: state.steps[0].at } : {})} /></div>}
  </section>;
}
