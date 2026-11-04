import { expect, it } from "vitest";
import { commentAgentSessions } from "./comment-agents";
import type { AgentSession, AgentSessionsFile } from "./agent-runs-api";
import type { PageComment } from "../comments/useComments";

const session = (id: string, page: string | null): AgentSession => ({ sessionId: id, runId: id, page, runtime: { spec: { model: "opus" } }, startedAt: "2026-11-04", state: "ended" });
it("retains historical thread IDs and merges matching page, target and shared associations", () => {
  const comment: PageComment = { id: "thread", body: "Review", createdAt: "2026-11-04", page: "example", author: { name: "Agent", sessionId: "historical" }, agentRun: { sessionId: "page", state: "done", requestedAt: "2026-11-04" } };
  const data: AgentSessionsFile = { settings: { autoRun: false, grouping: "shared", targets: { example: { kind: "captain", sessionId: "page", label: "Current" } } }, sessions: [session("page", "example"), session("other", "other"), session("shared", null)] };
  const result = commentAgentSessions([comment], data);
  expect(result.map(({ id, associations }) => ({ id, associations }))).toEqual([
    { id: "historical", associations: ["Author"] },
    { id: "page", associations: ["Thread hand-off", "Page target", "Page session"] },
    { id: "shared", associations: ["Shared session"] },
  ]);
  expect(result[0]?.session).toBeUndefined();
  expect(commentAgentSessions([comment], null).map(entry => entry.id)).toEqual(["historical", "page"]);
});
