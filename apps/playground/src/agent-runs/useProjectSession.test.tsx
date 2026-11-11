import { cleanup, renderHook, waitFor, act } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { fetchAgentProjects, fetchCaptainSessions, setPageAgentRoute } from "./agent-runs-api";
import { saveProjectSession } from "./project-session";
import { useProjectSession } from "./useProjectSession";

vi.mock("./agent-runs-api", () => ({ fetchAgentProjects: vi.fn(), fetchCaptainSessions: vi.fn(), setPageAgentRoute: vi.fn() }));
afterEach(() => { cleanup(); localStorage.clear(); vi.resetAllMocks(); });

it("binds the remembered project session on every page and restores another project's target", async () => {
  const first = { kind: "managed" as const, sessionId: "a", label: "A" };
  const second = { kind: "captain" as const, sessionId: "b", label: "B" };
  saveProjectSession({ project: "/work/a", projects: { "/work/a": { target: first }, "/work/b": { target: second } } });
  vi.mocked(fetchAgentProjects).mockResolvedValue({ defaultProject: "/work/a", projects: ["a", "b"].map(name => ({ value: name, label: name, path: `/work/${name}` })) });
  vi.mocked(setPageAgentRoute).mockResolvedValue({ target: { kind: "playground" }, autoRun: false });
  vi.mocked(fetchCaptainSessions).mockResolvedValue([{ id: "b", title: "B", source: "example", inCmux: false }]);
  const data = { settings: { grouping: "shared" as const }, sessions: [], pages: {} };
  const hook = renderHook(({ page }) => useProjectSession(true, page, data), { initialProps: { page: "external:first" } });
  await waitFor(() => expect(hook.result.current.ready).toBe(true));
  expect(setPageAgentRoute).toHaveBeenLastCalledWith("external:first", { target: first });
  hook.rerender({ page: "external:second" });
  await waitFor(() => expect(setPageAgentRoute).toHaveBeenLastCalledWith("external:second", { target: first }));
  act(() => hook.result.current.remember({ project: "/work/b" }));
  await waitFor(() => expect(hook.result.current.ready).toBe(true));
  expect(setPageAgentRoute).toHaveBeenLastCalledWith("external:second", { target: second });
});

it("blocks delivery when restoring a saved target fails", async () => {
  saveProjectSession({ project: "/work/a", projects: { "/work/a": { target: { kind: "managed", sessionId: "ended", label: "Ended" } } } });
  vi.mocked(fetchAgentProjects).mockResolvedValue({ defaultProject: "/work/a", projects: [{ value: "a", label: "A", path: "/work/a" }] });
  vi.mocked(setPageAgentRoute).mockRejectedValue(new Error("Session ended"));
  const hook = renderHook(() => useProjectSession(true, "external:first", { settings: { grouping: "shared" }, sessions: [], pages: {} }));
  await waitFor(() => expect(hook.result.current.error).toContain("Session ended"));
  expect(hook.result.current.ready).toBe(false);
  expect(hook.result.current.target).toMatchObject({ sessionId: "ended" });
});
