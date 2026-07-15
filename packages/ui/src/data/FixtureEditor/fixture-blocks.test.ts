import { describe, expect, it } from "vitest";
import {
  createChecklistMarkdown,
  createFenceMarkdown,
  firstFenceMetaToken,
  fixtureFenceKind,
  fixtureFenceInfo,
  fixtureFenceParsesYaml,
  fixtureFenceSchemaAliases,
  fixtureFenceSnippetInfo,
  parseFixtureYaml,
  resolveFixtureFenceSchema,
  stringifyFixtureYaml,
} from "./fixture-blocks";

describe("fixture markdown helpers", () => {
  it("creates schema-backed and raw fence snippets", () => {
    expect(
      createFenceMarkdown("test", {
        test: { type: "object" },
      }),
    ).toBe("```yaml test\n{}\n```\n");

    expect(createFenceMarkdown("exec")).toBe("```exec\n```\n");
    expect(createFenceMarkdown("exec", { exec: { type: "object" } })).toBe(
      "```exec\n```\n",
    );
    expect(createFenceMarkdown("ai", { ai: { type: "object" } })).toBe(
      "```ai\n```\n",
    );
  });

  it("creates markdown checklist snippets for the full document editor", () => {
    expect(createChecklistMarkdown()).toBe("- [ ] \n");
  });

  it("parses and serializes YAML object bodies", () => {
    expect(parseFixtureYaml("name: smoke\nretries: 1\n")).toEqual({
      ok: true,
      value: { name: "smoke", retries: 1 },
    });

    expect(stringifyFixtureYaml({ name: "api", retries: 2 })).toBe(
      "name: api\nretries: 2\n",
    );
  });

  it("reports malformed or non-object YAML bodies", () => {
    expect(parseFixtureYaml("name: [").ok).toBe(false);
    expect(parseFixtureYaml("- one\n")).toEqual({
      ok: false,
      error: "YAML root must be an object",
    });
  });

  it("normalizes MDX code block language and meta into fixture info", () => {
    expect(fixtureFenceInfo("yaml", "test")).toBe("yaml test");
    expect(fixtureFenceInfo("exec", "")).toBe("exec");
    expect(firstFenceMetaToken("lint strict")).toBe("lint");
  });

  it("resolves gavel runner fences by logical schema keys and aliases", () => {
    const schemas = {
      test: { type: "object" },
      "yaml lint": { type: "object" },
    };

    expect(fixtureFenceSnippetInfo("test")).toBe("yaml test");
    expect(fixtureFenceSnippetInfo("lint")).toBe("yaml lint");
    expect(fixtureFenceKind("yaml", "test")).toBe("test");
    expect(fixtureFenceKind("lint", "")).toBe("lint");
    expect(fixtureFenceKind("prompt", "")).toBe("prompt");
    expect(fixtureFenceSchemaAliases("test", "")).toEqual(["test", "yaml test"]);
    expect(fixtureFenceSchemaAliases("yaml", "lint")).toEqual(["yaml lint", "lint"]);
    expect(fixtureFenceSchemaAliases("bash", "")).toEqual(["bash", "shell", "exec"]);
    expect(resolveFixtureFenceSchema("yaml", "test", schemas)).toBe(schemas.test);
    expect(resolveFixtureFenceSchema("lint", "", schemas)).toBe(schemas["yaml lint"]);
    expect(resolveFixtureFenceSchema("bash", "", { exec: { type: "object" } })).toEqual({ type: "object" });
    expect(resolveFixtureFenceSchema("ai", "", { ai: { type: "object" } })).toBeUndefined();
    expect(fixtureFenceParsesYaml("yaml", "test")).toBe(true);
    expect(fixtureFenceParsesYaml("test", "")).toBe(true);
    expect(fixtureFenceParsesYaml("exec", "")).toBe(false);
    expect(fixtureFenceParsesYaml("ai", "")).toBe(false);
  });
});
