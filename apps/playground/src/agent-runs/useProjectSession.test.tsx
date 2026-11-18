import { cleanup, renderHook, waitFor, act } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { fetchAgentProjects, fetchCaptainSessions, type AgentSession, type AgentSessionsView } from "./agent-runs-api";
import { saveProjectSession } from "./project-session";
import { useProjectSession } from "./useProjectSession";

vi.mock("./agent-runs-api", () => ({ fetchAgentProjects: vi.fn(), fetchCaptainSessions: vi.fn() }));
afterEach(() => { cleanup(); localStorage.clear(); vi.resetAllMocks(); });

const running = (sessionId: string): AgentSession => ({ runId: `run-${sessionId}`, sessionId, page: "external:first", runtime: { spec: { model: "example-model" } }, startedAt: "2026-11-04T12:00:00Z", state: "running" });
const viewWith = (...sessions: AgentSession[]): AgentSessionsView => ({ settings: { grouping: "shared" }, sessions, pages: {} });
const projects = (...names: string[]) => ({ defaultProject: `/work/${names[0]}`, projects: names.map(name => ({ value: name, label: name, path: `/work/${name}` })) });

it("binds the remembered project session on every page and restores another project's target, all in the browser", async () => {
  const first = { kind: "managed" as const, sessionId: "a", label: "A" };
  const second = { kind: "captain" as const, sessionId: "b", label: "B" };
  saveProjectSession({ project: "/work/a", projects: { "/work/a": { target: first }, "/work/b": { target: second } } });
  vi.mocked(fetchAgentProjects).mockResolvedValue(projects("a", "b"));
  vi.mocked(fetchCaptainSessions).mockResolvedValue([{ id: "b", title: "B", source: "example", inCmux: false }]);
  const data = viewWith(running("a"));
  const hook = renderHook(({ page }) => useProjectSession(true, page, data), { initialProps: { page: "external:first" } });
  await waitFor(() => expect(hook.result.current.ready).toBe(true));
  expect(hook.result.current.target).toEqual(first);
  hook.rerender({ page: "external:second" });
  await waitFor(() => expect(hook.result.current.ready).toBe(true));
  act(() => hook.result.current.remember({ project: "/work/b" }));
  await waitFor(() => expect(hook.result.current.ready).toBe(true));
  expect(hook.result.current).toMatchObject({ project: "/work/b", target: second, error: null });
  expect(fetchCaptainSessions).toHaveBeenCalledWith();
});

it.each([
  ["a managed session that is no longer running", { kind: "managed" as const, sessionId: "ended", label: "Ended" }, "Ended is no longer running; switch or create a session"],
  ["a captain session that is no longer live", { kind: "captain" as const, sessionId: "gone", label: "Gone" }, "Gone is no longer live; switch or create a session"],
])("blocks delivery when the saved target is %s", async (_label, target, message) => {
  saveProjectSession({ project: "/work/a", projects: { "/work/a": { target } } });
  vi.mocked(fetchAgentProjects).mockResolvedValue(projects("a"));
  vi.mocked(fetchCaptainSessions).mockResolvedValue([]);
  const hook = renderHook(() => useProjectSession(true, "external:first", viewWith(running("other"))));
  await waitFor(() => expect(hook.result.current.error).toContain(message));
  expect(hook.result.current.ready).toBe(false);
  expect(hook.result.current.target).toMatchObject({ sessionId: target.sessionId });
});
