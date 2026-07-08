import { describe, expect, it } from "vitest";
import {
  applyFixtureFrontmatterRaw,
  applyFixtureFrontmatterState,
  fixtureFrontmatterState,
  parseFixtureFrontmatter,
} from "./fixture-frontmatter";

describe("fixture frontmatter helpers", () => {
  it("parses gavel ai, prompt, env, and runner extras while preserving the body", () => {
    const parsed = parseFixtureFrontmatter(
      [
        "---",
        "ai:",
        "  model: claude-code-sonnet",
        "  temperature: 0",
        "  maxTokens: 10000",
        "  maxConcurrent: 4",
        "  cacheTTL: 10m",
        "  prompt:",
        "    user: Review the diff",
        "env:",
        "  CAPTAIN_MODE: verify",
        "verify:",
        "  threshold: 80",
        "  disabled: [style]",
        "---",
        "# Verify",
      ].join("\n"),
    );

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const state = fixtureFrontmatterState(parsed.frontmatter);

    expect(parsed.body).toBe("# Verify");
    expect(state.runtime).toMatchObject({
      model: "claude-code-sonnet",
      temperature: 0,
      budget: { maxTokens: 10000 },
      prompt: { user: "Review the diff" },
      setup: { envVars: [{ name: "CAPTAIN_MODE", value: "verify" }] },
    });
    expect(state.aiExtras).toEqual({ maxConcurrent: 4, cacheTTL: "10m" });
  });

  it("serializes edited ai and env values while preserving existing verify frontmatter", () => {
    const markdown = [
      "---",
      "owner: docs",
      "verify:",
      "  threshold: 80",
      "---",
      "# Verify",
    ].join("\n");
    const next = applyFixtureFrontmatterState(markdown, {
      runtime: {
        model: "gpt-5",
        temperature: 0.2,
        budget: { maxTokens: 8000 },
        noCache: true,
        prompt: { user: "Review the change" },
        setup: {
          envVars: [{ name: "CAPTAIN_MODE", value: "verify" }],
        },
      },
      aiExtras: { maxConcurrent: 2, cacheTTL: "5m" },
    });

    expect(next).toContain("owner: docs\n");
    expect(next).toContain("ai:\n");
    expect(next).toContain("  model: gpt-5\n");
    expect(next).toContain("  maxTokens: 8000\n");
    expect(next).toContain("  maxConcurrent: 2\n");
    expect(next).toContain("  prompt:\n");
    expect(next).toContain("    user: Review the change\n");
    expect(next).toContain("env:\n");
    expect(next).toContain("  CAPTAIN_MODE: verify\n");
    expect(next).toContain("verify:\n");
    expect(next).toContain("  threshold: 80\n");
    expect(next.endsWith("# Verify")).toBe(true);
  });

  it("omits model runtime keys when verification inherits the parent model", () => {
    const markdown = ["---", "owner: docs", "---", "# Verify"].join("\n");
    const next = applyFixtureFrontmatterState(
      markdown,
      {
        runtime: {
          model: "gpt-5",
          temperature: 0.2,
          budget: { maxTokens: 8000 },
          noCache: true,
          prompt: { user: "Review with inherited runtime" },
          setup: {
            envVars: [{ name: "CAPTAIN_MODE", value: "verify" }],
          },
        },
        aiExtras: {},
      },
      { inheritModel: true },
    );

    expect(next).not.toContain("model: gpt-5");
    expect(next).not.toContain("temperature:");
    expect(next).not.toContain("maxTokens:");
    expect(next).not.toContain("noCache:");
    expect(next).toContain("  prompt:\n");
    expect(next).toContain("    user: Review with inherited runtime\n");
    expect(next).toContain("env:\n");
    expect(next).toContain("  CAPTAIN_MODE: verify\n");
  });

  it("reports invalid frontmatter and can replace it from raw source", () => {
    const markdown = ["---", "ai: [", "---", "# Verify"].join("\n");
    const parsed = parseFixtureFrontmatter(markdown);

    expect(parsed.ok).toBe(false);
    expect(applyFixtureFrontmatterRaw(markdown, "ai:\n  model: fixed\n")).toBe(
      ["---", "ai:", "  model: fixed", "---", "# Verify"].join("\n"),
    );
  });
});
