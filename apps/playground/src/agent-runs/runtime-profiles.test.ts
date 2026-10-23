import { describe, expect, it } from "vitest";
import type { RuntimeCatalogFamily } from "../../../../packages/ui/src/data/runtime/runtime-mode";

import { agentRuntimeProfiles } from "./runtime-profiles";

const catalog = [
  {
    family: "claude",
    provider: "anthropic",
    catalogPrefix: "anthropic",
    modes: [
      { mode: "api", defaultModel: "m-api", availability: { state: "available" } },
      { mode: "agent", defaultModel: "m-agent", availability: { state: "available" } },
    ],
  },
  {
    family: "codex",
    provider: "openai",
    catalogPrefix: "openai",
    modes: [
      { mode: "agent", defaultModel: "x-agent", availability: { state: "missing_credentials" } },
    ],
  },
  {
    family: "gemini",
    provider: "google",
    catalogPrefix: "google",
    modes: [{ mode: "agent", disabled: true, availability: { state: "available" } }],
  },
] as unknown as RuntimeCatalogFamily[];

describe("agentRuntimeProfiles", () => {
  it("offers only available, enabled agent-mode runtimes that have a default model", () => {
    expect(agentRuntimeProfiles(catalog)).toEqual([
      {
        id: "claude-agent",
        name: "Claude agent",
        description: "m-agent through captain's agent runtime",
        spec: { mode: "agent", model: "m-agent" },
        presets: [],
      },
    ]);
  });
});
