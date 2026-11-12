import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AgentRunsProvider, useAgentRuns } from "./AgentRunsProvider";
import { AgentSessionButton } from "./AgentSessionButton";
import { fetchAgentSessions, fetchCaptainSessions, setPageAutoRun, updateAgentSessionSettings, type AgentSessionsView, type AgentTarget } from "./agent-runs-api";
import { readPageTarget, rememberPageTarget } from "./page-targets";

vi.mock("./agent-runs-api", async importOriginal => ({
  ...await importOriginal<typeof import("./agent-runs-api")>(),
  fetchAgentSessions: vi.fn(),
  fetchCaptainSessions: vi.fn(),
  setPageAutoRun: vi.fn(),
  updateAgentSessionSettings: vi.fn(),
}));
const FIRST = { id: "session-a", source: "codex", title: "Review changes", model: "example-model", inCmux: false };
const SECOND = { id: "session-b", source: "claude", title: "Fix layout", model: "example-model", inCmux: false };
const RUNTIME = { spec: { model: "example-model" } };
const FIRST_TARGET = { kind: "captain" as const, sessionId: FIRST.id, label: "Review changes · codex" };
const SECOND_TARGET = { kind: "captain" as const, sessionId: SECOND.id, label: "Fix layout · claude" };
let data: AgentSessionsView;
beforeEach(() => {
  data = { settings: { grouping: "shared" }, sessions: [], pages: {} };
  vi.mocked(fetchAgentSessions).mockImplementation(async () => data);
  vi.mocked(fetchCaptainSessions).mockResolvedValue([FIRST, SECOND]);
  vi.mocked(updateAgentSessionSettings).mockImplementation(async patch => {
    data = { ...data, settings: { ...data.settings, ...patch } };
    return data.settings;
  });
  vi.mocked(setPageAutoRun).mockImplementation(async (page, autoRun) => {
    data = { ...data, pages: { ...data.pages, [page]: { autoRun } } };
    return { autoRun };
  });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.restoreAllMocks(); localStorage.clear(); });

function SessionControls({ page, runAgent }: { page?: string; runAgent: () => Promise<void> }) {
  return <AgentRunsProvider {...(page ? { page } : {})} runAgent={runAgent}><AgentSessionButton /></AgentRunsProvider>;
}
function FailedThread() {
  return <>{useAgentRuns().renderRunDetails({ id: "failed", page: "other", body: "Fix toolbar", author: null, createdAt: "2026-11-03", agentRun: { requestedAt: "2026-11-03", state: "error", error: "Delivery failed" } } as import("@flanksource/clicky-ui").Comment & { page: string })}</>;
}

describe("page agent target controls", () => {
  it("saves grouping and opens model configuration from the menu without sending a comment", async () => {
    const runAgent = vi.fn();
    render(<SessionControls runAgent={runAgent} />);
    fireEvent.click(screen.getByRole("button", { name: "Agent" }));
    fireEvent.click(await screen.findByRole("radio", { name: "Per page" }));
    await waitFor(() => expect(updateAgentSessionSettings).toHaveBeenCalledWith({ grouping: "page" }));
    await waitFor(() => expect(screen.getByRole("radio", { name: "Per page" }).getAttribute("aria-checked")).toBe("true"));
    expect(runAgent).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Choose playground model" }));
    await screen.findByRole("dialog", { name: "Agent runtime" });
    expect(screen.queryByRole("dialog", { name: "Agent" })).toBeNull();
  });
  describe("auto-run", () => {
    const openMenu = () => fireEvent.click(screen.getByRole("button", { name: "Agent" }));
    const toggleOf = () => screen.findByRole("switch", { name: "Auto-run new comments on this page" });

    it("switches a page on once the playground has a runtime, and shows gavel's answer", async () => {
      data.settings = { grouping: "shared", runtime: RUNTIME };
      render(<SessionControls page="welcome" runAgent={vi.fn()} />);
      openMenu();
      const toggle = await toggleOf();
      await waitFor(() => expect(toggle.getAttribute("aria-checked")).toBe("false"));

      fireEvent.click(toggle);

      await waitFor(() => expect(setPageAutoRun).toHaveBeenCalledWith("welcome", true));
      await waitFor(() => expect(screen.getByRole("switch", { name: "Auto-run new comments on this page" }).getAttribute("aria-checked")).toBe("true"));
      expect(screen.queryByRole("dialog", { name: "Agent runtime" })).toBeNull();
    });

    it("reads the toggle from the page's state and switches it off", async () => {
      data.settings = { grouping: "shared", runtime: RUNTIME };
      data.pages = { welcome: { autoRun: true } };
      render(<SessionControls page="welcome" runAgent={vi.fn()} />);
      openMenu();
      const toggle = await toggleOf();
      await waitFor(() => expect(toggle.getAttribute("aria-checked")).toBe("true"));

      fireEvent.click(toggle);

      await waitFor(() => expect(setPageAutoRun).toHaveBeenCalledWith("welcome", false));
      await waitFor(() => expect(screen.getByRole("switch", { name: "Auto-run new comments on this page" }).getAttribute("aria-checked")).toBe("false"));
    });

    it.each([
      ["a page on the playground agent", undefined],
      ["a page that sends its threads to a live session, which auto-run never uses", FIRST_TARGET],
    ])("asks for the playground agent's runtime first for %s", async (_label, chosen) => {
      if (chosen) rememberPageTarget("welcome", chosen);
      render(<SessionControls page="welcome" runAgent={vi.fn()} />);
      openMenu();
      const toggle = await toggleOf();
      await waitFor(() => expect(toggle.hasAttribute("disabled")).toBe(false));

      fireEvent.click(toggle);

      await screen.findByRole("dialog", { name: "Agent runtime" });
      expect(setPageAutoRun).not.toHaveBeenCalled();
    });

    it("is not offered where there is no page to route", async () => {
      render(<SessionControls runAgent={vi.fn()} />);
      openMenu();

      const toggle = await toggleOf();

      expect(toggle.hasAttribute("disabled")).toBe(true);
    });

    it("asks gavel about the page it is open on", async () => {
      render(<SessionControls page="welcome" runAgent={vi.fn()} />);
      await waitFor(() => expect(fetchAgentSessions).toHaveBeenCalledWith("welcome"));
    });
  });
  it("deduplicates live and managed sessions and leaves ended sessions in the history dialog", async () => {
    const managed = { runId: "run-a", sessionId: "captain-a", page: null, runtime: { spec: { model: "example-model" } }, startedAt: "2026-11-04T12:00:00Z", state: "running" as const };
    data.sessions = [managed, { ...managed, runId: "run-ended", sessionId: "ended", state: "ended" }];
    vi.mocked(fetchCaptainSessions).mockResolvedValue([{ ...FIRST, captainId: managed.sessionId }]);
    render(<SessionControls runAgent={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Agent" }));
    await screen.findByRole("button", { name: `Inspect session ${FIRST.id}` });
    expect(screen.getAllByRole("button", { name: /^Inspect session / })).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "Inspect session ended" })).toBeNull();
  });
  it("lists active sessions in the Agent menu and opens the clicked session", async () => {
    render(<SessionControls runAgent={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Agent" }));
    await screen.findByRole("button", { name: `Inspect session ${FIRST.id}` });
    expect(screen.getByRole("button", { name: `Inspect session ${SECOND.id}` })).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: "Session grouping" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Choose playground model" })).toBeTruthy();
    expect(screen.queryByRole("dialog", { name: "Agent sessions" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: `Inspect session ${FIRST.id}` }));
    await screen.findByRole("dialog", { name: "Agent session" });
    expect(screen.getByText(FIRST.id)).toBeTruthy();
    expect(screen.queryByRole("radiogroup", { name: "Session grouping" })).toBeNull();
  });
  it("combines project and agent filters while retaining creation and the default target", async () => {
    const project = "/work/example";
    vi.mocked(fetchCaptainSessions).mockResolvedValue([{ ...FIRST, cwd: project }, { ...SECOND, cwd: "/work/other" }]);
    render(<SessionControls page="welcome" runAgent={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Agent" }));
    fireEvent.click(screen.getByRole("button", { name: "All sessions…" }));
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
    expect(readPageTarget("welcome")).toBeUndefined();
  });
  it("changes a page's Captain session and returns it to the playground agent without sending", async () => {
    const runAgent = vi.fn();
    render(<SessionControls page="welcome" runAgent={runAgent} />);
    fireEvent.click(screen.getByRole("button", { name: "Agent" }));
    fireEvent.click(screen.getByRole("button", { name: "All sessions…" }));
    const picker = await screen.findByRole("combobox", { name: "Send comments to" });
    await waitFor(() => expect(picker.hasAttribute("disabled")).toBe(false));
    fireEvent.click(picker);
    fireEvent.mouseDown(await screen.findByRole("option", { name: /Review changes/ }));
    await waitFor(() => expect(readPageTarget("welcome")).toEqual(FIRST_TARGET));
    await waitFor(() => expect(picker.hasAttribute("disabled")).toBe(false));
    fireEvent.click(picker);
    fireEvent.mouseDown(await screen.findByRole("option", { name: /Fix layout/ }));
    await waitFor(() => expect(readPageTarget("welcome")).toEqual(SECOND_TARGET));
    await waitFor(() => expect(picker.hasAttribute("disabled")).toBe(false));
    fireEvent.click(picker);
    fireEvent.mouseDown(await screen.findByRole("option", { name: /Playground agent/ }));
    await waitFor(() => expect(readPageTarget("welcome")).toBeUndefined());
    expect(runAgent).not.toHaveBeenCalled();
    expect(setPageAutoRun).not.toHaveBeenCalled();
  });
  it.each([
    { name: "points a page without a target at the last live Captain session chosen", remembered: FIRST, expected: FIRST_TARGET },
    { name: "leaves a page on the playground agent when the remembered session is no longer live", remembered: { ...FIRST, id: "ended" }, expected: undefined },
  ])("$name", async ({ remembered, expected }) => {
    localStorage.setItem("playground.agent-target", JSON.stringify({ kind: "captain", sessionId: remembered.id, label: "Review changes · codex" }));
    render(<SessionControls page="other" runAgent={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Agent" }));
    fireEvent.click(screen.getByRole("button", { name: "All sessions…" }));
    const picker = await screen.findByRole("combobox", { name: "Send comments to" });
    await waitFor(() => expect(picker.hasAttribute("disabled")).toBe(false));
    await waitFor(() => expect(readPageTarget("other")).toEqual(expected));
  });
  it("remembers the session chosen for one page in localStorage", async () => {
    render(<SessionControls page="welcome" runAgent={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Agent" }));
    fireEvent.click(screen.getByRole("button", { name: "All sessions…" }));
    const picker = await screen.findByRole("combobox", { name: "Send comments to" });
    await waitFor(() => expect(picker.hasAttribute("disabled")).toBe(false));
    fireEvent.click(picker);
    fireEvent.mouseDown(await screen.findByRole("option", { name: /Fix layout/ }));
    await waitFor(() => expect(localStorage.getItem("playground.agent-target")).toBe(JSON.stringify({ kind: "captain", sessionId: SECOND.id, label: "Fix layout · claude" })));
  });
  it("shows the saved target for each page when navigating", async () => {
    rememberPageTarget("welcome", FIRST_TARGET);
    rememberPageTarget("other", SECOND_TARGET);
    const runAgent = vi.fn();
    const view = render(<SessionControls page="welcome" runAgent={runAgent} />);
    fireEvent.click(screen.getByRole("button", { name: "Agent" }));
    fireEvent.click(screen.getByRole("button", { name: "All sessions…" }));
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Send comments to" }).textContent).toContain("Review changes · codex"));
    view.rerender(<SessionControls page="other" runAgent={runAgent} />);
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Send comments to" }).textContent).toContain("Fix layout · claude"));
    expect(setPageAutoRun).not.toHaveBeenCalled();
  });
  it("does not offer page targeting on the global comments dashboard", async () => {
    render(<SessionControls runAgent={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Agent" }));
    fireEvent.click(screen.getByRole("button", { name: "All sessions…" }));
    await screen.findByText("No agent session yet.", { exact: false });
    expect(screen.queryByRole("combobox", { name: "Send comments to" })).toBeNull();
  });
  it("remembers the failed thread's page target in this browser and sends it with the retry, including from the dashboard", async () => {
    const runAgent = vi.fn().mockResolvedValue(undefined);
    render(<AgentRunsProvider runAgent={runAgent}><FailedThread /></AgentRunsProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Send failed" }));
    fireEvent.click(screen.getByRole("button", { name: "Send to another target" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: /Fix layout/ }));
    await waitFor(() => expect(runAgent).toHaveBeenCalledWith("failed", undefined, { target: SECOND_TARGET }));
    expect(readPageTarget("other")).toEqual(SECOND_TARGET);
  });
  it("retries in a new session without changing the page's target", async () => {
    const runAgent = vi.fn().mockResolvedValue(undefined);
    render(<AgentRunsProvider runAgent={runAgent}><FailedThread /></AgentRunsProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Send failed" }));
    fireEvent.click(screen.getByRole("button", { name: "Send to another target" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Retry in a new session" }));
    await waitFor(() => expect(runAgent).toHaveBeenCalledWith("failed", undefined, { fresh: true }));
    expect(readPageTarget("other")).toBeUndefined();
  });
  it("sends a retry to the session the browser chose for the thread's page", async () => {
    rememberPageTarget("other", FIRST_TARGET);
    const runAgent = vi.fn().mockResolvedValue(undefined);
    render(<AgentRunsProvider runAgent={runAgent}><FailedThread /></AgentRunsProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Send failed" }));
    fireEvent.click(screen.getByRole("button", { name: "Retry send" }));
    await waitFor(() => expect(runAgent).toHaveBeenCalledWith("failed", undefined, { target: FIRST_TARGET }));
  });
  it("does not offer a new session for a page that sends to a live session", async () => {
    rememberPageTarget("other", FIRST_TARGET);
    render(<AgentRunsProvider page="other" runAgent={vi.fn()}><FailedThread /></AgentRunsProvider>);
    await waitFor(() => expect(fetchAgentSessions).toHaveBeenCalled());
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
    fireEvent.click(screen.getByRole("button", { name: "Send failed" }));
    fireEvent.click(screen.getByRole("button", { name: "Send to another target" }));
    await screen.findByRole("menuitem", { name: "Send to Playground agent" });
    expect(screen.queryByRole("menuitem", { name: "Retry in a new session" })).toBeNull();
  });
  it("remembers a chosen session for the comment's page and sends it, without asking for a runtime", async () => {
    const runAgent = vi.fn().mockResolvedValue(undefined);
    const comment = { id: "page-error", page: "oipa/kit", body: "Page failed", author: null, createdAt: "2026-11-05" } as import("@flanksource/clicky-ui").Comment & { page: string };
    const target: AgentTarget = { kind: "captain", sessionId: SECOND.id, label: "Fix layout · claude" };
    function SendChosen() {
      const { start } = useAgentRuns();
      return <button onClick={() => void start(comment, target)}>Send chosen</button>;
    }
    render(<AgentRunsProvider page="oipa/kit" runAgent={runAgent}><SendChosen /></AgentRunsProvider>);
    await waitFor(() => expect(fetchAgentSessions).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Send chosen" }));
    await waitFor(() => expect(runAgent).toHaveBeenCalledWith("page-error", undefined, { target }));
    expect(readPageTarget("oipa/kit")).toEqual(target);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("does not send if this browser cannot remember the new target, and retries that choice on the next attempt", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => { throw new DOMException("Could not save target", "QuotaExceededError"); });
    const runAgent = vi.fn().mockResolvedValue(undefined);
    render(<AgentRunsProvider runAgent={runAgent}><FailedThread /></AgentRunsProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Send failed" }));
    fireEvent.click(screen.getByRole("button", { name: "Send to another target" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: /Fix layout/ }));
    await screen.findByText(/Cannot remember the agent session for other in this browser: Could not save target/, { selector: "pre" });
    expect(runAgent).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Retry send" }));
    await waitFor(() => expect(runAgent).toHaveBeenCalledOnce());
    expect(runAgent).toHaveBeenCalledWith("failed", undefined, { target: SECOND_TARGET });
    expect(readPageTarget("other")).toEqual(SECOND_TARGET);
  });
});
