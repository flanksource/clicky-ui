import type { SessionEntry } from "./SessionViewer.model";
import type { UnifiedSessionInput } from "./SessionViewer.unified";

export const INSPECTOR_SESSION: UnifiedSessionInput = {
  id: "session-parity",
  source: "claude",
  project: "captain",
  cwd: "/repo",
  historyFile: "/repo/.claude/session.jsonl",
  provider: "anthropic",
  backend: "claude-cmux",
  version: "1.2.3",
  model: "claude-opus-4-8",
  reasoningEffort: "high",
  git: { branch: "main", commit: "abc123" },
  startedAt: "2026-07-08T10:00:00Z",
  endedAt: "2026-07-08T10:05:00Z",
  usage: { inputTokens: 1000, outputTokens: 500, totalTokens: 1500 },
  cost: { inputCost: 0.01, outputCost: 0.02, totalTokens: 1500 },
  toolCosts: [
    {
      model: "claude-opus-4-8",
      inputTokens: 1000,
      outputTokens: 500,
      inputCost: 0.01,
      outputCost: 0.02,
    },
  ],
  context: { usedTokens: 1500, windowTokens: 1_000_000, freePercent: 99 },
  budget: { used: 0.03, total: 1 },
  capabilities: {
    tools: ["Read", "Bash"],
    agents: ["general-purpose"],
    skills: ["gavel-runner"],
  },
  events: [
    { type: "last-prompt", scope: "session" },
    {
      type: "memory_citation",
      scope: "session",
      turnId: "turn-1",
      data: {
        citation_entries: ["MEMORY.md:10-12|note=[session parser]"],
        rollout_ids: ["019f3754-ecfa-7323-a76b-a0205ea30bbe"],
      },
    },
  ],
  turns: [
    {
      id: "turn-1",
      index: 1,
      startedAt: "2026-07-08T10:00:00Z",
      endedAt: "2026-07-08T10:05:00Z",
      model: "claude-opus-4-8",
      backend: "claude-cmux",
      reasoningEffort: "high",
      status: "completed",
      stopReason: "end_turn",
      messageIds: ["m1"],
      usage: { inputTokens: 1000, outputTokens: 500 },
      cost: { inputCost: 0.01, outputCost: 0.02 },
      context: { usedTokens: 1500, windowTokens: 1_000_000, freePercent: 99 },
      events: [{ type: "budget_usd", scope: "turn", turnId: "turn-1" }],
    },
    {
      id: "turn-2",
      index: 2,
      startedAt: "2026-07-08T10:02:00Z",
      endedAt: "2026-07-08T10:03:00Z",
      model: "claude-opus-4-8",
      backend: "claude-cmux",
      reasoningEffort: "high",
      status: "completed",
      stopReason: "end_turn",
      messageIds: [],
      usage: { inputTokens: 640, outputTokens: 280, totalTokens: 920 },
      cost: { inputCost: 0.006, outputCost: 0.009 },
    },
    {
      id: "turn-3",
      index: 3,
      startedAt: "2026-07-08T10:04:00Z",
      model: "claude-opus-4-8",
      backend: "claude-cmux",
      reasoningEffort: "high",
      status: "running",
      messageIds: [],
      usage: { inputTokens: 360, outputTokens: 120, totalTokens: 480 },
      cost: { inputCost: 0.004, outputCost: 0.001 },
    },
  ],
  root: {
    id: "root",
    isRoot: true,
    historyFile: "/repo/.claude/session.jsonl",
    children: [
      { id: "agent-1", type: "general-purpose", desc: "Review parity" },
    ],
  },
  agents: [
    { id: "root", isRoot: true },
    { id: "agent-1", type: "general-purpose", desc: "Review parity" },
  ],
  files: {
    read: ["pkg/session/session.go"],
    written: ["pkg/cli/webapp/src/SessionBrowser.tsx"],
  },
  plan: {
    path: "/repo/.claude/plans/parity.md",
    content:
      "# Implement parity panels\n\n- Keep the inspector compact.\n- Verify every panel.",
    explicit: true,
    events: [{ kind: "exit", timestamp: "2026-07-08T10:03:00Z" }],
  },
  approvals: {
    approved: 2,
    denied: 1,
    denials: [
      { toolUseId: "tool-1", tool: "Bash", reason: "Needs manual review" },
    ],
  },
  health: [
    { kind: "low_context", severity: "warning", message: "Context low" },
  ],
  live: { active: true, pid: 1234, status: "running", command: "claude" },
  prompt: { name: "parity.prompt" },
  messages: [
    {
      id: "m1",
      role: "assistant",
      turnId: "turn-1",
      provenance: {
        timestamp: "2026-07-08T10:00:01Z",
        source: "claude",
        model: "claude-opus-4-8",
        cwd: "/repo",
        agentId: "root",
      },
      raw: { type: "assistant", uuid: "m1" },
      parts: [{ type: "text", text: "done" }],
    },
    {
      id: "m2",
      role: "assistant",
      turnId: "turn-2",
      provenance: {
        timestamp: "2026-07-08T10:02:01Z",
        source: "claude",
        model: "claude-opus-4-8",
        cwd: "/repo",
        agentId: "agent-1",
      },
      parts: [{ type: "text", text: "second turn" }],
    },
    {
      id: "m3",
      role: "assistant",
      turnId: "turn-3",
      provenance: {
        timestamp: "2026-07-08T10:04:01Z",
        source: "claude",
        model: "claude-opus-4-8",
        cwd: "/repo",
        agentId: "root",
      },
      parts: [{ type: "text", text: "third turn" }],
    },
  ],
};

// A representative captain session covering the shapes the viewer must handle:
// user/assistant prose, reasoning, consolidated tool_use rows with responses,
// a sub-agent dispatch, an MCP tool, and a terminal API error.
export const SAMPLE_SESSION: SessionEntry[] = [
  {
    type: "user",
    uuid: "u1",
    timestamp: "2026-06-25T10:00:00Z",
    message: {
      role: "user",
      content: [{ type: "text", text: "Add a session viewer component." }],
    },
  },
  {
    type: "assistant",
    uuid: "a1",
    timestamp: "2026-06-25T10:00:05Z",
    message: {
      role: "assistant",
      content: [
        {
          type: "thinking",
          thinking: "I should explore the repo's data components first.",
        },
        {
          type: "text",
          text: "I'll start by exploring the codebase, then add the component.",
        },
      ],
    },
  },
  {
    type: "assistant",
    uuid: "a2",
    timestamp: "2026-06-25T10:00:06Z",
    tool_use: {
      tool: "Read",
      input: {
        file_path: "/repo/packages/ui/src/data/Timeline.tsx",
        limit: 40,
      },
      cwd: "/repo",
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
      input: {
        command: "pnpm --filter @flanksource/clicky-ui test SessionViewer",
      },
      response: "Tests: 8 passed (8)",
    },
  },
  {
    type: "assistant",
    uuid: "a5",
    timestamp: "2026-06-25T10:00:20Z",
    tool_use: {
      tool: "Task",
      input: {
        description: "Explore icon system",
        prompt: "Find how icons are generated.",
      },
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
      input: {
        file_path: "packages/ui/src/data/ai/SessionViewer.tsx",
        content: "export function SessionViewer() {\n  return <ol />;\n}",
      },
      response: "File created (3 lines)",
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
