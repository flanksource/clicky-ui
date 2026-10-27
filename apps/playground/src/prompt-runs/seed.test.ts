import type { SpecRuntimeFamily } from "@flanksource/clicky-ui/ai";
import { describe, expect, it } from "vitest";

import { missingRequired, seedPromptForm, seedRuntime, sourceFile } from "./seed";

const PAGE_FILE = "/repo/apps/playground/src/pages/welcome.tsx";

describe("sourceFile", () => {
  it.each([
    ["a React stack line", `  in Welcome (at ${PAGE_FILE})`, PAGE_FILE],
    ["a stack line with line and column", `  in Card (at ${PAGE_FILE}:12:4)\n  in Welcome (at /x.tsx)`, PAGE_FILE],
    ["a path with a line", "apps/playground/src/pages/welcome.tsx:12", "apps/playground/src/pages/welcome.tsx"],
    ["a bare path", "apps/playground/src/pages/welcome.tsx", "apps/playground/src/pages/welcome.tsx"],
  ])("reads the file from %s", (_label, source, expected) => {
    expect(sourceFile(source)).toBe(expected);
  });
});

describe("seedPromptForm", () => {
  const element = {
    componentName: "Welcome",
    source: `  in Welcome (at ${PAGE_FILE}:3)`,
    html: "<h1>Playground</h1>",
  };
  const schema = {
    type: "object",
    properties: { files: { type: "string" }, input: { type: "string" }, focus: { type: "string" } },
  };

  it("seeds only the declared files and input arguments, with input as a multi-line box", () => {
    expect(seedPromptForm({ schema, element, page: "welcome" })).toEqual({
      variables: {
        files: PAGE_FILE,
        input: [
          "Playground page: welcome",
          "Component: <Welcome>",
          `Source: in Welcome (at ${PAGE_FILE}:3)`,
          "HTML:",
          "<h1>Playground</h1>",
        ].join("\n"),
      },
      schema: {
        type: "object",
        properties: {
          files: { type: "string" },
          input: { type: "string", format: "textarea" },
          focus: { type: "string" },
        },
      },
    });
  });

  it("names the element's first CSS locator, so a prompt's tools can find it on the page again", () => {
    const located = {
      ...element,
      locators: [
        { kind: "role" as const, tag: "h1", role: "heading", name: "Playground" },
        { kind: "css" as const, selector: "main > h1" },
        { kind: "css" as const, selector: "h1" },
      ],
    };
    const { variables } = seedPromptForm({ schema, element: located, page: "team/summary" });
    expect((variables["input"] as string).split("\n").slice(0, 3)).toEqual([
      "Playground page: team/summary",
      "Selector: main > h1",
      "Component: <Welcome>",
    ]);
  });

  it("seeds an array files argument with the element's file as its one item", () => {
    const list = { type: "object", properties: { files: { type: "array", items: { type: "string" } } } };
    expect(seedPromptForm({ schema: list, element, page: "welcome" })).toEqual({ variables: { files: [PAGE_FILE] }, schema: list });
  });

  describe("with the target's own files", () => {
    const MARKDOWN_FILE = "apps/playground/src/pages/guide.md";
    const SECOND_FILE = "apps/playground/src/pages/notes.md";

    it("seeds a string files argument with them instead of the element's source file", () => {
      const { variables } = seedPromptForm({ schema, element, page: "guide", files: [MARKDOWN_FILE, SECOND_FILE] });
      expect(variables["files"]).toBe(`${MARKDOWN_FILE} ${SECOND_FILE}`);
    });

    it("seeds an array files argument with one item per file", () => {
      const list = { type: "object", properties: { files: { type: "array", items: { type: "string" } } } };
      expect(seedPromptForm({ schema: list, element, page: "guide", files: [MARKDOWN_FILE] })).toEqual({
        variables: { files: [MARKDOWN_FILE] },
        schema: list,
      });
    });
  });

  it("leaves a prompt without those arguments untouched", () => {
    const other = { type: "object", properties: { rfp: { type: "string" } } };
    expect(seedPromptForm({ schema: other, element, page: "welcome" })).toEqual({ variables: {}, schema: other });
  });
});

describe("missingRequired", () => {
  const schema = {
    type: "object",
    required: ["files", "focus", "limit"],
    properties: { files: { type: "string" }, focus: { type: "string" }, limit: { type: "number" } },
  };

  it.each([
    ["every required argument is empty", {}, ["files", "focus", "limit"]],
    ["a value is only whitespace", { files: "a.tsx", focus: "  ", limit: 3 }, ["focus"]],
    ["zero and false are real values", { files: "a.tsx", focus: "x", limit: 0 }, []],
    ["an empty list counts as missing", { files: [], focus: "x", limit: 1 }, ["files"]],
  ])("lists the missing names when %s", (_label, variables, expected) => {
    expect(missingRequired(schema, variables)).toEqual(expected);
  });

  it("needs nothing when the schema declares no required arguments", () => {
    expect(missingRequired({ type: "object", properties: { files: { type: "string" } } }, {})).toEqual([]);
  });
});

describe("seedRuntime", () => {
  const CLAUDE_CLI = "anthropic/claude-sonnet-4-6";
  const CODEX_CLI = "openai/gpt-5-codex";
  const families: SpecRuntimeFamily[] = [
    {
      id: "claude",
      label: "Claude",
      provider: "anthropic",
      modes: [
        { id: "cli", label: "CLI", defaultModel: CLAUDE_CLI },
        { id: "agent", label: "Agent", defaultModel: "anthropic/claude-opus-4-1" },
      ],
    },
    { id: "codex", label: "Codex", provider: "openai", modes: [{ id: "api", label: "API", defaultModel: CODEX_CLI }] },
  ];

  it.each([
    [
      "the prompt's model, mode, effort and budget, dropping non-runtime spec fields",
      { model: "gemini-3.5-flash", mode: "api", effort: "high", budget: { cost: 2, timeout: "15m" }, prompt: { user: "x" } },
      { model: "gemini-3.5-flash", mode: "api", effort: "high", budget: { cost: 2, timeout: "15m" } },
    ],
    ["a model without a mode, leaving the mode to the model", { model: "claude-sonnet-5" }, { model: "claude-sonnet-5" }],
    ["a mode alone, with the first family's default model for it", { mode: "api" }, { mode: "api", model: CODEX_CLI }],
    ["no runtime at all, as the first available runtime", undefined, { mode: "cli", model: CLAUDE_CLI }],
    ["an empty spec, as the first available runtime", { model: "", prompt: {} }, { mode: "cli", model: CLAUDE_CLI }],
    ["a mode no runtime offers, without inventing a model", { mode: "cmux" }, { mode: "cmux" }],
  ])("seeds %s", (_label, spec, expected) => {
    expect(seedRuntime(spec, families)).toEqual(expected);
  });
});
