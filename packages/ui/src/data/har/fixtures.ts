import type { HAREntry } from "./types";

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
