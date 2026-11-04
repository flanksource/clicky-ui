import type { CaptainAgentTarget, CaptainSessionOption } from "./agent-runs-api";
export function captainAgentTarget(session: CaptainSessionOption): CaptainAgentTarget {
  return { kind: "captain", sessionId: session.id, label: `${session.title} · ${session.source}` };
}
