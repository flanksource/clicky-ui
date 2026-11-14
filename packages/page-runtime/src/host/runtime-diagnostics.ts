import type { FrameMessage } from "../schema.ts";
import { appendActivity, emptyActivity, type RuntimeActivityState } from "./activity-state.ts";
import type { BuildStep } from "./build-log.ts";

export type RuntimeDiagnostics = { status: string; steps: BuildStep[]; activity: RuntimeActivityState; error: string | null; dropped: number };
export const MAX_RUNTIME_REQUESTS = 2000;

export function createRuntimeDiagnostics(options: { capture: () => boolean }) {
  let state: RuntimeDiagnostics = { status: "connecting", steps: [{ label: "Frame created", at: Date.now(), source: "host" }], activity: emptyActivity(), error: null, dropped: 0 };
  const listeners = new Set<() => void>();
  const update = (patch: Partial<RuntimeDiagnostics>) => {
    state = { ...state, ...patch };
    for (const listener of listeners) listener();
  };
  const step = (label: string, error?: string) => [...state.steps, { label, at: Date.now(), source: "frame" as const, ...(error ? { error } : {}) }].slice(-128);
  const fail = (error: Error) => update({ status: "failed", error: error.message, steps: step("failed", error.message) });
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    receive(message: FrameMessage): void {
      if (message.type === "status") {
        if (message.state === state.status) return;
        if (message.state === "connecting" || (message.state === "booting" && ["ready", "failed"].includes(state.status))) state = { ...state, steps: [], error: null };
        update({ status: message.state, steps: step(message.state) });
      } else if (message.type === "error") {
        const { phase, file, line, column, message: text } = message.error;
        const location = [file, line, column].filter(value => value !== undefined && value !== "").join(":");
        fail(new Error(`${phase}: ${location ? `${location}: ` : ""}${text}`));
      } else if (message.type === "activity" && options.capture()) {
        const activity = appendActivity({ state: state.activity, message });
        if (activity === state.activity || !activity.current) return;
        const excess = Math.max(0, activity.current.records.length - MAX_RUNTIME_REQUESTS);
        const steps = !state.steps[0] || state.steps[0].at > message.navigationStart ? [{ label: "Navigation", at: message.navigationStart, source: "frame" as const }, ...state.steps] : state.steps;
        update({ steps, activity: { ...activity, current: { ...activity.current, records: activity.current.records.slice(-MAX_RUNTIME_REQUESTS) } }, dropped: (state.activity.current?.id === message.load ? state.dropped : 0) + excess });
      }
    },
    fail,
    clear() { update({ steps: [], activity: emptyActivity(), error: null, dropped: 0 }); },
  };
}
export type RuntimeDiagnosticsSource = ReturnType<typeof createRuntimeDiagnostics>;
