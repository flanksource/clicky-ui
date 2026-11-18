import { expect, it } from "vitest";
import { validateFrameOrigin } from "./origin.ts";

it.each(["http://localhost:3000", "http://127.0.0.1:3000", "http://[::1]:3000"])("accepts exact loopback origins only by opt-in (%s)", (origin) => {
  expect(() => validateFrameOrigin({ runtimeOrigin: origin, hostOrigin: origin, origin: "cross-origin" })).toThrow();
  expect(() => validateFrameOrigin({ runtimeOrigin: origin, hostOrigin: origin, origin: "same-origin-local" })).not.toThrow();
});
it.each(["https://example.com", "http://localhost.evil.example", "http://127.0.0.1:3000/path"])("rejects non-local or inexact same origins (%s)", (origin) => {
  expect(() => validateFrameOrigin({ runtimeOrigin: origin, hostOrigin: origin, origin: "same-origin-local" })).toThrow();
});
