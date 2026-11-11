import type {
  AgentSession,
  AgentSessionGrouping,
  AgentSessionRuntime,
  AgentSessionSettings,
  AgentSessionsView,
  AgentTarget,
  CaptainAgentTarget,
  PageAgentRoute,
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
  PageAgentRoute,
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
}): Promise<{ session: AgentSession; route: PageAgentRoute }> {
  return request(`${AGENT_SESSIONS_ROUTE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });
}

export function agentSessionSrc(sessionId: string): string {
  return `${AGENT_PROXY_ROUTE}/sessions/${encodeURIComponent(sessionId)}`;
}

/** Settings, every stored session (running ones verified against captain), and each page's gavel route. */
export function fetchAgentSessions(): Promise<AgentSessionsView> {
  return request<AgentSessionsView>(AGENT_SESSIONS_ROUTE);
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

/**
 * Sets where `page`'s threads go (a live session, or the playground's own
 * agent) and/or whether gavel delivers new comments there automatically. Both
 * live in the one gavel route under the page's comment target.
 */
export async function setPageAgentRoute(
  page: string,
  change: { target?: AgentTarget; autoRun?: boolean },
): Promise<PageAgentRoute> {
  const { route } = await request<{ route: PageAgentRoute }>(
    `${AGENT_SESSIONS_ROUTE}/targets`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page, ...change }),
    },
  );
  return route;
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
