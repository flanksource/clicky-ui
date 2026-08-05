import { describe, expect, it } from "vitest";
import type { ChatModel } from "../chat/types";
import {
  effortOptionsForModel,
  reconcileModelCapabilities,
} from "./model-capabilities";

const known = (patch: Partial<ChatModel>): ChatModel => ({
  id: "model",
  provider: "test",
  label: "Model",
  reasoning: true,
  capabilitiesKnown: true,
  ...patch,
});

describe("model capability reconciliation", () => {
  it("uses exact tiers and the model default", () => {
    const model = known({
      supportedEfforts: ["low", "high", "ultra"],
      defaultEffort: "high",
    });
    expect(effortOptionsForModel(model, ["medium"])).toEqual([
      "low",
      "high",
      "ultra",
    ]);
    expect(
      reconcileModelCapabilities({ model: "old", effort: "xhigh" }, model, [
        "medium",
      ]),
    ).toEqual({ model: "model", effort: "high" });
  });

  it("clears fixed effort and unsupported temperature", () => {
    const model = known({
      reasoning: false,
      supportedEfforts: [],
      temperature: false,
    });
    expect(
      reconcileModelCapabilities({ effort: "high", temperature: 0.7 }, model, [
        "medium",
      ]),
    ).toEqual({ model: "model" });
  });

  it("keeps the compatibility fallback for unknown models", () => {
    const model = known({ capabilitiesKnown: false });
    expect(
      reconcileModelCapabilities({ effort: "future" }, model, [
        "low",
        "medium",
      ]),
    ).toEqual({ model: "model", effort: "medium" });
  });
});
