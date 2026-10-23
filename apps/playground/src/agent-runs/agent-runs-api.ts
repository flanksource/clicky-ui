import type {
  AgentSession,
  AgentSessionGrouping,
  AgentSessionRuntime,
  AgentSessionSettings,
  AgentSessionsFile,
} from "../../plugins/agent-session-store";
import { request } from "../comments/useComments";

export type {
  AgentSession,
  AgentSessionGrouping,
  AgentSessionRuntime,
  AgentSessionSettings,
  AgentSessionsFile,
};

export const AGENT_SESSIONS_ROUTE = "/__playground/agent-sessions";
export const AGENT_PROXY_ROUTE = "/__playground/agent-runs";

export function agentSessionSrc(sessionId: string): string {
  return `${AGENT_PROXY_ROUTE}/sessions/${encodeURIComponent(sessionId)}`;
}

/** Settings plus every stored session, running ones verified against captain. */
export function fetchAgentSessions(): Promise<AgentSessionsFile> {
  return request<AgentSessionsFile>(AGENT_SESSIONS_ROUTE);
}

export async function updateAgentSessionSettings(
  patch: Partial<AgentSessionSettings>,
): Promise<AgentSessionSettings> {
  const { settings } = await request<{ settings: AgentSessionSettings }>(
    `${AGENT_SESSIONS_ROUTE}/settings`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    },
  );
  return settings;
}

export async function stopAgentSession(runId: string): Promise<void> {
  await request(`${AGENT_PROXY_ROUTE}/runs/${encodeURIComponent(runId)}/stop`, {
    method: "POST",
  });
}

/** Stops the session if it is running and forgets it; its page's next thread starts a new one. */
export async function forgetAgentSession(runId: string): Promise<void> {
  await request(
    `${AGENT_SESSIONS_ROUTE}/sessions/${encodeURIComponent(runId)}`,
    { method: "DELETE" },
  );
}
