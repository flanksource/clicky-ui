import { describe, expect, it } from "vitest";
import { defaultChatModelId } from "./models";
import type { ChatModel } from "./types";

function model(id: string, extra: Partial<ChatModel> = {}): ChatModel {
  return {
    id,
    provider: "anthropic",
    label: id,
    reasoning: false,
    ...extra,
  };
}

describe("defaultChatModelId", () => {
  it("prefers the row the catalog declared as its default over the first row", () => {
    const menu = [
      model("anthropic/claude-opus-5"),
      model("anthropic/claude-sonnet-5", { default: true }),
    ];

    expect(defaultChatModelId(menu)).toBe("anthropic/claude-sonnet-5");
  });

  it("skips a declared default the caller cannot select", () => {
    const menu = [
      model("anthropic/claude-sonnet-5", { default: true, configured: false }),
      model("claude-sonnet-5", { provider: "claude-agent", configured: true }),
    ];

    expect(defaultChatModelId(menu)).toBe("claude-sonnet-5");
  });

  it("falls back to the first configured row when the menu declares no default", () => {
    const menu = [
      model("openai/gpt-5.6-sol", { provider: "openai", configured: false }),
      model("anthropic/claude-opus-5"),
    ];

    expect(defaultChatModelId(menu)).toBe("anthropic/claude-opus-5");
  });

  it("returns undefined for a menu with nothing configured", () => {
    expect(defaultChatModelId([model("a", { configured: false })])).toBeUndefined();
    expect(defaultChatModelId([])).toBeUndefined();
  });
});
