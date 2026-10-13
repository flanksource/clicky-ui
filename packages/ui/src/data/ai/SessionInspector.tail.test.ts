import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  openRemoteSession,
  type RemoteSessionOptions,
  type RemoteSessionState,
} from "./SessionInspector.remote";
import {
  FakeEventSource,
  jsonResponse,
  lastEventSource,
  remoteSession,
  resetFakeEventSources,
  stubSessionFetch,
  textMessage,
} from "../../test/fake-session-stream.test-utils";

// Tailing a live session: the transcript fetched from `src` is extended by
// the follow stream's `entry` frames, and survives the aggregate refetches
// that `state` frames trigger. These specs drive openRemoteSession directly so
// they can assert on the exact message list it reports.

const SRC = "/api/captain/sessions/tail";
// The first read asks for the tail; the stream resumes after its newest message.
const TAIL = `${SRC}?tail=100`;
const FOLLOW_URL = `${SRC}?follow=1`;
const RUNNING = { lifecycleStatus: "running", activityState: "active", facets: "f1" };

beforeEach(resetFakeEventSources);
afterEach(() => vi.unstubAllGlobals());

function tail(options: RemoteSessionOptions = {}) {
  const changes: RemoteSessionState[] = [];
  const handle = openRemoteSession(SRC, {
    ...options,
    eventSourceFactory: (url) => new FakeEventSource(url),
    onChange: (state) => changes.push(state),
  });
  const latest = () => changes.at(-1)!;
  return {
    handle,
    changes,
    latest,
    transcript: () =>
      latest().session?.messages?.map((message) => {
        const part = message.parts[0] as { text: string };
        return [message.id, part.text];
      }),
  };
}

function deferred() {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((done) => (resolve = done));
  return { promise, resolve };
}

describe("tailing a live session", () => {
  it("appends entries in arrival order after the fetched transcript, updating a known id in place", async () => {
    stubSessionFetch({ [TAIL]: [() => jsonResponse(remoteSession({ messages: [textMessage("m1", "question")] }))] });
    const { handle, transcript } = tail();
    await handle.loaded;
    const stream = lastEventSource();

    stream.emit("entry", textMessage("m2", "thinking"));
    stream.emit("entry", textMessage("m3", "tool call"));
    stream.emit("entry", textMessage("m2", "thinking, done"));

    expect(stream.url).toBe(`${FOLLOW_URL}&after=m1`);
    expect(transcript()).toEqual([
      ["m1", "question"],
      ["m2", "thinking, done"],
      ["m3", "tool call"],
    ]);
  });

  it("keeps entries streamed while a refetch is in flight over the refetch's older copy", async () => {
    const refetch = deferred();
    stubSessionFetch({
      [TAIL]: [
        () => jsonResponse(remoteSession({ revision: 1, messages: [textMessage("m1", "draft")] })),
        () => refetch.promise,
      ],
    });
    const { handle, transcript, latest } = tail();
    await handle.loaded;
    const stream = lastEventSource();

    stream.emit("state", { revision: 2, ...RUNNING });
    stream.emit("entry", textMessage("m1", "streamed final"));
    stream.emit("entry", textMessage("m2", "streamed next"));
    refetch.resolve(jsonResponse(remoteSession({ revision: 2, messages: [textMessage("m1", "refetched stale")] })));

    await vi.waitFor(() => expect(latest().session?.revision).toBe(2));
    expect(transcript()).toEqual([
      ["m1", "streamed final"],
      ["m2", "streamed next"],
    ]);
  });

  it("lets a refetch started after an entry supersede that entry, keeping entries the server has not stored yet", async () => {
    stubSessionFetch({
      [TAIL]: [
        () => jsonResponse(remoteSession({ revision: 1 })),
        () => jsonResponse(remoteSession({ revision: 2, messages: [textMessage("m1", "complete")] })),
      ],
    });
    const { handle, transcript, latest } = tail();
    await handle.loaded;
    const stream = lastEventSource();

    stream.emit("entry", textMessage("m1", "partial"));
    stream.emit("entry", textMessage("m2", "not persisted yet"));
    stream.emit("state", { revision: 2, ...RUNNING });

    await vi.waitFor(() => expect(latest().session?.revision).toBe(2));
    expect(transcript()).toEqual([
      ["m1", "complete"],
      ["m2", "not persisted yet"],
    ]);
  });

  it("drops a superseded refetch that resolves after the newer one", async () => {
    const older = deferred();
    const newer = deferred();
    stubSessionFetch({
      [TAIL]: [
        () => jsonResponse(remoteSession({ revision: 1 })),
        () => older.promise,
        () => newer.promise,
      ],
    });
    const { handle, transcript, latest } = tail();
    await handle.loaded;
    const stream = lastEventSource();

    stream.emit("state", { revision: 2, ...RUNNING });
    stream.emit("state", { revision: 3, ...RUNNING });
    newer.resolve(jsonResponse(remoteSession({ revision: 3, messages: [textMessage("m1", "revision three")] })));
    await vi.waitFor(() => expect(latest().session?.revision).toBe(3));
    older.resolve(jsonResponse(remoteSession({ revision: 2, messages: [textMessage("m1", "revision two")] })));
    await older.promise;
    await new Promise((settle) => setTimeout(settle, 0));

    expect(latest().session?.revision).toBe(3);
    expect(transcript()).toEqual([["m1", "revision three"]]);
  });

  it("keeps tailing across a transient drop and upserts the server's replay without duplicates", async () => {
    stubSessionFetch({ [TAIL]: [() => jsonResponse(remoteSession({ messages: [textMessage("m1", "question")] }))] });
    const { handle, transcript, latest } = tail();
    await handle.loaded;
    const stream = lastEventSource();

    stream.emit("entry", textMessage("m2", "answer"));
    stream.dropConnection();
    stream.emit("entry", textMessage("m1", "question"));
    stream.emit("entry", textMessage("m2", "answer"));
    stream.emit("entry", textMessage("m3", "after reconnect"));

    expect(latest().error).toBeUndefined();
    expect(stream.closed).toBe(false);
    expect(transcript()).toEqual([
      ["m1", "question"],
      ["m2", "answer"],
      ["m3", "after reconnect"],
    ]);
  });

  it("reports a lost stream, keeping the tailed transcript, once the connection closes for good", async () => {
    stubSessionFetch({ [TAIL]: [() => jsonResponse(remoteSession())] });
    const { handle, transcript, latest } = tail();
    await handle.loaded;
    const stream = lastEventSource();

    stream.emit("entry", textMessage("m1", "last words"));
    stream.failConnection();

    expect(latest().error).toBe(`Lost the session stream ${FOLLOW_URL}`);
    expect(transcript()).toEqual([["m1", "last words"]]);
  });

  it.each([
    { name: "has no id", frame: JSON.stringify({ role: "assistant", parts: [] }), error: "has no message id" },
    { name: "is not JSON", frame: "{not json", error: "Unparseable entry frame" },
  ])("stops tailing and reports an entry frame that $name", async ({ frame, error }) => {
    stubSessionFetch({ [TAIL]: [() => jsonResponse(remoteSession({ messages: [textMessage("m1", "kept")] }))] });
    const { handle, transcript, latest } = tail();
    await handle.loaded;
    const stream = lastEventSource();

    stream.emit("entry", frame);

    expect(latest().error).toContain(error);
    expect(latest().error).toContain(FOLLOW_URL);
    expect(stream.closed).toBe(true);
    expect(transcript()).toEqual([["m1", "kept"]]);
  });

  it("reports nothing once closed, even when an in-flight refetch resolves", async () => {
    const refetch = deferred();
    stubSessionFetch({ [TAIL]: [() => jsonResponse(remoteSession({ revision: 1 })), () => refetch.promise] });
    const { handle, changes } = tail();
    await handle.loaded;
    const stream = lastEventSource();
    stream.emit("state", { revision: 2, ...RUNNING });
    const reported = changes.length;

    handle.close();
    refetch.resolve(jsonResponse(remoteSession({ revision: 2, messages: [textMessage("m1", "too late")] })));
    await refetch.promise;
    await new Promise((settle) => setTimeout(settle, 0));

    expect(stream.closed).toBe(true);
    expect(changes).toHaveLength(reported);
  });

  it("does not tail a session that reports no lifecycleStatus unless follow is forced", async () => {
    const untracked = { ...remoteSession(), lifecycleStatus: undefined };
    stubSessionFetch({ [TAIL]: [() => jsonResponse(untracked)] });

    await tail().handle.loaded;
    expect(FakeEventSource.instances).toHaveLength(0);

    await tail({ follow: true }).handle.loaded;
    expect(FakeEventSource.instances.map((es) => es.url)).toEqual([FOLLOW_URL]);
  });
});

// History is paged in on demand: the first read returns the newest page and,
// while `window` says more exist, loadOlder fetches the page before the oldest
// message held and prepends it.
describe("paging a session's history", () => {
  const PAGE = 2;
  const pageUrl = (before: string) => `${SRC}?before=${before}&limit=${PAGE}`;
  const firstPage = () =>
    jsonResponse(remoteSession({
      revision: 1,
      messages: [textMessage("m4", "four"), textMessage("m5", "five")],
      window: { messages: 6, events: 0, toolCalls: 0 },
    }));

  it("reads only the newest page and follows after it", async () => {
    const fetchMock = stubSessionFetch({ [`${SRC}?tail=${PAGE}`]: [firstPage] });
    const { handle, latest } = tail({ pageSize: PAGE });
    await handle.loaded;

    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([`${SRC}?tail=${PAGE}`]);
    expect(lastEventSource().url).toBe(`${FOLLOW_URL}&after=m5`);
    expect(latest().hasOlder).toBe(true);
  });

  it("prepends older pages until one comes back short", async () => {
    stubSessionFetch({
      [`${SRC}?tail=${PAGE}`]: [firstPage],
      [pageUrl("m4")]: [() => jsonResponse(remoteSession({ messages: [textMessage("m2", "two"), textMessage("m3", "three")] }))],
      [pageUrl("m2")]: [() => jsonResponse(remoteSession({ messages: [textMessage("m1", "one")] }))],
    });
    const { handle, transcript, latest } = tail({ pageSize: PAGE });
    await handle.loaded;

    await handle.loadOlder();
    expect(latest().hasOlder).toBe(true);
    await handle.loadOlder();

    expect(transcript()).toEqual([
      ["m1", "one"],
      ["m2", "two"],
      ["m3", "three"],
      ["m4", "four"],
      ["m5", "five"],
    ]);
    expect(latest()).toMatchObject({ hasOlder: false, loadingOlder: false });
  });

  it("asks for each page once however often the reader reaches the top", async () => {
    const page = deferred();
    const fetchMock = stubSessionFetch({ [`${SRC}?tail=${PAGE}`]: [firstPage], [pageUrl("m4")]: [() => page.promise] });
    const { handle, latest } = tail({ pageSize: PAGE });
    await handle.loaded;

    const first = handle.loadOlder();
    const second = handle.loadOlder();
    expect(latest().loadingOlder).toBe(true);
    page.resolve(jsonResponse(remoteSession({ messages: [textMessage("m3", "three")] })));
    await Promise.all([first, second]);

    expect(fetchMock.mock.calls.filter(([url]) => String(url) === pageUrl("m4"))).toHaveLength(1);
  });

  it("keeps loaded history when a state frame refetches the newest page", async () => {
    stubSessionFetch({
      [`${SRC}?tail=${PAGE}`]: [
        firstPage,
        () => jsonResponse(remoteSession({ revision: 2, messages: [textMessage("m5", "five"), textMessage("m6", "six")] })),
      ],
      [pageUrl("m4")]: [() => jsonResponse(remoteSession({ messages: [textMessage("m2", "two"), textMessage("m3", "three")] }))],
    });
    const { handle, transcript, latest } = tail({ pageSize: PAGE });
    await handle.loaded;
    await handle.loadOlder();

    lastEventSource().emit("state", { revision: 2, ...RUNNING });
    await vi.waitFor(() => expect(latest().session?.revision).toBe(2));

    expect(transcript()).toEqual([
      ["m2", "two"],
      ["m3", "three"],
      ["m4", "four"],
      ["m5", "five"],
      ["m6", "six"],
    ]);
    expect(latest().hasOlder).toBe(true);
  });

  it("does not page a session whose first read held every message", async () => {
    const fetchMock = stubSessionFetch({
      [`${SRC}?tail=${PAGE}`]: [() => jsonResponse(remoteSession({ messages: [textMessage("m1", "only")] }))],
    });
    const { handle, latest } = tail({ pageSize: PAGE });
    await handle.loaded;

    await handle.loadOlder();

    expect(latest().hasOlder).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("surfaces a failed page as the session error and lets the reader retry", async () => {
    stubSessionFetch({
      [`${SRC}?tail=${PAGE}`]: [firstPage],
      [pageUrl("m4")]: [
        () => jsonResponse({ error: `no message "m4" in session tail` }, 400),
        () => jsonResponse(remoteSession({ messages: [textMessage("m3", "three")] })),
      ],
    });
    const { handle, transcript, latest } = tail({ pageSize: PAGE });
    await handle.loaded;

    await handle.loadOlder();
    expect(latest()).toMatchObject({ loadingOlder: false, hasOlder: true });
    expect(latest().error).toContain(`no message "m4" in session tail`);

    await handle.loadOlder();
    expect(transcript()?.[0]).toEqual(["m3", "three"]);
    expect(latest().error).toBeUndefined();
  });
});
