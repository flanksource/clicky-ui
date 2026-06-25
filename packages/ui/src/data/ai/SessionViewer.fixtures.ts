import type { SessionEntry } from "./SessionViewer.model";

// A representative captain session covering the shapes the viewer must handle:
// user/assistant prose, reasoning, consolidated tool_use rows with responses,
// a sub-agent dispatch, an MCP tool, and a terminal API error.
export const SAMPLE_SESSION: SessionEntry[] = [
  {
    type: "user",
    uuid: "u1",
    timestamp: "2026-06-25T10:00:00Z",
    message: { role: "user", content: [{ type: "text", text: "Add a session viewer component." }] },
  },
  {
    type: "assistant",
    uuid: "a1",
    timestamp: "2026-06-25T10:00:05Z",
    message: {
      role: "assistant",
      content: [
        { type: "thinking", thinking: "I should explore the repo's data components first." },
        { type: "text", text: "I'll start by exploring the codebase, then add the component." },
      ],
    },
  },
  {
    type: "assistant",
    uuid: "a2",
    timestamp: "2026-06-25T10:00:06Z",
    tool_use: {
      tool: "Read",
      input: { file_path: "packages/ui/src/data/Timeline.tsx" },
      tool_use_id: "t1",
      source: "claude",
      model: "claude-opus-4-8",
      response: "export function Timeline() { /* … */ }",
    },
  },
  {
    type: "assistant",
    uuid: "a3",
    timestamp: "2026-06-25T10:00:08Z",
    tool_use: {
      tool: "Grep",
      input: { pattern: "SessionEntry", path: "packages/ui/src" },
      model: "claude-opus-4-8",
      response: "3 matches across 2 files",
    },
  },
  {
    type: "assistant",
    uuid: "a4",
    timestamp: "2026-06-25T10:00:12Z",
    tool_use: {
      tool: "Bash",
      input: { command: "pnpm --filter @flanksource/clicky-ui test SessionViewer" },
      response: "Tests: 8 passed (8)",
    },
  },
  {
    type: "assistant",
    uuid: "a5",
    timestamp: "2026-06-25T10:00:20Z",
    tool_use: {
      tool: "Task",
      input: { description: "Explore icon system", prompt: "Find how icons are generated." },
    },
  },
  {
    type: "assistant",
    uuid: "a6",
    timestamp: "2026-06-25T10:00:30Z",
    tool_use: {
      tool: "mcp__iconify__search_icons",
      input: { query: "robot" },
      response: "ph:robot, ph:robot-fill",
    },
  },
  {
    type: "assistant",
    uuid: "a7",
    timestamp: "2026-06-25T10:00:40Z",
    tool_use: {
      tool: "Write",
      input: { file_path: "packages/ui/src/data/ai/SessionViewer.tsx" },
      response: "File created (220 lines)",
    },
  },
  {
    isApiErrorMessage: true,
    uuid: "err1",
    error: "rate_limit",
    apiErrorStatus: 429,
    timestamp: "2026-06-25T10:01:00Z",
  },
];

// The same first three entries as a JSONL string (one JSON object per line),
// the on-disk form of a Claude Code transcript.
export const SAMPLE_SESSION_JSONL = [
  JSON.stringify(SAMPLE_SESSION[0]),
  JSON.stringify(SAMPLE_SESSION[1]),
  JSON.stringify(SAMPLE_SESSION[2]),
].join("\n");
