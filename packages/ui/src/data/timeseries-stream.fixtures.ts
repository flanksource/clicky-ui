import type { EventSourceFactory, EventSourceLike } from "../hooks/event-source";

const CONNECTING = 0;
const OPEN = 1;
const CLOSED = 2;

/**
 * An in-memory EventSourceLike for tests and stories: it records the URL it
 * was opened with and dispatches whatever frames the caller emits, standing
 * in for one hub subscription.
 */
export class FakeEventSource implements EventSourceLike {
  readyState = CONNECTING;
  onopen: ((ev: Event) => unknown) | null = null;
  onmessage: ((ev: MessageEvent) => unknown) | null = null;
  onerror: ((ev: Event) => unknown) | null = null;
  readonly listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();

  constructor(readonly url: string) {}

  /** The `id` query values, in URL order. */
  get ids(): string[] {
    return new URL(this.url, "http://fake.test").searchParams.getAll("id");
  }

  param(name: string): string | null {
    return new URL(this.url, "http://fake.test").searchParams.get(name);
  }

  get closed(): boolean {
    return this.readyState === CLOSED;
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    const set = this.listeners.get(type) ?? new Set();
    set.add(listener);
    this.listeners.set(type, set);
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    this.listeners.get(type)?.delete(listener);
  }

  /** Called once when the consumer closes the stream, e.g. to stop a story's timers. */
  onClose: (() => void) | null = null;

  close(): void {
    if (this.closed) return;
    this.readyState = CLOSED;
    this.onClose?.();
  }

  /** Dispatches a server-named event whose data is `payload` as JSON. */
  emit(name: string, payload: unknown): void {
    if (this.closed) throw new Error(`emit ${name} on closed fake stream ${this.url}`);
    this.readyState = OPEN;
    this.dispatch(name, new MessageEvent(name, { data: JSON.stringify(payload) }));
  }

  /** A transport failure: no data, the stream ends CLOSED. */
  fail(): void {
    this.readyState = CLOSED;
    this.dispatch("error", new Event("error"));
  }

  private dispatch(name: string, event: Event): void {
    for (const listener of Array.from(this.listeners.get(name) ?? [])) {
      if (typeof listener === "function") listener(event);
      else listener.handleEvent(event);
    }
  }
}

/** A factory that opens FakeEventSources and keeps every one it opened, oldest first. */
export function createFakeEventSourceFactory(): {
  factory: EventSourceFactory;
  opened: FakeEventSource[];
  latest(): FakeEventSource;
} {
  const opened: FakeEventSource[] = [];
  return {
    factory: (url) => {
      const source = new FakeEventSource(url);
      opened.push(source);
      return source;
    },
    opened,
    latest() {
      const last = opened[opened.length - 1];
      if (!last) throw new Error("no fake stream has been opened");
      return last;
    },
  };
}
