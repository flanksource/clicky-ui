import { describe, expect, it } from "vitest";
import type { SpecRuntimeFamily } from "./runtime-mode";
import { runtimeFieldSupport } from "./runtime-field-support";

const families: SpecRuntimeFamily[] = [
  {
    id: "claude",
    label: "Claude",
    provider: "claude-agent",
    modes: [
      {
        id: "agent",
        label: "Agent",
        backend: "claude-agent",
        arguments: [
          { name: "model", source: "model", implementation: "mapped" },
          {
            name: "ephemeral",
            source: "memory.skipMemory|memory.bare",
            implementation: "mapped",
          },
        ],
      },
      {
        id: "cli",
        label: "CLI",
        backend: "claude-cli",
        arguments: [
          { name: "model", source: "model", implementation: "mapped" },
          { name: "effort", source: "effort", implementation: "mapped" },
          {
            name: "system",
            source: "prompt.system",
            implementation: "mapped",
          },
          {
            name: "tool",
            source: "cliArgs.tools",
            implementation: "mapped",
          },
        ],
      },
    ],
  },
];

describe("runtimeFieldSupport", () => {
  it("shows selected-mode sources and hides provider-specific sources from other modes", () => {
    const supports = runtimeFieldSupport(families, "claude-agent");

    expect(supports("model")).toBe(true);
    expect(supports("memory.skipMemory")).toBe(true);
    expect(supports("memory.bare")).toBe(true);
    expect(supports("effort")).toBe(false);
    expect(supports("prompt.system")).toBe(false);
    expect(supports("cliArgs")).toBe(false);
  });

  it("keeps Captain-global fields that no runtime maps directly", () => {
    expect(runtimeFieldSupport(families, "claude-agent")("budget.timeout")).toBe(
      true,
    );
  });

  it("does not restrict editors when no argument catalog was published", () => {
    const withoutArguments: SpecRuntimeFamily[] = [
      {
        id: "api",
        label: "API",
        provider: "api",
        modes: [{ id: "api", label: "API", backend: "api" }],
      },
    ];

    expect(runtimeFieldSupport(withoutArguments, "api")("effort")).toBe(true);
  });
});
