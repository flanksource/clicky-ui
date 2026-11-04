import { expect, it } from "vitest";
import { bridgeMessage, envelope } from "./model";

it("rejects layout commands from a different bridge or session", () => {
  const message = { type: "sidebar-layout", width: 400, maximized: true } as const;
  expect(bridgeMessage(envelope("session", message), "session")).toEqual(message);
  expect(bridgeMessage(envelope("other", message), "session")).toBeNull();
  expect(bridgeMessage({ bridge: "other", session: "session", message }, "session")).toBeNull();
});
