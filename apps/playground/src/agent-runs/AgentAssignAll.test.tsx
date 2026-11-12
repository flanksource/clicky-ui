import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CommentProvider, DEFAULT_COMMENT_STATUSES, type Comment } from "@flanksource/clicky-ui";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AgentRunsProvider, useAgentRuns } from "./AgentRunsProvider";
import { AgentSessionButton } from "./AgentSessionButton";
import { fetchAgentSessions, fetchCaptainSessions, type AgentSessionsView, type CaptainSessionOption } from "./agent-runs-api";
import { readPageTarget } from "./page-targets";
import type { PageComment } from "../comments/useComments";

vi.mock("./agent-runs-api", async importOriginal => ({
  ...await importOriginal<typeof import("./agent-runs-api")>(),
  fetchAgentSessions: vi.fn(),
  fetchCaptainSessions: vi.fn(),
}));

const PAGE = "welcome";
const RUNTIME = { spec: { model: "example-model" } };
const LIVE: CaptainSessionOption = { id: "session-b", source: "claude", title: "Fix layout", model: "example-model", inCmux: false };
const ENDED: CaptainSessionOption = { id: "managed-1", source: "claude", title: "welcome threads", status: "ended", inCmux: false, managed: true, resumable: true };
const LIVE_TARGET = { kind: "captain" as const, sessionId: LIVE.id, label: "Fix layout · claude" };
const ENDED_TARGET = { kind: "managed" as const, sessionId: ENDED.id, label: ENDED.title };
const REQUESTED = "2026-11-12T10:00:00Z";

const thread = (id: string, overrides: Partial<PageComment> = {}): PageComment => ({ id, page: PAGE, body: `Thread ${id}`, author: null, createdAt: "2026-11-12", status: "open", ...overrides } as PageComment);
const handOff = (sessionId: string | undefined, overrides: Partial<NonNullable<Comment["agentRun"]>> = {}): NonNullable<Comment["agentRun"]> => ({ state: "sent", requestedAt: REQUESTED, target: { label: "New editor-comments session" }, ...(sessionId ? { sessionId } : {}), ...overrides });

let data: AgentSessionsView;
beforeEach(() => {
  data = { settings: { grouping: "shared", runtime: RUNTIME }, sessions: [], pages: {} };
  vi.mocked(fetchAgentSessions).mockImplementation(async () => data);
  vi.mocked(fetchCaptainSessions).mockResolvedValue([LIVE, ENDED]);
});
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.restoreAllMocks(); localStorage.clear(); });

/** A thread's Assign menu entries, as buttons. */
function AssignMenu({ comment }: { comment: Comment }) {
  const { extraAssignItems } = useAgentRuns();
  return <ul>{extraAssignItems(comment).map((item, index) => <li key={index}><button disabled={item.disabled === true} onClick={() => item.onSelect?.()}>{item.label}</button></li>)}</ul>;
}

function host(props: { comments: PageComment[]; runAgent?: () => Promise<void>; runBatch?: () => Promise<void> }) {
  const { comments, runAgent = vi.fn().mockResolvedValue(undefined), runBatch = vi.fn().mockResolvedValue(undefined) } = props;
  return (
    <CommentProvider comments={comments} config={{ statuses: DEFAULT_COMMENT_STATUSES }}>
      <AgentRunsProvider page={PAGE} runAgent={runAgent} runBatch={runBatch}>
        <AgentSessionButton />
        <AssignMenu comment={comments[0] ?? thread("none")} />
      </AgentRunsProvider>
    </CommentProvider>
  );
}
const openMenu = () => fireEvent.click(screen.getByRole("button", { name: "Agent" }));

describe("the merged session list", () => {
  it("lists an ended managed session in the Agent menu as resumable and counts only the sessions that are running", async () => {
    render(host({ comments: [thread("a")] }));
    openMenu();

    const ended = await screen.findByRole("button", { name: `Inspect session ${ENDED.id}` });

    expect(ended.textContent).toContain("resumes");
    expect(screen.getByRole("button", { name: `Inspect session ${LIVE.id}` }).textContent).not.toContain("resumes");
    expect(screen.getByRole("button", { name: "Agent" }).textContent).toContain("1");
  });

  it("offers each listed session in a thread's Assign menu, an ended managed one marked resumes, and sends the thread into the chosen one", async () => {
    const runAgent = vi.fn().mockResolvedValue(undefined);
    render(host({ comments: [thread("a")], runAgent }));

    const entry = await screen.findByRole("button", { name: `Send to ${ENDED.title} · resumes` });
    expect(screen.getByRole("button", { name: `Send to ${LIVE_TARGET.label}` })).toBeTruthy();
    fireEvent.click(entry);

    await waitFor(() => expect(runAgent).toHaveBeenCalledWith("a", undefined, { target: ENDED_TARGET }));
    expect(readPageTarget(PAGE)).toEqual(ENDED_TARGET);
  });

  it("does not offer a resolved thread's Assign entries", async () => {
    render(host({ comments: [thread("a", { status: "resolved" })] }));

    const entry = await screen.findByRole("button", { name: `Send to ${LIVE_TARGET.label}` });

    expect(entry.hasAttribute("disabled")).toBe(true);
  });
});

describe("assigning every open thread of the page", () => {
  it("sends them into a chosen session and points the page at it", async () => {
    const runBatch = vi.fn().mockResolvedValue(undefined);
    render(host({ comments: [thread("a"), thread("b")], runBatch }));
    openMenu();
    const assign = await screen.findByRole("button", { name: `Assign all to ${LIVE.title}` });
    expect(screen.getByText("2 open threads")).toBeTruthy();

    fireEvent.click(assign);

    await waitFor(() => expect(runBatch).toHaveBeenCalledWith(PAGE, undefined, { target: LIVE_TARGET }));
    expect(readPageTarget(PAGE)).toEqual(LIVE_TARGET);
  });

  it("resumes an ended managed session", async () => {
    const runBatch = vi.fn().mockResolvedValue(undefined);
    render(host({ comments: [thread("a")], runBatch }));
    openMenu();

    fireEvent.click(await screen.findByRole("button", { name: `Assign all to ${ENDED.title}` }));

    await waitFor(() => expect(runBatch).toHaveBeenCalledWith(PAGE, undefined, { target: ENDED_TARGET }));
  });

  it("starts a new session with the saved runtime, leaving the page's chosen session until the new one is adopted", async () => {
    const runBatch = vi.fn().mockResolvedValue(undefined);
    render(host({ comments: [thread("a")], runBatch }));
    openMenu();

    fireEvent.click(await screen.findByRole("button", { name: "Assign all to a new session" }));

    await waitFor(() => expect(runBatch).toHaveBeenCalledWith(PAGE, undefined, { fresh: true }));
    expect(readPageTarget(PAGE)).toBeUndefined();
  });

  it("asks for a runtime first when none is saved, sending nothing yet", async () => {
    data.settings = { grouping: "shared" };
    const runBatch = vi.fn().mockResolvedValue(undefined);
    render(host({ comments: [thread("a")], runBatch }));
    openMenu();
    const assign = await screen.findByRole("button", { name: "Assign all to a new session" });
    await waitFor(() => expect(assign.hasAttribute("disabled")).toBe(false));

    fireEvent.click(assign);

    await screen.findByRole("dialog", { name: "Assign all to a new session" });
    expect(runBatch).not.toHaveBeenCalled();
  });

  it("is disabled, saying why, when the page has no open thread", async () => {
    render(host({ comments: [thread("a", { status: "resolved" }), thread("b", { parentId: "a" })] }));
    openMenu();

    const buttons = await screen.findAllByRole("button", { name: /^Assign all to / });

    expect(buttons.every(button => button.hasAttribute("disabled"))).toBe(true);
    expect(screen.getByText("No open threads on this page")).toBeTruthy();
  });

  it("shows gavel's refusal instead of dropping it", async () => {
    const runBatch = vi.fn().mockRejectedValue(new Error("thread b is stale"));
    render(host({ comments: [thread("a")], runBatch }));
    openMenu();

    fireEvent.click(await screen.findByRole("button", { name: `Assign all to ${LIVE.title}` }));

    await screen.findByText(/thread b is stale/);
  });
});

describe("adopting the session a run started", () => {
  it("points the page at the session once the thread's hand-off records one, labelled with the playground runtime", async () => {
    const runAgent = vi.fn().mockResolvedValue(undefined);
    const comments = [thread("a")];
    const view = render(host({ comments, runAgent }));
    fireEvent.click(await screen.findByRole("button", { name: "Run agent" }));
    await waitFor(() => expect(runAgent).toHaveBeenCalledWith("a", undefined, {}));
    expect(readPageTarget(PAGE)).toBeUndefined();

    view.rerender(host({ comments: [thread("a", { agentRun: handOff(undefined, { state: "queued" }) })], runAgent }));
    expect(readPageTarget(PAGE)).toBeUndefined();
    view.rerender(host({ comments: [thread("a", { agentRun: handOff("managed-7") })], runAgent }));

    await waitFor(() => expect(readPageTarget(PAGE)).toEqual({ kind: "managed", sessionId: "managed-7", label: `${PAGE} · example-model` }));
  });

  it("ignores the hand-off a thread had before this send, adopting only the newer one", async () => {
    const runAgent = vi.fn().mockResolvedValue(undefined);
    const view = render(host({ comments: [thread("a", { agentRun: handOff("old-session") })], runAgent }));
    fireEvent.click(await screen.findByRole("button", { name: "Run agent" }));
    await waitFor(() => expect(runAgent).toHaveBeenCalled());

    view.rerender(host({ comments: [thread("a", { agentRun: handOff("old-session") })], runAgent }));
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(readPageTarget(PAGE)).toBeUndefined();

    view.rerender(host({ comments: [thread("a", { agentRun: handOff("new-session", { requestedAt: "2026-11-12T12:00:00Z" }) })], runAgent }));
    await waitFor(() => expect(readPageTarget(PAGE)?.sessionId).toBe("new-session"));
  });

  it("adopts nothing when the send's own hand-off failed", async () => {
    const runAgent = vi.fn().mockResolvedValue(undefined);
    const view = render(host({ comments: [thread("a")], runAgent }));
    fireEvent.click(await screen.findByRole("button", { name: "Run agent" }));
    await waitFor(() => expect(runAgent).toHaveBeenCalled());

    view.rerender(host({ comments: [thread("a", { agentRun: handOff("failed-session", { state: "error", error: "boom" }) })], runAgent }));
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(readPageTarget(PAGE)).toBeUndefined();
  });

  it("adopts the session a new-session batch started, from any of the threads it sent", async () => {
    const runBatch = vi.fn().mockResolvedValue(undefined);
    const view = render(host({ comments: [thread("a"), thread("b")], runBatch }));
    openMenu();
    fireEvent.click(await screen.findByRole("button", { name: "Assign all to a new session" }));
    await waitFor(() => expect(runBatch).toHaveBeenCalled());

    view.rerender(host({ comments: [thread("a"), thread("b", { agentRun: handOff("managed-9") })], runBatch }));

    await waitFor(() => expect(readPageTarget(PAGE)?.sessionId).toBe("managed-9"));
  });

  it("does not adopt a session for a send into a session the browser chose", async () => {
    const runAgent = vi.fn().mockResolvedValue(undefined);
    const view = render(host({ comments: [thread("a")], runAgent }));
    fireEvent.click(await screen.findByRole("button", { name: `Send to ${LIVE_TARGET.label}` }));
    await waitFor(() => expect(runAgent).toHaveBeenCalledWith("a", undefined, { target: LIVE_TARGET }));

    view.rerender(host({ comments: [thread("a", { agentRun: handOff("managed-7") })], runAgent }));
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(readPageTarget(PAGE)).toEqual(LIVE_TARGET);
  });
});
