import type { HAREntry } from "./types";

/**
 * An in-flight request as the commons/har collector snapshots it: `_pending`,
 * a zeroed response, and `time` holding the elapsed ms at snapshot time.
 */
export function pendingHarEntry(startedAt: Date, snapshotElapsedMs: number): HAREntry {
  return {
    startedDateTime: startedAt.toISOString(),
    time: snapshotElapsedMs,
    _id: "req-cycles-run",
    _pending: true,
    request: {
      method: "POST",
      url: "https://api.example.com/v1/cycles/run",
      headers: [{ name: "content-type", value: "application/json" }],
      postData: { mimeType: "application/json", text: JSON.stringify({ cycle: "nightly" }) },
      bodySize: 20,
    },
    response: { status: 0, bodySize: 0 },
  };
}

/**
 * The later snapshot of the same request once its response arrived: same `_id`
 * and start, `_pending` gone, a real response and final `time`.
 */
export function completedHarEntry(pending: HAREntry, responseText: string): HAREntry {
  const { _pending: _, ...rest } = pending;
  return {
    ...rest,
    time: 41_250,
    response: {
      status: 200,
      statusText: "OK",
      headers: [{ name: "content-type", value: "text/plain" }],
      content: { size: responseText.length, mimeType: "text/plain", text: responseText },
      bodySize: responseText.length,
    },
  };
}

/** A request that never got a response: status 0 plus the transport error. */
export function transportErrorHarEntry(startedAt: Date, error: string): HAREntry {
  return {
    startedDateTime: startedAt.toISOString(),
    time: 30_000,
    _id: "req-activities-pending",
    _error: error,
    request: {
      method: "GET",
      url: "https://api.example.com/v1/activities/pending",
      headers: [],
      bodySize: 0,
    },
    response: { status: 0, bodySize: 0 },
  };
}

export const sampleHarEntries: HAREntry[] = [
  {
    startedDateTime: new Date().toISOString(),
    time: 123,
    request: {
      method: "GET",
      url: "https://api.example.com/v1/configs",
      httpVersion: "HTTP/1.1",
      headers: [
        { name: "accept", value: "application/json" },
        { name: "authorization", value: "Bearer ***" },
      ],
      queryString: [],
      bodySize: 0,
    },
    response: {
      status: 200,
      statusText: "OK",
      headers: [{ name: "content-type", value: "application/json" }],
      content: {
        size: 64,
        mimeType: "application/json",
        text: JSON.stringify({ items: [{ id: 1, name: "db" }] }, null, 2),
      },
      bodySize: 64,
    },
  },
  {
    startedDateTime: new Date().toISOString(),
    time: 420,
    request: {
      method: "POST",
      url: "https://api.example.com/v1/configs",
      headers: [{ name: "content-type", value: "application/json" }],
      postData: {
        mimeType: "application/json",
        text: JSON.stringify({ name: "new-config" }),
      },
      bodySize: 24,
    },
    response: {
      status: 201,
      headers: [{ name: "content-type", value: "application/json" }],
      content: { size: 18, mimeType: "application/json", text: '{"id":"abc"}' },
      bodySize: 18,
    },
  },
  {
    startedDateTime: new Date().toISOString(),
    time: 88,
    request: {
      method: "GET",
      url: "https://api.example.com/v1/missing",
      headers: [],
      bodySize: 0,
    },
    response: {
      status: 404,
      headers: [],
      content: { size: 9, mimeType: "text/plain", text: "Not found" },
      bodySize: 9,
    },
  },
  {
    startedDateTime: new Date().toISOString(),
    time: 1200,
    request: {
      method: "GET",
      url: "https://api.example.com/v1/slow",
      headers: [],
      bodySize: 0,
    },
    response: {
      status: 503,
      headers: [],
      content: { size: 22, mimeType: "text/plain", text: "Service Unavailable" },
      bodySize: 22,
    },
  },
];
