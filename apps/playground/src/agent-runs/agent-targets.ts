import type { AgentTarget, CaptainAgentTarget, CaptainSessionOption, SessionAgentTarget } from "./agent-runs-api";
export function captainAgentTarget(session: CaptainSessionOption): CaptainAgentTarget {
  return { kind: "captain", sessionId: session.id, label: `${session.title} · ${session.source}` };
}

const REMEMBERED_TARGET = "playground.agent-target";

/** Records the session target last chosen for any page; choosing the playground agent forgets it. */
export function rememberAgentTarget(target: AgentTarget) {
  if (target.kind === "playground") localStorage.removeItem(REMEMBERED_TARGET);
  else localStorage.setItem(REMEMBERED_TARGET, JSON.stringify(target));
}

export function rememberedAgentTarget(): SessionAgentTarget | null {
  const stored = localStorage.getItem(REMEMBERED_TARGET);
  if (stored === null) return null;
  const value: unknown = JSON.parse(stored);
  if (
    typeof value !== "object" || value === null ||
    !("kind" in value && (value.kind === "captain" || value.kind === "managed")) ||
    !("sessionId" in value && typeof value.sessionId === "string" && value.sessionId) ||
    !("label" in value && typeof value.label === "string")
  ) throw new Error(`localStorage ${REMEMBERED_TARGET} holds ${stored}, not a captain or managed session target`);
  return value as SessionAgentTarget;
}
