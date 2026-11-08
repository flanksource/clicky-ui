import { describe, expect, it } from "vitest";
import { validateEnvelope } from "./validation.ts";
import { createBridge } from "./bridge.ts";

const envelope = { bridge: "page-runtime-v1", session: "session-1", message: { type: "status", state: "ready" } };
describe("bridge validation", () => {
  it("accepts a valid frame envelope", () => expect(validateEnvelope(envelope, "frame")).toEqual(envelope));
  it.each([
    { ...envelope, bridge: "other" }, { ...envelope, session: "" }, { ...envelope, id: 2 },
    { ...envelope, message: { type: "status", state: "arbitrary" } }, { ...envelope, extra: true },
    { ...envelope, message: { type: "error", error: { phase: "invalid", message: "bad", file: "x" } } },
    { ...envelope, message: { type: "data", data: {} } },
  ])("rejects untrusted invalid frame envelope %#", (value) => expect(() => validateEnvelope(value, "frame")).toThrow());
  it("rejects extra message fields", () => expect(() => validateEnvelope({ ...envelope, message: { type: "snapshot", html: "x", secret: "x" } }, "frame")).toThrow());
});

describe.each(["https://pages.example.com", "http://localhost:3000"])("bridge provenance (%s)", (origin) => {
  it("delivers only messages with the expected origin, source window and session", () => {
    const local = new EventTarget(); const target = {} as Window;
    const received: unknown[] = []; const errors: Error[] = [];
    const bridge = createBridge({ target, origin, session: envelope.session, direction: "host", window: local as Window, onMessage: (e) => received.push(e), onError: (e) => errors.push(e) });
    const deliver = (origin: string, source: Window, data: unknown) => {
      const event = new Event("message"); Object.assign(event, { origin, source, data }); local.dispatchEvent(event);
    };
    deliver("https://other.example.com", target, envelope);
    deliver(origin, {} as Window, envelope);
    deliver(origin, target, { ...envelope, session: "other-session" });
    deliver(origin, target, envelope);
    expect({ received, errors }).toEqual({ received: [envelope], errors: [] });
    bridge.dispose();
    deliver(origin, target, envelope);
    expect(received).toHaveLength(1);
  });
});
