import { act, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionInspector } from "./SessionInspector";
import type { SessionFeedHandlers, SessionFeedSubscription } from "./session-feed";
import type { SessionFollowState } from "./SessionInspector.remote";
import {
  FakeEventSource,
  jsonResponse,
  remoteSession,
  renderWithFakeStream,
  resetFakeEventSources,
  stubSessionFetch,
  textMessage,
} from "../../test/fake-session-stream.test-utils";

const SRC = "/api/captain/sessions/remote";
const TAIL = `${SRC}?tail=100`;

const expectText = (text: string) =>
  waitFor(() => expect(screen.getByText(text)).toBeInTheDocument());

const running = (revision: number, facets = "f1"): SessionFollowState => ({
  revision,
  lifecycleStatus: "running",
  activityState: "active",
  facets,
});

/** A hand-driven feed: tests push frames to whoever is subscribed. */
function manualFeed() {
  const subscribers = new Set<SessionFeedHandlers>();
  const subscription: SessionFeedSubscription = (handlers) => {
    subscribers.add(handlers);
    return () => {
      subscribers.delete(handlers);
    };
  };
  const each = (fn: (handlers: SessionFeedHandlers) => void) => {
    for (const handlers of Array.from(subscribers)) fn(handlers);
  };
  return {
    subscription,
    subscribers,
    entry: (message: ReturnType<typeof textMessage>) => act(() => each((h) => h.onEntry(message))),
    state: (next: SessionFollowState) => act(() => each((h) => h.onState(next))),
    error: (message: string) => act(() => each((h) => h.onError(message))),
  };
}

beforeEach(resetFakeEventSources);
afterEach(() => vi.unstubAllGlobals());

describe("SessionInspector with an injected feed", () => {
  it("opens no EventSource and merges fed entries by id: a known id replaces, a new id appends", async () => {
    stubSessionFetch({
      [TAIL]: [() => jsonResponse(remoteSession({ messages: [textMessage("m1", "first draft")] }))],
    });
    const feed = manualFeed();

    renderWithFakeStream(<SessionInspector src={SRC} feed={feed.subscription} />);
    await expectText("first draft");

    feed.entry(textMessage("m1", "first answer, enriched"));
    feed.entry(textMessage("m2", "second answer"));

    await expectText("first answer, enriched");
    await expectText("second answer");
    expect(screen.queryByText("first draft")).not.toBeInTheDocument();
    expect(FakeEventSource.instances).toHaveLength(0);
    expect(feed.subscribers.size).toBe(1);
  });

  it("keeps entries fed while the first read is still in flight", async () => {
    let finishRead!: () => void;
    stubSessionFetch({
      [TAIL]: [
        () =>
          new Promise<Response>((resolve) => {
            finishRead = () =>
              resolve(jsonResponse(remoteSession({ messages: [textMessage("m1", "from history")] })));
          }),
      ],
    });
    const feed = manualFeed();

    renderWithFakeStream(<SessionInspector src={SRC} feed={feed.subscription} />);
    await waitFor(() => expect(feed.subscribers.size).toBe(1));
    feed.entry(textMessage("m2", "arrived mid-read"));
    await act(async () => finishRead());

    await expectText("from history");
    await expectText("arrived mid-read");
  });

  it("refetches the aggregate on a higher state revision and keeps fed entries", async () => {
    const fetchMock = stubSessionFetch({
      [TAIL]: [
        () => jsonResponse(remoteSession({ revision: 3, plan: { content: "# Draft plan" } })),
        () => jsonResponse(remoteSession({ revision: 4, plan: { content: "# Approved plan" } })),
      ],
    });
    const feed = manualFeed();

    renderWithFakeStream(<SessionInspector src={SRC} feed={feed.subscription} defaultTab="plan" />);
    expect(await screen.findByRole("heading", { name: "Draft plan" })).toBeInTheDocument();

    feed.entry(textMessage("m9", "fed before refetch"));
    feed.state(running(3));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    feed.state(running(4));

    expect(await screen.findByRole("heading", { name: "Approved plan" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("unsubscribes when a state frame reports a terminal lifecycle", async () => {
    stubSessionFetch({ [TAIL]: [() => jsonResponse(remoteSession({ revision: 2 }))] });
    const feed = manualFeed();

    renderWithFakeStream(<SessionInspector src={SRC} feed={feed.subscription} />);
    await waitFor(() => expect(feed.subscribers.size).toBe(1));

    feed.state({ ...running(2), lifecycleStatus: "succeeded", activityState: "idle" });

    expect(feed.subscribers.size).toBe(0);
  });

  it("surfaces a feed error beside the loaded session and stops following", async () => {
    stubSessionFetch({ [TAIL]: [() => jsonResponse(remoteSession({ messages: [textMessage("m1", "kept answer")] }))] });
    const feed = manualFeed();

    renderWithFakeStream(<SessionInspector src={SRC} feed={feed.subscription} />);
    await expectText("kept answer");

    feed.error("LISTEN captain_session_change failed");

    expect(await screen.findByRole("alert")).toHaveTextContent("LISTEN captain_session_change failed");
    expect(feed.subscribers.size).toBe(0);
  });

  it("surfaces a fed entry without a message id instead of merging it", async () => {
    stubSessionFetch({ [TAIL]: [() => jsonResponse(remoteSession({ messages: [textMessage("m1", "kept answer")] }))] });
    const feed = manualFeed();

    renderWithFakeStream(<SessionInspector src={SRC} feed={feed.subscription} />);
    await expectText("kept answer");

    feed.entry({ role: "assistant", parts: [] } as unknown as ReturnType<typeof textMessage>);

    expect(await screen.findByRole("alert")).toHaveTextContent("no message id");
    expect(feed.subscribers.size).toBe(0);
  });

  it("never subscribes with follow={false}", async () => {
    stubSessionFetch({ [TAIL]: [() => jsonResponse(remoteSession({ messages: [textMessage("m1", "static")] }))] });
    const feed = manualFeed();

    renderWithFakeStream(<SessionInspector src={SRC} feed={feed.subscription} follow={false} />);
    await expectText("static");

    expect(feed.subscribers.size).toBe(0);
    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it("drops the subscription when a default-follow session loads already terminal", async () => {
    stubSessionFetch({
      [TAIL]: [() => jsonResponse(remoteSession({ lifecycleStatus: "succeeded", messages: [textMessage("m1", "final")] }))],
    });
    const feed = manualFeed();

    renderWithFakeStream(<SessionInspector src={SRC} feed={feed.subscription} />);
    await expectText("final");

    expect(feed.subscribers.size).toBe(0);
  });

  it("unsubscribes on unmount", async () => {
    stubSessionFetch({ [TAIL]: [() => jsonResponse(remoteSession({ messages: [textMessage("m1", "live")] }))] });
    const feed = manualFeed();

    const { unmount } = renderWithFakeStream(<SessionInspector src={SRC} feed={feed.subscription} />);
    await expectText("live");
    expect(feed.subscribers.size).toBe(1);

    unmount();

    expect(feed.subscribers.size).toBe(0);
  });
});
