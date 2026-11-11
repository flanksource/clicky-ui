import { afterEach, expect, it } from "vitest";
import { readProjectSession, saveProjectSession } from "./project-session";

afterEach(() => localStorage.clear());

it("retains independent sessions and complete runtimes for each project", () => {
  saveProjectSession({ project: "/work/a", projects: {
    "/work/a": { target: { kind: "managed", sessionId: "a", label: "A" }, runtime: { spec: { model: "example", effort: "high" }, presets: ["review"] } },
    "/work/b": { target: { kind: "captain", sessionId: "b", label: "B" } },
  } });
  expect(readProjectSession()).toEqual({ project: "/work/a", projects: {
    "/work/a": { target: { kind: "managed", sessionId: "a", label: "A" }, runtime: { spec: { model: "example", effort: "high" }, presets: ["review"] } },
    "/work/b": { target: { kind: "captain", sessionId: "b", label: "B" } },
  } });
});

it("rejects corrupt preferences instead of forgetting the active session", () => {
  localStorage.setItem("playground.project-sessions", '{"project":7}');
  expect(readProjectSession).toThrow("Invalid playground project sessions");
});
