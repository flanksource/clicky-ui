import { describe, expect, it } from "vitest";
import {
  createTurnPalette,
  runtimeDescriptor,
  shortSessionId,
} from "./SessionInspector.model";

describe("runtimeDescriptor", () => {
  it.each([
    ["claude-agent", "Agent"],
    ["claude", "CLI"],
    ["claude-sdk", "SDK"],
    ["codex", "CLI"],
    ["codex-cli", "CLI"],
    ["openai", "API"],
    ["claude-cmux", "cmux"],
  ])("maps %s to its session runtime mode", (backend, mode) => {
    expect(runtimeDescriptor(backend)).toMatchObject({ mode });
  });
});

describe("turn identity presentation", () => {
  it("assigns stable distinct palette entries and shortens long IDs", () => {
    const ids = [
      "turn-019f3754-ecfa-7323-a76b",
      "turn-019f3754-ecfa-7323-a76c",
    ];

    expect(createTurnPalette("session-parity", ids)).toEqual(
      createTurnPalette("session-parity", ids),
    );
    expect(createTurnPalette("session-parity", ids)[ids[0]]).not.toBe(
      createTurnPalette("session-parity", ids)[ids[1]],
    );
    expect(shortSessionId(ids[0])).toBe("a76b");
  });
});
