import { describe, expect, it } from "vitest";

import {
  groupRuntimesByProvider,
  providerIconName,
  runtimeKey,
  summarizeRuntimes,
  type RuntimeAdapter,
} from "./topology-model";

const PROVIDER_API: RuntimeAdapter = {
  provider: "provider-a",
  providerLabel: "Provider A",
  mode: "api",
  auth: "Vault token",
  ready: true,
  disabled: false,
  isDefault: true,
  modelCount: 4,
  models: [],
};
const PROVIDER_CLI: RuntimeAdapter = {
  provider: "provider-a",
  providerLabel: "Provider A",
  mode: "cli",
  auth: "Local login",
  ready: true,
  disabled: true,
  disabledBy: "mode cli",
  modelCount: 3,
  models: [],
};
const OTHER_PROVIDER: RuntimeAdapter = {
  provider: "provider-b",
  providerLabel: "Provider B",
  mode: "api",
  auth: "Not configured",
  ready: false,
  disabled: false,
  modelCount: 2,
  models: [],
};
const ADAPTERS = [PROVIDER_API, PROVIDER_CLI, OTHER_PROVIDER];

describe("whoami playground model", () => {
  it("maps every catalog provider to its logo", () => {
    expect(
      ["anthropic", "openai", "gemini", "deepseek"].map(providerIconName),
    ).toEqual(["anthropic", "openai", "gemini", "deepseek"]);
    expect(() => providerIconName("provider-a")).toThrow(
      "No provider logo is registered for provider-a",
    );
  });

  it("summarizes readiness independently from circulation state", () => {
    expect(summarizeRuntimes(ADAPTERS)).toEqual({
      adapters: 3,
      ready: 2,
      models: 9,
      disabled: 1,
    });
  });

  it("identifies a runtime by provider and mode", () => {
    expect(runtimeKey(PROVIDER_API)).toBe("provider-a:api");
    expect(runtimeKey(PROVIDER_CLI)).toBe("provider-a:cli");
  });

  it("keeps disabled runtimes inside their provider", () => {
    expect(groupRuntimesByProvider(ADAPTERS)).toEqual([
      {
        id: "provider-a",
        label: "Provider A",
        adapters: [PROVIDER_API, PROVIDER_CLI],
        modelCount: 7,
        disabled: 1,
      },
      {
        id: "provider-b",
        label: "Provider B",
        adapters: [OTHER_PROVIDER],
        modelCount: 2,
        disabled: 0,
      },
    ]);
  });
});
