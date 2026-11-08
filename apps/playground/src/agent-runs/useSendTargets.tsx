import type { DropdownMenuItem } from "@flanksource/clicky-ui";
import { AgentIdentity } from "@flanksource/clicky-ui/chat";
import type { AgentSession, AgentTarget } from "./agent-runs-api";
import { captainAgentTarget } from "./agent-targets";
import { RuntimeIdentity } from "./RuntimeIdentity";
import { useCaptainSessions } from "./useCaptainSessions";

/** "Send to …" menu entries: the playground agent, running managed sessions and live captain sessions. */
export function useSendTargets({ managedSessions, onSelect }: { managedSessions: AgentSession[]; onSelect: (target: AgentTarget) => void }) {
  const { sessions, error } = useCaptainSessions();
  const items: DropdownMenuItem[] = [
    { label: "Send to Playground agent", onSelect: () => onSelect({ kind: "playground" }) },
    ...managedSessions.filter(session => session.purpose === "target" && session.state === "running").map(session => ({ label: <span className="flex items-center gap-2">Send to {session.label}<RuntimeIdentity runtime={session.runtime} /></span>, onSelect: () => onSelect({ kind: "managed", sessionId: session.sessionId, label: session.label! }) })),
    ...(sessions ?? []).map(session => ({ label: <span className="flex items-center gap-2">Send to {captainAgentTarget(session).label}<AgentIdentity {...(session.model ? { model: session.model } : { provider: session.source })} /></span>, title: session.cwd ?? session.id, onSelect: () => onSelect(captainAgentTarget(session)) })),
  ];
  return { items, error, loading: sessions === null && error === null };
}
