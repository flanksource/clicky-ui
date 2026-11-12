import { afterEach, expect, it, vi } from "vitest";
import { readPageTarget, readPageTargets, rememberPageTarget } from "./page-targets";

const CAPTAIN = { kind: "captain" as const, sessionId: "session-a", label: "Review changes · codex" };
const MANAGED = { kind: "managed" as const, sessionId: "session-b", label: "welcome · model" };
afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

it("keeps each page's session apart and forgets one when the playground agent is chosen", () => {
  rememberPageTarget("welcome", CAPTAIN);
  rememberPageTarget("team/summary", MANAGED);
  expect(readPageTargets()).toEqual({ welcome: CAPTAIN, "team/summary": MANAGED });
  rememberPageTarget("welcome", { kind: "playground" });
  expect({ welcome: readPageTarget("welcome"), summary: readPageTarget("team/summary") }).toEqual({ welcome: undefined, summary: MANAGED });
});

it.each([
  ["not JSON", "{"],
  ["not an object", "[1]"],
])("reads a store that is %s as no choices", (_label, stored) => {
  localStorage.setItem("playground.page-agent-targets", stored);
  expect(readPageTargets()).toEqual({});
});

it("drops an entry that is not a session target and keeps the others", () => {
  localStorage.setItem("playground.page-agent-targets", JSON.stringify({ bad: { kind: "captain", label: "x" }, other: { kind: "terminal", sessionId: "s", label: "x" }, good: CAPTAIN }));
  expect(readPageTargets()).toEqual({ good: CAPTAIN });
});

it("reads as empty and says why a choice cannot be saved when storage is blocked", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("blocked", "SecurityError"); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("quota", "QuotaExceededError"); });
  expect(readPageTargets()).toEqual({});
  expect(() => rememberPageTarget("welcome", CAPTAIN)).toThrow(/Cannot remember the agent session for welcome in this browser: quota/);
});
