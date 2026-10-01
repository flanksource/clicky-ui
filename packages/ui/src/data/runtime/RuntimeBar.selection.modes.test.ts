import { describe, expect, it } from "vitest";
import { UiColumns, UiRobotAi, UiTerminal } from "../../icons";
import { runtimeModes } from "./RuntimeBar.selection";
import type { SpecRuntimeFamily } from "./runtime-mode";

describe("runtimeModes", () => {
  it("falls back to the canonical mode icon when a host family omits one", () => {
    const families: SpecRuntimeFamily[] = [
      {
        id: "claude",
        label: "Claude",
        provider: "anthropic",
        modes: [
          { id: "agent", label: "Agent" },
          { id: "cli", label: "CLI" },
          { id: "cmux", label: "cmux", icon: UiTerminal },
        ],
      },
    ];

    expect(
      runtimeModes(families).map(({ id, icon }) => ({ id, icon })),
    ).toEqual([
      { id: "agent", icon: UiRobotAi },
      { id: "cli", icon: UiTerminal },
      // A host-supplied icon wins over the canonical one.
      { id: "cmux", icon: UiTerminal },
    ]);
    expect(runtimeModes(families)[2]?.icon).not.toBe(UiColumns);
  });
});
