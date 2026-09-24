import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { vi } from "vitest";
import type { EventSourceLike } from "../hooks/event-source";
import { EventSourceProvider } from "../hooks/event-source-provider";
import type {
  SessionUIMessage,
  UnifiedSessionInput,
} from "../data/ai/SessionViewer.unified";

/** A scripted stand-in for the session follow stream: tests push `entry`,
 *  `state` and `error` frames, or a bare connection failure, through `emit`
 *  and `failConnection`. */
export class FakeEventSource implements EventSourceLike {
  static instances: FakeEventSource[] = [];
  readyState = 1;
  onopen: ((ev: Event) => unknown) | null = null;
  onmessage: ((ev: MessageEvent) => unknown) | null = null;
  onerror: ((ev: Event) => unknown) | null = null;
  closed = false;
  private listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();

  constructor(readonly url: string) {
    FakeEventSource.instances.push(this);
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
    this.readyState = 2;
  }

  emit(type: "entry" | "state" | "error", data: unknown) {
    this.dispatch(
      new MessageEvent(type, {
        data: typeof data === "string" ? data : JSON.stringify(data),
      }),
    );
  }

  failConnection() {
    this.readyState = 2;
    this.dispatch(new Event("error"));
  }

  private dispatch(event: Event) {
    if (this.closed) throw new Error(`frame ${event.type} sent to a closed stream ${this.url}`);
    for (const listener of this.listeners.get(event.type) ?? []) {
      if (typeof listener === "function") listener(event);
      else listener.handleEvent(event);
    }
  }
}

export function resetFakeEventSources() {
  FakeEventSource.instances = [];
}

export function lastEventSource(): FakeEventSource {
  const source = FakeEventSource.instances.at(-1);
  if (!source) throw new Error("no EventSource was opened");
  return source;
}

export function renderWithFakeStream(ui: ReactElement): RenderResult {
  const wrap = (node: ReactElement) => (
    <EventSourceProvider value={(url) => new FakeEventSource(url)}>
      {node}
    </EventSourceProvider>
  );
  const result = render(wrap(ui));
  return { ...result, rerender: (next) => result.rerender(wrap(next as ReactElement)) };
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Stubs `fetch` with a per-URL queue of responses; the last response for a
 *  URL repeats, and an unknown URL fails the test loudly. */
export function stubSessionFetch(routes: Record<string, Array<() => Response>>) {
  const calls = new Map<string, number>();
  const mock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const queue = routes[url];
    if (!queue?.length) throw new Error(`unexpected fetch ${url}`);
    const index = calls.get(url) ?? 0;
    calls.set(url, index + 1);
    return queue[Math.min(index, queue.length - 1)]!();
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

export function textMessage(id: string, text: string): SessionUIMessage {
  return {
    id,
    role: "assistant",
    parts: [{ type: "text", text }],
    provenance: { sessionId: "remote", timestamp: "2026-09-24T10:00:00Z" },
  };
}

export function remoteSession(
  overrides: Partial<UnifiedSessionInput> = {},
): UnifiedSessionInput {
  return {
    id: "remote",
    provider: "anthropic",
    model: "claude-sonnet-5",
    revision: 1,
    lifecycleStatus: "running",
    messages: [],
    ...overrides,
  };
}
