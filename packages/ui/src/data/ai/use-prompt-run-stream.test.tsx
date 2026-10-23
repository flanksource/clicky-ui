import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EventSourceLike } from "../../hooks/event-source";
import { EventSourceProvider } from "../../hooks/event-source-provider";
import { usePromptRunStream, type PromptRunSummary } from "./use-prompt-run-stream";

class FakeRunStream implements EventSourceLike {
  static instances: FakeRunStream[] = [];
  readyState = 1;
  onopen: ((ev: Event) => unknown) | null = null;
  onmessage: ((ev: MessageEvent) => unknown) | null = null;
  onerror: ((ev: Event) => unknown) | null = null;
  closed = false;
  private listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();

  constructor(readonly url: string) {
    FakeRunStream.instances.push(this);
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
    const set = this.listeners.get(type) ?? new Set();
    set.add(listener);
    this.listeners.set(type, set);
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject) {
    this.listeners.get(type)?.delete(listener);
  }

  close() {
    this.closed = true;
  }

  frame(type: "run" | "entry" | "done" | "error", data?: unknown) {
    this.dispatch(new MessageEvent(type, data === undefined ? {} : { data: JSON.stringify(data) }));
  }

  private dispatch(event: Event) {
    if (this.closed) throw new Error(`frame ${event.type} sent to closed stream ${this.url}`);
    for (const listener of this.listeners.get(event.type) ?? []) {
      if (typeof listener === "function") listener(event);
      else listener.handleEvent(event);
    }
  }
}

const RUN_ID = "run-7f3a";
const SESSION_ID = "sess-91bc";
const STREAM_URL = `/api/captain/prompt/runs/${RUN_ID}/stream`;
const SNAPSHOT_URL = `/api/captain/prompt/runs/${RUN_ID}`;

const wrapper = ({ children }: { children: ReactNode }) => (
  <EventSourceProvider value={(url) => new FakeRunStream(url)}>{children}</EventSourceProvider>
);

const lastStream = () => {
  const stream = FakeRunStream.instances.at(-1);
  if (!stream) throw new Error("no stream opened");
  return stream;
};

beforeEach(() => {
  FakeRunStream.instances = [];
});
afterEach(() => vi.unstubAllGlobals());

describe("usePromptRunStream", () => {
  it("is idle and opens no stream without a run id", () => {
    const { result } = renderHook(() => usePromptRunStream(undefined), { wrapper });
    expect(result.current).toEqual({ status: "idle", entries: [] });
    expect(FakeRunStream.instances).toHaveLength(0);
  });

  it("follows the run stream under baseUrl and reports running until a frame arrives", () => {
    const { result } = renderHook(() => usePromptRunStream(RUN_ID, { baseUrl: "http://gavel.test" }), { wrapper });
    expect(FakeRunStream.instances.map((s) => s.url)).toEqual([`http://gavel.test${STREAM_URL}`]);
    expect(result.current).toEqual({ status: "running", entries: [] });
  });

  it("encodes the run id into the stream path", () => {
    renderHook(() => usePromptRunStream("run/odd id"), { wrapper });
    expect(lastStream().url).toBe("/api/captain/prompt/runs/run%2Fodd%20id/stream");
  });

  it("takes the session id from the run frame while staying running", () => {
    const { result } = renderHook(() => usePromptRunStream(RUN_ID), { wrapper });
    act(() => lastStream().frame("run", { sessionId: SESSION_ID }));
    expect(result.current).toEqual({ status: "running", sessionId: SESSION_ID, entries: [] });
  });

  it("collects the run's transcript entries, replacing a replayed entry by id", () => {
    const first = { id: "m1", role: "assistant", parts: [{ type: "dynamic-tool", toolName: "read_file", toolCallId: "c1", input: { path: "a.go" } }] };
    const updated = { ...first, parts: [{ ...first.parts[0], state: "output-available", output: "ok" }] };
    const second = { id: "m2", role: "assistant", parts: [{ type: "text", text: "{\"violations\":[]}" }] };
    const { result } = renderHook(() => usePromptRunStream(RUN_ID), { wrapper });
    act(() => lastStream().frame("entry", first));
    act(() => lastStream().frame("entry", second));
    act(() => lastStream().frame("entry", updated));
    expect(result.current.entries).toEqual([updated, second]);
    act(() => lastStream().frame("done", { success: true }));
    expect(result.current).toEqual({ status: "succeeded", summary: { success: true }, entries: [updated, second] });
  });

  it("succeeds on a successful done frame, closes the stream and reports the summary to onDone", () => {
    const summary: PromptRunSummary = {
      sessionId: SESSION_ID,
      success: true,
      structuredOutput: { violations: [{ file: "a.go", line: 3 }] },
    };
    const onDone = vi.fn();
    const { result } = renderHook(() => usePromptRunStream(RUN_ID, { onDone }), { wrapper });
    act(() => lastStream().frame("run", { sessionId: SESSION_ID }));
    act(() => lastStream().frame("done", summary));
    expect(result.current).toEqual({ status: "succeeded", sessionId: SESSION_ID, summary, entries: [] });
    expect(lastStream().closed).toBe(true);
    expect(onDone).toHaveBeenCalledExactlyOnceWith(summary);
  });

  it("fails with the summary's error on an unsuccessful done frame", () => {
    const summary: PromptRunSummary = { sessionId: SESSION_ID, success: false, error: "model refused" };
    const onDone = vi.fn();
    const { result } = renderHook(() => usePromptRunStream(RUN_ID, { onDone }), { wrapper });
    act(() => lastStream().frame("done", summary));
    expect(result.current).toEqual({ status: "failed", sessionId: SESSION_ID, summary, error: "model refused", entries: [] });
    expect(onDone).toHaveBeenCalledExactlyOnceWith(summary);
  });

  it("names the run when an unsuccessful done frame carries no error text", () => {
    const { result } = renderHook(() => usePromptRunStream(RUN_ID), { wrapper });
    act(() => lastStream().frame("done", { success: false }));
    expect(result.current.status).toBe("failed");
    expect(result.current.error).toBe("The prompt run did not succeed.");
  });

  it("fails on a server error frame that carries a summary", () => {
    const summary: PromptRunSummary = { sessionId: SESSION_ID, success: false, error: "provider crashed" };
    const onDone = vi.fn();
    const { result } = renderHook(() => usePromptRunStream(RUN_ID, { onDone }), { wrapper });
    act(() => lastStream().frame("error", summary));
    expect(result.current).toEqual({ status: "failed", sessionId: SESSION_ID, summary, error: "provider crashed", entries: [] });
    expect(lastStream().closed).toBe(true);
    expect(onDone).toHaveBeenCalledExactlyOnceWith(summary);
  });

  describe("a data-less error frame (dropped connection)", () => {
    it("stays running while the snapshot says the run is still known", async () => {
      const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
      vi.stubGlobal("fetch", fetchMock);
      const { result } = renderHook(() => usePromptRunStream(RUN_ID, { baseUrl: "http://gavel.test" }), { wrapper });
      act(() => lastStream().frame("error"));
      await waitFor(() => expect(fetchMock).toHaveBeenCalledExactlyOnceWith(`http://gavel.test${SNAPSHOT_URL}`));
      expect(result.current.status).toBe("running");
      expect(lastStream().closed).toBe(false);
    });

    it("fails as unknown when the snapshot is a 404", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("gone", { status: 404 })));
      const onDone = vi.fn();
      const { result } = renderHook(() => usePromptRunStream(RUN_ID, { onDone }), { wrapper });
      act(() => lastStream().frame("error"));
      await waitFor(() => expect(result.current.status).toBe("failed"));
      expect(result.current.error).toBe("Captain no longer knows this prompt run; check its result before retrying.");
      expect(lastStream().closed).toBe(true);
      expect(onDone).toHaveBeenCalledExactlyOnceWith({
        success: false,
        error: "Captain no longer knows this prompt run; check its result before retrying.",
      });
    });
  });

  it("keeps the stream open when callbacks change between renders", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ onDone }) => usePromptRunStream(RUN_ID, { onDone }), {
      wrapper,
      initialProps: { onDone: first },
    });
    rerender({ onDone: second });
    expect(FakeRunStream.instances).toHaveLength(1);
    act(() => lastStream().frame("done", { success: true }));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it("closes the stream and restarts as running when the run id changes", () => {
    const { result, rerender } = renderHook(({ id }) => usePromptRunStream(id), {
      wrapper,
      initialProps: { id: RUN_ID as string | undefined },
    });
    const first = lastStream();
    act(() => first.frame("done", { success: true, sessionId: SESSION_ID }));
    expect(result.current.status).toBe("succeeded");
    rerender({ id: "run-next" });
    expect(FakeRunStream.instances.map((s) => s.url)).toEqual([STREAM_URL, "/api/captain/prompt/runs/run-next/stream"]);
    expect(result.current).toEqual({ status: "running", entries: [] });
  });
});
