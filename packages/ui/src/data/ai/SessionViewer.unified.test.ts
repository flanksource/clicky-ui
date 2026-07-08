import { describe, expect, it } from "vitest";
import { getSessionMetadata, normalizeSession } from "./SessionViewer.model";
import type { SessionUIMessage, UnifiedSessionInput } from "./SessionViewer.unified";

// normalizeSession must flatten the unified SessionUIMessage[] into the same
// SessionEvent rows the legacy SessionEntry log produces: text/reasoning by
// role, tool parts with input+output merged, and provenance-derived metadata.
describe("normalizeSession (unified messages)", () => {
  const messages: SessionUIMessage[] = [
    { id: "u1", role: "user", parts: [{ type: "text", text: "hi" }] },
    {
      id: "a1",
      role: "assistant",
      provenance: { model: "claude-sonnet-5", cwd: "/repo", source: "claude", timestamp: "2026-07-06T00:00:00Z" },
      parts: [
        { type: "reasoning", text: "thinking…" },
        { type: "text", text: "on it" },
        {
          type: "dynamic-tool",
          toolName: "Read",
          toolCallId: "call_1",
          state: "output-available",
          input: { file_path: "a.ts" },
          output: "file contents",
        },
      ],
    },
  ];

  it("maps text parts to role events", () => {
    const events = normalizeSession(messages);
    expect(events[0]).toMatchObject({ kind: "user", text: "hi" });
    expect(events.find((e) => e.kind === "assistant")).toMatchObject({ text: "on it" });
  });

  it("maps a reasoning part to a thinking event", () => {
    const events = normalizeSession(messages);
    expect(events.find((e) => e.kind === "thinking")).toMatchObject({ text: "thinking…" });
  });

  it("maps a tool part with input+output and provenance metadata", () => {
    const tool = normalizeSession(messages).find((e) => e.kind === "tool");
    expect(tool).toMatchObject({
      tool: "Read",
      toolInput: { file_path: "a.ts" },
      toolResponse: "file contents",
      model: "claude-sonnet-5",
      cwd: "/repo",
      source: "claude",
    });
  });

  it("serializes a non-string tool output as JSON text", () => {
    const [tool] = normalizeSession([
      { role: "assistant", parts: [{ type: "dynamic-tool", toolName: "Bash", output: { code: 0 } }] },
    ]);
    expect(tool.toolResponse).toBe('{"code":0}');
  });

  it("emits an error event for a message flagged with an API error status", () => {
    const [err] = normalizeSession([
      { role: "assistant", provenance: { apiErrorStatus: 429 }, parts: [] },
    ]);
    expect(err).toMatchObject({ kind: "error", errorStatus: 429 });
    expect(err.text).toContain("429");
  });

  it("accepts a full unified session object and preserves session metadata separately", () => {
    const session: UnifiedSessionInput = {
      id: "s1",
      messages,
      turns: [{ id: "turn-1", index: 1, messageIds: ["u1", "a1"] }],
      capabilities: {
        tools: ["Read", "Bash"],
        pendingMcpServers: ["github"],
        agents: ["general-purpose"],
        skills: ["gavel-runner"],
      },
      budget: { used: 1.25, total: 5, remaining: 3.75 },
      context: { usedTokens: 1500, windowTokens: 1_000_000, freePercent: 99 },
      events: [{ type: "last-prompt", scope: "session" }],
    };

    expect(normalizeSession(session).map((e) => e.kind)).toEqual(
      normalizeSession(messages).map((e) => e.kind),
    );
    expect(getSessionMetadata(session)).toMatchObject({
      turns: [{ id: "turn-1" }],
      capabilities: { tools: ["Read", "Bash"], skills: ["gavel-runner"] },
      budget: { used: 1.25, total: 5 },
      context: { freePercent: 99 },
      events: [{ type: "last-prompt" }],
    });
  });
});
