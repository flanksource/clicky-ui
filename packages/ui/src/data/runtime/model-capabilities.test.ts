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
  it("drops an unsupported effort without inventing a replacement by default", () => {
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
    ).toEqual({ model: "model" });
  });

  it("uses exact tiers and the model default when a default effort is requested", () => {
    const model = known({
      supportedEfforts: ["low", "high", "ultra"],
      defaultEffort: "high",
    });
    expect(
      reconcileModelCapabilities(
        { model: "old", effort: "xhigh" },
        model,
        ["medium"],
        { defaultEffort: true },
      ),
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

  it("drops an unsupported custom effort for unknown models by default", () => {
    const model = known({ capabilitiesKnown: false });
    expect(
      reconcileModelCapabilities({ effort: "future" }, model, [
        "low",
        "medium",
      ]),
    ).toEqual({ model: "model" });
  });

  it("keeps the compatibility fallback for unknown models when a default effort is requested", () => {
    const model = known({ capabilitiesKnown: false });
    expect(
      reconcileModelCapabilities(
        { effort: "future" },
        model,
        ["low", "medium"],
        { defaultEffort: true },
      ),
    ).toEqual({ model: "model", effort: "medium" });
  });

  it("applies an explicit mode alongside a requested default effort", () => {
    const model = known({ supportedEfforts: ["low", "medium"] });
    expect(
      reconcileModelCapabilities({}, model, ["low", "medium"], {
        mode: "cli",
        defaultEffort: true,
      }),
    ).toEqual({ model: "model", mode: "cli", effort: "medium" });
  });
});
