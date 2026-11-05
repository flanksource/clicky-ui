import type {
  AgentSession,
  AgentSessionGrouping,
  AgentSessionRuntime,
  AgentSessionSettings,
  AgentSessionsFile,
  AgentTarget,
  CaptainAgentTarget,
  SessionAgentTarget,
} from "../../plugins/agent-session-store";
import type { CaptainSessionOption } from "../../plugins/agent-runs-server";
import { request } from "../comments/useComments";

export type {
  AgentSession,
  AgentSessionGrouping,
  AgentSessionRuntime,
  AgentSessionSettings,
  AgentSessionsFile,
  AgentTarget,
  CaptainAgentTarget,
  SessionAgentTarget,
  CaptainSessionOption,
};

export const AGENT_SESSIONS_ROUTE = "/__playground/agent-sessions";
export const AGENT_PROXY_ROUTE = "/__playground/agent-runs";

export type AgentProject = { value: string; label: string; path: string };
export function fetchAgentProjects(): Promise<{
  projects: AgentProject[];
  defaultProject: string;
}> {
  return request(`${AGENT_SESSIONS_ROUTE}/projects`);
}
export function createAgentSession(options: {
  page: string;
  project: string;
  runtime: AgentSessionRuntime;
}): Promise<{ session: AgentSession; settings: AgentSessionSettings }> {
  return request(`${AGENT_SESSIONS_ROUTE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });
}

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

/** Live captain sessions a page's threads can be delivered into. */
export async function fetchCaptainSessions(page?: string): Promise<CaptainSessionOption[]> {
  const { sessions } = await request<{ sessions: CaptainSessionOption[] }>(
    `${AGENT_SESSIONS_ROUTE}/captain${page ? `?${new URLSearchParams({ page })}` : ""}`,
  );
  return sessions;
}

/** Sends `page`'s threads to a live captain session, or back to the playground's own. */
export async function setPageAgentTarget(
  page: string,
  target: AgentTarget,
): Promise<AgentSessionSettings> {
  const { settings } = await request<{ settings: AgentSessionSettings }>(
    `${AGENT_SESSIONS_ROUTE}/targets`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page, target }),
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
