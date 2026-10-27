import { describe, expect, it } from "vitest";

import { promptResultComment, promptVariablesSchema } from "./prompt-result";

const DIAGRAM_SMELLS = [
  "---",
  "model: agent:sol:medium",
  "---",
  '{{role "system"}}',
  "You lint diagrams.",
  '{{role "user"}}',
  "Lint: {{#if files}}{{files}}{{else}}the attached images{{/if}}.",
  "{{#if input}}",
  "{{{input}}}",
  "{{/if}}",
].join("\n");

describe("promptVariablesSchema", () => {
  it("uses the declared input schema when the prompt has one", () => {
    const inputSchema = {
      type: "object",
      required: ["files"],
      properties: { files: { type: "string" } },
    };
    expect(
      promptVariablesSchema({ id: "p", name: "p", inputSchema, content: "{{other}}" }),
    ).toEqual(inputSchema);
  });

  it("builds a schema from the listed variables", () => {
    expect(
      promptVariablesSchema({
        id: "p",
        name: "p",
        variables: [
          { name: "files", type: "string", description: "Paths", required: true },
          { name: "focus" },
        ],
      }),
    ).toEqual({
      type: "object",
      required: ["files"],
      properties: {
        files: { type: "string", description: "Paths" },
        focus: { type: "string" },
      },
    });
  });

  it("falls back to the template's placeholders, ignoring helpers", () => {
    expect(
      promptVariablesSchema({ id: "p", name: "diagram-smells", content: DIAGRAM_SMELLS }),
    ).toEqual({
      type: "object",
      properties: { files: { type: "string" }, input: { type: "string" } },
    });
  });
});

describe("promptResultComment", () => {
  const violations = [
    {
      file: "docs/arch.svg",
      line: 42,
      severity: "error",
      message: "Label overflows its box; widen the node.",
      rule: { method: "diagram-smells/label-overflow" },
    },
    { message: "Edges cross near the gateway.", severity: "warning" },
  ];

  it("turns lint violations into a body, checklist, refs and the raw findings", () => {
    expect(
      promptResultComment("diagram-smells", {
        success: true,
        structuredOutput: { violations },
      }),
    ).toEqual({
      kind: "comment",
      body: [
        "**diagram-smells** found 2 issues:",
        "",
        "- **error** `diagram-smells/label-overflow` `docs/arch.svg:42` — Label overflows its box; widen the node.",
        "- **warning** — Edges cross near the gateway.",
      ].join("\n"),
      checklist: [
        {
          label: "error · diagram-smells/label-overflow — Label overflows its box; widen the node.",
          status: "open",
        },
        { label: "warning — Edges cross near the gateway.", status: "open" },
      ],
      refs: [{ label: "Files", items: ["docs/arch.svg:42"], mono: true }],
      lint: { violations },
    });
  });

  it("reports an empty result when there are no violations", () => {
    expect(
      promptResultComment("diagram-smells", {
        success: true,
        structuredOutput: { violations: [] },
      }),
    ).toEqual({ kind: "empty" });
  });

  it("keeps a free-text answer as the body when there is no structured output", () => {
    expect(
      promptResultComment("review", { success: true, text: "Looks fine overall." }),
    ).toEqual({ kind: "comment", body: "**review**:\n\nLooks fine overall." });
  });

  it("keeps other structured output as a JSON block", () => {
    expect(
      promptResultComment("score", { success: true, structuredOutput: { score: 3 } }),
    ).toEqual({
      kind: "comment",
      body: '**score**:\n\n```json\n{\n  "score": 3\n}\n```',
    });
  });

  it.each([
    ["a failed run", { success: false, error: "budget exceeded" }, "budget exceeded"],
    ["a run with no output", { success: true }, "returned no output"],
  ])("fails for %s", (_label, summary, error) => {
    expect(promptResultComment("diagram-smells", summary)).toEqual({
      kind: "failed",
      error: expect.stringContaining(error),
    });
  });
});
