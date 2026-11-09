import { BuildLog, buildLog, type BuildStep, type RuntimeActivityState } from "@flanksource/page-runtime/host";

/** Collapsed disclosure of the per-step durations of a finished (failed or blocked) page load. */
export function RuntimeTimings({ steps, load }: { steps: BuildStep[]; load: RuntimeActivityState["current"] }) {
  if (!steps.length) return null;
  return <details className="shrink-0 border-t border-border"><summary className="cursor-pointer px-3 py-2 text-xs">Timings</summary><div className="max-h-64 overflow-auto px-3 pb-3"><BuildLog entries={buildLog({ steps, load })} live={false} /></div></details>;
}
