// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { createFrameActivity } from "./activity.ts";
import { createRequestActivity } from "../sw/activity.ts";
import type { ActivityMessage } from "../activity-schema.ts";

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

it("batches worker records with frame diagnostics without dropping records or exceeding the bridge bound", () => {
  vi.useFakeTimers();
  const controller = {}; const addEventListener = vi.fn();
  vi.stubGlobal("navigator", { serviceWorker: { controller, addEventListener, removeEventListener: vi.fn() } });
  const send = vi.fn(); const error = vi.fn();
  const activity = createFrameActivity({ send, error });
  const receive = addEventListener.mock.calls[0]![1] as (event: MessageEvent) => void;
  const records = Array.from({ length: 33 }, () => createRequestActivity("https://runtime.example/src/report.tsx"));
  for (const batch of [records.slice(0, 32), records.slice(32)]) receive({ source: controller, data: { type: "activity", load: activity.load, navigationStart: activity.navigationStart, records: batch, timeline: [], tailwind: [] } } as MessageEvent);
  activity.tailwind({ kind: "candidates", startMs: 0, durationMs: 1, candidates: 2, cssBytes: 3, cacheHit: false });
  expect(send).not.toHaveBeenCalled();
  vi.advanceTimersByTime(40);
  const messages = send.mock.calls.map(([message]) => message as ActivityMessage);
  expect(messages.map((message) => message.records.length)).toEqual([32, 1]);
  expect(messages.flatMap((message) => message.records)).toEqual(records);
  expect(messages.map((message) => message.tailwind.length)).toEqual([1, 0]);
  expect(error).not.toHaveBeenCalled();
  activity.stop();
});
