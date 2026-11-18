import { afterEach, expect, it, vi } from "vitest";
import { validateActivity, type ActivityMessage } from "./activity-schema.ts";
import { applyLinkActivity, createRequestActivity, serverTiming, createActivityBatcher } from "./sw/activity.ts";
import { validateFrameMessage } from "./host/validation.ts";

const url = "https://runtime.example/npm/@acme/widgets@1.2.3/dist/index.js?page=page.tsx";
const message = (): ActivityMessage => ({ type: "activity", load: "load-1", navigationStart: 1000, records: [createRequestActivity(url)], timeline: [{ phase: "ready", atMs: 30 }], tailwind: [] });
afterEach(() => vi.useRealTimers());

it("identifies scoped npm files without mistaking the version for the package scope", () => {
  expect(createRequestActivity(url)).toMatchObject({ kind: "npm", package: { name: "@acme/widgets", version: "1.2.3", path: "dist/index.js" }, source: "generated", status: 0, error: null });
});
it("formats the measured phases and cache result as Server-Timing metrics", () => {
  expect(serverTiming({ ...createRequestActivity(url), fetchMs: 1.2345, integrityMs: 2, compileMs: 3, rewriteMs: 4, totalMs: 12, cache: "storage" })).toBe('fetch;dur=1.23, integrity;dur=2.00, compile;dur=3.00, rewrite;dur=4.00, total;dur=12.00, cache;desc="hit"');
});
it("labels an unavailable linked phase without reporting a fabricated zero duration", () => {
  const timing = serverTiming({ ...createRequestActivity(url), unavailable: ["compile"] });
  expect(timing).toContain('compile;desc="unavailable"');
  expect(timing).not.toContain("compile;dur=");
});
it("batches concurrent requests by client and bounds each delivery", async () => {
  vi.useFakeTimers();
  const send = vi.fn(async (_client: string, _records: unknown[]) => undefined);
  const batcher = createActivityBatcher({ send, delayMs: 20 });
  const pending = Array.from({ length: 70 }, () => batcher.push({ client: "frame-a", record: createRequestActivity(url) }));
  pending.push(batcher.push({ client: "frame-b", record: createRequestActivity(url) }));
  expect(send).not.toHaveBeenCalled();
  await vi.advanceTimersByTimeAsync(20);
  await Promise.all(pending);
  expect(send.mock.calls.map(([client, records]) => [client, records.length])).toEqual([["frame-a", 32], ["frame-a", 32], ["frame-a", 6], ["frame-b", 1]]);
});
it("accepts activity through the same validated frame-message boundary", () => {
  const valid = message();
  expect(validateActivity(valid)).toEqual(valid);
  expect(validateFrameMessage(valid)).toEqual(valid);
});
it("consumes measured linked-route metadata and rejects malformed metadata", () => {
  const record = createRequestActivity("https://runtime.example/link/checkout/src/Button.tsx?page=page.tsx");
  const metrics = { source: "compiled", cache: "miss", origin: "https://checkout.example/src/Button.tsx", generated: null, decodedBytes: 120, outputBytes: 200, transferredBytes: 100, compileMs: 3.5, rewriteMs: 1, fetchMs: 2, integrityMs: 0, unavailable: [] };
  expect(applyLinkActivity({ response: new Response(null, { headers: { "x-link-activity": encodeURIComponent(JSON.stringify(metrics)) } }), record })).toBe(true);
  expect(record).toMatchObject(metrics);
  expect(() => applyLinkActivity({ response: new Response(null, { headers: { "x-link-activity": encodeURIComponent('{"compileMs":-1}') } }), record })).toThrow();
  expect(() => applyLinkActivity({ response: new Response(null, { headers: { "x-link-activity": encodeURIComponent('{"url":"https://other.example"}') } }), record })).toThrow();
});
it.each([
  () => ({ ...message(), extra: true }),
  () => ({ ...message(), records: Array.from({ length: 33 }, () => createRequestActivity(url)) }),
  () => ({ ...message(), load: "x".repeat(257) }),
  () => ({ ...message(), records: [{ ...createRequestActivity(url), totalMs: NaN }] }),
  () => ({ ...message(), records: [{ ...createRequestActivity(url), transferredBytes: -1 }] }),
  () => ({ ...message(), records: [{ ...createRequestActivity(url), url: "javascript:alert(1)" }] }),
  () => ({ ...message(), records: [{ ...createRequestActivity(url), headers: { cookie: "secret" } }] }),
  () => ({ ...message(), timeline: [{ phase: "ready", atMs: Infinity }] }),
  () => ({ ...message(), tailwind: [{ kind: "candidates", startMs: 0, durationMs: 1, candidates: 1.5, cssBytes: 10, cacheHit: false }] }),
])("rejects malformed or oversized activity %#", (invalid) => {
  expect(() => validateActivity(invalid())).toThrow();
});
