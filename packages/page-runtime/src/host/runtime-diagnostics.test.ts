import { expect, it } from "vitest";
import { createRuntimeDiagnostics, MAX_RUNTIME_REQUESTS } from "./runtime-diagnostics.ts";
import { createRequestActivity } from "../sw/activity.ts";
import type { ActivityMessage } from "../activity-schema.ts";
import { buildLog } from "./build-log.ts";

const activity: ActivityMessage = { type: "activity", load: "report", navigationStart: 1000, records: [createRequestActivity("https://runtime.example/src/report.tsx")], timeline: [{ phase: "ready", atMs: 12 }], tailwind: [] };

it("keeps frame statuses, failed builds and deduplicated request batches for the console", () => {
  const source = createRuntimeDiagnostics({ capture: () => true });
  source.receive({ type: "status", state: "booting" });
  source.receive(activity);
  source.receive(activity);
  source.receive({ type: "error", error: { phase: "compile", message: "Unexpected token", file: "report.tsx", line: 8 } });
  expect({ status: source.getSnapshot().status, error: source.getSnapshot().error, records: source.getSnapshot().activity.current?.records }).toEqual({ status: "failed", error: "compile: report.tsx:8: Unexpected token", records: activity.records });
  source.clear();
  expect(source.getSnapshot()).toMatchObject({ status: "failed", steps: [], activity: { current: null, previous: null }, error: null, dropped: 0 });
  source.receive(activity);
  const state = source.getSnapshot();
  expect(() => buildLog({ steps: state.steps, load: state.activity.current })).not.toThrow();
});

it("captures no request payloads while disabled, and bounds retained requests while enabled", () => {
  let enabled = false;
  const source = createRuntimeDiagnostics({ capture: () => enabled });
  source.receive(activity);
  expect(source.getSnapshot().activity.current).toBeNull();
  enabled = true;
  const records = Array.from({ length: MAX_RUNTIME_REQUESTS + 1 }, (_, index) => ({ ...activity.records[0]!, id: `request-${index}` }));
  source.receive({ ...activity, records });
  expect({ held: source.getSnapshot().activity.current?.records.length, dropped: source.getSnapshot().dropped }).toEqual({ held: MAX_RUNTIME_REQUESTS, dropped: 1 });
  source.receive({ ...activity, load: "next", navigationStart: 2000 });
  expect(source.getSnapshot().dropped).toBe(0);
});

it("notifies subscribers of bridge failures and removes an old error on the next build", () => {
  const source = createRuntimeDiagnostics({ capture: () => true });
  const seen: string[] = [];
  const release = source.subscribe(() => seen.push(source.getSnapshot().status));
  source.fail(new Error("Bridge timed out"));
  source.receive({ type: "status", state: "booting" });
  release();
  source.receive({ type: "status", state: "ready" });
  expect({ seen, error: source.getSnapshot().error, steps: source.getSnapshot().steps.map(step => step.label) }).toEqual({ seen: ["failed", "booting"], error: null, steps: ["booting", "ready"] });
});
