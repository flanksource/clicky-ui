import { describe, expect, it } from "vitest";
import type { ChatModel } from "../chat/types";
import {
  modelBelongsToFamily,
  modelsForFamily,
  type SpecRuntimeFamily,
} from "./runtime-mode";

const claudeFamily: SpecRuntimeFamily = {
  id: "claude",
  label: "Claude",
  provider: "anthropic",
  modes: [
    { id: "agent", label: "Agent", backend: "claude-agent" },
    { id: "cmux", label: "cmux", backend: "claude-cmux" },
  ],
};

const models: ChatModel[] = [
  {
    id: "claude-sonnet-agent",
    provider: "anthropic",
    label: "Sonnet Agent",
    reasoning: true,
    backends: ["claude-agent"],
  },
  {
    id: "claude-opus-cmux",
    provider: "anthropic",
    label: "Opus cmux",
    reasoning: true,
    backends: ["claude-cmux"],
  },
  {
    id: "claude-haiku-shared",
    provider: "anthropic",
    label: "Haiku Shared",
    reasoning: true,
  },
  {
    id: "gpt-codex-agent",
    provider: "openai",
    label: "GPT Codex",
    reasoning: true,
    backends: ["codex-agent"],
  },
];

describe("runtime model filtering", () => {
  it("filters models by provider family and selected backend", () => {
    expect(modelsForFamily(models, claudeFamily, "claude-agent").map((model) => model.id)).toEqual([
      "claude-sonnet-agent",
      "claude-haiku-shared",
    ]);

    expect(modelsForFamily(models, claudeFamily, "claude-cmux").map((model) => model.id)).toEqual([
      "claude-opus-cmux",
      "claude-haiku-shared",
    ]);
  });

  it("invalidates selected models that belong to a different backend", () => {
    expect(
      modelBelongsToFamily("claude-opus-cmux", models, claudeFamily, "claude-agent"),
    ).toBe(false);
    expect(
      modelBelongsToFamily("claude-haiku-shared", models, claudeFamily, "claude-agent"),
    ).toBe(true);
    expect(
      modelBelongsToFamily("gpt-codex-agent", models, claudeFamily, "claude-agent"),
    ).toBe(false);
  });
});
