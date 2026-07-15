import { describe, expect, it } from "vitest";
import {
  getSessionAction,
  normalizeSession,
  splitMcpTool,
  summarizeSession,
  type SessionEntry,
} from "./SessionViewer.model";
import { SAMPLE_SESSION, SAMPLE_SESSION_JSONL } from "./SessionViewer.fixtures";
import { UiAsterisk, UiEye, UiPalette, UiProhibit, UiStrategy, UiWrench } from "../../icons";

describe("normalizeSession", () => {
  it("flattens entries into ordered events, splitting message content blocks", () => {
    const events = normalizeSession(SAMPLE_SESSION);
    const kinds = events.map((e) => e.kind);
    // user text, then a1's thinking + assistant text, then the tool rows, then the error.
    expect(kinds.slice(0, 4)).toEqual(["user", "thinking", "assistant", "tool"]);
    expect(kinds.at(-1)).toBe("error");
  });

  it("preserves system roles instead of presenting them as assistant messages", () => {
    const events = normalizeSession({
      messages: [
        { id: "system", role: "system", parts: [{ type: "text", text: "# AGENTS.md instructions" }] },
        { id: "user", role: "user", parts: [{ type: "text", text: "Fix the parser" }] },
      ],
    });

    expect(events.map((event) => event.kind)).toEqual(["system", "user"]);
    expect(summarizeSession(events).messageCount).toBe(2);
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
      icon: UiEye,
      tone: "sky",
      label: "Read file",
      summaryOnly: true,
    });
  });

  it("maps an MCP icon-server tool to the palette icon and a server-scoped label", () => {
    const action = getSessionAction("mcp__iconify__search_icons");
    expect(action.icon).toBe(UiPalette);
    expect(action.tone).toBe("pink");
    expect(action.label).toBe("iconify: search icons");
  });

  it("adopts the design glyphs for search and destructive tools", () => {
    expect(getSessionAction("Glob").icon).toBe(UiAsterisk);
    expect(getSessionAction("KillShell").icon).toBe(UiProhibit);
    expect(getSessionAction("TaskStop").icon).toBe(UiProhibit);
  });

  it("renders extracted assistant plans as planning actions", () => {
    expect(getSessionAction("Plan")).toEqual({
      icon: UiStrategy,
      tone: "sky",
      label: "Plan",
    });
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
