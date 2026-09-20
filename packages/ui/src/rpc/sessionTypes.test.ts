import { describe, expect, it } from "vitest";
import { JVM_TRACE_EVENTS, KV_STORE_EVENTS, sessionFixture } from "./session-story.fixtures";
import { parseSessionInfo } from "./sessionTypes";

const SOURCE = "GET /api/v1/sessions/7c1e";

describe("parseSessionInfo events", () => {
  it.each([
    { name: "a sqlite store with host and file", events: JVM_TRACE_EVENTS },
    { name: "a kv store with neither host nor file", events: KV_STORE_EVENTS },
  ])("accepts $name", ({ events }) => {
    const session = sessionFixture({ events });
    expect(parseSessionInfo(JSON.parse(JSON.stringify(session)), SOURCE)).toEqual(session);
  });

  it("accepts a session with no event stream", () => {
    const { events: _events, ...session } = sessionFixture();
    expect(parseSessionInfo(session, SOURCE).events).toBeUndefined();
  });

  it.each([
    { field: "events", events: "probe:FileMessageListener", got: '"probe:FileMessageListener"' },
    { field: "events.stream", events: { ...JVM_TRACE_EVENTS, stream: 7 }, got: "7" },
    { field: "events.kind", events: { ...JVM_TRACE_EVENTS, kind: null }, got: "null" },
    { field: "events.generation", events: { ...JVM_TRACE_EVENTS, generation: 3 }, got: "3" },
    { field: "events.low", events: { ...JVM_TRACE_EVENTS, low: "1" }, got: '"1"' },
    { field: "events.high", events: { ...JVM_TRACE_EVENTS, high: undefined }, got: "undefined" },
    { field: "events.from", events: { ...JVM_TRACE_EVENTS, from: "1" }, got: '"1"' },
    { field: "events.to", events: { ...JVM_TRACE_EVENTS, to: true }, got: "true" },
    { field: "events.total", events: { ...JVM_TRACE_EVENTS, total: "1843" }, got: '"1843"' },
    { field: "events.store", events: { ...JVM_TRACE_EVENTS, store: undefined }, got: "undefined" },
    { field: "events.store.backend", events: { ...JVM_TRACE_EVENTS, store: { host: "db-1" } }, got: "undefined" },
    { field: "events.store.host", events: { ...JVM_TRACE_EVENTS, store: { backend: "sqlite", host: 1 } }, got: "1" },
    { field: "events.store.file", events: { ...JVM_TRACE_EVENTS, store: { backend: "sqlite", file: false } }, got: "false" },
  ])("names $field when it breaks the contract", ({ field, events, got }) => {
    const session = { ...sessionFixture(), events };
    expect(() => parseSessionInfo(session, SOURCE)).toThrow(
      `${SOURCE}: session field "${field}" must be`,
    );
    expect(() => parseSessionInfo(session, SOURCE)).toThrow(`got ${got}`);
  });
});

describe("parseSessionInfo metadata", () => {
  const STATEMENTS = { name: "sql_xevent.statements", label: "Started with", language: "sql", value: "CREATE EVENT SESSION [t] ON SERVER;" };

  it.each([
    { name: "an entry with a language", metadata: [STATEMENTS] },
    { name: "an entry without one", metadata: [{ name: "target", label: "Target", value: "cycle-0" }] },
  ])("accepts $name", ({ metadata }) => {
    const session = sessionFixture({ metadata });
    expect(parseSessionInfo(JSON.parse(JSON.stringify(session)), SOURCE)).toEqual(session);
  });

  it.each([
    { field: "metadata", metadata: STATEMENTS, got: JSON.stringify(STATEMENTS) },
    { field: "metadata[0]", metadata: ["CREATE EVENT SESSION"], got: '"CREATE EVENT SESSION"' },
    { field: "metadata[0].name", metadata: [{ ...STATEMENTS, name: "" }], got: '""' },
    { field: "metadata[0].label", metadata: [{ ...STATEMENTS, label: 1 }], got: "1" },
    { field: "metadata[0].value", metadata: [{ ...STATEMENTS, value: undefined }], got: "undefined" },
    { field: "metadata[1].language", metadata: [STATEMENTS, { ...STATEMENTS, name: "b", language: 7 }], got: "7" },
  ])("names $field when it breaks the contract", ({ field, metadata, got }) => {
    const session = { ...sessionFixture(), metadata };
    expect(() => parseSessionInfo(session, SOURCE)).toThrow(`${SOURCE}: session field "${field}" must be`);
    expect(() => parseSessionInfo(session, SOURCE)).toThrow(`got ${got}`);
  });
});
