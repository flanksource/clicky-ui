import { useEffect, useState } from "react";
import { fetchAgentProjects, fetchCaptainSessions, type AgentSessionRuntime, type AgentTarget, type AgentSessionsView } from "./agent-runs-api";
import { readProjectSession, saveProjectSession, type ProjectSessions } from "./project-session";

export function useProjectSession(enabled: boolean, page: string | undefined, data: AgentSessionsView | null) {
  const [preferences, setPreferences] = useState<ProjectSessions>({ project: "", projects: {} });
  const [error, setError] = useState<string | null>(null);
  const [bound, setBound] = useState("");
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    fetchAgentProjects().then(result => {
      if (!active) return;
      const saved = readProjectSession();
      if (!saved.project) saved.project = result.defaultProject;
      setPreferences(saved);
      if (!result.projects.some(project => project.path === saved.project)) throw new Error(`Saved project ${saved.project} is unavailable; choose a project`);
      saveProjectSession(saved);
    }).catch((cause: unknown) => { if (active) setError(String(cause)); });
    return () => { active = false; };
  }, [enabled]);
  useEffect(() => {
    if (!enabled) return;
    const update = () => { try { setPreferences(readProjectSession()); } catch (cause) { setError(String(cause)); } };
    window.addEventListener("storage", update);
    return () => window.removeEventListener("storage", update);
  }, [enabled]);
  const current = preferences.projects[preferences.project];
  const target = current?.target;
  const binding = JSON.stringify([page, preferences.project, target]);
  useEffect(() => {
    if (!enabled || !page || !data || !preferences.project) return;
    let active = true;
    if (!target) { setBound(binding); return; }
    const validate = async () => {
      if (target.kind === "captain" && !(await fetchCaptainSessions()).some(session => session.id === target.sessionId || session.captainId === target.sessionId)) throw new Error(`${target.label} is no longer live; switch or create a session`);
      if (target.kind === "managed" && !data.sessions.some(session => session.sessionId === target.sessionId && session.state === "running") && !(await fetchCaptainSessions()).some(session => session.managed && session.id === target.sessionId)) throw new Error(`${target.label} is no longer running; switch or create a session`);
    };
    validate().then(() => {
      if (active) { setBound(binding); setError(null); }
    }).catch((cause: unknown) => { if (active) setError(String(cause)); });
    return () => { active = false; };
  }, [enabled, page, Boolean(data), binding]);
  function remember(patch: { project?: string; target?: AgentTarget; runtime?: AgentSessionRuntime }) {
    const project = patch.project ?? preferences.project;
    if (!project) throw new Error("Select a project first");
    const next = { project, projects: { ...preferences.projects, [project]: { ...preferences.projects[project], ...(patch.target ? { target: patch.target } : {}), ...(patch.runtime ? { runtime: patch.runtime } : {}) } } };
    saveProjectSession(next);
    setError(null);
    setPreferences(next);
  }
  return { project: preferences.project, target, runtime: current?.runtime, remember, error, ready: !enabled || (bound === binding && !!preferences.project && !error) };
}
