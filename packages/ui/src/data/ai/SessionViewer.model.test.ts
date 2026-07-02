import { describe, expect, it } from "vitest";
import {
  getSessionAction,
  normalizeSession,
  relativizePath,
  shellCommand,
  splitMcpTool,
  summarizeSession,
  summarizeToolInput,
  toolInputParams,
  type SessionEntry,
} from "./SessionViewer.model";
import { SAMPLE_SESSION, SAMPLE_SESSION_JSONL } from "./SessionViewer.fixtures";
import { UiFileText, UiImage, UiWrench } from "../../icons";

describe("normalizeSession", () => {
  it("flattens entries into ordered events, splitting message content blocks", () => {
    const events = normalizeSession(SAMPLE_SESSION);
    const kinds = events.map((e) => e.kind);
    // user text, then a1's thinking + assistant text, then the tool rows, then the error.
    expect(kinds.slice(0, 4)).toEqual(["user", "thinking", "assistant", "tool"]);
    expect(kinds.at(-1)).toBe("error");
  });

  it("carries response, model, source and cwd from a consolidated tool_use row", () => {
    const events = normalizeSession(SAMPLE_SESSION);
    const read = events.find((e) => e.tool === "Read");
    expect(read).toMatchObject({
      kind: "tool",
      toolResponse: "export function Timeline() { /* … */ }",
      model: "claude-opus-4-8",
      source: "claude",
      cwd: "/repo",
    });
    expect(read?.toolInput).toEqual({
      file_path: "/repo/packages/ui/src/data/Timeline.tsx",
      limit: 40,
    });
  });

  it("turns an isApiErrorMessage entry into an error event with the HTTP status", () => {
    const events = normalizeSession(SAMPLE_SESSION);
    const error = events.find((e) => e.kind === "error");
    expect(error).toMatchObject({ errorType: "rate_limit", errorStatus: 429 });
    expect(error?.text).toBe("rate_limit (HTTP 429)");
  });

  it("parses a JSONL string and a pretty-printed JSON array identically", () => {
    const fromJsonl = normalizeSession(SAMPLE_SESSION_JSONL);
    const fromArray = normalizeSession(JSON.stringify(SAMPLE_SESSION.slice(0, 3), null, 2));
    expect(fromJsonl.map((e) => e.kind)).toEqual(fromArray.map((e) => e.kind));
    expect(fromJsonl[0]?.text).toBe("Add a session viewer component.");
  });

  it("throws loudly on a malformed JSONL line rather than dropping it", () => {
    expect(() => normalizeSession('{"type":"user"}\n{not json}')).toThrow(/invalid session JSON line/);
  });

  it("returns no events for empty input", () => {
    expect(normalizeSession("")).toEqual([]);
    expect(normalizeSession([])).toEqual([]);
  });
});

describe("getSessionAction", () => {
  it("maps a known tool to its icon, tone and label", () => {
    expect(getSessionAction("Read")).toEqual({
      icon: UiFileText,
      tone: "sky",
      label: "Read file",
      summaryOnly: true,
    });
  });

  it("maps an MCP icon-server tool to the asset icon and a server-scoped label", () => {
    const action = getSessionAction("mcp__iconify__search_icons");
    expect(action.icon).toBe(UiImage);
    expect(action.tone).toBe("pink");
    expect(action.label).toBe("iconify: search icons");
  });

  it("falls back to the wrench for an unknown tool", () => {
    expect(getSessionAction("SomethingNew")).toEqual({
      icon: UiWrench,
      tone: "slate",
      label: "SomethingNew",
    });
  });
});

describe("splitMcpTool", () => {
  it("splits both the mcp-prefixed and bare server__name forms", () => {
    expect(splitMcpTool("mcp__postgres__execute_sql")).toEqual({ server: "postgres", name: "execute_sql" });
    expect(splitMcpTool("iconify__get_icon")).toEqual({ server: "iconify", name: "get_icon" });
  });

  it("returns null for a plain tool name", () => {
    expect(splitMcpTool("Read")).toBeNull();
  });
});

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

describe("toolInputParams", () => {
  it("flattens input entries into name/value pairs in insertion order", () => {
    expect(toolInputParams("Grep", { pattern: "Foo", path: "src" })).toEqual([
      { name: "pattern", value: "Foo" },
      { name: "path", value: "src" },
    ]);
  });

  it("excludes keys already rendered as the heading or inline command", () => {
    expect(toolInputParams("Read", { file_path: "/repo/a.ts", limit: 40 })).toEqual([
      { name: "limit", value: "40" },
    ]);
    expect(toolInputParams("Bash", { command: "ls", description: "List files" })).toEqual([
      { name: "description", value: "List files" },
    ]);
  });

  it("skips empty values and collapses multiline values to one truncated line", () => {
    expect(toolInputParams("Edit", { file_path: "a.ts", old_string: "", new_string: "x\n  y" })).toEqual([
      { name: "new_string", value: "x y" },
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

describe("relativizePath", () => {
  it("strips the cwd prefix at a path-segment boundary only", () => {
    expect(relativizePath("/repo/src/a.ts", "/repo")).toBe("src/a.ts");
    expect(relativizePath("/repo/src/a.ts", "/repo/")).toBe("src/a.ts");
    expect(relativizePath("/repository/src/a.ts", "/repo")).toBe("/repository/src/a.ts");
    expect(relativizePath("/repo/src/a.ts", undefined)).toBe("/repo/src/a.ts");
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

describe("summarizeSession", () => {
  it("counts tool calls, messages and the dominant model", () => {
    const events = normalizeSession(SAMPLE_SESSION);
    const summary = summarizeSession(events);
    expect(summary.toolCount).toBe(6);
    expect(summary.messageCount).toBe(2);
    expect(summary.model).toBe("claude-opus-4-8");
  });

  it("omits the model when none was recorded", () => {
    const entries: SessionEntry[] = [
      { type: "assistant", tool_use: { tool: "Glob", input: { pattern: "*.ts" } } },
    ];
    expect(summarizeSession(normalizeSession(entries)).model).toBeUndefined();
  });
});
