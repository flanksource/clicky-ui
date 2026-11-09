import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTaskRun } from "../hooks/use-task-run";
import { TaskProgress } from "./TaskProgress";
import { SessionSummaryLine } from "./TaskSession.summary";
import type { TaskSessionRef, TaskSessionSummary, TaskSnapshot } from "./TaskSnapshot";
import { createTaskSessionFeed } from "./task-session-feed";
import { EventSourceProvider } from "../hooks/event-source-provider";
import {
  FakeEventSource,
  jsonResponse,
  remoteSession,
  renderWithFakeStream,
  resetFakeEventSources,
  stubSessionFetch,
  textMessage,
} from "../test/fake-session-stream.test-utils";

const HREF = "/api/captain/sessions/abc";
const INSPECTOR_TAIL = `${HREF}?tail=100`;

const SUMMARY: TaskSessionSummary = {
  model: "claude-sonnet-5",
  context: { usedTokens: 40_000, windowTokens: 200_000 },
  actions: 2,
  latest: { kind: "tool", tool: "Bash", text: "go test ./..." },
};
const SESSION: TaskSessionRef = { type: "captain", id: "abc", href: HREF, summary: SUMMARY };

function run(
  taskStatus: string,
  { task, group }: { task?: TaskSessionRef; group?: TaskSessionRef } = {},
): TaskSnapshot[] {
  return [
    {
      id: "run-1",
      name: "Prompt run",
      type: "group",
      status: taskStatus,
      groupId: "g1",
      kind: "prompt",
      total: 1,
      ...(group ? { session: group } : {}),
    },
    {
      id: "t1",
      name: "Run prompt",
      type: "task",
      status: taskStatus,
      groupId: "g1",
      ...(task ? { session: task } : {}),
    },
  ];
}

// The transcript re-renders a message once its markdown resolves, so a node
// found by findByText can be detached a tick later; assert on the live DOM.
const expectText = (text: string) =>
  waitFor(() => expect(screen.getByText(text)).toBeInTheDocument());

const forbidFetch = () => {
  const fetchMock = vi.fn(async () => {
    throw new Error("a collapsed session row must not fetch");
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

beforeEach(resetFakeEventSources);
afterEach(() => vi.unstubAllGlobals());

describe("SessionSummaryLine", () => {
  it("shows the model, context usage, action count and latest tool call", () => {
    render(<SessionSummaryLine summary={SUMMARY} />);

    const line = screen.getByTestId("session-task-summary");
    const tool = within(line).getByTestId("session-tail-tool");
    expect(tool).toHaveTextContent("Bash");
    expect(tool).toHaveTextContent("go test ./...");
    expect(within(line).getByText("claude-sonnet-5")).toBeInTheDocument();
    expect(within(line).getByLabelText("Context 20% used")).toBeInTheDocument();
    expect(within(line).getByText("2 actions")).toBeInTheDocument();
  });

  it("shows the latest assistant text", () => {
    render(<SessionSummaryLine summary={{ actions: 1, latest: { kind: "text", text: "Looking at the router" } }} />);

    expect(screen.getByTestId("session-tail-text")).toHaveTextContent("Looking at the router");
  });

  it("omits the model, gauge and latest line a summary does not carry, and singularises one action", () => {
    render(<SessionSummaryLine summary={{ actions: 1 }} />);

    const line = screen.getByTestId("session-task-summary");
    expect(within(line).getByText("1 action")).toBeInTheDocument();
    expect(within(line).queryByLabelText(/^Context/)).not.toBeInTheDocument();
    expect(within(line).queryByTestId("session-tail-tool")).not.toBeInTheDocument();
    expect(within(line).queryByTestId("session-tail-text")).not.toBeInTheDocument();
  });

  it("clamps a context beyond its window to fully used", () => {
    render(<SessionSummaryLine summary={{ actions: 0, context: { usedTokens: 250_000, windowTokens: 200_000 } }} />);

    expect(screen.getByLabelText("Context 100% used")).toBeInTheDocument();
  });

  it("exposes the activity as data without rendering it as text", () => {
    render(<SessionSummaryLine summary={{ actions: 0, activity: "thinking" }} />);

    expect(screen.getByTestId("session-task-summary")).toHaveAttribute("data-activity", "thinking");
    expect(screen.queryByText("thinking")).not.toBeInTheDocument();
  });
});

describe("TaskProgress captain session summary", () => {
  it("renders the summary straight from the snapshot with no fetch and no EventSource", () => {
    const fetchMock = forbidFetch();

    renderWithFakeStream(<TaskProgress snapshots={run("running", { task: SESSION })} />);

    const line = screen.getByTestId("session-task-summary");
    expect(within(line).getByTestId("session-tail-tool")).toHaveTextContent("go test ./...");
    expect(within(line).getByText("2 actions")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it("uses the group's session when the task carries none", () => {
    forbidFetch();

    renderWithFakeStream(<TaskProgress snapshots={run("running", { group: SESSION })} />);

    expect(screen.getByText("2 actions")).toBeInTheDocument();
  });

  it("replaces the line when a newer snapshot carries a new summary", () => {
    forbidFetch();
    const { rerender } = renderWithFakeStream(<TaskProgress snapshots={run("running", { task: SESSION })} />);

    rerender(
      <TaskProgress
        snapshots={run("running", {
          task: {
            ...SESSION,
            summary: { ...SUMMARY, actions: 3, latest: { kind: "tool", tool: "Grep", text: "TODO src" } },
          },
        })}
      />,
    );

    expect(screen.getByTestId("session-tail-tool")).toHaveTextContent("Grep");
    expect(screen.getByText("3 actions")).toBeInTheDocument();
  });

  it("renders no line before the server has computed a summary", () => {
    const fetchMock = forbidFetch();

    renderWithFakeStream(
      <TaskProgress snapshots={run("running", { task: { type: "captain", id: "abc", href: HREF } })} />,
    );

    expect(screen.queryByTestId("session-task-summary")).not.toBeInTheDocument();
    expect(screen.queryByText("captain · abc")).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renders the summary of a captain ref that has no href", () => {
    forbidFetch();

    renderWithFakeStream(
      <TaskProgress snapshots={run("running", { task: { type: "captain", id: "abc", summary: SUMMARY } })} />,
    );

    expect(screen.getByText("2 actions")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Run prompt"));
    expect(screen.queryByRole("button", { name: "Session" })).not.toBeInTheDocument();
  });
});

describe("TaskProgress session expansion without a feed", () => {
  it("makes a session task expandable with the inspector in a first Session tab", async () => {
    const fetchMock = stubSessionFetch({
      [INSPECTOR_TAIL]: [() => jsonResponse(remoteSession({ id: "abc", messages: [textMessage("m1", "read once")] }))],
    });

    renderWithFakeStream(<TaskProgress snapshots={run("running", { task: SESSION })} />);
    expect(screen.queryByTestId("task-session-detail")).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Run prompt"));

    const tab = await screen.findByRole("button", { name: "Session" });
    expect(tab).toHaveAttribute("aria-current", "true");
    const detail = await screen.findByTestId("task-session-detail");
    expect(detail).toHaveClass("h-96");
    expect(detail.parentElement).not.toHaveClass("bg-black");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(INSPECTOR_TAIL, expect.anything()));
    await expectText("read once");
  });

  it("does a static read of a running session: no follow stream is opened", async () => {
    stubSessionFetch({
      [INSPECTOR_TAIL]: [() => jsonResponse(remoteSession({ id: "abc", lifecycleStatus: "running", messages: [textMessage("m1", "still running")] }))],
    });

    renderWithFakeStream(<TaskProgress snapshots={run("running", { task: SESSION })} />);
    fireEvent.click(screen.getByText("Run prompt"));

    await expectText("still running");
    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it("keeps a task without a session unexpandable", () => {
    renderWithFakeStream(<TaskProgress snapshots={run("running")} />);

    fireEvent.click(screen.getByText("Run prompt"));

    expect(screen.queryByRole("button", { name: "Session" })).not.toBeInTheDocument();
  });
});

describe("TaskProgress session expansion on the shared task stream", () => {
  const taskStream = () => {
    const source = FakeEventSource.instances.find((candidate) => candidate.url.includes("/tasks/stream"));
    if (!source) throw new Error("the task stream was not opened");
    return source;
  };

  function LiveRun() {
    const { snapshots, sessionFeed } = useTaskRun({ id: "g1" });
    return <TaskProgress snapshots={snapshots} {...(sessionFeed ? { sessionFeed } : {})} />;
  }

  const renderLiveRun = (taskStatus = "running") => {
    vi.stubGlobal("EventSource", class {} as unknown as typeof EventSource);
    renderWithFakeStream(<LiveRun />);
    act(() => {
      for (const snapshot of run(taskStatus, { task: SESSION })) taskStream().emit("task", snapshot);
    });
  };

  it("streams a session frame into the open inspector without opening a session EventSource", async () => {
    stubSessionFetch({
      [INSPECTOR_TAIL]: [() => jsonResponse(remoteSession({ id: "abc", lifecycleStatus: "running", messages: [textMessage("m1", "from history")] }))],
    });
    renderLiveRun();

    fireEvent.click(await screen.findByText("Run prompt"));
    await expectText("from history");
    act(() => taskStream().emit("session", { session: { type: "captain", id: "abc" }, entry: textMessage("m2", "streamed live") }));

    await expectText("streamed live");
    expect(FakeEventSource.instances.map((source) => source.url)).toEqual([expect.stringContaining("/tasks/stream")]);
  });

  it("ignores a session frame for another session", async () => {
    stubSessionFetch({
      [INSPECTOR_TAIL]: [() => jsonResponse(remoteSession({ id: "abc", lifecycleStatus: "running", messages: [textMessage("m1", "from history")] }))],
    });
    renderLiveRun();
    fireEvent.click(await screen.findByText("Run prompt"));
    await expectText("from history");

    act(() => taskStream().emit("session", { session: { type: "captain", id: "other" }, entry: textMessage("m2", "someone else") }));

    expect(screen.queryByText("someone else")).not.toBeInTheDocument();
  });

  it("does not follow a finished task's session", async () => {
    stubSessionFetch({
      [INSPECTOR_TAIL]: [() => jsonResponse(remoteSession({ id: "abc", lifecycleStatus: "running", messages: [textMessage("m1", "from history")] }))],
    });
    renderLiveRun("success");
    fireEvent.click(await screen.findByText("Run prompt"));
    await expectText("from history");

    act(() => taskStream().emit("session", { session: { type: "captain", id: "abc" }, entry: textMessage("m2", "too late") }));

    expect(screen.queryByText("too late")).not.toBeInTheDocument();
  });
});

describe("TaskProgress session references without a captain renderer", () => {
  it("renders an unknown session type as a type · id chip", () => {
    renderWithFakeStream(<TaskProgress snapshots={run("running", { task: { type: "pty", id: "42" } })} />);

    expect(screen.getByText("pty · 42")).toBeInTheDocument();
    expect(screen.queryByTestId("session-task-summary")).not.toBeInTheDocument();
  });

  it("links the chip when the unknown type has an href", () => {
    renderWithFakeStream(
      <TaskProgress snapshots={run("running", { task: { type: "pty", id: "42", href: "/ptys/42" } })} />,
    );

    expect(screen.getByRole("link", { name: "pty · 42" })).toHaveAttribute("href", "/ptys/42");
  });

  it("uses a host renderer registered for the type and hands it the feed", () => {
    const { feed } = createTaskSessionFeed();
    const seen: unknown[] = [];
    render(
      <EventSourceProvider value={(url) => new FakeEventSource(url)}>
        <TaskProgress
          snapshots={run("running", { task: { type: "pty", id: "42" } })}
          sessionFeed={feed}
          sessionRenderers={{
            pty: {
              summary: (ref, _task, ctx) => {
                seen.push(ctx.feed);
                return <span>tty {ref.id}</span>;
              },
              detail: (ref) => <span>tty detail {ref.id}</span>,
            },
          }}
        />
      </EventSourceProvider>,
    );

    expect(screen.getByText("tty 42")).toBeInTheDocument();
    expect(seen).toContain(feed);
    fireEvent.click(screen.getByText("Run prompt"));
    expect(screen.getByText("tty detail 42")).toBeInTheDocument();
  });
});
