import { describe, expect, it } from "vitest";
import {
  relativizePath,
  shellCommand,
  summarizeToolInput,
  toolDiff,
  toolInputParams,
} from "./SessionViewer.input";

describe("summarizeToolInput", () => {
  const cases: Array<[string, Record<string, unknown>, string]> = [
    ["Bash", { command: "ls -la" }, "ls -la"],
    ["Read", { file_path: "src/a.ts" }, "src/a.ts"],
    ["Grep", { pattern: "Foo", path: "src" }, "Foo src"],
    ["Task", { description: "Explore icons" }, "Explore icons"],
    ["TaskUpdate", { taskId: "3", status: "completed" }, "3 completed"],
    ["WebSearch", { query: "phosphor icons" }, "phosphor icons"],
    ["mcp__postgres__execute_sql", { sql: "SELECT 1" }, "SELECT 1"],
  ];
  it.each(cases)("summarizes %s input", (tool, input, expected) => {
    expect(summarizeToolInput(tool, input)).toBe(expected);
  });

  it("counts AskUserQuestion questions", () => {
    expect(summarizeToolInput("AskUserQuestion", { questions: [{}, {}] })).toBe("2 questions");
  });

  it("returns an empty string when there is no input", () => {
    expect(summarizeToolInput("Read", undefined)).toBe("");
  });

  it("relativizes file paths against the event cwd", () => {
    expect(summarizeToolInput("Read", { file_path: "/repo/src/a.ts" }, "/repo")).toBe("src/a.ts");
    expect(summarizeToolInput("Write", { file_path: "/elsewhere/a.ts" }, "/repo")).toBe(
      "/elsewhere/a.ts",
    );
  });
});

describe("shellCommand", () => {
  it("returns the full command for a Bash tool call", () => {
    expect(shellCommand("Bash", { command: "pnpm run build" })).toBe("pnpm run build");
  });

  it("returns undefined for non-shell tools and missing commands", () => {
    expect(shellCommand("Read", { file_path: "src/a.ts" })).toBeUndefined();
    expect(shellCommand("Bash", {})).toBeUndefined();
    expect(shellCommand("Bash", undefined)).toBeUndefined();
  });
});

describe("toolInputParams", () => {
  it("flattens input entries into name/value pairs in insertion order", () => {
    expect(toolInputParams("Grep", { pattern: "Foo", path: "src" })).toEqual([
      { name: "pattern", value: "Foo" },
      { name: "path", value: "src" },
    ]);
  });

  it("excludes keys already rendered as the heading, command, or diff", () => {
    expect(toolInputParams("Read", { file_path: "/repo/a.ts", limit: 40 })).toEqual([
      { name: "limit", value: "40" },
    ]);
    expect(toolInputParams("Bash", { command: "ls", description: "List files" })).toEqual([
      { name: "description", value: "List files" },
    ]);
    expect(
      toolInputParams("Edit", { file_path: "a.ts", old_string: "a", new_string: "b" }),
    ).toEqual([]);
    expect(toolInputParams("Write", { file_path: "a.ts", content: "x" })).toEqual([]);
  });

  it("skips empty values and collapses multiline values to one truncated line", () => {
    expect(toolInputParams("Task", { description: "", prompt: "x\n  y" })).toEqual([
      { name: "prompt", value: "x y" },
    ]);
    const long = "a".repeat(80);
    expect(toolInputParams("Task", { prompt: long })).toEqual([
      { name: "prompt", value: `${"a".repeat(60)}…` },
    ]);
  });

  it("relativizes string values against the cwd and serializes non-strings", () => {
    expect(toolInputParams("Grep", { path: "/repo/src", "-n": true }, "/repo")).toEqual([
      { name: "path", value: "src" },
      { name: "-n", value: "true" },
    ]);
  });
});

describe("toolDiff", () => {
  it("treats a Write as one all-added segment and infers the language", () => {
    expect(toolDiff("Write", { file_path: "a.ts", content: "a\nb\nc" })).toEqual({
      added: 3,
      removed: 0,
      segments: [{ original: "", modified: "a\nb\nc" }],
      language: "ts",
    });
  });

  it("counts an Edit's real add/remove lines via LCS", () => {
    expect(toolDiff("Edit", { old_string: "a\nb", new_string: "c" })).toEqual({
      added: 1,
      removed: 2,
      segments: [{ original: "a\nb", modified: "c" }],
    });
  });

  it("keeps a segment per MultiEdit edit and sums their counts", () => {
    const diff = toolDiff("MultiEdit", {
      edits: [
        { old_string: "a", new_string: "b" },
        { old_string: "", new_string: "c\nd" },
      ],
    });
    expect(diff).toEqual({
      added: 3,
      removed: 1,
      segments: [
        { original: "a", modified: "b" },
        { original: "", modified: "c\nd" },
      ],
    });
  });

  it("returns undefined for non-writing tools, empty inputs, and no-op edits", () => {
    expect(toolDiff("Read", { file_path: "a.ts" })).toBeUndefined();
    expect(toolDiff("Write", { file_path: "a.ts" })).toBeUndefined();
    expect(toolDiff("Edit", undefined)).toBeUndefined();
    expect(toolDiff("MultiEdit", { edits: [] })).toBeUndefined();
    // old === new produces only context lines → no diff.
    expect(toolDiff("Edit", { old_string: "a\nb", new_string: "a\nb" })).toBeUndefined();
  });
});

describe("relativizePath", () => {
  it("strips the cwd prefix at a path-segment boundary only", () => {
    expect(relativizePath("/repo/src/a.ts", "/repo")).toBe("src/a.ts");
    expect(relativizePath("/repo/src/a.ts", "/repo/")).toBe("src/a.ts");
    expect(relativizePath("/repository/src/a.ts", "/repo")).toBe("/repository/src/a.ts");
    expect(relativizePath("/repo/src/a.ts", undefined)).toBe("/repo/src/a.ts");
  });
});
