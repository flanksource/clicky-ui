import { describe, expect, it } from "vitest";
import { normalizeToolOutput } from "./normalize";

describe("normalizeToolOutput", () => {
  it("unwraps the transport envelope and parses the double-encoded payload", () => {
    expect(normalizeToolOutput({ output: '{"count":2}' })).toEqual({
      value: { count: 2 },
      isError: false,
    });
  });

  it("propagates isError off the envelope", () => {
    expect(normalizeToolOutput({ output: '{"message":"nope"}', isError: true })).toEqual({
      value: { message: "nope" },
      isError: true,
    });
  });

  it("parses a bare JSON string", () => {
    expect(normalizeToolOutput('[{"id":"1"}]')).toEqual({
      value: [{ id: "1" }],
      isError: false,
    });
  });

  it("returns a non-JSON string untouched and exposes it as text", () => {
    expect(normalizeToolOutput("Updated 3 accounts")).toEqual({
      value: "Updated 3 accounts",
      isError: false,
      text: "Updated 3 accounts",
    });
  });

  it("returns a malformed JSON-looking string untouched", () => {
    expect(normalizeToolOutput("{not json")).toEqual({
      value: "{not json",
      isError: false,
      text: "{not json",
    });
  });

  it("leaves an already-unwrapped object untouched", () => {
    const value = { id: "j1", lines: [{ amount: 10 }] };
    expect(normalizeToolOutput(value)).toEqual({ value, isError: false });
  });

  it("does not unwrap a record that merely has an output field", () => {
    const value = { output: "artifact.pdf", status: "done" };
    expect(normalizeToolOutput(value)).toEqual({ value, isError: false });
  });

  it("unwraps a doubly-wrapped envelope", () => {
    expect(normalizeToolOutput({ output: JSON.stringify({ output: '{"ok":true}' }) })).toEqual({
      value: { ok: true },
      isError: false,
    });
  });

  it("is identity for null and undefined", () => {
    expect(normalizeToolOutput(undefined)).toEqual({ value: undefined, isError: false });
    expect(normalizeToolOutput(null)).toEqual({ value: null, isError: false });
  });
});
