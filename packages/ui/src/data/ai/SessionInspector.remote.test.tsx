import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionInspector } from "./SessionInspector";
import {
  isTerminalSessionLifecycle,
  sessionFollowUrl,
} from "./SessionInspector.remote";
import type { SessionCollectionInput } from "./SessionInspector.collection";
import { collectionSession } from "./SessionInspector.collection.fixtures";
import {
  FakeEventSource,
  jsonResponse,
  lastEventSource,
  remoteSession,
  renderWithFakeStream,
  resetFakeEventSources,
  stubSessionFetch,
  textMessage,
} from "../../test/fake-session-stream.test-utils";

const SRC = "/api/captain/sessions/remote";
const FOLLOW_URL = `${SRC}?follow=1`;
const TERMINAL = ["succeeded", "partial", "failed", "cancelled", "interrupted", "completed"];

// The transcript re-renders a message once its markdown resolves, so a node
// found by findByText can be detached a tick later; assert on the live DOM.
const expectText = (text: string) =>
  waitFor(() => expect(screen.getByText(text)).toBeInTheDocument());

beforeEach(resetFakeEventSources);
afterEach(() => vi.unstubAllGlobals());

describe("sessionFollowUrl", () => {
  it.each([
    { src: "/api/captain/sessions/a", want: "/api/captain/sessions/a?follow=1" },
    { src: "/api/captain/sessions/a?tail=50", want: "/api/captain/sessions/a?tail=50&follow=1" },
    { src: "/api/captain/sessions/a?", want: "/api/captain/sessions/a?follow=1" },
    { src: "/api/captain/sessions/a#plan", want: "/api/captain/sessions/a?follow=1#plan" },
  ])("appends follow=1 to $src", ({ src, want }) => {
    expect(sessionFollowUrl(src)).toBe(want);
  });
});

describe("isTerminalSessionLifecycle", () => {
  it.each(TERMINAL)("treats %s as terminal", (status) => {
    expect(isTerminalSessionLifecycle(status)).toBe(true);
  });
  it.each(["created", "running"])("treats %s as live", (status) => {
    expect(isTerminalSessionLifecycle(status)).toBe(false);
  });
});

describe("SessionInspector src", () => {
  it("shows a loading state, then renders the Plan tab from the fetched plan.content", async () => {
    const fetchMock = stubSessionFetch({
      [SRC]: [
        () =>
          jsonResponse(
            remoteSession({
              lifecycleStatus: "succeeded",
              plan: { content: "# Shadow activities by age", events: [] },
            }),
          ),
      ],
    });

    renderWithFakeStream(<SessionInspector src={SRC} defaultTab="plan" />);

    expect(screen.getByText("Loading session…")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Shadow activities by age" }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      SRC,
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
  });

  it.each(TERMINAL)("opens no event stream for a %s session", async (lifecycleStatus) => {
    stubSessionFetch({
      [SRC]: [() => jsonResponse(remoteSession({ lifecycleStatus, messages: [textMessage("m1", "final answer")] }))],
    });

    renderWithFakeStream(<SessionInspector src={SRC} />);

    await expectText("final answer");
    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it("follow={true} streams a terminal session and follow={false} never streams a live one", async () => {
    stubSessionFetch({
      [SRC]: [() => jsonResponse(remoteSession({ lifecycleStatus: "succeeded" }))],
      "/api/captain/sessions/live": [() => jsonResponse(remoteSession({ id: "live", lifecycleStatus: "running", messages: [textMessage("m1", "live answer")] }))],
    });

    const { unmount } = renderWithFakeStream(<SessionInspector src={SRC} follow />);
    await waitFor(() => expect(FakeEventSource.instances.map((es) => es.url)).toEqual([FOLLOW_URL]));
    unmount();
    expect(lastEventSource().closed).toBe(true);

    resetFakeEventSources();
    renderWithFakeStream(<SessionInspector src="/api/captain/sessions/live" follow={false} />);
    await expectText("live answer");
    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it("merges streamed entry frames by id: a known id replaces, a new id appends", async () => {
    stubSessionFetch({
      [SRC]: [() => jsonResponse(remoteSession({ messages: [textMessage("m1", "first draft")] }))],
    });

    renderWithFakeStream(<SessionInspector src={SRC} />);
    await expectText("first draft");
    const stream = lastEventSource();
    expect(stream.url).toBe(FOLLOW_URL);

    act(() => stream.emit("entry", textMessage("m1", "first answer, enriched")));
    act(() => stream.emit("entry", textMessage("m2", "second answer")));

    await expectText("first answer, enriched");
    await expectText("second answer");
    expect(screen.queryByText("first draft")).not.toBeInTheDocument();
  });

  it("refetches the aggregate on a higher state revision and keeps streamed entries", async () => {
    const fetchMock = stubSessionFetch({
      [SRC]: [
        () => jsonResponse(remoteSession({ revision: 3, plan: { content: "# Draft plan" } })),
        () => jsonResponse(remoteSession({ revision: 4, plan: { content: "# Approved plan" } })),
      ],
    });

    renderWithFakeStream(<SessionInspector src={SRC} defaultTab="plan" />);
    expect(await screen.findByRole("heading", { name: "Draft plan" })).toBeInTheDocument();
    const stream = lastEventSource();

    act(() => stream.emit("entry", textMessage("m9", "streamed before refetch")));
    act(() => stream.emit("state", { revision: 3, lifecycleStatus: "running", activityState: "active", facets: "f1" }));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    act(() => stream.emit("state", { revision: 4, lifecycleStatus: "running", activityState: "active", facets: "f1" }));
    expect(await screen.findByRole("heading", { name: "Approved plan" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole("tab", { name: /^Transcript/ }));
    await expectText("streamed before refetch");
    expect(stream.closed).toBe(false);
  });

  it("closes the stream when a state frame reports a terminal lifecycle", async () => {
    stubSessionFetch({ [SRC]: [() => jsonResponse(remoteSession({ revision: 2 }))] });

    renderWithFakeStream(<SessionInspector src={SRC} />);
    await waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    const stream = lastEventSource();

    act(() => stream.emit("state", { revision: 2, lifecycleStatus: "succeeded", activityState: "idle", facets: "f1" }));

    expect(stream.closed).toBe(true);
  });

  it("does not refetch on the first state frame's facets alone", async () => {
    const fetchMock = stubSessionFetch({
      [SRC]: [() => jsonResponse(remoteSession({ revision: 5, plan: { content: "# Draft plan" } }))],
    });

    renderWithFakeStream(<SessionInspector src={SRC} defaultTab="plan" />);
    expect(await screen.findByRole("heading", { name: "Draft plan" })).toBeInTheDocument();
    const stream = lastEventSource();

    act(() =>
      stream.emit("state", { revision: 5, lifecycleStatus: "running", activityState: "active", facets: "f1" }),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { name: "Draft plan" })).toBeInTheDocument();
  });

  it("refetches a later frame with the same revision but different facets, updating the Plan tab", async () => {
    const fetchMock = stubSessionFetch({
      [SRC]: [
        () => jsonResponse(remoteSession({ revision: 5, plan: { content: "# Draft plan" } })),
        () => jsonResponse(remoteSession({ revision: 5, plan: { content: "# Revised plan" } })),
      ],
    });

    renderWithFakeStream(<SessionInspector src={SRC} defaultTab="plan" />);
    expect(await screen.findByRole("heading", { name: "Draft plan" })).toBeInTheDocument();
    const stream = lastEventSource();

    act(() =>
      stream.emit("state", { revision: 5, lifecycleStatus: "running", activityState: "active", facets: "f1" }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);

    act(() =>
      stream.emit("state", { revision: 5, lifecycleStatus: "running", activityState: "active", facets: "f2" }),
    );
    expect(await screen.findByRole("heading", { name: "Revised plan" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not refetch when a later frame repeats the same facets and revision", async () => {
    const fetchMock = stubSessionFetch({
      [SRC]: [() => jsonResponse(remoteSession({ revision: 5, plan: { content: "# Draft plan" } }))],
    });

    renderWithFakeStream(<SessionInspector src={SRC} defaultTab="plan" />);
    expect(await screen.findByRole("heading", { name: "Draft plan" })).toBeInTheDocument();
    const stream = lastEventSource();

    act(() =>
      stream.emit("state", { revision: 5, lifecycleStatus: "running", activityState: "active", facets: "f1" }),
    );
    act(() =>
      stream.emit("state", { revision: 5, lifecycleStatus: "running", activityState: "active", facets: "f1" }),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { name: "Draft plan" })).toBeInTheDocument();
  });

  it("surfaces an error when a state frame is missing facets", async () => {
    stubSessionFetch({ [SRC]: [() => jsonResponse(remoteSession({ revision: 2 }))] });

    renderWithFakeStream(<SessionInspector src={SRC} />);
    await waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    const stream = lastEventSource();

    act(() => stream.emit("state", { revision: 2, lifecycleStatus: "running", activityState: "active" }));

    expect(screen.getByRole("alert")).toHaveTextContent(FOLLOW_URL);
    expect(stream.closed).toBe(true);
  });

  it("closes the old stream and opens a new one when src changes", async () => {
    const next = "/api/captain/sessions/next?tail=10";
    stubSessionFetch({
      [SRC]: [() => jsonResponse(remoteSession({ messages: [textMessage("a", "old session")] }))],
      [next]: [() => jsonResponse(remoteSession({ id: "next", messages: [textMessage("b", "new session")] }))],
    });

    const { rerender } = renderWithFakeStream(<SessionInspector src={SRC} />);
    await expectText("old session");
    const first = lastEventSource();

    rerender(<SessionInspector src={next} />);

    expect(first.closed).toBe(true);
    await expectText("new session");
    expect(FakeEventSource.instances.map((es) => es.url)).toEqual([
      FOLLOW_URL,
      "/api/captain/sessions/next?tail=10&follow=1",
    ]);
    expect(screen.queryByText("old session")).not.toBeInTheDocument();
  });

  it.each([
    {
      name: "a JSON error body",
      response: () => jsonResponse({ error: "session remote not found", detailSource: "none" }, 404),
      shown: "session remote not found",
    },
    {
      name: "a plain-text body",
      response: () => new Response("no route for session remote", { status: 404 }),
      shown: "no route for session remote",
    },
  ])("displays $name of a 404 response", async ({ response, shown }) => {
    stubSessionFetch({ [SRC]: [response] });

    renderWithFakeStream(<SessionInspector src={SRC} />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(shown);
    expect(alert).toHaveTextContent("HTTP 404");
    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it("surfaces an error frame from the stream beside the loaded session", async () => {
    stubSessionFetch({ [SRC]: [() => jsonResponse(remoteSession({ messages: [textMessage("m1", "kept answer")] }))] });

    renderWithFakeStream(<SessionInspector src={SRC} />);
    await expectText("kept answer");
    fireEvent.click(screen.getByRole("tab", { name: /^Metadata/ }));
    const stream = lastEventSource();

    act(() => stream.emit("error", { error: "LISTEN captain_session_change failed" }));

    expect(screen.getByRole("alert")).toHaveTextContent("LISTEN captain_session_change failed");
    expect(screen.getByRole("tab", { name: /^Metadata/ })).toHaveAttribute("aria-selected", "true");
    expect(stream.closed).toBe(true);
  });

  it("surfaces a stream connection failure that delivered no data", async () => {
    stubSessionFetch({ [SRC]: [() => jsonResponse(remoteSession())] });

    renderWithFakeStream(<SessionInspector src={SRC} />);
    await waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    const stream = lastEventSource();

    act(() => stream.failConnection());

    expect(screen.getByRole("alert")).toHaveTextContent(FOLLOW_URL);
    expect(stream.closed).toBe(true);
  });

  it("rejects session and src together", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const both = { session: remoteSession(), src: SRC } as unknown as Parameters<typeof SessionInspector>[0];
    expect(() => renderWithFakeStream(<SessionInspector {...both} />)).toThrow(
      "SessionInspector takes either `session` or `src`, not both",
    );
  });
});

describe("SessionInspector collection items with src", () => {
  const attempt2Src = "/api/captain/sessions/attempt-2";
  const collection: SessionCollectionInput = {
    kind: "session-collection",
    id: "todo-attempts",
    currentSessionId: "attempt-1",
    sessions: [
      {
        id: "attempt-1",
        label: "Attempt #1",
        session: collectionSession("attempt-1", "gpt-5", "attempt one answer", 0.01),
      },
      { id: "attempt-2", label: "Attempt #2", mode: "plan", src: attempt2Src },
    ],
  };

  it("lazy-loads an item's src only when it is selected in the picker", async () => {
    const fetchMock = stubSessionFetch({
      [attempt2Src]: [
        () =>
          jsonResponse(
            remoteSession({
              id: "attempt-2",
              lifecycleStatus: "succeeded",
              messages: [textMessage("a2", "attempt two answer")],
            }),
          ),
      ],
    });

    renderWithFakeStream(<SessionInspector session={collection} />);
    expect(screen.getByText("attempt one answer")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Select session content: 1 of 2 sessions" }));
    fireEvent.click(
      within(screen.getByRole("tree", { name: "Session content" })).getByRole("checkbox", {
        name: "Include Attempt #2",
      }),
    );

    await expectText("attempt two answer");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Select session content: 2 of 2 sessions" })).toBeInTheDocument();
    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it("follows a selected live src item and closes its stream when the item leaves the collection", async () => {
    stubSessionFetch({
      [attempt2Src]: [() => jsonResponse(remoteSession({ id: "attempt-2", messages: [textMessage("a2", "live attempt two")] }))],
    });
    const selected = ["attempt-1", "attempt-2"];

    const { rerender } = renderWithFakeStream(
      <SessionInspector session={collection} selectedSessionIds={selected} />,
    );
    await expectText("live attempt two");
    const stream = lastEventSource();
    expect(stream.url).toBe(`${attempt2Src}?follow=1`);

    act(() => stream.emit("entry", textMessage("a2-2", "attempt two follow-up")));
    await expectText("attempt two follow-up");

    rerender(
      <SessionInspector
        session={{ ...collection, sessions: [collection.sessions[0]!] }}
        selectedSessionIds={["attempt-1"]}
      />,
    );
    expect(stream.closed).toBe(true);
    expect(screen.queryByText("attempt two follow-up")).not.toBeInTheDocument();
  });

  it("loads and follows a current item that only carries src", async () => {
    const currentSrc = "/api/captain/sessions/attempt-3";
    stubSessionFetch({
      [currentSrc]: [() => jsonResponse(remoteSession({ id: "attempt-3", messages: [textMessage("a3", "attempt three answer")] }))],
    });

    renderWithFakeStream(
      <SessionInspector
        session={{
          ...collection,
          currentSessionId: "attempt-3",
          sessions: [...collection.sessions, { id: "attempt-3", label: "Attempt #3", src: currentSrc }],
        }}
      />,
    );

    expect(screen.getByText("Loading session…")).toBeInTheDocument();
    await expectText("attempt three answer");
    const stream = lastEventSource();
    expect(stream.url).toBe(`${currentSrc}?follow=1`);

    act(() => stream.emit("entry", textMessage("a3-2", "attempt three follow-up")));
    await expectText("attempt three follow-up");
  });
});
