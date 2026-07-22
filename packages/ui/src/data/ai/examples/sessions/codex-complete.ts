import type { UnifiedSessionInput } from "../../SessionViewer.unified";

// ── Complete Codex CLI transcript ────────────────────────────────────────────
// One un-anonymized Codex session mirroring the Claude coverage fixture with
// Codex's own tool vocabulary (exec_command, apply_patch, view_image,
// update_plan, read_file, list_dir) plus shared MCP tools. Exercises every turn
// status, stop reason, effort level, part type, tool state, and event kind the
// SessionViewer / SessionInspector renders. Real cwd / home / history-file /
// git / UUID values are kept intentionally (unsanitized).

export const CODEX_COMPLETE_SESSION: UnifiedSessionInput = {
  id: "5b8e2a41-7c3d-4f19-9a06-1d4e8b7c2f3a",
  source: "codex",
  project: "clicky-ui",
  cwd: "/Users/moshe/go/src/github.com/flanksource/clicky-ui",
  slug: "codex-transcript-coverage",
  title: "Mirror the coverage transcript for Codex",
  initialPrompt:
    "Mirror the Claude coverage transcript using Codex tools — exec_command, apply_patch, view_image, update_plan.",
  version: "0.51.0",
  provider: "openai",
  backend: "codex",
  model: "gpt-5.1-codex-max",
  reasoningEffort: "high",
  historyFile:
    "/Users/moshe/.codex/sessions/2026/07/15/rollout-2026-07-15T09-12-04-5b8e2a41-7c3d-4f19-9a06-1d4e8b7c2f3a.jsonl",
  git: {
    branch: "pr/workspaces",
    commit: "69859e7c",
    worktree: "/Users/moshe/go/src/github.com/flanksource/clicky-ui",
  },
  startedAt: "2026-07-15T09:12:04Z",
  endedAt: "2026-07-15T10:18:52Z",
  usage: {
    inputTokens: 168_420,
    outputTokens: 9_940,
    reasoningTokens: 22_600,
    cacheReadTokens: 1_204_608,
    totalTokens: 1_405_568,
  },
  cost: {
    model: "gpt-5.1-codex-max",
    inputTokens: 168_420,
    outputTokens: 9_940,
    reasoningTokens: 22_600,
    cacheReadTokens: 1_204_608,
    totalTokens: 1_405_568,
    inputCost: 0.505260,
    outputCost: 0.149100,
    reasoningCost: 0.339000,
    cacheReadCost: 0.361382,
  },
  toolCosts: [
    {
      model: "gpt-5.1-codex-max",
      inputTokens: 168_420,
      outputTokens: 9_940,
      totalTokens: 1_405_568,
      inputCost: 0.505260,
      outputCost: 0.149100,
    },
  ],
  context: { usedTokens: 168_400, windowTokens: 272_000, freePercent: 38 },
  budget: {
    used: 1.35,
    total: 5,
    remaining: 3.65,
    updatedAt: "2026-07-15T10:18:52Z",
  },
  capabilities: {
    tools: [
      "view_image", "read_file", "list_dir", "exec_command", "apply_patch",
      "update_plan", "web_search", "ToolSearch",
    ],
    pendingMcpServers: ["mcp__postgres"],
    skills: ["agent-browser", "iconography", "deep-research"],
  },

  // ── Turns: status × stop-reason × effort matrix ───────────────────────────
  turns: [
    {
      id: "x-turn-review",
      index: 1,
      startedAt: "2026-07-15T09:12:04Z",
      endedAt: "2026-07-15T09:22:41Z",
      model: "gpt-5.1-codex-max",
      backend: "codex",
      reasoningEffort: "high",
      status: "completed",
      stopReason: "end_turn",
      messageIds: ["x-user-brief", "x-think-review", "x-review-tools", "x-review-text"],
      usage: { inputTokens: 41_830, outputTokens: 2_140, reasoningTokens: 6_800, cacheReadTokens: 262_144, totalTokens: 312_914 },
      cost: { inputCost: 0.12549, outputCost: 0.0321, cacheReadCost: 0.0786432 },
    },
    {
      id: "x-turn-plan",
      index: 2,
      startedAt: "2026-07-15T09:23:10Z",
      endedAt: "2026-07-15T09:31:58Z",
      model: "gpt-5.1-codex-max",
      backend: "codex",
      reasoningEffort: "medium",
      status: "completed",
      stopReason: "tool_use",
      messageIds: ["x-plan-tools", "x-plan-text"],
      usage: { inputTokens: 33_920, outputTokens: 1_610, cacheReadTokens: 245_760, totalTokens: 281_290 },
      cost: { inputCost: 0.10176, outputCost: 0.02415, cacheReadCost: 0.073728 },
    },
    {
      id: "x-turn-implement",
      index: 3,
      startedAt: "2026-07-15T09:32:20Z",
      endedAt: "2026-07-15T09:52:04Z",
      model: "gpt-5.1-codex-max",
      backend: "codex",
      reasoningEffort: "high",
      status: "completed",
      stopReason: "end_turn",
      messageIds: ["x-impl-tools", "x-impl-text"],
      usage: { inputTokens: 44_210, outputTokens: 3_120, reasoningTokens: 9_400, cacheReadTokens: 286_720, totalTokens: 343_450 },
      cost: { inputCost: 0.13263, outputCost: 0.0468, cacheReadCost: 0.086016 },
    },
    {
      id: "x-turn-verify",
      index: 4,
      startedAt: "2026-07-15T09:52:30Z",
      endedAt: "2026-07-15T10:03:11Z",
      model: "gpt-5.1-codex-max",
      backend: "codex",
      reasoningEffort: "low",
      status: "completed",
      stopReason: "tool_use",
      messageIds: ["x-verify-tools", "x-verify-text"],
      usage: { inputTokens: 24_610, outputTokens: 1_240, cacheReadTokens: 180_224, totalTokens: 206_074 },
      cost: { inputCost: 0.07383, outputCost: 0.0186, cacheReadCost: 0.0540672 },
    },
    {
      id: "x-turn-mcp",
      index: 5,
      startedAt: "2026-07-15T10:03:40Z",
      endedAt: "2026-07-15T10:11:26Z",
      model: "gpt-5.1-codex-max",
      backend: "codex",
      reasoningEffort: "minimal",
      status: "completed",
      stopReason: "max_tokens",
      messageIds: ["x-mcp-tools", "x-mcp-text"],
      usage: { inputTokens: 18_400, outputTokens: 940, cacheReadTokens: 147_456, totalTokens: 166_796 },
      cost: { inputCost: 0.0552, outputCost: 0.0141, cacheReadCost: 0.0442368 },
    },
    {
      id: "x-turn-error",
      index: 6,
      startedAt: "2026-07-15T10:11:50Z",
      endedAt: "2026-07-15T10:14:03Z",
      model: "gpt-5.1-codex-max",
      backend: "codex",
      reasoningEffort: "high",
      status: "error",
      stopReason: "refusal",
      error: "openai: 429 rate_limit_exceeded — retry after 20s",
      messageIds: ["x-system-notice", "x-api-error", "x-error-text"],
      usage: { inputTokens: 3_450, outputTokens: 210, cacheReadTokens: 49_152, totalTokens: 52_812 },
      cost: { inputCost: 0.01035, outputCost: 0.00315, cacheReadCost: 0.0147456 },
    },
    {
      id: "x-turn-cancel",
      index: 7,
      startedAt: "2026-07-15T10:14:30Z",
      endedAt: "2026-07-15T10:18:52Z",
      model: "gpt-5.1-codex-max",
      backend: "codex",
      reasoningEffort: "medium",
      status: "cancelled",
      stopReason: "cancelled",
      messageIds: ["x-cancel-tools", "x-cancel-text"],
      usage: { inputTokens: 2_000, outputTokens: 320, cacheReadTokens: 33_152, totalTokens: 35_472 },
      cost: { inputCost: 0.006, outputCost: 0.0048, cacheReadCost: 0.0099456 },
    },
  ],

  // ── Messages ──────────────────────────────────────────────────────────────
  messages: [
    // Turn 1 — review: user text, reasoning, image + read + shell exploration.
    {
      id: "x-user-brief",
      role: "user",
      turnId: "x-turn-review",
      provenance: { timestamp: "2026-07-15T09:12:04Z", source: "codex", model: "gpt-5.1-codex-max", reasoningEffort: "high", cwd: "/Users/moshe/go/src/github.com/flanksource/clicky-ui", sessionId: "5b8e2a41-7c3d-4f19-9a06-1d4e8b7c2f3a", agentId: "x-root", uuid: "1d4e8b7c-2f3a-4c9d-8e06-5b8e2a417c3d" },
      parts: [{ type: "text", text: "Mirror the Claude coverage transcript using Codex tools — exec_command, apply_patch, view_image, update_plan. Do not anonymize anything." }],
    },
    {
      id: "x-think-review",
      role: "assistant",
      turnId: "x-turn-review",
      provenance: { timestamp: "2026-07-15T09:13:22Z", source: "codex", model: "gpt-5.1-codex-max", reasoningEffort: "high", agentId: "x-root" },
      parts: [{ type: "reasoning", text: "Codex speaks exec_command / apply_patch instead of Bash / Edit, and view_image / update_plan instead of the browser suite. I'll first read the reference screenshot and the existing fixture, then plan the mirror." }],
    },
    {
      id: "x-review-tools",
      role: "assistant",
      turnId: "x-turn-review",
      provenance: { timestamp: "2026-07-15T09:15:40Z", source: "codex", agentId: "x-root" },
      parts: [
        { type: "dynamic-tool", toolName: "view_image", toolCallId: "call_ViewImage01", state: "output-available", input: { path: "/Users/moshe/Desktop/session-inspector-reference.png" }, output: { width: 1512, height: 982, inspected: true } },
        { type: "dynamic-tool", toolName: "list_dir", toolCallId: "call_ListDir01", state: "output-available", input: { path: "packages/ui/src/data/ai/examples/sessions" }, output: "claude.ts\ncodex.ts\nindex.ts\nsessions.test.ts" },
        { type: "dynamic-tool", toolName: "read_file", toolCallId: "call_ReadFile01", state: "output-available", input: { path: "packages/ui/src/data/ai/examples/sessions/codex.ts", offset: 1, limit: 60 }, output: "CODEX_SESSION_EXAMPLE: UnifiedSessionInput = { id: 'codex-session-example', … }" },
        { type: "dynamic-tool", toolName: "exec_command", toolCallId: "call_Exec01", state: "output-available", input: { command: "rg -n \"UnifiedSessionInput\" packages/ui/src/data/ai/SessionViewer.unified.ts", cwd: "/Users/moshe/go/src/github.com/flanksource/clicky-ui" }, output: "193:export interface UnifiedSessionInput {" },
        { type: "dynamic-tool", toolName: "ToolSearch", toolCallId: "call_ToolSearch01", state: "output-available", input: { query: "select:mcp__postgres__execute_sql", max_results: 3 }, output: "Loaded schema: mcp__postgres__execute_sql." },
      ],
    },
    {
      id: "x-review-text",
      role: "assistant",
      turnId: "x-turn-review",
      provenance: { timestamp: "2026-07-15T09:22:41Z", source: "codex", agentId: "x-root" },
      parts: [{ type: "text", text: "Reference reviewed. The unified schema already models Codex tool parts identically to Claude's, so a parallel fixture with codex tool names is enough." }],
    },

    // Turn 2 — plan: update_plan + exploration.
    {
      id: "x-plan-tools",
      role: "assistant",
      turnId: "x-turn-plan",
      provenance: { timestamp: "2026-07-15T09:24:30Z", source: "codex", model: "gpt-5.1-codex-max", reasoningEffort: "medium", agentId: "x-root" },
      parts: [
        { type: "dynamic-tool", toolName: "update_plan", toolCallId: "call_UpdatePlan01", state: "output-available", input: { plan: [{ step: "Read the unified schema", status: "completed" }, { step: "Draft codex-complete.ts", status: "in_progress" }, { step: "Run typecheck + tests", status: "pending" }] }, output: "Plan updated (1 completed, 1 in_progress, 1 pending)." },
        { type: "dynamic-tool", toolName: "exec_command", toolCallId: "call_Exec02", state: "output-available", input: { command: "sed -n '193,228p' packages/ui/src/data/ai/SessionViewer.unified.ts" }, output: "UnifiedSessionInput fields: id, source, provider, backend, model, turns, messages, agents, plan, approvals, health, live." },
      ],
    },
    {
      id: "x-plan-text",
      role: "assistant",
      turnId: "x-turn-plan",
      provenance: { timestamp: "2026-07-15T09:31:58Z", source: "codex", agentId: "x-reviewer" },
      parts: [{ type: "text", text: "Plan ready. Implementing the fixture with one turn per status and the codex tool set." }],
    },

    // Turn 3 — implement: apply_patch (approved/pending/denied), exec_command.
    {
      id: "x-impl-tools",
      role: "assistant",
      turnId: "x-turn-implement",
      provenance: { timestamp: "2026-07-15T09:33:15Z", source: "codex", model: "gpt-5.1-codex-max", reasoningEffort: "high", agentId: "x-root" },
      parts: [
        { type: "reasoning", text: "apply_patch is Codex's single file-mutation tool. I'll add the fixture, update the barrel, then run the checks — one patch each." },
        { type: "dynamic-tool", toolName: "apply_patch", toolCallId: "call_ApplyPatch01", state: "output-available", input: { patch: "*** Begin Patch\n*** Add File: packages/ui/src/data/ai/examples/sessions/codex-complete.ts\n+export const CODEX_COMPLETE_SESSION = {};\n*** End Patch" }, output: "Added codex-complete.ts (1 hunk, +1)." },
        { type: "dynamic-tool", toolName: "apply_patch", toolCallId: "call_ApplyPatch02", state: "approval-responded", input: { patch: "*** Begin Patch\n*** Update File: packages/ui/src/data/ai/examples/sessions/index.ts\n@@\n+export { CODEX_COMPLETE_SESSION } from \"./codex-complete\";\n*** End Patch" }, approval: { id: "approval-index", approved: true, reason: "trusted in-repo edit" }, output: "Updated index.ts (1 hunk, +1)." },
        { type: "dynamic-tool", toolName: "apply_patch", toolCallId: "call_ApplyPatch03", state: "output-denied", input: { patch: "*** Begin Patch\n*** Update File: /Users/moshe/.codex/config.toml\n@@\n+approval_policy = \"never\"\n*** End Patch" }, approval: { id: "approval-config", approved: false, reason: "do not edit the global codex config" }, output: "Denied by user — patch outside the workspace." },
        { type: "dynamic-tool", toolName: "exec_command", toolCallId: "call_Exec03", state: "output-available", input: { command: "pnpm exec tsc -b --pretty false packages/ui" }, output: "Done — 0 type errors." },
      ],
    },
    {
      id: "x-impl-text",
      role: "assistant",
      turnId: "x-turn-implement",
      provenance: { timestamp: "2026-07-15T09:52:04Z", source: "codex", agentId: "x-root" },
      parts: [{ type: "text", text: "Fixture and barrel export landed; typecheck is clean. The config patch was correctly refused." }],
    },

    // Turn 4 — verify: shell tests, a pending approval, an errored exec.
    {
      id: "x-verify-tools",
      role: "assistant",
      turnId: "x-turn-verify",
      provenance: { timestamp: "2026-07-15T09:53:40Z", source: "codex", model: "gpt-5.1-codex-max", reasoningEffort: "low", agentId: "x-root" },
      parts: [
        { type: "dynamic-tool", toolName: "exec_command", toolCallId: "call_Exec04", state: "output-available", input: { command: "pnpm --filter @flanksource/clicky-ui test examples/sessions/complete" }, output: "✓ 4 passed (complete.test.ts)" },
        { type: "dynamic-tool", toolName: "exec_command", toolCallId: "call_Exec05", state: "approval-requested", input: { command: "pnpm run build && git clean -xdf packages/ui/dist", cwd: "/Users/moshe/go/src/github.com/flanksource/clicky-ui" }, approval: { id: "approval-clean", pending: true }, pending: true, output: "" },
        { type: "dynamic-tool", toolName: "exec_command", toolCallId: "call_Exec06", state: "output-error", input: { command: "pnpm --filter storybook test SessionInspector" }, output: "Error: exit 1 — 1 test failed (flaky chromium launch); see logs." },
        { type: "dynamic-tool", toolName: "web_search", toolCallId: "call_WebSearch01", state: "output-available", input: { query: "codex cli rollout jsonl session format" }, output: "Codex writes rollout-<ts>-<uuid>.jsonl with session_meta, response_item, and event_msg records." },
      ],
    },
    {
      id: "x-verify-text",
      role: "assistant",
      turnId: "x-turn-verify",
      provenance: { timestamp: "2026-07-15T10:03:11Z", source: "codex", agentId: "x-root" },
      parts: [{ type: "text", text: "Unit tests pass. The storybook chromium launch flaked once; the destructive clean is awaiting your approval." }],
    },

    // Turn 5 — MCP tools + external providers.
    {
      id: "x-mcp-tools",
      role: "assistant",
      turnId: "x-turn-mcp",
      provenance: { timestamp: "2026-07-15T10:04:20Z", source: "codex", model: "gpt-5.1-codex-max", reasoningEffort: "minimal", agentId: "x-root" },
      parts: [
        { type: "dynamic-tool", toolName: "mcp__codex__codex", toolCallId: "call_McpCodex01", state: "output-available", input: { prompt: "Summarize the coverage matrix", model: "gpt-5.1-codex-max" }, output: "All 7 turn statuses and every codex tool are represented." },
        { type: "dynamic-tool", toolName: "mcp__gemini-cli__gemini", toolCallId: "call_McpGemini01", state: "output-available", input: { prompt: "Cross-check the openai error shape (429).", model: "gemini-2.5-pro" }, output: "429 rate_limit_exceeded carries retry_after; matches the fixture." },
        { type: "dynamic-tool", toolName: "mcp__postgres__execute_sql", toolCallId: "call_McpPg01", state: "output-available", input: { sql: "select backend, avg(total_tokens) from turns group by 1" }, output: "codex 200795 | claude 1287915" },
        { type: "dynamic-tool", toolName: "mcp__open-knowledge__search", toolCallId: "call_McpKnow01", state: "output-available", input: { query: "codex approval policy on-request" }, output: "on-request prompts per exec/apply_patch; the fixture models that via approval-requested." },
      ],
    },
    {
      id: "x-mcp-text",
      role: "assistant",
      turnId: "x-turn-mcp",
      provenance: { timestamp: "2026-07-15T10:11:26Z", source: "codex", agentId: "x-root" },
      parts: [{ type: "text", text: "Cross-checks complete. Output truncated here — the turn hit the max output-token limit." }],
    },

    // Turn 6 — error turn: system notice + synthetic 429 API-error entry.
    {
      id: "x-system-notice",
      role: "system",
      turnId: "x-turn-error",
      provenance: { timestamp: "2026-07-15T10:11:55Z", source: "codex", agentId: "x-root" },
      parts: [{ type: "text", text: "Rate limit reached for gpt-5.1-codex-max. Backing off before retry." }],
    },
    {
      id: "x-api-error",
      role: "assistant",
      turnId: "x-turn-error",
      provenance: { timestamp: "2026-07-15T10:12:40Z", source: "codex", agentId: "x-root", apiErrorStatus: 429, uuid: "9a061d4e-8b7c-4f2f-b3a5-2f3a5b8e2a41" },
      parts: [{ type: "text", text: "OpenAI request failed: 429 rate_limit_exceeded." }],
      raw: { type: "assistant", isApiErrorMessage: true, error: "rate_limit", apiErrorStatus: 429 },
    },
    {
      id: "x-error-text",
      role: "assistant",
      turnId: "x-turn-error",
      provenance: { timestamp: "2026-07-15T10:14:03Z", source: "codex", agentId: "x-root" },
      parts: [{ type: "text", text: "Hit the OpenAI rate limit; the retry window is 20s. Will resume automatically." }],
    },

    // Turn 7 — cancelled turn: interrupted while awaiting approval.
    {
      id: "x-cancel-tools",
      role: "assistant",
      turnId: "x-turn-cancel",
      provenance: { timestamp: "2026-07-15T10:14:50Z", source: "codex", model: "gpt-5.1-codex-max", reasoningEffort: "medium", agentId: "x-root" },
      parts: [{ type: "dynamic-tool", toolName: "exec_command", toolCallId: "call_Exec07", state: "approval-requested", input: { command: "git commit -am 'feat(ui): codex coverage transcript'", cwd: "/Users/moshe/go/src/github.com/flanksource/clicky-ui" }, approval: { id: "approval-commit", pending: true }, pending: true, output: "" }],
    },
    {
      id: "x-cancel-text",
      role: "assistant",
      turnId: "x-turn-cancel",
      provenance: { timestamp: "2026-07-15T10:18:52Z", source: "codex", agentId: "x-root" },
      parts: [{ type: "text", text: "Interrupted by the user before the commit approval resolved. Work preserved on the branch." }],
    },
  ],

  // ── Agent hierarchy, files, plan, approvals, health, live process ─────────
  root: {
    id: "x-root",
    isRoot: true,
    type: "coding-agent",
    desc: "Codex coverage transcript",
    historyFile: "/Users/moshe/.codex/sessions/2026/07/15/rollout-2026-07-15T09-12-04-5b8e2a41-7c3d-4f19-9a06-1d4e8b7c2f3a.jsonl",
    usage: { inputTokens: 168_420, outputTokens: 9_940, totalTokens: 1_405_568 },
    children: [
      { id: "x-reviewer", parentId: "x-root", type: "reviewer", desc: "Schema parity review", usage: { outputTokens: 1_200, totalTokens: 88_400 } },
    ],
  },
  agents: [
    { id: "x-root", isRoot: true, type: "coding-agent", desc: "Codex coverage transcript" },
    { id: "x-reviewer", parentId: "x-root", type: "reviewer", desc: "Schema parity review" },
  ],
  files: {
    read: [
      "packages/ui/src/data/ai/SessionViewer.unified.ts",
      "packages/ui/src/data/ai/examples/sessions/codex.ts",
    ],
    written: [
      "packages/ui/src/data/ai/examples/sessions/codex-complete.ts",
      "packages/ui/src/data/ai/examples/sessions/index.ts",
    ],
  },
  plan: {
    path: "/Users/moshe/go/src/github.com/flanksource/clicky-ui/.codex/plans/codex-transcript-coverage.md",
    slug: "codex-transcript-coverage",
    explicit: true,
    content: "# Codex coverage transcript\n\n1. Read the unified schema and existing codex fixture.\n2. Add codex-complete.ts with one turn per status.\n3. Typecheck and run the coverage test.",
    events: [
      { kind: "write", timestamp: "2026-07-15T09:24:30Z" },
      { kind: "exit", timestamp: "2026-07-15T09:31:58Z", reason: "approved" },
    ],
  },
  approvals: {
    approved: 6,
    denied: 1,
    denials: [
      { toolUseId: "call_ApplyPatch03", tool: "apply_patch", reason: "do not edit the global codex config" },
    ],
  },
  events: [
    { type: "plan_updated", scope: "turn", turnId: "x-turn-plan", timestamp: "2026-07-15T09:24:30Z" },
    { type: "rate_limit", scope: "session", turnId: "x-turn-error", timestamp: "2026-07-15T10:11:55Z", data: { status: 429, retryAfter: 20 } },
    { type: "token_count", scope: "session", timestamp: "2026-07-15T10:11:26Z", data: { used: 168_400, window: 272_000 } },
  ],
  health: [
    { kind: "context_pressure", severity: "warning", message: "Context is 62% full" },
    { kind: "rate_limit", severity: "error", message: "A turn failed with HTTP 429 (rate_limit_exceeded)" },
    { kind: "flaky_test", severity: "info", message: "One storybook chromium launch flaked" },
  ],
  live: {
    active: false,
    pid: 4821,
    status: "completed",
    startedAt: "2026-07-15T09:12:04Z",
    cwd: "/Users/moshe/go/src/github.com/flanksource/clicky-ui",
    command: "codex --model gpt-5.1-codex-max",
  },
};
