import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AgentRunsProvider, AgentSessionButton, useAgentRuns } from "./AgentRunsProvider";
import { fetchAgentSessions, fetchCaptainSessions, setPageAgentTarget, type AgentSessionsFile, type AgentTarget } from "./agent-runs-api";

vi.mock("./agent-runs-api", async importOriginal => ({
  ...await importOriginal<typeof import("./agent-runs-api")>(),
  fetchAgentSessions: vi.fn(),
  fetchCaptainSessions: vi.fn(),
  setPageAgentTarget: vi.fn(),
}));
const FIRST = { id: "session-a", source: "codex", title: "Review changes", model: "example-model", inCmux: false };
const SECOND = { id: "session-b", source: "claude", title: "Fix layout", model: "example-model", inCmux: false };
let data: AgentSessionsFile;
beforeEach(() => {
  data = { settings: { grouping: "shared", autoRun: false }, sessions: [] };
  vi.mocked(fetchAgentSessions).mockImplementation(async () => data);
  vi.mocked(fetchCaptainSessions).mockResolvedValue([FIRST, SECOND]);
  vi.mocked(setPageAgentTarget).mockImplementation(async (page, target: AgentTarget) => {
    const targets = { ...data.settings.targets };
    if (target.kind === "captain") targets[page] = target;
    else delete targets[page];
    data = { ...data, settings: { ...data.settings, targets } };
    return data.settings;
  });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

function SessionControls({ page, runAgent }: { page?: string; runAgent: () => Promise<void> }) {
  return <AgentRunsProvider {...(page ? { page } : {})} runAgent={runAgent}><AgentSessionButton /></AgentRunsProvider>;
}
function FailedThread() {
  return <>{useAgentRuns().renderRunDetails({ id: "failed", page: "other", body: "Fix toolbar", author: null, createdAt: "2026-11-03", agentRun: { requestedAt: "2026-11-03", state: "error", error: "Delivery failed" } } as import("@flanksource/clicky-ui").Comment & { page: string })}</>;
}

describe("page agent target controls", () => {
  it("combines project and agent filters while retaining creation and the default target", async () => {
    const project = "/work/example";
    vi.mocked(fetchCaptainSessions).mockResolvedValue([{ ...FIRST, cwd: project }, { ...SECOND, cwd: "/work/other" }]);
    render(<SessionControls page="welcome" runAgent={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Agent sessions" }));
    const picker = await screen.findByRole("combobox", { name: "Send comments to" });
    await waitFor(() => expect(picker.hasAttribute("disabled")).toBe(false));
    fireEvent.click(picker);
    await screen.findByRole("option", { name: /Review changes/ });
    fireEvent.change(screen.getByRole("combobox", { name: "Filter sessions by project" }), { target: { value: project } });
    expect(screen.queryByRole("option", { name: /Fix layout/ })).toBeNull();
    fireEvent.change(screen.getByRole("combobox", { name: "Filter sessions by agent" }), { target: { value: SECOND.source } });
    expect(screen.queryByRole("option", { name: /Review changes/ })).toBeNull();
    expect(screen.getByRole("option", { name: /Playground agent/ })).toBeDefined();
    expect(screen.getByRole("button", { name: "New session…" })).toBeDefined();
    expect(setPageAgentTarget).not.toHaveBeenCalled();
  });
  it("changes a page's Captain session and returns it to the playground agent without sending", async () => {
    const runAgent = vi.fn();
    render(<SessionControls page="welcome" runAgent={runAgent} />);
    fireEvent.click(screen.getByRole("button", { name: "Agent sessions" }));
    const picker = await screen.findByRole("combobox", { name: "Send comments to" });
    await waitFor(() => expect(picker.hasAttribute("disabled")).toBe(false));
    fireEvent.click(picker);
    fireEvent.mouseDown(await screen.findByRole("option", { name: /Review changes/ }));
    await waitFor(() => expect(setPageAgentTarget).toHaveBeenLastCalledWith("welcome", { kind: "captain", sessionId: FIRST.id, label: "Review changes · codex" }));
    await waitFor(() => expect(picker.hasAttribute("disabled")).toBe(false));
    fireEvent.click(picker);
    fireEvent.mouseDown(await screen.findByRole("option", { name: /Fix layout/ }));
    await waitFor(() => expect(setPageAgentTarget).toHaveBeenLastCalledWith("welcome", { kind: "captain", sessionId: SECOND.id, label: "Fix layout · claude" }));
    await waitFor(() => expect(picker.hasAttribute("disabled")).toBe(false));
    fireEvent.click(picker);
    fireEvent.mouseDown(await screen.findByRole("option", { name: /Playground agent/ }));
    await waitFor(() => expect(setPageAgentTarget).toHaveBeenLastCalledWith("welcome", { kind: "playground" }));
    expect(runAgent).not.toHaveBeenCalled();
  });
  it("shows the saved target for each page when navigating", async () => {
    data.settings.targets = { welcome: { kind: "captain", sessionId: FIRST.id, label: "Review changes · codex" }, other: { kind: "captain", sessionId: SECOND.id, label: "Fix layout · claude" } };
    const runAgent = vi.fn();
    const view = render(<SessionControls page="welcome" runAgent={runAgent} />);
    fireEvent.click(screen.getByRole("button", { name: "Agent sessions" }));
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Send comments to" }).textContent).toContain("Review changes · codex"));
    view.rerender(<SessionControls page="other" runAgent={runAgent} />);
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Send comments to" }).textContent).toContain("Fix layout · claude"));
    expect(setPageAgentTarget).not.toHaveBeenCalled();
  });
  it("does not offer page targeting on the global comments dashboard", async () => {
    render(<SessionControls runAgent={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Agent sessions" }));
    await screen.findByText("No agent session yet.", { exact: false });
    expect(screen.queryByRole("combobox", { name: "Send comments to" })).toBeNull();
  });
  it("saves the failed thread's page target before retrying, including from the dashboard", async () => {
    const runAgent = vi.fn().mockResolvedValue(undefined);
    render(<AgentRunsProvider runAgent={runAgent}><FailedThread /></AgentRunsProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Send failed" }));
    fireEvent.click(screen.getByRole("button", { name: "Send to another target" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: /Fix layout/ }));
    await waitFor(() => expect(runAgent).toHaveBeenCalledWith("failed", undefined));
    expect(setPageAgentTarget).toHaveBeenCalledWith("other", { kind: "captain", sessionId: SECOND.id, label: "Fix layout · claude" });
    expect(vi.mocked(setPageAgentTarget).mock.invocationCallOrder[0]).toBeLessThan(runAgent.mock.invocationCallOrder[0]!);
  });
  it("does not send if saving the new target fails, and retries that choice on the next attempt", async () => {
    vi.mocked(setPageAgentTarget).mockRejectedValueOnce(new Error("Could not save target"));
    const runAgent = vi.fn().mockResolvedValue(undefined);
    render(<AgentRunsProvider runAgent={runAgent}><FailedThread /></AgentRunsProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Send failed" }));
    fireEvent.click(screen.getByRole("button", { name: "Send to another target" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: /Fix layout/ }));
    await screen.findByText("Could not save target", { selector: "pre" });
    expect(runAgent).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Retry send" }));
    await waitFor(() => expect(runAgent).toHaveBeenCalledOnce());
    expect(setPageAgentTarget).toHaveBeenNthCalledWith(2, "other", { kind: "captain", sessionId: SECOND.id, label: "Fix layout · claude" });
  });
});
