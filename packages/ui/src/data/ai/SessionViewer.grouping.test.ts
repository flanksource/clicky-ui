import { describe, expect, it } from "vitest";
import {
  collapseWaitRuns,
  isSessionEventGroup,
} from "./SessionViewer.grouping";
import type { SessionEvent } from "./SessionViewer.model";

function wait(id: string, overrides: Partial<SessionEvent> = {}): SessionEvent {
  return {
    id,
    kind: "tool",
    tool: "Wait",
    sessionId: "session-1",
    source: "codex",
    turnId: "turn-1",
    agentId: "agent-1",
    model: "gpt-5.6-sol",
    reasoningEffort: "max",
    toolInput: { cell_id: id },
    ...overrides,
  };
}

describe("collapseWaitRuns", () => {
  it("collapses adjacent Wait calls with the same transcript context", () => {
    const items = collapseWaitRuns([wait("214"), wait("215"), wait("216")]);

    expect(items).toHaveLength(1);
    expect(isSessionEventGroup(items[0])).toBe(true);
    if (!isSessionEventGroup(items[0])) throw new Error("expected wait group");
    expect(items[0].count).toBe(3);
    expect(items[0].events.map((event) => event.id)).toEqual(["214", "215", "216"]);
  });

  it("keeps an intervening raw event as a group boundary", () => {
    const thinking: SessionEvent = { id: "thinking", kind: "thinking", text: "still working" };
    const items = collapseWaitRuns([wait("214"), thinking, wait("215"), wait("216")]);

    expect(items).toHaveLength(3);
    expect(isSessionEventGroup(items[0])).toBe(false);
    expect(items[1]).toBe(thinking);
    expect(isSessionEventGroup(items[2])).toBe(true);
  });

  it.each([
    ["session", { sessionId: "session-2" }],
    ["source", { source: "claude" }],
    ["turn", { turnId: "turn-2" }],
    ["agent", { agentId: "agent-2" }],
    ["model", { model: "gpt-5.5-codex" }],
    ["effort", { reasoningEffort: "high" }],
  ] as const)("does not cross a %s boundary", (_name, overrides) => {
    const items = collapseWaitRuns([wait("214"), wait("215", overrides)]);

    expect(items).toHaveLength(2);
    expect(items.every((item) => !isSessionEventGroup(item))).toBe(true);
  });

  it("leaves a single Wait as an ordinary row", () => {
    const event = wait("214");
    expect(collapseWaitRuns([event])).toEqual([event]);
  });
});
