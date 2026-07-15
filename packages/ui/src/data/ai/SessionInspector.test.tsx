import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionInspector } from "./SessionInspector";
import type { UnifiedSessionInput } from "./SessionViewer.unified";

const FULL_SESSION: UnifiedSessionInput = {
  id: "session-parity",
  source: "claude",
  project: "captain",
  cwd: "/repo",
  historyFile: "/repo/.claude/session.jsonl",
  provider: "anthropic",
  version: "1.2.3",
  model: "claude-opus-4-8",
  git: { branch: "main", commit: "abc123" },
  startedAt: "2026-07-08T10:00:00Z",
  endedAt: "2026-07-08T10:05:00Z",
  usage: { inputTokens: 1000, outputTokens: 500, totalTokens: 1500 },
  cost: { inputCost: 0.01, outputCost: 0.02, totalTokens: 1500 },
  toolCosts: [{ model: "claude-opus-4-8", inputTokens: 1000, outputTokens: 500, inputCost: 0.01, outputCost: 0.02 }],
  context: { usedTokens: 1500, windowTokens: 1_000_000, freePercent: 99 },
  budget: { used: 0.03, total: 1 },
  capabilities: { tools: ["Read", "Bash"], agents: ["general-purpose"], skills: ["gavel-runner"] },
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
      stopReason: "end_turn",
      messageIds: ["m1"],
      usage: { inputTokens: 1000, outputTokens: 500 },
      cost: { inputCost: 0.01, outputCost: 0.02 },
      context: { usedTokens: 1500, windowTokens: 1_000_000, freePercent: 99 },
      events: [{ type: "budget_usd", scope: "turn", turnId: "turn-1" }],
    },
  ],
  root: {
    id: "root",
    isRoot: true,
    historyFile: "/repo/.claude/session.jsonl",
    children: [{ id: "agent-1", type: "general-purpose", desc: "Review parity" }],
  },
  agents: [{ id: "root", isRoot: true }, { id: "agent-1", type: "general-purpose", desc: "Review parity" }],
  files: { read: ["pkg/session/session.go"], written: ["pkg/cli/webapp/src/SessionBrowser.tsx"] },
  plan: {
    path: "/repo/.claude/plans/parity.md",
    content: "Implement parity panels",
    explicit: true,
    events: [{ kind: "exit", timestamp: "2026-07-08T10:03:00Z" }],
  },
  approvals: {
    approved: 2,
    denied: 1,
    denials: [{ toolUseId: "tool-1", tool: "Bash", reason: "Needs manual review" }],
  },
  health: [{ kind: "low_context", severity: "warning", message: "Context low" }],
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
  ],
};

describe("SessionInspector", () => {
  it("renders full unified session detail tabs", () => {
    render(
      <div className="h-[720px]">
        <SessionInspector session={FULL_SESSION} />
      </div>,
    );

    expect(screen.getByText("done")).toBeInTheDocument();
    expect(screen.getByText("turn turn-1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Turns" }));
    expect(screen.getByText("turn-1")).toBeInTheDocument();
    expect(screen.getByText("end_turn")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Agents" }));
    expect(screen.getByText("Root")).toBeInTheDocument();
    expect(screen.getByText("Review parity")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Files" }));
    expect(screen.getByText("pkg/session/session.go")).toBeInTheDocument();
    expect(screen.getByText("pkg/cli/webapp/src/SessionBrowser.tsx")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Plan" }));
    expect(screen.getByText("Implement parity panels")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Approvals" }));
    expect(screen.getByText("Needs manual review")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Costs" }));
    expect(screen.getAllByText("$0.03").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("radio", { name: "Metadata" }));
    expect(screen.getByText("/repo/.claude/session.jsonl")).toBeInTheDocument();
    expect(screen.getByText("anthropic")).toBeInTheDocument();
    fireEvent.click(screen.getByText(/4 keys/));
    expect(document.body.textContent).toContain("memory_citation");

    fireEvent.click(screen.getByRole("radio", { name: "Raw" }));
    expect(screen.getByText('"session-parity"')).toBeInTheDocument();
  });
});
