import { expect, it } from "vitest";
import { linkRelayPath } from "./transport.ts";

it("keeps the existing cross-origin relay and offers a frame-scoped local relay", () => {
  expect(linkRelayPath({})).toBe("/frame/__runtime-link-relay");
  expect(linkRelayPath({ relayPath: "/frame/_link-relay" })).toBe("/frame/_link-relay");
});
it.each(["/", "/link/other", "/frame/../shell", "//other.example/frame/_link-relay", "/frame/_link-relay?host=other"])("rejects relay scope escape %s", (relayPath) => {
  expect(() => linkRelayPath({ relayPath })).toThrow(/relay/);
});
