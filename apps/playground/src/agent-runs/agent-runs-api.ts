import type {
  AgentSession,
  AgentSessionGrouping,
  AgentSessionRuntime,
  AgentSessionSettings,
  AgentSessionsView,
  AgentTarget,
  CaptainAgentTarget,
  PageAgentState,
  SessionAgentTarget,
} from "../../plugins/agent-session-store";
import type { CaptainSessionOption } from "../../plugins/agent-runs-server";
import { request } from "../comments/useComments";

export type {
  AgentSession,
  AgentSessionGrouping,
  AgentSessionRuntime,
  AgentSessionSettings,
  AgentSessionsView,
  AgentTarget,
  CaptainAgentTarget,
  PageAgentState,
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
}): Promise<{ session: AgentSession }> {
  return request(`${AGENT_SESSIONS_ROUTE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });
}

export function agentSessionSrc(sessionId: string): string {
  return `${AGENT_PROXY_ROUTE}/sessions/${encodeURIComponent(sessionId)}`;
}

/** Settings, every stored session (running ones verified against captain), and with `page` whether gavel auto-runs its new comments. */
export function fetchAgentSessions(page?: string): Promise<AgentSessionsView> {
  return request<AgentSessionsView>(
    `${AGENT_SESSIONS_ROUTE}${page ? `?${new URLSearchParams({ page })}` : ""}`,
  );
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

/**
 * Live captain sessions a page's threads can be delivered into. `linked` are
 * sessions the browser chose for the page, which are listed even when they
 * work outside the page's directory.
 */
export async function fetchCaptainSessions(page?: string, linked: string[] = []): Promise<CaptainSessionOption[]> {
  const query = new URLSearchParams(page ? { page } : {});
  for (const id of linked) query.append("linked", id);
  const search = query.toString();
  const { sessions } = await request<{ sessions: CaptainSessionOption[] }>(
    `${AGENT_SESSIONS_ROUTE}/captain${search ? `?${search}` : ""}`,
  );
  return sessions;
}

/**
 * Sets whether gavel delivers new human comments on `page` to the playground's
 * agent as they are created: the page's comment-agent entry in gavel's settings.
 */
export function setPageAutoRun(page: string, autoRun: boolean): Promise<PageAgentState> {
  return request<PageAgentState>(`${AGENT_SESSIONS_ROUTE}/auto-run`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page, autoRun }),
  });
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
