import type { AgentSessionRuntime, AgentTarget } from "./agent-runs-api";

export type ProjectSessions = {
  project: string;
  projects: Record<string, { target?: AgentTarget; runtime?: AgentSessionRuntime }>;
};
const KEY = "playground.project-sessions";

export function readProjectSession(): ProjectSessions {
  const source = localStorage.getItem(KEY);
  if (source === null) return { project: "", projects: {} };
  const value = JSON.parse(source) as ProjectSessions;
  if (!value || typeof value.project !== "string" || !value.projects || typeof value.projects !== "object" || Array.isArray(value.projects)) throw new Error("Invalid playground project sessions");
  for (const entry of Object.values(value.projects)) {
    if (!entry || typeof entry !== "object") throw new Error("Invalid playground project sessions");
    const target = entry.target;
    if (target && target.kind !== "playground" && (!(target.kind === "managed" || target.kind === "captain") || typeof target.sessionId !== "string" || !target.sessionId || typeof target.label !== "string")) throw new Error("Invalid playground project sessions");
    if (entry.runtime && (!entry.runtime.spec || typeof entry.runtime.spec.model !== "string")) throw new Error("Invalid playground project sessions");
  }
  return value;
}

export function saveProjectSession(value: ProjectSessions) {
  localStorage.setItem(KEY, JSON.stringify(value));
}
