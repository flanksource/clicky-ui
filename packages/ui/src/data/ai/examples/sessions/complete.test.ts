import { describe, expect, it } from "vitest";
import {
  getSessionAction,
  getSessionMetadata,
  normalizeSession,
  type SessionEvent,
} from "../../SessionViewer.model";
import { CLAUDE_COMPLETE_SESSION, CODEX_COMPLETE_SESSION } from ".";

// Every per-tool key in the SessionViewer.model ACTIONS registry. The complete
// transcripts must collectively exercise all of them so no icon/tone row goes
// unrendered. Kept as an explicit literal (not derived from ACTIONS) so a tool
// dropped from a fixture fails loudly here rather than silently passing.
const KNOWN_ACTION_TOOLS = [
  "Read", "Write", "Edit", "MultiEdit", "NotebookEdit", "Grep", "Glob",
  "Bash", "BashOutput", "KillShell", "Task", "Agent", "Skill", "TodoWrite",
  "Plan", "TaskCreate", "TaskUpdate", "TaskList", "TaskGet", "TaskOutput",
  "TaskStop", "ToolSearch", "AskUserQuestion", "EnterPlanMode", "ExitPlanMode",
  "WebFetch", "WebSearch", "browser_navigate", "browser_navigate_back",
  "browser_click", "browser_triple_click", "browser_type", "browser_press_key",
  "browser_snapshot", "browser_take_screenshot", "browser_evaluate",
  "browser_console_messages", "browser_network_requests", "browser_wait_for",
  "Wait", "browser_close",
] as const;

const KNOWN_CODEX_TOOLS = [
  "view_image", "read_file", "list_dir", "exec_command", "apply_patch",
  "update_plan", "web_search",
] as const;

const claudeEvents = normalizeSession(CLAUDE_COMPLETE_SESSION);
const codexEvents = normalizeSession(CODEX_COMPLETE_SESSION);
const allEvents = [...claudeEvents, ...codexEvents];

const toolNames = new Set(
  allEvents.flatMap((e) => (e.kind === "tool" && e.tool ? [e.tool] : [])),
);
const toolStates = new Set(
  allEvents.flatMap((e) => (e.toolState ? [e.toolState] : [])),
);
const eventKinds = new Set(allEvents.map((e) => e.kind));

function turnStatuses(session: typeof CLAUDE_COMPLETE_SESSION) {
  return new Set((session.turns ?? []).map((t) => t.status));
}
function efforts(session: typeof CLAUDE_COMPLETE_SESSION) {
  return new Set((session.turns ?? []).map((t) => t.reasoningEffort));
}

describe("complete coverage transcripts", () => {
  it("normalizes both sessions without throwing", () => {
    expect(claudeEvents.length).toBeGreaterThan(30);
    expect(codexEvents.length).toBeGreaterThan(15);
  });

  it("exercises every ACTIONS tool across the Claude transcript", () => {
    const claudeTools = new Set(
      claudeEvents.flatMap((e) => (e.tool ? [e.tool] : [])),
    );
    const missing = KNOWN_ACTION_TOOLS.filter((t) => !claudeTools.has(t));
    expect(missing).toEqual([]);
  });

  it("exercises every Codex-native tool across the Codex transcript", () => {
    const codexTools = new Set(
      codexEvents.flatMap((e) => (e.tool ? [e.tool] : [])),
    );
    const missing = KNOWN_CODEX_TOOLS.filter((t) => !codexTools.has(t));
    expect(missing).toEqual([]);
  });

  it("includes MCP tools from icon, generative, and generic servers", () => {
    expect(toolNames.has("mcp__iconify__search")).toBe(true);
    expect(toolNames.has("mcp__gemini-cli__gemini")).toBe(true);
    expect(toolNames.has("mcp__postgres__execute_sql")).toBe(true);
    expect(toolNames.has("mcp__codex__codex")).toBe(true);
  });

  it("resolves an icon, tone, and label for every tool used", () => {
    for (const tool of toolNames) {
      const action = getSessionAction(tool);
      expect(action.icon).toBeTruthy();
      expect(action.tone).toBeTruthy();
      expect(action.label.length).toBeGreaterThan(0);
    }
  });

  it("covers every tool state", () => {
    for (const state of [
      "output-available",
      "approval-requested",
      "approval-responded",
      "output-denied",
      "output-error",
      "input-streaming",
    ]) {
      expect(toolStates.has(state)).toBe(true);
    }
  });

  it("covers every event kind", () => {
    for (const kind of [
      "system",
      "user",
      "assistant",
      "thinking",
      "tool",
      "error",
    ] satisfies SessionEvent["kind"][]) {
      expect(eventKinds.has(kind)).toBe(true);
    }
  });

  it("covers the terminal turn statuses and the full effort ramp", () => {
    for (const session of [CLAUDE_COMPLETE_SESSION, CODEX_COMPLETE_SESSION]) {
      const statuses = turnStatuses(session);
      expect(statuses.has("completed")).toBe(true);
      expect(statuses.has("error")).toBe(true);
      expect(statuses.has("cancelled")).toBe(true);
    }
    const claudeEfforts = efforts(CLAUDE_COMPLETE_SESSION);
    for (const level of ["minimal", "low", "medium", "high", "max", "adaptive"]) {
      expect(claudeEfforts.has(level)).toBe(true);
    }
  });

  it("surfaces pending approvals, denials, and API errors in metadata", () => {
    for (const session of [CLAUDE_COMPLETE_SESSION, CODEX_COMPLETE_SESSION]) {
      const meta = getSessionMetadata(session);
      expect(meta).toBeDefined();
      expect((session.approvals?.denied ?? 0)).toBeGreaterThan(0);
      expect(session.health?.some((h) => h.severity === "error")).toBe(true);
    }
    expect(allEvents.some((e) => e.kind === "error" && e.errorStatus)).toBe(
      true,
    );
    expect(allEvents.some((e) => e.pending)).toBe(true);
  });

  it("keeps real (un-anonymized) environment values intact", () => {
    const serialized = JSON.stringify([
      CLAUDE_COMPLETE_SESSION,
      CODEX_COMPLETE_SESSION,
    ]);
    expect(serialized).toContain("/Users/moshe/go/src/github.com/flanksource");
    expect(serialized).toContain("/Users/moshe/.claude/projects/");
    expect(serialized).toContain("/Users/moshe/.codex/sessions/");
  });
});
