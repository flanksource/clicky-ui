import { expect, it } from "vitest";
import { appendActivity, emptyActivity, activityLibraries, activityTimings, summarizeActivity } from "./activity-state.ts";
import { createRequestActivity } from "../sw/activity.ts";
import type { ActivityMessage } from "../activity-schema.ts";

const record = { ...createRequestActivity("https://runtime.example/npm/react@18.3.1/index.js"), source: "network" as const, origin: "https://packages.example/react@18.3.1/index.js", transferredBytes: 100, decodedBytes: 200, outputBytes: 220, compileMs: 3 };
const first: ActivityMessage = { type: "activity", load: "first", navigationStart: 1000, records: [record], timeline: [{ phase: "ready", atMs: 30 }], tailwind: [], runtime: { versions: { react: "18.3.1" }, base: { react: "/npm/react@18.3.1/index.js" }, managed: [], scopes: 0, importMapBytes: 40 } };

it("deduplicates request batches, resets on navigation, retains the previous summary and rejects late older-load batches", () => {
  const state = appendActivity({ state: emptyActivity(), message: first });
  const duplicate = appendActivity({ state, message: { ...first, timeline: [] } });
  expect(duplicate.current?.records).toEqual([record]);
  expect(summarizeActivity(duplicate.current!)).toEqual({ requests: 1, transferredBytes: 100, unknownTransfers: 0, unknownCompiles: 0, decodedBytes: 200, outputBytes: 220, cacheHits: 0, compileMs: 3, readyMs: 30, versions: { react: "18.3.1" } });
  const next = appendActivity({ state: duplicate, message: { ...first, load: "second", navigationStart: 2000, records: [], timeline: [{ phase: "visible", atMs: 20 }] }, editStartedAt: 1980 });
  expect({ previous: next.previous, requests: next.current?.records.length, edit: next.current?.editToVisibleMs }).toEqual({ previous: summarizeActivity(state.current!), requests: 0, edit: 40 });
  expect(appendActivity({ state: next, message: first })).toBe(next);
});
it("reports a ready load as Server-Timing metrics: time to ready plus per-phase work summed over the requests that did it", () => {
  const fetched = { ...record, id: "fetched", fetchMs: 12, integrityMs: 2, compileMs: 0, rewriteMs: 1.5 };
  const compiled = { ...record, id: "compiled", source: "compiled" as const, fetchMs: 0, integrityMs: 0, compileMs: 8, rewriteMs: 0.5 };
  const cached = { ...record, id: "cached", source: "cache" as const, fetchMs: 0, integrityMs: 0, compileMs: 0, rewriteMs: 0 };
  const tailwind = [{ kind: "libraries" as const, startMs: 0, durationMs: 20, candidates: 0, cssBytes: 0, cacheHit: false }, { kind: "candidates" as const, startMs: 25, durationMs: 0, candidates: 3, cssBytes: 10, cacheHit: true }];
  const load = appendActivity({ state: emptyActivity(), message: { ...first, records: [fetched, compiled, cached], tailwind } }).current!;
  expect(activityTimings(load)).toEqual([
    { name: "total", duration: 30, counters: {} },
    { name: "fetch", duration: 12, counters: { requests: 1 } },
    { name: "integrity", duration: 2, counters: { files: 1 } },
    { name: "compile", duration: 8, counters: { modules: 1 } },
    { name: "rewrite", duration: 2, counters: { modules: 2 } },
    { name: "tailwind", duration: 20, counters: { builds: 1 } },
  ]);
  expect(activityTimings({ ...load, timeline: [] })).toEqual([]);
});
it("aggregates package bytes and distinct files and distinguishes base-set packages", () => {
  const state = appendActivity({ state: emptyActivity(), message: { ...first, records: [record, { ...record, id: "cached", source: "cache", cache: "storage", transferredBytes: 0 }] } });
  expect(activityLibraries(state.current!)).toEqual([{ id: "react@18.3.1", name: "react", version: "18.3.1", origin: "https://packages.example/react@18.3.1/", files: 1, transferredBytes: 100, unknownTransfers: 0, decodedBytes: 400, cacheRatio: 0.5, role: "base set" }]);
});
