import { describe, expect, it } from "vitest";
import {
  jsonMessageFields,
  markdownToolFields,
  questionsFromToolInput,
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

  describe("ApplyPatch", () => {
    const repo = "/repo";
    const files = [
      { op: "update", path: `${repo}/cmd/a.go`, old: "x\n", new: "y\n" },
      { op: "add", path: `${repo}/cmd/b.go`, content: "z\n" },
      { op: "delete", path: `${repo}/cmd/c.go` },
    ];

    it("names a multi-file patch's file count and cwd-relative paths", () => {
      expect(summarizeToolInput("ApplyPatch", { files, input: "*** Begin Patch" }, repo)).toBe(
        "3 files: cmd/a.go, cmd/b.go, cmd/c.go",
      );
    });

    it("names a single-file move or delete by its operation and path", () => {
      expect(
        summarizeToolInput("ApplyPatch", { file_path: `${repo}/a.go`, operation: "delete" }, repo),
      ).toBe("delete a.go");
      expect(
        summarizeToolInput(
          "ApplyPatch",
          { file_path: `${repo}/a.go`, operation: "move", to: `${repo}/b.go` },
          repo,
        ),
      ).toBe("move a.go → b.go");
    });
  });

  it("relativizes file paths against the event cwd", () => {
    expect(summarizeToolInput("Read", { file_path: "/repo/src/a.ts" }, "/repo")).toBe("src/a.ts");
    expect(summarizeToolInput("Write", { file_path: "/elsewhere/a.ts" }, "/repo")).toBe(
      "/elsewhere/a.ts",
    );
  });
});

describe("markdownToolFields", () => {
  it("finds the title first, then every body-like string field by name, ignoring blanks and non-strings", () => {
    expect(
      markdownToolFields({
        id: "thread-1",
        body: "**Fixed** the parser",
        summary: "Parser fixed",
        title: "Fix parser",
        bodyMarkdown: "- item",
        comment: "  ",
        description: 42,
      }),
    ).toEqual([
      { key: "title", text: "Fix parser", kind: "title" },
      { key: "body", text: "**Fixed** the parser", kind: "markdown" },
      { key: "summary", text: "Parser fixed", kind: "markdown" },
      { key: "bodyMarkdown", text: "- item", kind: "markdown" },
    ]);
  });

  it("leaves calls without prose fields structured", () => {
    expect([
      markdownToolFields({ command: "ls -la", description: "" }),
      markdownToolFields({ name: "lookup", message: "hi" }),
      markdownToolFields(undefined),
    ]).toEqual([[], [], []]);
  });

  it("reads a sub-agent handback's message as Markdown", () => {
    const message = "## Findings\n\n- **root cause** in the parser";
    expect(markdownToolFields({ message, status: "completed" }, "SubAgentHandback")).toEqual([
      { key: "message", text: message, kind: "markdown" },
    ]);
  });
});

describe("jsonMessageFields", () => {
  it("unwraps a message that is one JSON object carrying prose fields", () => {
    const text = `\n{\n  "comment": "All **three** tests passed.\\n\\n- one",\n  "event": "completed",\n  "success": true\n}\n`;
    expect(jsonMessageFields(text)).toEqual({
      input: { comment: "All **three** tests passed.\n\n- one", event: "completed", success: true },
      fields: [{ key: "comment", text: "All **three** tests passed.\n\n- one", kind: "markdown" }],
    });
  });

  it("leaves prose, JSON without prose fields, arrays, and malformed JSON as ordinary text", () => {
    expect([
      jsonMessageFields("Done. {\"comment\": \"inline\"}"),
      jsonMessageFields('{"event": "completed", "success": true}'),
      jsonMessageFields('[{"comment": "x"}]'),
      jsonMessageFields('{"comment": "unterminated}'),
      jsonMessageFields(undefined),
    ]).toEqual([undefined, undefined, undefined, undefined, undefined]);
  });
});

describe("questionsFromToolInput", () => {
  it("normalizes multi-question payloads with option descriptions", () => {
    expect(questionsFromToolInput({
      questions: [
        {
          id: "scope",
          header: "Scope",
          question: "Which scope should the rule use?",
          options: [
            { label: "Project", description: "Current workspace" },
            { label: "Global" },
          ],
        },
        {
          id: "checks",
          question: "Which checks?",
          multiSelect: true,
          options: ["Lint", "Tests"],
        },
      ],
    })).toEqual([
      {
        id: "scope",
        text: "Which scope should the rule use?",
        context: "Scope",
        multiSelect: false,
        options: [
          { value: "Project", label: "Project", description: "Current workspace" },
          { value: "Global", label: "Global" },
        ],
      },
      {
        id: "checks",
        text: "Which checks?",
        multiSelect: true,
        options: [
          { value: "Lint", label: "Lint" },
          { value: "Tests", label: "Tests" },
        ],
      },
    ]);
  });

  it("normalizes single-question fallback fields", () => {
    expect(questionsFromToolInput({
      question: "Run the migration?",
      header: "Database",
      options: [{ value: "yes", label: "Yes" }],
    })).toEqual([
      {
        id: "1",
        text: "Run the migration?",
        context: "Database",
        multiSelect: false,
        options: [{ value: "yes", label: "Yes" }],
      },
    ]);
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
    expect(
      toolInputParams("ApplyPatch", {
        input: "*** Begin Patch",
        files: [{ op: "update", path: "a.go" }],
        file_path: "a.go",
        operation: "move",
        to: "b.go",
      }),
    ).toEqual([]);
  });

  it("hides an Edit's default replace_all: false, which the diff already shows, but keeps replace_all: true", () => {
    const edit = { file_path: "a.ts", old_string: "a", new_string: "b" };
    expect([
      toolInputParams("Edit", { ...edit, replace_all: false }),
      toolInputParams("Edit", { ...edit, replace_all: true }),
    ]).toEqual([[], [{ name: "replace_all", value: "true" }]]);
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
  it("turns a multi-file ApplyPatch into one segment per changed file", () => {
    expect(
      toolDiff("ApplyPatch", {
        input: "*** Begin Patch",
        files: [
          { op: "update", path: "a.go", old: "x\ny\n", new: "x\nz\n" },
          { op: "add", path: "b.go", content: "n\n" },
          { op: "delete", path: "c.go" },
        ],
      }),
    ).toEqual({
      added: 2,
      removed: 1,
      segments: [
        { original: "x\ny\n", modified: "x\nz\n" },
        { original: "", modified: "n\n" },
      ],
      language: "go",
    });
  });

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
    expect(relativizePath("/repo/src/a.ts", `/repo${"/".repeat(50_000)}`)).toBe(
      "src/a.ts",
    );
  });
});
