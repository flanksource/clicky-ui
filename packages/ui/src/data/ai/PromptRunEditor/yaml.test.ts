import { YAMLParseError } from "yaml";
import { describe, expect, it } from "vitest";
import type { AIPromptRunValue } from "./model";
import { parsePromptRunYaml, promptRunYaml } from "./yaml";

const VALUE: AIPromptRunValue = {
  variables: { company: "Acme", focus: ["ledger", "tax"] },
  spec: {
    model: "claude-sonnet-4-6",
    mode: "agent",
    prompt: {
      user: "Review {{company}}\nThen summarise.",
      system: "Be precise",
    },
    budget: { cost: 2, timeout: "30m" },
  },
  runtimes: [
    { model: "claude-sonnet-4-6", mode: "agent" },
    { model: "gpt-5.5", mode: "api" },
  ],
  chat: false,
  presets: ["defaults", "review"],
  runtimeProfile: "review-profile",
};

describe("prompt run YAML", () => {
  it("serializes the request as block YAML", () => {
    expect(promptRunYaml({ variables: { company: "Acme" }, chat: true })).toBe(
      "variables:\n  company: Acme\nchat: true\n",
    );
  });

  it("parses its own serialization back to the same request", () => {
    expect(parsePromptRunYaml(promptRunYaml(VALUE))).toEqual(VALUE);
  });

  it.each([
    { text: "", error: "Prompt run YAML must be a mapping" },
    { text: "- spec", error: "Prompt run YAML must be a mapping" },
    {
      text: "varaibles: {}",
      error: 'Prompt run YAML has unknown field "varaibles"',
    },
    {
      text: "variables: [a]",
      error: "Prompt run YAML field variables must be a mapping",
    },
    {
      text: "spec: sonnet",
      error: "Prompt run YAML field spec must be a mapping",
    },
    {
      text: "runtimes: {}",
      error: "Prompt run YAML field runtimes must be a list of mappings",
    },
    {
      text: "runtimes: [api]",
      error: "Prompt run YAML field runtimes must be a list of mappings",
    },
    {
      text: "chat: yes",
      error: "Prompt run YAML field chat must be a boolean",
    },
    {
      text: "presets: default",
      error: "Prompt run YAML field presets must be a list of strings",
    },
    {
      text: "runtimeProfile: 3",
      error: "Prompt run YAML field runtimeProfile must be a string",
    },
  ])("rejects $text", ({ text, error }) => {
    expect(() => parsePromptRunYaml(text)).toThrow(error);
  });

  it("reports malformed YAML from the parser", () => {
    expect(() => parsePromptRunYaml("spec: [")).toThrow(YAMLParseError);
  });
});
