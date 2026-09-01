import { describe, expect, it } from "vitest";
import {
  createTurnPalette,
  runtimeDescriptor,
  shortSessionId,
} from "./SessionInspector.model";

describe("runtimeDescriptor", () => {
  // A session records its runtime mode, not a composite adapter id. The
  // composite ids this table used to carry ("claude-agent", "codex-cli") do not
  // exist any more, and the family half they smuggled in is a separate field.
  it.each([
    ["api", "API"],
    ["agent", "Agent"],
    ["cli", "CLI"],
    ["cmux", "cmux"],
  ])("maps %s to its session runtime mode", (specMode, label) => {
    expect(runtimeDescriptor(specMode)).toMatchObject({ mode: label });
  });

  it("stays silent about a mode the catalog does not declare", () => {
    expect(runtimeDescriptor("claude-agent")).toBeUndefined();
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
