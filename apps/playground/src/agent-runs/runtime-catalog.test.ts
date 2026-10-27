import { describe, expect, it } from "vitest";
import type { RuntimeCatalogFamily } from "../../../../packages/ui/src/data/runtime/runtime-mode";

import { availableRuntimeCatalog } from "./runtime-catalog";

const agent = (defaultModel: string | undefined, state: string, disabled = false) => ({
  mode: "agent",
  ...(defaultModel ? { defaultModel } : {}),
  disabled,
  availability: { state },
});

const catalog = [
  {
    family: "claude",
    provider: "anthropic",
    catalogPrefix: "anthropic",
    modes: [
      { mode: "api", defaultModel: "m-api", availability: { state: "available" } },
      agent("m-agent", "available"),
    ],
  },
  {
    family: "codex",
    provider: "openai",
    catalogPrefix: "openai",
    modes: [agent("x-agent", "missing_credentials")],
  },
  {
    family: "gemini",
    provider: "google",
    catalogPrefix: "google",
    modes: [agent("g-agent", "available", true)],
  },
  {
    family: "deepseek",
    provider: "deepseek",
    catalogPrefix: "deepseek",
    modes: [{ mode: "api", defaultModel: "d-api", availability: { state: "available" } }],
  },
] as unknown as RuntimeCatalogFamily[];

describe("availableRuntimeCatalog", () => {
  it("keeps only available, enabled agent modes with a default model, dropping emptied families", () => {
    expect(availableRuntimeCatalog(catalog, { mode: "agent" })).toEqual([
      { ...catalog[0], modes: [agent("m-agent", "available")] },
    ]);
  });

  it("keeps every available mode when no mode is required, still dropping unavailable and disabled ones", () => {
    expect(availableRuntimeCatalog(catalog, {})).toEqual([
      catalog[0],
      { ...catalog[3] },
    ]);
  });
});
