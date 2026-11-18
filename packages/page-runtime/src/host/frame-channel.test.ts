import { describe, expect, it } from "vitest";
import { validateEnvelope, validateFrameMessage } from "./validation.ts";

describe("page to host data channel", () => {
  it.each([
    { type: "emit", event: "change", payload: { name: "api", replicas: [1, 2], nested: { on: true, none: null } } },
    { type: "emit", event: "ping", payload: null },
    { type: "size", height: 412 },
    { type: "size", height: 0 },
  ])("accepts frame message $type", (message) => {
    expect(validateFrameMessage(message)).toEqual(message);
  });

  it.each([
    [{ type: "emit", event: "", payload: null }, /event/],
    [{ type: "emit", event: "change" }, /payload/],
    [{ type: "emit", event: "change", payload: undefined }, /payload|data/],
    [{ type: "emit", event: "change", payload: Number.NaN }, /payload|data/],
    [{ type: "emit", event: "change", payload: null, extra: true }, /extra/],
    [{ type: "size", height: -1 }, /height/],
    [{ type: "size", height: Number.POSITIVE_INFINITY }, /height/],
    [{ type: "size", height: "12" }, /height/],
    [{ type: "size" }, /height/],
  ])("rejects malformed frame message %j", (message, reason) => {
    expect(() => validateFrameMessage(message)).toThrow(reason);
  });

  it("does not accept emit or size from the host direction", () => {
    const envelope = { bridge: "page-runtime-v1", session: "s", message: { type: "size", height: 10 } };
    expect(() => validateEnvelope(envelope, "host")).toThrow(/unsupported host message/);
    expect(validateEnvelope(envelope, "frame")).toEqual(envelope);
  });
});
