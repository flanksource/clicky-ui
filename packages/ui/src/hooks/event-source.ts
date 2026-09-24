import { createContext, useContext } from "react";

// event-source is the injection seam every SSE-opening hook in clicky-ui
// (useTaskRun/useTaskRuns, usePrompts, useLogTail, useDebugStream) reads
// through instead of calling `new EventSource(url)` directly. A host that
// needs to route every SSE connection through its own transport — e.g. to
// multiplex several streams over one connection and work around the
// six-connections-per-origin cap HTTP/1.1 imposes — wraps its tree in
// `EventSourceProvider` (./event-source-provider) once, and every hook picks
// the substitute up without per-call plumbing. Without a provider, hooks fall
// back to the browser's native `EventSource`.
//
// The Provider component lives in its own file (event-source-provider.tsx) so
// this one stays JSX-free and exports only the context/hook — matching
// use-theme.ts/theme-provider.tsx and use-density.ts/density-provider.tsx.

/**
 * The subset of the DOM `EventSource` surface the hooks in this package
 * actually use. A host's injected factory only has to return something that
 * satisfies this — never the full `EventSource` interface — so a consumer
 * hook must never narrow with `instanceof EventSource`.
 */
export interface EventSourceLike {
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  close(): void;
  readonly readyState: number;
  readonly url: string;
  onopen: ((ev: Event) => unknown) | null;
  onmessage: ((ev: MessageEvent) => unknown) | null;
  onerror: ((ev: Event) => unknown) | null;
}

/** Builds an EventSource-compatible connection for a URL. */
export type EventSourceFactory = (url: string) => EventSourceLike;

const defaultEventSourceFactory: EventSourceFactory = (url) => new EventSource(url);

export const EventSourceFactoryContext = createContext<EventSourceFactory>(defaultEventSourceFactory);

/** The active `EventSourceFactory` — the provided one, or `(url) => new EventSource(url)`. */
export function useEventSourceFactory(): EventSourceFactory {
  return useContext(EventSourceFactoryContext);
}
