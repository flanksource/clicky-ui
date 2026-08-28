import { describe, expect, it } from "vitest";
import type { SpecRuntimeFamily } from "./runtime-mode";
import {
  runtimeFieldSection,
  runtimeFieldSupport,
} from "./runtime-field-support";

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
        schema: {
          type: "object",
          properties: {
            model: { type: "string" },
            budget: {
              type: "object",
              properties: { timeout: { type: "string" } },
            },
            memory: {
              type: "object",
              properties: {
                skipMemory: {
                  type: "boolean",
                  "x-clicky-section": "model",
                },
                bare: { type: "boolean" },
              },
            },
          },
        },
      },
      {
        id: "cli",
        label: "CLI",
        backend: "claude-cli",
        schema: {
          type: "object",
          properties: {
            model: { type: "string" },
            effort: { type: "string" },
            prompt: {
              type: "object",
              properties: { system: { type: "string" } },
            },
            cliArgs: {
              type: "object",
              properties: { tools: { type: "string" } },
            },
          },
        },
      },
    ],
  },
];

describe("runtimeFieldSupport", () => {
  it("shows only fields declared by the selected runtime schema", () => {
    const supports = runtimeFieldSupport(families, "claude-agent");

    expect(supports("model")).toBe(true);
    expect(supports("memory.skipMemory")).toBe(true);
    expect(supports("memory.bare")).toBe(true);
    expect(supports("effort")).toBe(false);
    expect(supports("prompt.system")).toBe(false);
    expect(supports("cliArgs")).toBe(false);
  });

  it("keeps server-managed fields Captain includes in the selected schema", () => {
    expect(runtimeFieldSupport(families, "claude-agent")("budget.timeout")).toBe(
      true,
    );
  });

  it("reads editor placement from the selected runtime schema", () => {
    expect(
      runtimeFieldSection(families, "claude-agent", "memory.skipMemory"),
    ).toBe("model");
  });

  it("rejects an invalid editor section published by the server", () => {
    const invalid: SpecRuntimeFamily[] = [
      {
        id: "claude",
        label: "Claude",
        provider: "claude-agent",
        modes: [
          {
            id: "agent",
            label: "Agent",
            backend: "claude-agent",
            schema: {
              type: "object",
              properties: {
                model: {
                  type: "string",
                  "x-clicky-section": "unexpected",
                },
              },
            },
          },
        ],
      },
    ];

    expect(() => runtimeFieldSection(invalid, "claude-agent", "model")).toThrow(
      'runtime field "model" has invalid x-clicky-section "unexpected"',
    );
  });

  it("does not restrict editors when no runtime schema was published", () => {
    const withoutSchema: SpecRuntimeFamily[] = [
      {
        id: "api",
        label: "API",
        provider: "api",
        modes: [{ id: "api", label: "API", backend: "api" }],
      },
    ];

    expect(runtimeFieldSupport(withoutSchema, "api")("effort")).toBe(true);
  });
});
